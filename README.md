# 张晅晔 · PLAYER 1

像素风格的个人主页，记录自己的一些经历和所得所感。

以 FC 游戏机的「PLAYER 1」状态面板为界面语言，把工作经历、技能、作品、成就和日记组织成一张可滚动的游戏卡带。

**在线访问：<https://jibai33.github.io/>**

## 页面结构

| 模块 | 内容 |
|---|---|
| 角色卡 | 张晅晔 · 设计师 / 开发者，LV.24、EXP 70/100，附「目前在做什么 / 在读 / 在听」与打字机自我介绍 |
| 任务日志 | 工作经历时间线，3 段（2017 至今） |
| 技能装备 | 10 项技能标签：Figma、Photoshop、Illustrator、HTML/CSS、JavaScript、动效设计、像素画、品牌视觉、交互原型、独立游戏 |
| 联系我 | GitHub、Email、知乎 |
| 作品仓库 | 3 个作品卡片，各带「CLEAR」进度条：像素官网生成器、地牢漫步、8-BIT 品牌手册 |
| 成就墙 | 6 枚成就徽章：FIRST COMMIT、PIXEL MASTER、SHIP IT、50K DL、NIGHT OWL、COIN HOARDER |
| 日记本 | 500 字上限、4 种心情标签、按日期区间筛选、每条可展开评论区、导出独立 HTML 存档、JSON 导入导出、与仓库 `diary.json` 自动合并、`SYNC ▲` 一键直传仓库 |

## 技术说明

- **单文件实现**：全部结构与逻辑在 `index.html`（3174 行），无构建步骤、无框架，样式与脚本全部内联
- **数据驱动**：内容由内联 JS 的数据数组渲染——`LOGS`（经历）、`SKILLS`（技能）、`SOCIALS`（联系方式）、`PROJECTS`（作品）、`ACHV`（成就）。改文案只需改对应数组，不必动 DOM
- **像素图形**：图标是代码里的点阵字符串（`ICONS`），由 `pixelGrid()` 绘制
- **头像**：`assets/avatar.png`（源图 `assets/头像.png` 居中裁方后缩到 160×160），CSS 用 `image-rendering: pixelated` 最近邻放大保留颗粒感；图片缺失时自动退回点阵 `Z` 图标
- **字体自托管**：Fusion Pixel（中文正文，78 个 unicode-range 分片）、Press Start 2P（标题）、VT323，均为 SIL OFL-1.1，许可与原文见 LICENSES.md
- **外部请求**：MUSIC 播放调用网易云音乐外链、评论区加载 giscus（`giscus.app`）；字体与样式不依赖任何 CDN
- **日记数据**：正文存浏览器 `localStorage`，仓库根 `diary.json` 是跨设备的共享快照；页面打开时自动拉取合并，导出 HTML 存档（内嵌 `diary-data` JSON，可再次导入）时文件名形如 `diary-archive-20261030.html`
- **评论**：giscus（GitHub Discussions），每条日记的讨论串由 `data-term`（`日记 <日期时间> · <日记 id>`）唯一确定；组件懒加载，只有点开某条日记的 `COMMENTS` 才注入 iframe
- **部署**：GitHub Pages，`main` 分支根目录直接发布，无需 Actions

## 日记评论（giscus）

评论存在仓库的 **Discussions** 里，不需要服务器，也不需要数据库。任何访问者用 GitHub 账号登录即可对某条日记留言，作者在仓库 Discussions 页面或本站都能看到。

一条日记对应一个讨论串，标题即可读的 term：`日记 2026.10.30 周五 17:01 · <日记 id>`。`id` 来自 `diary.json`、稳定不变，所以不同日记的评论互不混淆，新增/删除日记也不影响已有讨论。第一条评论发出时，giscus 会自动在 `Announcements` 分类下建好对应讨论。

**当前状态：已接通**（`repo` / `repoId` / `categoryId` 均已填好，仓库 Discussions 已开启，giscus App 已安装）。

```js
var GISCUS = {
  repo: 'jibai33/jibai33.github.io',
  repoId: 'R_kgDOVccitQ',
  category: 'Announcements',          // 与 categoryId 对应的分类名
  categoryId: 'DIC_kwDOVccitc4DJ_Im'  // Announcements 的 node id
};
```

**换分类或换仓库时**，`categoryId` 不必去 giscus.app 页面点：

```bash
curl -s "https://giscus.app/api/discussions/categories?repo=<owner>/<repo>"
# {"repositoryId":"R_kgDO...","categories":[{"id":"DIC_kwDO...","name":"Announcements"}, ...]}
```

返回值里 `repositoryId` 填 `GISCUS.repoId`，所选分类的 `id` 填 `GISCUS.categoryId`，`name` 填 `GISCUS.category`，三者必须来自同一仓库。

