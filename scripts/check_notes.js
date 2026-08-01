#!/usr/bin/env node
// Vault のノート整合性チェック（決定的検査）
// 検査項目:
//   1. WikiLink の解決: [[target]] / [[path/target|alias]] の basename が Vault 内に存在するか
//   2. 脚注の対応: 本文の [^N] 参照と [^N]: 定義が過不足なく対応するか
//   3. 孤立ノート: どのノートからもリンクされていないノート（警告のみ）
// 使い方: node scripts/check_notes.js   （Vault ルートで実行。終了コード 1 = エラーあり）
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules" || e.name === ".obsidian") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".md")) files.push(p);
  }
})(ROOT);

const basenames = new Map(); // basename(拡張子なし) -> パス一覧
for (const f of files) {
  const b = path.basename(f, ".md");
  if (!basenames.has(b)) basenames.set(b, []);
  basenames.get(b).push(f);
}

let errors = 0;
const warnings = [];
const linkedTargets = new Set();

for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  let text = fs.readFileSync(f, "utf8");
  // インラインコード内の [[name]] 等（構文例）は検査対象外
  const scrubbed = text.replace(/`[^`\n]*`/g, "");

  // 1. WikiLink
  for (const m of scrubbed.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
    // 表セル内の別名リンク [[target\|alias]] は末尾にエスケープ用の \ が残るため除去する
    const target = m[1].trim().replace(/\\$/, "");
    const base = target.split("/").pop();
    if (!basenames.has(base)) {
      console.log(`ERROR ${rel}: リンク切れ [[${target}]]`);
      errors++;
    } else {
      linkedTargets.add(base);
    }
  }

  // 2. 脚注の対応（[^N]: 定義行と本文参照）
  const defs = new Set();
  for (const m of scrubbed.matchAll(/^\[\^(\d+)\]:/gm)) defs.add(m[1]);
  const refs = new Set();
  const noDefLines = scrubbed.replace(/^\[\^\d+\]:.*$/gm, "");
  for (const m of noDefLines.matchAll(/\[\^(\d+)\]/g)) refs.add(m[1]);
  for (const r of refs) if (!defs.has(r)) { console.log(`ERROR ${rel}: 脚注 [^${r}] の定義がない`); errors++; }
  for (const d of defs) if (!refs.has(d)) { console.log(`ERROR ${rel}: 脚注定義 [^${d}] が本文から参照されていない`); errors++; }
}

// 3. 孤立ノート（索引・設定類は除外）
const exempt = new Set(["README", "CLAUDE", "00_index", "MEMORY"]);
for (const f of files) {
  const b = path.basename(f, ".md");
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  if (exempt.has(b) || rel.startsWith(".claude/") || rel.startsWith("scripts/")) continue;
  if (!linkedTargets.has(b)) warnings.push(`WARN  ${rel}: どのノートからもリンクされていない（孤立）`);
}
for (const w of warnings) console.log(w);

console.log(`--- check_notes: ${files.length} files, ${errors} errors, ${warnings.length} warnings`);
process.exit(errors > 0 ? 1 : 0);
