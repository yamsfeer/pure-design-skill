# PureDesign Skill

一个给 **coding agent** 用的 UI 设计 skill：把一句口语化的自然语言需求，变成一个**自包含、有明确设计风格、生产级**的 HTML 页面。

没有 CLI、没有交互问答界面、没有 Web 服务——这些由**宿主 agent 自己**承担。本仓库只有三样东西：**一套资产、一份工作流程（SKILL.md）、几个确定性质检脚本**。

> 资产取自开源项目 [open-design](https://github.com/nexu-io/open-design)，完整提取：162 个技能、151 个设计系统、114 个模板、5 个视觉方向、11 个工艺参考。

## 与 PureDesign CLI 的关系

| | PureDesign CLI（[pure-open-design](https://github.com/yamsfeer/pure-open-design)） | **PureDesign Skill（本仓库）** |
|---|---|---|
| 形态 | commander CLI + TUI + Web 界面 + 内置 Pi SDK | 一个 `SKILL.md` + 资产 + 脚本 |
| 谁在驱动 agent 循环 | 内置 Pi SDK（`@earendil-works/pi-agent-core`） | **宿主 coding agent 自己**（Claude Code / Pi / …） |
| 交互 | readline 一问一答 / 装配确认 | agent 原生对话 |
| 依赖 | Pi SDK + commander + marked（几十 MB node_modules） | **零依赖**（脚本只用 Node 内置模块） |

同一个资产库、同一套「判断类型 → 选型 → 澄清 → 迭代 → lint」流程。skill 版把它从「代码」重写成「工作流 + 静态目录」。

## 完整工作流程

```
用户一句口语需求
   │
   ▼
【阶段一：选型 + 澄清】（写代码之前）
   ① 判断任务类型（大模型语义分类，落在 6 类之一）
   ② 查 catalog.md 收窄候选（按类型拿 3–4 个 skill / 模板）
   ③ 选设计系统（默认 default；点名品牌才查目录）
   ④ 选视觉方向（5 选 1）
   ⑤ grilling 澄清（缺啥问啥，一次一问带推荐答案）
   │
   ▼
【阶段二：生成 + 迭代 + 质检】（agent 自己干）
   ⑥ 读选中的资产全文（skill + DESIGN.md + 方向 + craft + 模板）
   ⑦ 生成循环：写 HTML → 对照自检清单自查 → 重写 → 满意（最多 6 版）
   ⑧ 写后 lint：node scripts/lint.mjs（确定性反 AI 味，P0/P1 必修）
   ⑨ 交付校验：node scripts/validate.mjs（自包含 / 没截断）
   ⑩ 归档：语义文件名，重名 +v2/+v3
```

关键点：**「找得准」不靠大模型读 82MB 资产，而靠 `catalog.md` 收窄。** agent 只读一份几十 KB 的目录，选出候选后再定向读取命中的那几份文件。

## 安装

复制到你的 agent skills 目录，再软链给各个 agent（与 [tailscale-remote](https://github.com/yamsfeer/tailscale-remote) 同一套做法）：

```bash
mkdir -p ~/.agents/skills/pure-design-skill
cp -r /path/to/pure-design-skill ~/.agents/skills/
# 软链给 Claude Code / Pi
ln -s ~/.agents/skills/pure-design-skill ~/.claude/skills/pure-design-skill
ln -s ~/.agents/skills/pure-design-skill ~/.pi/agent/skills/pure-design-skill
```

可选：设置 `PURE_DESIGN_DIR` 环境变量指向本仓库，agent 不确定安装路径时用它定位资产。

## 用法

在 coding agent 里直接说需求即可，例如：

```
用 pure-design-skill 设计一个给独立开发者的极简记账 App 首页，主打本月支出与预算进度。
```

agent 会自己走完上述流程。想指定设计系统或方向，在需求里带上即可（「要 Stripe 风格」「用 editorial 方向」）。

## 目录结构

```
pure-design-skill/
├── SKILL.md          # 编排入口：完整工作流（两段式 + 输出契约）
├── README.md         # 本文件
├── catalog.md        # 资产目录（scripts/index.mjs 生成，选型入口）
├── assets/           # 82M 资产（open-design 完整提取）
│   ├── skills/          162 个技能（frontend-design、taste-skill、gsap-* …）
│   ├── design-systems/  151 个设计系统（DESIGN.md 品牌契约）
│   ├── design-templates/ 114 个渲染模板（SKILL.md + 种子 + layouts + checklist）
│   ├── craft/           11 个工艺参考（typography、color、anti-ai-slop …）
│   ├── directions/      5 个视觉方向
│   └── prompt-templates/ 图像/视频提示词模板（不参与 HTML 流程，按需取用）
└── scripts/          # 确定性程序（零依赖，纯 Node 内置模块）
    ├── index.mjs     # 生成 catalog.md（资产变动时重跑）
    ├── lint.mjs      # 反 AI 味 lint（agent 写后调用）
    └── validate.mjs  # 交付完整性校验（agent 写后调用）
```

## 三个脚本

| 脚本 | 什么时候跑 | 干什么 |
|---|---|---|
| `node scripts/index.mjs` | 资产变动后（开发期一次性） | 扫描 assets/ → 生成 catalog.md |
| `node scripts/lint.mjs <file.html>` | agent 每写一版后 | 确定性反 AI 味检查，退出码 1 = 有 P0/P1 要修 |
| `node scripts/validate.mjs <file.html>` | agent 交付前 | 检查 doctype / `</html>` / 长度 / 自包含 |

> 运行时 agent **只读 catalog.md 和命中的资产**，不跑 `index.mjs`；只有你新增 / 修改了资产，才需要重跑一次生成目录。

## License

Apache-2.0。资产版权归 open-design 原作者，本仓库仅做提取与 skill 化编排。