`categoryId` 为空时页面不加载评论组件，展开 `COMMENTS` 只会显示开启步骤提示，不会白屏。


## 日记同步

```
本地/线上浏览器 localStorage  ──PUBLISH──▶ 下载 diary.json ──git commit/push──▶ 仓库根 diary.json
        ▲                          │                                                   │
        │                          └──SYNC（配 token）──GET sha → 合并 → PUT───────────┘
        └──────────────── 打开页面时 fetch + 合并（去重 by ts|text，跳过墓碑） ◀──────────┘
```

- **直传**：填入 GitHub fine-grained token（仅本仓库 `Contents: Read and write`）后点 `SYNC ▲`，页面走 Contents API——`GET` 取当前 `sha` 与内容 → 与本地按 `ts|text` 合并 → `PUT` 整文件写回，GitHub 自动生成一次提交，Pages 约 1 分钟更新。token 只存本机 `localStorage`（`linyi_diary_token`），随时可在 GitHub 撤销
- **CORS**：`api.github.com` 对 `PUT` 预检返回 `access-control-allow-methods: GET, POST, PATCH, PUT, DELETE` 与 `allow-origin: *`，页面可直连

- **拉取**：页面加载后 `fetch diary.json`（带时间戳绕 CDN 缓存，线上取同源相对路径，本地打开取 `https://jibai33.github.io/diary.json`，GitHub Pages 返回 `access-control-allow-origin: *`），按 `ts|text` 去重合并进 `localStorage`，提示 `SYNC +N`
- **推送**：日记区 `PUBLISH` 按钮把当前全部日记下载为 `diary.json`，放到仓库根提交推送后，任何设备打开页面都能拉到
- **删除**：删除某条日记会写入本机墓碑（`linyi_diary_v1_tomb`），避免仓库里的旧快照把它合并复活
- **公开性**：`diary.json` 随站点发布，任何访问 <https://jibai33.github.io/diary.json> 的人都能读取全部日记——这是零 token 方案的代价，私密内容请勿只依赖此存档

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

直接双击 `index.html` 多数情况也能看，但部分浏览器对本地字体的限制会影响显示，建议起静态服务器。

## 已知限制

- 评论依赖 giscus 与仓库 Discussions：未开启 Discussions / 未安装 giscus App 时评论区不加载；评论者需要 GitHub 账号（giscus 不支持匿名昵称）
- **评论区必须在 http(s) 页面下打开**：giscus 的 iframe 响应带 `Content-Security-Policy: frame-ancestors`，服务端按客户端传来的 `origin` 回显放行；`file://` 的 origin 是 `null`，永远拿不到放行，所以双击本地 HTML 会看到「评论区不可用」的提示。本地调试请用 `python3 -m http.server` 起服务访问 `http://localhost:8000`
- 部分预览面板 / 广告拦截会拦掉 `giscus.app/client.js` 这类外链脚本，页面会分别提示「脚本被拦」与「已加载但未渲染」，便于区分是网络问题还是配置问题
- 评论数据的增删改在 GitHub Discussions 里进行，页面只做展示，不做本地缓存；离线打开时 iframe 空白
- **giscus.app 的可达性决定了评论框能否出现**：`giscus.app` 部署在境外，大陆部分网络下会连不上（表现为评论框一直空白）。页面按三种情况分别提示——脚本被拦、脚本已加载但没渲染出 iframe、10 秒无响应（多为网络受限），并给出「去仓库 Discussions 看评论」的直达链接。若长期不可用，可自建 giscus 反向代理，把 `mountGiscus()` 里的 `https://giscus.app/client.js` 换成代理域名（注意 iframe 的 `frame-ancestors` 也要放行你的站点）
- MUSIC 播放依赖网易云音乐的外链接口，歌曲可能因版权或接口调整而失效
- 音效受浏览器自动播放策略限制，需首次交互后才解锁
- 日记正文只存在当前浏览器的 `localStorage`（清除站点数据即丢失），仓库 `diary.json` 是手动 PUBLISH 或 SYNC 提交的共享快照；重要内容请用 EXPORT 另存一份
- 同步是「仓库 → 浏览器」的自动合并 + 「浏览器 → 仓库」的手动触发（PUSH 下载或 SYNC 直传）；浏览器里新写的日记在触发之前不会出现在其他设备上
- `SYNC ▲` 依赖本机 `localStorage` 里的 GitHub token：清除站点数据会一并清掉 token，需要重新填入；token 失效或权限不足时页面会提示 401/403

## 许可

页面内容与代码版权归作者所有，未声明开源许可。第三方字体许可详见 LICENSES.md。
