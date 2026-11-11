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
| 作品仓库 | 5 个作品卡片，各带「CLEAR」进度条：**闻曲 Earworm**（置顶，红框 NEW 贴纸，可跳在线版与源码）、像素官网生成器、地牢漫步、工厂官网设计、8-BIT 品牌手册 |
| 成就墙 | 6 枚成就徽章：FIRST COMMIT、PIXEL MASTER、SHIP IT、50K DL、NIGHT OWL、COIN HOARDER |
| 日记本 | 500 字上限、4 种心情标签、按日期区间筛选、每条可展开评论区、**云端同步（写入即上传，多设备共用）**、导出独立 HTML 存档、JSON 导入导出、`SYNC ▲` 一键直传仓库做备份 |
| 天气粒子 | 按访问当天的实时天气掉落像素：晴＝彩色微尘、阴＝灰雾、雨＝蓝色雨丝（触底溅起）、雪＝白色雪块、雷雨＝雨＋随机闪电；HUD 显示「WX 小雨 13°C」 |

## 技术说明

- **单文件实现**：全部结构与逻辑在 `index.html`（3786 行），无构建步骤、无框架，样式与脚本全部内联；云同步接口页 `diary-api.html`（184 行，内嵌 SDK）单独部署在云域名
- **数据驱动**：内容由内联 JS 的数据数组渲染——`LOGS`（经历）、`SKILLS`（技能）、`SOCIALS`（联系方式）、`PROJECTS`（作品）、`ACHV`（成就）。改文案只需改对应数组，不必动 DOM
- **像素图形**：图标是代码里的点阵字符串（`ICONS`），由 `pixelGrid()` 绘制
- **头像**：`assets/avatar.png`（源图 `assets/头像.png` 居中裁方后缩到 160×160），CSS 用 `image-rendering: pixelated` 最近邻放大保留颗粒感；图片缺失时自动退回点阵 `Z` 图标
- **字体自托管**：Fusion Pixel（中文正文，78 个 unicode-range 分片）、Press Start 2P（标题）、VT323，均为 SIL OFL-1.1，许可与原文见 LICENSES.md
- **外部请求**：MUSIC 播放调用网易云音乐外链、评论区从云服务域名加载 `comments.html`、日记云同步走同域名 `diary-api.html`、天气数据请求 `api.open-meteo.com`；字体、SDK 与样式全部本地自托管，不依赖任何 CDN
- **天气粒子**：`WX` / `WX_FX` 两张表驱动，Canvas 双层（背景层 + 卡片之上的前景层）绘制像素粒子，天气取不到时退化为晴天微尘
- **日记数据**：正文写进浏览器 `localStorage` 的同时**自动同步到云数据库 `diary_entries`**（匿名写入，写入即全网可见）；仓库根 `diary.json` 退化为只读备份。导出 HTML 存档（内嵌 `diary-data` JSON，可再次导入）时文件名形如 `diary-archive-20261030.html`
- **评论**：WorkBuddy 云数据库（PostgreSQL + RLS）+ 自建 iframe 小组件。评论 UI 部署在云服务域名 `https://jibai33-home.app.workbuddy.host/comments.html`，页面用 iframe 内嵌并按 `postMessage` 自适应高度；访客无需登录，填昵称即可留言
- **日记云同步**：与评论同一朵云、同一套桥接方案——云域名上的 `diary-api.html` 提供 `list / insert / delete` 三个操作，主页面用一个隐藏 iframe + `postMessage` 调用（云接口按 Origin 精确匹配，github.io 不能直连）。RLS 允许匿名读/写/删，但 `INSERT` 带 `WITH CHECK`：id 格式、时间戳范围、心情枚举、正文 ≤500 字都在数据库侧把关
- **部署**：GitHub Pages，`main` 分支根目录直接发布，无需 Actions

## 天气粒子

