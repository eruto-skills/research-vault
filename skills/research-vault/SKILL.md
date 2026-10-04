---
name: research-vault
description: "Bootstrap and operate a sourced research vault (Obsidian-compatible Markdown project) for a long-running investigation of any topic — a country, hobby, technology, or domain. Scaffolds pillar structure with index notes, declares a project CLAUDE.md (writing rules, freshness management, quality gates), provides a parallel research-agent workflow with verification discipline, and a deterministic integrity checker. Trigger on: \"調査プロジェクトを作りたい\", \"research vault\", \"◯◯を調べて蓄積したい\", \"knowledge base project for X\". NOT for one-off investigations that produce a single note — use research-note for those."
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, WebSearch, Bash, Task
argument-hint: [topic]
---

# research-vault

## 実行環境の扱い

この手順の Read / Bash / WebSearch / Agent / Skill は操作の種類を表す。
Claude Codeでは対応するツールを使い、Codexでは提供されているファイル読取・シェル・Web検索・画像表示ツールを使う。
別スキルを使うときは、利用可能なスキル一覧から名前と実際の SKILL.md の場所を確認して読む。
スキルが未導入なら、その工程に必要な依存として案内し、実行したことにしない。
サブエージェントは提供されているAPIと実行権限に従う。
使えない場合、取得作業は自分で順に行い、独立レビューが必要な工程は未実施として報告する。
スクリプトと参照資料は、この SKILL.md のあるディレクトリを基準に絶対パスへ解決する。
作業先プロジェクトの cwd や隣のプラグインの配置を、スキルの配置場所と取り違えない。

Set up and run a research vault: a Markdown project that accumulates sourced notes about one topic over months, stays navigable as it grows, and keeps its facts verifiable and fresh.

## When to use / not use

- Use for: a **project** — many notes, multiple visits, growth over time
- Do not use for: a single investigation ("research X and write me a note") — that is the available research-note skill (resolve its path from the skill list)

## Workflow

### 1. Interview (once, at bootstrap)

Ask the user:

- What is the topic, and what will the vault be **used for**? (2〜4 purposes become the pillars, e.g. culture / language / travel)
- Obsidian WikiLinks or plain Markdown links?
- Git: local only, or private remote? (Default new remotes to PRIVATE)

### 2. Scaffold minimal — flat, not deep

Create only: one folder per pillar, each with a `00_index.md` (the single entry point), a root README, and the project CLAUDE.md from [claude-md-template](references/claude-md-template.md).
Also create an AGENTS.md entry that tells Codex to read the shared CLAUDE.md before work. Copy `scripts/check_notes.js` into the project.

**Do not pre-create subfolders or empty category files.** Start flat inside each pillar; split a subfolder only when a cluster of 3+ same-kind notes exists and is still growing. Premature taxonomy causes decision paralysis and empty folders — links and index notes do the organizing until then.

### 3. Research loop

- Single topic → run research-note (it will follow this project's CLAUDE.md placement rules)
- Batch of topics → parallel subagents, one per topic, **max 5–6 per wave** (larger waves amplify quota-outage blast radius and outrun your review capacity). Build each prompt from [agent-prompt-template](references/agent-prompt-template.md)
- After each wave: run `node scripts/check_notes.js`, review only judgment-heavy parts (fact ranges, interpretation-vs-fact separation, canon boundaries with existing notes), update indexes yourself (agents must not touch shared files), commit

### 4. Keep it healthy as it grows

- New note → add a link in its pillar's `00_index.md` (the checker flags orphans)
- Volatile facts (prices, officeholders, regulations, availability) get a retrieval date stamp (e.g. "as of 2026-08") and a row in CLAUDE.md's freshness table
- Cross-cutting themes → a MOC (map-of-content) note linking existing notes, not a new folder
- When sources disagree, record the disagreement instead of picking silently; when something could not be found, write "not found" so the search is not repeated

## Verification discipline (why the quality holds)

Generation and verification are separated — the agent that wrote a note never grades it:

1. Agents may cite only URLs whose content they actually read, and must report what they could **not** verify
2. Deterministic checks (links, footnote pairing, orphans) run before any human-judgment review
3. Error-prone fact classes (official registry statuses, current officeholders, program start dates) are named explicitly in the prompt with "verify against a primary source"

## Bundled resources

- [claude-md-template](references/claude-md-template.md) — project CLAUDE.md starting point (structure, placement table, writing rules, freshness, quality gates)
- [agent-prompt-template](references/agent-prompt-template.md) — parallel research agent order form
- `scripts/check_notes.js` — deterministic integrity checker (WikiLink resolution, footnote ref/def pairing, orphan detection)
