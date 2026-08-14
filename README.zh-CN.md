# PureDesign Skill

一个给 **coding agent** 用的 UI 设计 skill：**用自然语言描述你想要什么，它就把需求变成一个 UI 设计，以 HTML 文件的形式交付。** 基于从 [OpenDesign](https://github.com/nexu-io/open-design) 抽离出来的设计资产库。

没有 CLI、没有交互问答界面、没有 Web 服务、没有云——全部由宿主 agent（Claude Code、Pi，或任何会读 `SKILL.md` 的 agent）自己驱动。本仓库只有三样东西：**一套设计资产、一份工作流（`SKILL.md`）、几个确定性质检脚本**。

> [English](README.md) · 简体中文

## 为什么会有这个项目

[OpenDesign](https://github.com/nexu-io/open-design) 把一套很好的设计资产库打包进了一个完整的平台里——登录、云同步、桌面端、守护进程、MCP、插件市场。一个 coding agent 根本用不到这些平台设施，它只需要资产 + 一份工作流。于是我们把资产库抽离出来（162 个技能、151 个设计系统、114 个模板、5 个视觉方向、11 个工艺参考），包进一个 skill 里——clone 下来、软链一下，任何 agent 就能直接做设计。

## 它是怎么工作的

```
一句自然语言需求
   │
   ▼
【阶段一：选型 + 澄清】（写代码之前）
   1. 判断任务类型（大模型语义分类，落在 6 类之一）
   2. 查 catalog.md 收窄候选（类型 → 3–4 个 skill / 模板）
   3. 选设计系统（默认 default；点名品牌才按名字查）
   4. 选视觉方向（5 选 1）
   5. grilling 澄清：缺信息才问，一次一个问题
   │
   ▼
【阶段二：生成 + 迭代 + 质检】（agent 自己干）
   6. 读选中的资产全文
   7. 写 HTML → 对照自检清单自查 → 重写 → 满意（最多 6 版）
   8. lint：    node scripts/lint.mjs      （确定性反 AI 味，修 P0/P1）
   9. validate：node scripts/validate.mjs  （不依赖外部资源、没截断）
  10. 归档：语义文件名（重名 +v2/+v3）
```

关键点：**agent 从不读 82MB。** 它只读 `catalog.md`（约 56KB），从中选出候选，再定向读取命中的那几份文件。

## 安装

clone 仓库，然后把它软链到你的 agent 的 skills 目录：

```bash
git clone https://github.com/yamsfeer/pure-design-skill.git
cd pure-design-skill

# 例子一：一个共享的 hub 目录
mkdir -p ~/.agents/skills
ln -s "$PWD" ~/.agents/skills/pure-design-skill

# 例子二：Claude Code
ln -s "$PWD" ~/.claude/skills/pure-design-skill
```

会从类似目录发现 skill 的 agent 就能直接用了；其他 agent 就把 clone 下来的仓库软链到它自己的 skills 路径。

可选：设置 `PURE_DESIGN_DIR` 指向本仓库，agent 不确定安装路径时用它定位资产。

## 用法

在 agent 里直接说需求即可：

> 用 pure-design-skill 设计一个给独立开发者的极简记账 App 首页，主打本月支出与预算进度。

想指定设计系统或方向，在需求里带上即可（「Stripe 风格」「editorial 方向」）。

## 目录结构

```
pure-design-skill/
├── SKILL.md          # 工作流：两段式 + 输出契约
├── README.md         # 英文说明（本文件为 README.zh-CN.md）
├── catalog.md        # 资产目录，由 scripts/index.mjs 生成 —— 选型入口
├── assets/           # 82MB 抽离自 OpenDesign 的资产
│   ├── skills/           162 个技能（frontend-design、taste-skill、gsap-* …）
│   ├── design-systems/   151 个设计系统（DESIGN.md 品牌契约）
│   ├── design-templates/ 114 个渲染模板（SKILL.md + 种子 + layouts + checklist）
│   ├── craft/            11 个工艺参考（typography、color、anti-ai-slop …）
│   ├── directions/       5 个视觉方向
│   └── prompt-templates/ 图像/视频提示词模板（不参与 HTML 流程）
└── scripts/          # 确定性代码，零依赖（纯 Node 内置模块）
    ├── index.mjs     # 资产变动后重新生成 catalog.md
    ├── lint.mjs      # 反 AI 味 lint（每次写完后跑）
    └── validate.mjs  # 交付校验（完成前跑）
```

## 脚本

| 脚本 | 什么时候跑 | 干什么 |
|---|---|---|
| `node scripts/index.mjs` | 资产变动后（一次性） | 扫描 `assets/` → 重新生成 `catalog.md` |
| `node scripts/lint.mjs <file.html>` | 每次写完后 | 确定性反 AI 味检查；退出码 1 = 有 P0/P1 要修 |
| `node scripts/validate.mjs <file.html>` | 完成前 | doctype / `</html>` / 长度 / 不依赖外部资源 |

运行时 agent 只读 `catalog.md` 和命中的资产；`index.mjs` 是构建期工具。

## License

本 skill 的编排代码为 Apache-2.0。抽离的资产保留 OpenDesign 原始许可。
