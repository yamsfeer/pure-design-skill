---
name: pure-design-skill
description: |
  把用户一句口语化的自然语言需求，变成一个自包含、有明确设计风格、生产级的 HTML 页面。
  内置 open-design 完整资产库（162 个技能、151 个设计系统、114 个模板、5 个视觉方向、11 个工艺参考）。
  流程：判断任务类型 → 查 catalog 收窄选型 → grilling 澄清 → 迭代生成 → 确定性反 AI 味 lint → 交付校验。
triggers:
  - "设计一个页面"
  - "做一个网站"
  - "设计 dashboard"
  - "设计落地页"
  - "UI 设计"
  - "生成 HTML"
---

# Pure Design

把用户一句口语化的需求，变成一个**自包含、有明确设计风格、生产级**的 HTML 页面。无登录、无云服务、无外部资源。

## 工作方式（两段式）

### 阶段一：选型 + 澄清（写代码之前）

1. **判断任务类型**（靠语义理解，别用关键词正则）：读 brief，判断它属于下面 6 类之一——
   `web` / `dashboard` / `mobile` / `deck` / `editorial` / `brand`。判断依据是「意思」不是「词」：用户说「数据看板」就该归 dashboard，说「在手机上用的东西」就该归 mobile。
2. **查目录收窄**：读 `catalog.md`（本 SKILL.md 同级目录），按任务类型从「一、任务类型 → 候选」表拿到候选 skill / 模板。**只读 catalog + 命中的资产，不要翻 assets/ 目录。**
3. **选设计系统**：默认 `default`。只有用户**点名品牌**（如「要 Stripe 风格」）才在 catalog.md「二、设计系统索引」里按名字查，命中后 read 对应 `DESIGN.md`。
4. **选视觉方向**：从 catalog.md「三、视觉方向」的 5 个里挑 1 个，read 对应 `.md`。
5. **grilling 澄清**：信息不够就问，**一次一个问题、带推荐答案**，等用户回答再继续。能自己推断的别问；只有「会实质改变结果的决定」才问（目标受众 / 内容规模 / 硬性约束 / 品牌资产）。用户贴 logo、色值、参考图，也在这里接收。

### 阶段二：生成 + 迭代 + 质检（你自己干）

6. **读资产全文**：把选中的这些全部读进来——
   - skill：`assets/skills/<id>/SKILL.md`
   - 设计系统：`assets/design-systems/<id>/DESIGN.md`
   - 方向：`assets/directions/<id>.md`
   - craft：按 catalog.md「四」里的映射选 3–4 个，read `assets/craft/<id>.md`
   - 模板：`assets/design-templates/<id>/SKILL.md` + 它的 `assets/template.html`（种子骨架）+ `references/layouts.md`（区块库）+ `references/checklist.md`（自检清单）
7. **生成循环**：写完整 HTML → 对照自检清单逐条自查 → 不达标就重写 → 直到满意。**最多 6 版**，达到满意就停，别硬凑轮数。
8. **写后 lint**（确定性，非自评）：每写一版后跑 `node scripts/lint.mjs <file>`，P0/P1 必须修，P2 尽量修。
9. **交付校验**：跑 `node scripts/validate.mjs <file>`，确认自包含、没截断。
10. **归档**：写到语义文件名（从 brief 派生，中英文混排），已存在就 `+v2`/`+v3`。

## 输出契约（HARD REQUIREMENTS）

- 只输出一个完整自包含 HTML（`<!doctype html>` 到 `</html>`）。
- CSS 全内联在 `<style>`；禁止任何外部资源（字体 / 图片 / CDN / JS / 外链）。
- 用模板的 `:root` 变量体系，把 DESIGN.md 配色精确映射到 `--bg/--surface/--fg/--muted/--border/--accent`，别另造 hex。
- 每个顶层 `<section>` 加 `data-od-id`。
- 中文 brief → 界面文案用中文。
- 不编造数据 / 指标；示例数据标注为示例 / 占位。
- 界面要有真实状态：悬停 / 聚焦 / 点击反馈；移动端宽度下不横向溢出。

## 文件位置（重要）

本 SKILL.md 所在目录记为 **SKILL_DIR**，所有路径都相对它：

| 路径 | 内容 |
|---|---|
| `SKILL_DIR/catalog.md` | 资产目录（选型入口，只读它 + 命中的资产） |
| `SKILL_DIR/assets/skills/<id>/SKILL.md` | 技能 |
| `SKILL_DIR/assets/design-systems/<id>/DESIGN.md` | 设计系统 |
| `SKILL_DIR/assets/design-templates/<id>/` | 模板（SKILL.md + assets/template.html + references/） |
| `SKILL_DIR/assets/directions/<id>.md` | 视觉方向 |
| `SKILL_DIR/assets/craft/<id>.md` | 工艺参考 |
| `SKILL_DIR/scripts/lint.mjs` / `scripts/validate.mjs` | 确定性质检脚本 |

如果你（agent）知道本 skill 的安装路径就直接用；否则先定位本 SKILL.md，或用 `PURE_DESIGN_DIR` 环境变量。

## 兜底

- 拿不准任务类型 → `web`；拿不准 skill → `frontend-design`（最通用）。
- 真·歧义 → 直接问用户，别猜。
