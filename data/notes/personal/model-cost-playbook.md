# Model Cost Playbook (updated 2026-03-23)

## 1. Usage audit
- **Default behavior:** Everything previously ran on `openai/gpt-4o-mini` because it was the global default. Premium (gpt-5.1-codex) was rarely triggered automatically.
- **High-risk areas:**
  - Sermon/ad copy occasionally stayed on Tier C even when it should have been higher quality.
  - Atlas planning sessions sometimes needed deeper reasoning but were stuck on Tier C.
  - BDM Sales tasks almost never needed high-tier models, so we keep that lane on Tier C by default.
- **Goal:** Keep 80–90% of daily tokens on Tier C, <20% on Tier B, and only spike into Tier A when Paul explicitly needs it.

## 2. Price reference
| Tier | Model | Approx cost (per 1M tokens) | Use cases |
| --- | --- | --- | --- |
| Premium | `openai/gpt-5.1-codex` | ~$25 input / ~$75 output | Sermon study, public-facing statements, legal/financial analysis |
| Balanced | `openai/gpt-4o` | ~$5 input / ~$15 output | Planning, research, narrative recaps |
| Economy | `openai/gpt-4o-mini` | ~$0.60 input / ~$2.40 output | Lists, reminders, data transforms |

*(Update numbers when OpenAI refreshes pricing.)*

## 3. Agent defaults & triggers
- **Atlas:** default Balanced. Upgrade for public summaries, complex multi-step work, or sensitive notes. Downgrade to Economy for reminder edits/housekeeping.
- **Micah (Church Ops):** default Balanced. Upgrade for sermon research or ad copy. Downgrade for volunteer rosters, supply lists, reminder batching.
- **Grant (BDM Sales):** default Economy. Upgrade only when drafting outbound messages/proposals that Paul may send without major edits. Stay on Economy for pipeline upkeep.
- **Nova (Business Growth):** default Balanced. Upgrade for sales pages, investor decks, automation architecture. Downgrade for experiment logging/backlog grooming.

## 4. When to log spend
- If any turn is expected to exceed ~$1 (≈170k Tier C tokens, ≈13k Tier B tokens, ≈4k Tier A tokens), jot a note in `memory/YYYY-MM-DD.md`:
  - `MODEL_SPEND: <agent> | <task> | <tier> | est $X`
- This creates a lightweight audit trail for later review.

## 5. Escalation rules
1. Retry on Tier B if Tier C output is weak before jumping to Tier A.
2. Paul’s explicit “use Premium” overrides everything else.
3. Revisit this playbook monthly; adjust percentages if Premium creep exceeds ~20% of total token volume.

## 6. Quick reference commands
- Update routing: edit `MODEL_ROUTING.md`.
- Change agent defaults: `openclaw config set agents.list[...]` or edit `~/.openclaw/openclaw.json`.
- Check current config: `openclaw models routes` (or `openclaw agents list`, once support is enabled).
