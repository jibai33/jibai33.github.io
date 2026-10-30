// 日记同步回归测试：从 index.html 抽取真实源码，验证线上存档合并与墓碑逻辑
// 运行：node --test tests/diary-sync.test.mjs
import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function extract(name) {
  const re = new RegExp('function ' + name + '\\s*\\([\\s\\S]*?\\n  \\}', 'm');
  const m = re.exec(html);
  if (!m) throw new Error('未找到函数源码: ' + name);
  return m[0];
}

const MOODS = [{ id: 'happy' }, { id: 'calm' }, { id: 'tired' }, { id: 'sad' }];
const factory = new Function('MOODS',
  extract('diaryKey') + '\n' + extract('mergeRemoteEntries') + '\n' +
  extract('b64encode') + '\n' + extract('decodeContents') +
  '\nreturn { diaryKey: diaryKey, mergeRemoteEntries: mergeRemoteEntries, b64encode: b64encode, decodeContents: decodeContents };');
const { diaryKey, mergeRemoteEntries, b64encode, decodeContents } = factory(MOODS);

test('远端合并进空本地并按 ts 倒序', () => {
  const remote = [
    { id: 'r1', ts: 200, mood: 'happy', text: '旧' },
    { id: 'r2', ts: 400, mood: 'calm', text: '新' }
  ];
  const out = mergeRemoteEntries([], remote, []);
  assert.equal(out.added, 2);
  assert.deepEqual(out.list.map(x => x.ts), [400, 200]);
});

test('同内容不同 id 不重复入库', () => {
  const local = [{ id: 'a', ts: 100, mood: 'happy', text: '你好' }];
  const remote = [{ id: 'b', ts: 100, mood: 'sad', text: '你好' }];
  const out = mergeRemoteEntries(local, remote, []);
  assert.equal(out.added, 0);
  assert.equal(out.list.length, 1);
  assert.equal(out.list[0].mood, 'happy', '本地版本应保持原样');
});

test('墓碑条目被远端数据挡住', () => {
  const key = diaryKey({ ts: 100, text: '你好' });
  const out = mergeRemoteEntries([], [{ id: 'x', ts: 100, mood: 'happy', text: '你好' }], [key]);
  assert.equal(out.added, 0);
  assert.equal(out.list.length, 0);
});

test('字段校验与归一化', () => {
  const remote = [
    { id: 'bad1', ts: 'not-a-number', mood: 'happy', text: 'ts 非数字' },
    { id: 'bad2', ts: 111, mood: 'happy' },
    null,
    { id: 'ok', ts: 222, mood: 'furious', text: 'x'.repeat(600) }
  ];
  const out = mergeRemoteEntries([], remote, []);
  assert.equal(out.added, 1);
  assert.equal(out.list[0].mood, 'calm');
  assert.equal(out.list[0].text.length, 500);
});

test('缺 id 自动补 rem- 前缀 id', () => {
  const out = mergeRemoteEntries([], [{ ts: 333, mood: 'happy', text: '无 id' }], []);
  assert.equal(out.added, 1);
  assert.match(out.list[0].id, /^rem-333-/);
});

test('不就地修改本地列表', () => {
  const local = [{ id: 'a', ts: 100, mood: 'happy', text: '一' }];
  const snapshot = JSON.stringify(local);
  mergeRemoteEntries(local, [{ id: 'b', ts: 200, mood: 'calm', text: '二' }], []);
  assert.equal(JSON.stringify(local), snapshot);
});

test('仓库 diary.json 结构合法且可合并', () => {
  const raw = readFileSync(new URL('../diary.json', import.meta.url), 'utf8');
  const data = JSON.parse(raw);
  assert.ok(Array.isArray(data), 'diary.json 必须是数组');
  const out = mergeRemoteEntries([], data, []);
  assert.equal(out.added, data.length);
  out.list.forEach(it => {
    assert.equal(typeof it.text, 'string');
    assert.equal(typeof it.ts, 'number');
    assert.ok(['happy', 'calm', 'tired', 'sad'].includes(it.mood));
  });
  const sorted = out.list.every((it, i, arr) => i === 0 || arr[i - 1].ts >= it.ts);
  assert.ok(sorted, '合并结果必须按时间倒序');
});

test('b64encode 对中文 UTF-8 编码可往返', () => {
  const text = JSON.stringify([{ id: 'a', ts: 1, mood: 'happy', text: '你好，十一月！🎮' }], null, 2) + '\n';
  const b64 = b64encode(text);
  assert.match(b64, /^[A-Za-z0-9+/]+={0,2}$/, '必须是标准 base64 无换行');
  const back = Buffer.from(b64, 'base64').toString('utf8');
  assert.equal(back, text);
});

test('decodeContents 解析 contents API 响应（含换行 base64）', () => {
  const list = [{ id: 'r1', ts: 100, mood: 'calm', text: '远端记录' }];
  const raw = b64encode(JSON.stringify(list));
  const wrapped = raw.replace(/(.{60})/g, '$1\n'); // GitHub 返回的 content 每 60 字符换行
  const parsed = decodeContents({ sha: 'abc123', content: wrapped });
  assert.equal(parsed.sha, 'abc123');
  assert.deepEqual(parsed.list, list);
});

test('decodeContents 对非法输入返回 null', () => {
  assert.equal(decodeContents(null), null);
  assert.equal(decodeContents({ sha: 'x', content: b64encode('{"not":"array"}') }), null);
  assert.equal(decodeContents({ sha: 'x', content: '!!!not-base64!!!' }), null);
});
