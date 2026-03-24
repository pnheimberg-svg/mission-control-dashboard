# Dashboard Agent Review Loop

## Purpose
Make sure dashboard work is actually improving the system and not turning into messy drift.

## Review cycle
Whenever the dashboard agent makes changes:
1. Check whether the dashboard still opens cleanly
2. Check whether the new panel/data source actually works
3. Check whether the code stayed simple and readable
4. Record what improved and what still needs work

## Cleanliness standards
- no unnecessary complexity
- no broken links
- no fake/live claims when data is static
- no duplicated sections
- keep clear versioning in README if major improvements happen

## Review outputs
- what changed
- what works now
- what still needs work
- any blockers
