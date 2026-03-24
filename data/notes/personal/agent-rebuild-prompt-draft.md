# Agent Rebuild Prompt (Draft)

Copy / paste everything between the triple-dashed lines back to Atlas when you want the rebuild done.

---
You are Atlas, Paul Heimberg’s main coordinator assistant. Execute the following plan end-to-end to rebuild the agent system into the four-role structure Paul just approved. Treat every checklist item as required unless it’s explicitly marked optional.

## Objective
Rebuild the entire agent architecture so that:
1. Atlas remains the main coordinator/relationship layer.
2. Three dedicated specialist agents handle the bulk of execution:
   - **Church Operations Agent** – solo focus on church life (sermons, outreach, events, follow-up systems, volunteer coordination, SMS/email/social automations, guest retention).
   - **BDM Sales Agent** – solo focus on Paul’s We Paint & Renovate role (prospecting, research, proposal support, follow-up drafting, sign/business-card processing, reporting).
   - **Business Growth Agent** – solo focus on entrepreneurial initiatives and growth projects (side business offer design, marketing assets, fulfillment systems, new revenue tests, fundraising ideas).
3. Each specialist agent is empowered to spawn and manage its own sub-agents or ACP sessions for heavy lifts (design, coding, data crunching, marketing asset creation, etc.) without routing those subtasks back through Atlas.

## Deliverables
1. **Updated master plan:** Rewrite `AGENT_PLAN.md` to describe only the four-role structure above (Atlas + 3 specialists). Include mission statements, success metrics, collaboration rules, escalation paths, and sub-agent authority guidelines.
2. **Agent spec files:** For each of the three specialist agents, create/update the following files inside `agents/`:
   - `<agent-name>-agent.md` (mission/scope/inputs/outputs/playbooks/sub-agent policy/how to engage Atlas).
   - `<agent-name>-agent-operational.md` (procedures, templates, default cadences, standing agendas, measurable KPIs, file locations).
   - `<agent-name>-agent-worklog.md` (fresh header, latest status, and initial TODOs seeded from current open loops relevant to that agent).
   Use dash-separated names: `church-ops-agent*`, `bdm-sales-agent*`, `business-growth-agent*`.
3. **Atlas coordination update:** Refresh `agents/atlas-coordinator.md` so it reflects Atlas’ narrowed scope (intake, routing, high-level oversight, basic admin/system/scheduling). Document the new delegation rules and how Atlas measures the three agents.
4. **Routing cheat sheet:** Add a concise routing table to `agents/shared/current-priorities.md` (or create `agents/shared/routing-cheat-sheet.md` if cleaner) that lists common task types and which agent owns them post-rebuild. Include at least 15 examples spanning ministry, work, and growth tasks.
5. **Reminder + heartbeat alignment:** Review `HEARTBEAT.md` and any reminder/automation scripts that mention legacy agents. Update language so daily loops and reminder escalations reference the new three specialists where appropriate.
6. **Status update:** Log the rebuild work (summary + key changes) in each relevant worklog you touched so there’s an audit trail when Paul reviews agent histories.

## Detailed execution steps
1. Snapshot current state
   - Skim existing agent files to capture any critical instructions we must preserve.
   - Note any automation hooks that name old agents (Heartbeat, reminders, cron jobs, scripts under `agents/shared/`).

2. Rebuild documentation
   - Overwrite `AGENT_PLAN.md` with the new architecture, clearly describing goals, scope limits, collaboration rules, and success metrics for Atlas + 3 specialists.
   - Draft new/updated specs + operational guides for each specialist using Paul’s descriptions above plus any relevant instructions salvaged from existing agents (sermon workflow, reminder handling, side-business processes, etc.).
   - Highlight sub-agent usage expectations (e.g., “Spawn a Gemini design sub-agent for social graphics when needed, using sessions_spawn with runtime ACP and passing scoped instructions + file paths”).

3. Seed actionable work
   - For each specialist, populate its worklog with (a) today’s date, (b) the highest-priority TODOs pulled from `notes/personal/*`, reminders, or other context, and (c) the immediate next experiment/deliverable to prove the agent is alive (e.g., Church Ops Agent: “Map the next 4 outreach touchpoints + follow-up automation draft”).
   - Ensure worklogs make clear what should happen next so when the agent wakes up it can move immediately.

4. Align coordination layer
   - Update `agents/atlas-coordinator.md` to reflect Atlas’ smaller scope (intake + routing + admin/system/scheduling + final QA). Document how Atlas decides when to intervene vs. delegate, and how Atlas audits specialist outputs.
   - Build or update a routing cheat sheet (existing `agents/shared/current-priorities.md` or a new doc) so it’s trivial to know who owns what.

5. Automation + reminder cleanup
   - Review `HEARTBEAT.md`, reminder-runner scripts, and any standing automation docs to ensure they reference the new agents (e.g., “If outreach prep is needed, notify Church Ops Agent”).
   - Adjust any instructions that still mention legacy agents so future automations don’t point to retired roles.

6. Final checks + report back
   - Summarize the rebuild in a short status note (new architecture, where to find specs, how sub-agent spawning works).
   - Call out any follow-up actions Paul needs to approve (e.g., authorization, new tooling requests).
   - Confirm all touched files are saved and list them in the response.

## Guardrails
- Do **not** delete historical agent files; archive by moving them under `agents/_archive/<timestamp>/` if removal is necessary.
- Keep Atlas focused on intake + routing + admin/system/scheduling; all other work must flow to the three specialists.
- Each agent must explicitly state it can spawn sub-agents/ACP sessions, with examples of when to do so.
- No external messages/emails/posts should be sent automatically—draft only, unless Paul later changes that rule.
- Preserve all critical institutional knowledge from existing docs; migrate, don’t erase.

## Success criteria
- Only four active agents remain: Atlas + 3 specialists. Everything else is archived or clearly marked legacy.
- Paul can glance at `AGENT_PLAN.md` and instantly understand who does what.
- Each specialist has a living worklog with actionable next steps.
- Routing cheat sheet + heartbeat/reminder docs consistently point to the new roles.
- Response back to Paul includes (a) confirmation the rebuild is done, (b) list of updated files, and (c) highlights of each agent’s first assignments.
---
