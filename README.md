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
| 日记本 | 500 字上限、4 种心情标签、按日期区间筛选、导出独立 HTML 存档、JSON 导入导出、与仓库 `diary.json` 自动合并、`SYNC ▲` 一键直传仓库 |

## 技术说明

- **单文件实现**：全部结构与逻辑在 `index.html`（2966 行），无构建步骤、无框架，样式与脚本全部内联
- **数据驱动**：内容由内联 JS 的数据数组渲染——`LOGS`（经历）、`SKILLS`（技能）、`SOCIALS`（联系方式）、`PROJECTS`（作品）、`ACHV`（成就）。改文案只需改对应数组，不必动 DOM
- **像素图形**：图标是代码里的点阵字符串（`ICONS`），由 `pixelGrid()` 绘制
- **头像**：`assets/avatar.png`（源图 `assets/头像.png` 居中裁方后缩到 160×160），CSS 用 `image-rendering: pixelated` 最近邻放大保留颗粒感；图片缺失时自动退回点阵 `Z` 图标
- **字体自托管**：Fusion Pixel（中文正文，78 个 unicode-range 分片）、Press Start 2P（标题）、VT323，均为 SIL OFL-1.1，许可与原文见 LICENSES.md
- **外部请求**：仅 MUSIC 播放调用网易云音乐的第三方外链；字体与样式不依赖任何 CDN
- **日记数据**：正文存浏览器 `localStorage`，仓库根 `diary.json` 是跨设备的共享快照；页面打开时自动拉取合并，导出 HTML 存档（内嵌 `diary-data` JSON，可再次导入）时文件名形如 `diary-archive-20261030.html`
- **部署**：GitHub Pages，`main` 分支根目录直接发布，无需 Actions

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

- MUSIC 播放依赖网易云音乐的外链接口，歌曲可能因版权或接口调整而失效
- 音效受浏览器自动播放策略限制，需首次交互后才解锁
- 日记正文只存在当前浏览器的 `localStorage`（清除站点数据即丢失），仓库 `diary.json` 是手动 PUBLISH 或 SYNC 提交的共享快照；重要内容请用 EXPORT 另存一份
- 同步是「仓库 → 浏览器」的自动合并 + 「浏览器 → 仓库」的手动触发（PUSH 下载或 SYNC 直传）；浏览器里新写的日记在触发之前不会出现在其他设备上
- `SYNC ▲` 依赖本机 `localStorage` 里的 GitHub token：清除站点数据会一并清掉 token，需要重新填入；token 失效或权限不足时页面会提示 401/403

## 许可

页面内容与代码版权归作者所有，未声明开源许可。第三方字体许可详见 LICENSES.md。
