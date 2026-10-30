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
| 日记本 | 本地日记面板：500 字上限、心情标签、按日期区间筛选、导出为独立 HTML 存档、JSON 导入导出 |

## 技术说明

- **单文件实现**：全部结构与逻辑在 `index.html`（2518 行），无构建步骤、无框架，样式与脚本全部内联
- **数据驱动**：内容由内联 JS 的数据数组渲染——`LOGS`（经历）、`SKILLS`（技能）、`SOCIALS`（联系方式）、`PROJECTS`（作品）、`ACHV`（成就）。改文案只需改对应数组，不必动 DOM
- **像素图形**：图标是代码里的点阵字符串（`ICONS`），由 `pixelGrid()` 绘制，不含图片资源
- **字体自托管**：Fusion Pixel（中文正文，78 个 unicode-range 分片）、Press Start 2P（标题）、VT323，均为 SIL OFL-1.1，许可与原文见 LICENSES.md
- **外部请求**：仅 MUSIC 播放调用网易云音乐的第三方外链；字体与样式不依赖任何 CDN
- **日记数据**：存 `localStorage`，不上传服务器。导出时生成一个自包含 HTML 存档（内嵌 `diary-data` JSON，可再次导入），文件名形如 `diary-archive-20261030.html`
- **部署**：GitHub Pages，`main` 分支根目录直接发布，无需 Actions

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

直接双击 `index.html` 多数情况也能看，但部分浏览器对本地字体的限制会影响显示，建议起静态服务器。

## 已知限制

- MUSIC 播放依赖网易云音乐的外链接口，歌曲可能因版权或接口调整而失效
- 音效受浏览器自动播放策略限制，需首次交互后才解锁
- 日记只存在当前浏览器的 `localStorage`，清除站点数据即丢失；重要内容请用 EXPORT 导出备份

## 许可

页面内容与代码版权归作者所有，未声明开源许可。第三方字体许可详见 LICENSES.md。
