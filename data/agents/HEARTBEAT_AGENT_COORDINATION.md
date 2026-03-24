# Heartbeat Agent Coordination

## Purpose
Simulate persistent background agents using files, worklogs, and periodic heartbeat-driven reviews, with Atlas acting as coordinator.

## Core model
- Atlas = coordinator
- Specialist agents = Micah (Church Ops), Grant (BDM Sales), Nova (Business Growth)
- Heartbeats = scheduled review moments
- Shared files = memory + handoff layer

## Heartbeat responsibilities for Atlas
When heartbeat or proactive review time occurs:
1. Check shared priorities + routing cheat sheet.
2. Check open loops/reminders for near-term deadlines.
3. Check each specialist worklog.
4. Decide which lane needs immediate attention.
5. Advance at least one meaningful deliverable (doc update, reminder, asset, etc.).
6. Update worklogs/handoffs with what changed.

## Priority review order
1. Micah · Church Operations Agent (sermons, outreach, events, retention)
2. Grant · BDM Sales Agent (pipeline, follow-ups, proposals)
3. Nova · Business Growth Agent (experiments, offers, marketing assets)
4. Atlas Coordinator hygiene (routing, reminders, automation scripts)

## Rule
Do not try to advance everything every heartbeat. Advance the most valuable lane first.

## Output rule
When reporting back to Paul, keep it short:
- what was improved
- what remains open
- what the next useful step is
