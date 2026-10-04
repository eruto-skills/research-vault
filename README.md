# research-vault

Create and maintain a sourced Markdown research vault with topic indexes, integrity checks, and freshness management.

## Codex / Claude Code installation

This package supports both Codex and Claude Code. The plugin entry point is
`skills/research-vault/SKILL.md`; the root `SKILL.md` remains the standalone source.

For Codex, add the public `eruto-skills` marketplace in the plugin UI using
`https://github.com/eruto-skills/marketplace`, then install `research-vault`.
To install as a standalone user skill instead:

```bash
mkdir -p ~/.agents/skills
git clone https://github.com/eruto-skills/research-vault.git ~/.agents/skills/research-vault
```

On Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE/.agents/skills" | Out-Null
git clone https://github.com/eruto-skills/research-vault.git "$env:USERPROFILE/.agents/skills/research-vault"
```

In Codex, select the installed skill by name or invoke `$research-vault` with a task.
In Claude Code:

```text
/plugin marketplace add eruto-skills/marketplace
/plugin install research-vault@eruto-skills
```

The instructions use the tools available in the current host. Scripts are resolved
from the actual skill directory, rather than a fixed author path. Additional browser,
Python, or format-specific dependencies are described in `SKILL.md` and the references;
installing the plugin alone does not install those external programs.

## Maintaining the plugin package

Edit the root `SKILL.md` and its supporting resources, then run:

```bash
node scripts/package-plugin.mjs
node scripts/package-plugin.mjs --check
```

Commit the generated `skills/` files with the source changes. CI checks that both
layouts match, including the Claude manifest. Do not edit generated files directly.
