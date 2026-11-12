#!/usr/bin/env node
/**
 * scripts/visual.mjs — 视觉自检 CLI（确定性，真浏览器）
 *
 * 用法: node scripts/visual.mjs <file.html> [--json] [--width 390,1440]
 * 退出码: 0 = 无 P0；1 = 有 P0（必须修）；2 = 用法错误 / 无法运行
 *
 * 与 lint.mjs 的分工：lint 查字符串（AI 味 / 外部资源 / token），
 * 这里查真实布局（横向溢出、对比度、触控目标、标题层级、空 section）。
 */
import { visualCheck } from './visual-check.mjs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('用法: node scripts/visual.mjs <file.html> [--json] [--width 390,1440]');
  process.exit(2);
}
const wi = args.indexOf('--width');
const widths = wi !== -1 && args[wi + 1]
  ? args[wi + 1].split(',').map((n) => parseInt(n, 10)).filter(Boolean)
  : undefined;

const findings = await visualCheck(file, { widths });
const p0 = findings.filter((f) => f.severity === 'P0');

if (args.includes('--json')) {
  console.log(JSON.stringify({ file, findings, p0: p0.length }, null, 2));
} else if (findings.length === 0) {
  console.log('✓ 视觉自检通过（无溢出 / 对比度 / 触控目标问题）');
} else {
  for (const f of findings) {
    console.log(`[${f.severity}] ${f.id} — ${f.message}`);
    if (f.fix) console.log(`  修复: ${f.fix}`);
    if (f.snippet) console.log(`  片段: ${f.snippet}`);
  }
  console.log(`\n共 ${findings.length} 条，其中 P0 ${p0.length} 条。`);
}
process.exit(p0.length ? 1 : 0);
