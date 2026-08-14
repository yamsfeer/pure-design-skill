#!/usr/bin/env node
/**
 * scripts/validate.mjs — 交付完整性校验（确定性，非 LLM 自评）
 *
 * 检查: 文件存在 / <!doctype html> / </html> 结尾 / 长度 / 自包含（无外部资源）。
 * 用法: node scripts/validate.mjs <file.html>
 * 退出码: 0 = 通过；1 = 未通过。
 */
import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('用法: node scripts/validate.mjs <file.html>');
  process.exit(2);
}
if (!existsSync(file)) {
  console.log(`✗ 文件不存在: ${file}`);
  process.exit(1);
}

const html = readFileSync(file, 'utf8');
const head = html.slice(0, 200).toLowerCase();
const problems = [];

if (!/<!doctype html/i.test(head)) problems.push('缺少 <!doctype html> 声明');
if (!/<\/html>\s*$/i.test(html.trimEnd())) problems.push('缺 </html>（可能被截断）');
if (html.length < 100) problems.push(`内容过短（${html.length} 字节）`);

// 自包含检查：禁止任何外部资源（字体/图片/CDN/JS/外链）
const extRefs = [
  ...html.matchAll(/<link[^>]+href=["']https?:\/\//gi),
  ...html.matchAll(/<script[^>]+src=["']https?:\/\//gi),
  ...html.matchAll(/<img[^>]+src=["']https?:\/\//gi),
];
if (extRefs.length) problems.push(`引用了 ${extRefs.length} 处外部资源（必须自包含、零外部依赖）`);

if (problems.length === 0) {
  console.log(`✓ 交付校验通过（${html.length} 字节，自包含）`);
  process.exit(0);
}
for (const p of problems) console.log(`✗ ${p}`);
process.exit(1);
