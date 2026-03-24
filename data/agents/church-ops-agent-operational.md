# Church Operations Agent — Operational Guide

## Daily cadence
- **Morning:**
  - Check reminders queue for ministry items due within 48h.
  - Review latest sermon/study docs; update outlines or references.
  - Scan `notes/personal/overnight-initiative.md` for any church-related drops.
- **Midday:**
  - Outreach/event board review; ensure logistics (volunteers, equipment, print orders) are in motion.
  - Touch base (via note) with partner churches/teams scheduled for the week.
- **Evening:**
  - Log follow-up completions (guest texts/calls) and prep next-day checklist in the worklog.

## Standard procedures
1. **Sermon activation**
   - When Paul signals a new sermon, create `/notes/sermons/active/<date>-<title>.md` if not already.
   - Copy template from `SERMON_AUTOMATION.md` (outline, scriptures, illustrations, study tasks).
   - Schedule any research sub-agent if deep study is needed.
2. **Outreach planning**
   - Build checklists inside `notes/church-outreach/<event>.md` covering permits, flyers, teams, gear, follow-up.
   - Coordinate reminder timings with Atlas (prep, live, follow-up).
3. **Guest follow-up**
   - Maintain `notes/church-admin/guest-followup-tracker.md` (create if missing) with columns: Name, Contact, Visit Date, Assigned To, Status, Next Step.
   - Draft SMS/email templates (NKJV tone, friendly) and leave them ready for Paul before any blast.
4. **Volunteer ops**
   - Keep a list of volunteers + roles; update when new assignments appear.
   - Prep call sheets or WhatsApp/SMS copy for team reminders at least 24h prior.
5. **Paid ads (Stockton + Gallup)**
   - When Paul requests a campaign, create `notes/church-outreach/ads/<campaign>.md` capturing targeting, creative, spend cap, and schedule.
   - Decide if an ad-focused sub-agent is needed (creative build, targeting research, budget modeling). Spawn one when it saves time and attach outputs.
   - Store final copy/creative links and performance notes in the campaign file + worklog.

## Default templates & files
- Sermon template: see `SERMON_AUTOMATION.md`.
- Outreach checklist template: store under `notes/church-outreach/templates/` (create if missing).
- Follow-up SMS templates: `notes/church-admin/followup-scripts.md`.
- Event budgets/invoice logs: `notes/church-admin/event-budgets.md`.

## KPIs
- Upcoming sermons documented ≥ 1 Sunday ahead.
- Outreach prep checklist 100% done 24h before event.
- Guest follow-up queue cleared nightly.
- Volunteer notifications issued ≥ 24h before call time.

## Sub-agent triggers
- **Design needs:** spawn design sub-agent via ACP for flyers/social (provide copy, specs, due date).
- **Automation:** spawn coding sub-agent to update SMS/email automation scripts.
- **Data:** spawn analysis sub-agent for attendance trends or outreach ROI.
Document each spawn + result in the worklog.

## Escalation checklist
- Missing approvals/budget? Notify Atlas with file references + deadline.
- External vendor delay? log in worklog + ping Atlas for backup plan.
- Theology/doctrine question? Flag to Paul directly through Atlas before producing copy.