页面打开时会取一次实时天气，然后按天气掉落不同像素。数据来自 [Open-Meteo](https://open-meteo.com/)（免 key、支持 CORS），默认坐标取西安（34.34, 108.94）；如果访问者**此前已经授权过定位**，就用其真实位置，不主动弹权限框。结果存 `sessionStorage` 30 分钟，避免每次刷新都请求。

| 天气（WMO 代码） | 粒子模式 | 表现 |
|---|---|---|
| 晴 / 晴间多云（0、1） | `clear` | 彩色像素缓缓下落、左右飘摆（夜间换成冷色） |
| 多云（2） | `cloud` | 少量灰白像素，速度慢 |
| 阴（3） | `overcast` | 灰雾颗粒缓慢横移，星空自动压暗 |
| 雾（45、48） | `fog` | 横向拉长的雾带 |
| 毛毛雨（51–56） | `drizzle` | 稀疏短雨丝 |
| 小雨 / 中雨 / 阵雨（57–67、80–81） | `rain` | 明显雨丝，触底有像素水花 |
| 大雨 / 暴雨（65、67、82） | `heavy` | 更密更快，雨丝更长 |
| 雪（71–77、85、86） | `snow` | 白色方块缓慢飘落 |
| 雷雨（95、96、99） | `storm` | 密集雨丝 + 每 5–12 秒一次全屏闪电 |

实现要点：

- 双层 Canvas：`#wxBack` 在卡片之下、`#wxFront` 在卡片之上，粒子按 `depth` 随机分到两层，形成前后景纵深；两层都 `pointer-events: none`
- 像素化：`fillRect` + 坐标取整 + `image-rendering` 无关（Canvas 本身就是硬边），DPR 上限 2，避免手机上过度渲染
- 性能：粒子数按天气 20–230 浮动；页面切到后台（`visibilitychange`）暂停 `requestAnimationFrame`，回到前台恢复
- 降级：`prefers-reduced-motion: reduce` 时完全不画粒子，只保留 HUD 文字；接口失败或断网时退化为晴天微尘，HUD 显示「WX 天气未知」
- HUD 里的天气条带 `title`，鼠标悬停可看到坐标、温度与数据来源

想换城市：改 `index.html` 里 `WX.lat` / `WX.lon` 与 `WX.place`；想调密度或颜色：改 `WX_FX` 里对应模式的 `count`、`a`、`colors`。

## 日记评论（云端匿名评论）

评论存在云数据库 `diary_comments` 表里，访客**不需要登录、不需要 GitHub 账号**，填个昵称就能发言。作者在云服务管理面板里能看到全部评论。

**为什么评论 UI 跑在另一个域名上**

云服务接口按 **Origin 精确匹配** 放行（实测从 `https://jibai33.github.io` 发起的预检直接被 403），而页面本身仍在 GitHub Pages。解法是把评论界面做成独立页面 `comments.html`，部署到云服务自己的域名上，再用 iframe 嵌进日记卡片——iframe 里的请求来自它自己的 origin，天然通过校验。页面地址不变，评论照样能用。

**数据表**

```sql
CREATE TABLE diary_comments (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  diary_id   TEXT NOT NULL,   -- 对应日记的 id（diary.json 里的稳定 id，退回时间戳）
  nickname   TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- RLS：anon / authenticated 均可 SELECT 与 INSERT，不允许改删
```

**前端配置**（`index.html` 顶部）

```js
var CLOUD_CMT = {
  base: 'https://jibai33-home.app.workbuddy.host',  // 云服务应用域名
  page: 'comments.html',
  share: 'KWLMX3RRCK'                               // 站点访问码，重新发布后如变化需同步更新
};
```

`comments.html` 里的 `CLOUD` 常量持有 `endpoint` / `publishableKey`（云服务 `publicConfig`，可公开）。

**改样式**：评论组件是独立页面，它的 CSS 与主页面同源（复用 `assets/fonts` 与同一套配色变量），改 `comments.html` 即可，不影响主页面。

**重新发布**：改动 `comments.html` 后需要重新发布到云服务域名，否则线上评论组件还是旧版；`index.html` 单独改则照常推 GitHub Pages。

## 日记同步

```
浏览器 localStorage ──保存/删除时自动────▶ 云数据库 diary_entries ◀──自动拉取合并── 其他设备/访客
        ▲  ▲                                        │
        │  └────────── SYNC ▲ / PUBLISH（备份）──────┘（不相干，两条路独立）
        │
仓库根 diary.json ──打开页面时 fetch 合并（备份通道，云不可用时兜底）
```

- **主通道（云）**：写日记 → 本地保存 + 自动 `insert` 上云；删除 → 本地墓碑 + 云端 `delete`；打开页面 → `list` 拉全量，按 `ts|text` 去重合并进本地，再把本地有而云上没有的条目逐条补传。全程经隐藏 iframe 调 `diary-api.html`，桥不通时静默降级，一切照旧走 localStorage + diary.json
- **「只在本机」角标 / 未同步 N ▲**：以云为准判断——云库里没有的条目打角标，底栏按钮显示数量，点一下立即补传；云不可用时退回按仓库 `diary.json` 判断，断网不误报
- **备份通道（GitHub）**：`PUBLISH` 下载 `diary.json` 提交到仓库、`SYNC ▲` 配 token 直传，仓库快照只进不出；云库挂了还能靠它恢复
- **删除**：写入本机墓碑（`linyi_diary_v1_tomb`），云删除失败也不会被下次同步复活
- **公开性**：云库匿名可写，RLS 限制了字段格式但挡不住恶意内容（与评论同一信任级别）；`diary.json` 随站点发布，任何访问 <https://jibai33.github.io/diary.json> 的人都能读取——私密内容别放日记

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

直接双击 `index.html` 多数情况也能看，但部分浏览器对本地字体的限制会影响显示，建议起静态服务器。

## 已知限制

- **天气依赖 `api.open-meteo.com` 可达**：被墙或断网时粒子退化为晴天微尘，HUD 显示「WX 天气未知」，页面其他部分不受影响
- **评论依赖云服务域名可达**：评论组件托管在 `jibai33-home.app.workbuddy.host`，该域名不通时 iframe 会空白，页面 12 秒后提示并给出「新窗口打开评论页」的链接
- **评论 UI 与页面不同源**：`comments.html` 改动后必须重新发布到云服务域名才生效；只推 GitHub Pages 不会更新线上评论组件
- **重新发布会换 sharecode**：`CLOUD_CMT.share` 与发布链接里的一致，发布链接变化时应同步更新该常量，否则 iframe 会拿到 403
- 评论是**匿名**的：昵称由访客自填，没有账号体系，也没有审核；如需过滤可在云数据库里直接删除行，或后续加敏感词校验
- 评论不做本地缓存，离线打开时评论区空白；发言有 20 秒冷却，防止误触重复提交
- MUSIC 播放依赖网易云音乐的外链接口，歌曲可能因版权或接口调整而失效
- 音效受浏览器自动播放策略限制，需首次交互后才解锁
- 日记正文存在浏览器 `localStorage` **并自动同步云库**（清除站点数据不丢，云库还在）；仓库 `diary.json` 降级为手动备份；重要内容仍建议用 EXPORT 另存一份
- **云同步是匿名通道**：与评论同一信任级别——任何访客技术上都能向 `diary_entries` 写/删（RLS 只校验字段格式）；日记若被恶意删改，可从 `diary.json` 备份或 EXPORT 存档恢复
- 云同步经隐藏 iframe 调 `diary-api.html`，**该文件改动后必须重新发布到云服务域名**（与 comments.html 同理）；只推 GitHub Pages 不会更新同步通道
- 同步失败时页面静默降级：云不可用就退回 localStorage + diary.json 的老流程，`只在本机` 角标按仓库快照判断；恢复后打开页面会自动补传差异
- `SYNC ▲` 依赖本机 `localStorage` 里的 GitHub token：清除站点数据会一并清掉 token，需要重新填入；token 失效或权限不足时页面会提示 401/403

## 许可

页面内容与代码版权归作者所有，未声明开源许可。第三方字体许可详见 LICENSES.md。
