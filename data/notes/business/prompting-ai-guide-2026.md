# Prompting AI Like a Pro (2026)

_Last updated: 20 Mar 2026_

## 1. Why prompting still matters
Modern models (GPT-4o 1M tokens, Claude 3.7 2M, Gemini 2.0 10M) can reason through dozens of steps, but they stay literal. Short, vague requests waste most of that capability. Treat prompts like specs: a clear objective, the right context, and an explicit output contract turn Atlas (and other models) into a predictable teammate instead of a chat toy. (Source: [AI Corner, 2026 Guide](https://www.the-ai-corner.com/p/your-2026-guide-to-prompt-engineering))

## 2. What the best prompt minds agree on
| Expert/source | Core point | How to use it |
| --- | --- | --- |
| [IBM Prompt Engineering Guide (2026)](https://www.ibm.com/think/prompt-engineering) | "Prompt engineering is the new coding"; context engineering (RAG, summaries, structured inputs) beats ad-hoc chit chat. | Package the right documents, label sections, and send JSON-friendly requests so the model knows what matters. |
| [AI Corner 2026 guide](https://www.the-ai-corner.com/p/your-2026-guide-to-prompt-engineering) | Six-part structure works across GPT, Claude, Gemini: Role, Goal, Context, Format, Examples, Constraints. | Make every important prompt follow this skeleton so Atlas always knows who to be, what to do, and how to reply. |
| [PromptBuilder checklist (2026)](https://promptbuilder.cc/blog/prompt-engineering-best-practices-2026) | Define success criteria, output contract, constraints, inputs, examples, verification, iteration. | Turn each request into a mini spec with a "self-check" block so the model validates its own answer. |
| [Andrew Ng & Isa Fulford course](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) | Iterative prompting and systematic testing are mandatory; prompts power summarizing, inferring, transforming, expanding tasks. | Start with a draft, inspect, refine the instructions, and keep the same spec for repeated jobs. |
| [Prompting Science Report #1](https://gail.wharton.upenn.edu/research-and-insights/tech-report-prompt-engineering-is-complicated-and-contingent/) (Mollick et al.) | Prompt effects are contingent; formatting helps, politeness doesn’t matter on average, and benchmarks must be multi-trial. | Expect variance. Re-run important prompts, keep evaluation rubrics, and don’t assume a trick works everywhere. |
| [Riley Goodside interview (Scale AI)](https://www.cognitiverevolution.ai/from-poetry-to-programming-the-evolution-of-prompt-engineering-with-riley-goodside-of-scale-ai/) | Prompting has become "more programming than poetry"; enterprises rely on contracts, curated examples, and tool-aware flows. | Write prompts like code reviews: clean sections, sample I/O pairs, and guidance on which tools or files to touch. |

## 3. Paul’s practical framework
Use this whenever you ask Atlas (or another model) for anything substantial.

```
/think minimal
ROLE: <who should Atlas imitate>
GOAL: <single verb target + success metric>
CONTEXT:
- Key fact 1
- Key fact 2
INPUTS:
- Doc(s) or pasted data
FORMAT:
- Section A (constraints)
- Section B (constraints)
- JSON schema if automation needs it
EXAMPLES:
- Mini sample if style matters
CONSTRAINTS:
- Scope/length guardrails
- How to handle uncertainty
SELF-CHECK:
- 3–4 boxes Atlas must tick before replying
```

## 4. Step-by-step deep dive
1. **Define “done”** – Borrow PromptBuilder’s success-criteria pattern. E.g., “Include only data from `Q2_sales.csv`; call out assumptions; keep total under 150 words.”
2. **Package context** – Follow IBM’s “designing with context.” Label attachments (e.g., `INPUT_A: Outreach notes (Feb 2026)`) and highlight what matters most so Atlas doesn’t waste tokens.
3. **Pick the persona** – Use AI Corner’s role slot (“Act as my bidding-specialist project manager”). This primes tone and tool choices.
4. **Specify the output contract** – Lay out the sections, tone, reading level, and machine-readable schema if you’ll paste the result into another system. (PromptBuilder)
5. **Seed with examples** – When format matters, include a three-line sample. Models learn faster from patterns than adjectives. (PromptBuilder)
6. **Add guardrails & self-check** – Tell Atlas how to respond when unsure (“Mark unsupported claims as [UNCERTAIN]”). Finish with a checkbox list so the model validates itself before sending. (PromptBuilder)
7. **Iterate intentionally** – Andrew Ng’s guidance: run the prompt, inspect misses, tighten wording, and re-use the improved spec for similar tasks. Save good prompts in `notes/business/prompts/`. 
8. **Evaluate like Mollick** – Important outputs deserve multi-run spot checks or a lightweight rubric (Correctness, Completeness, Clarity, Actionability). Formatting instructions tend to create the biggest lift.

## 5. Advanced techniques worth knowing
- **Context engineering (IBM)** – Point the model to the right snippets via summaries, bullet “must-use” facts, or RAG citations instead of dumping giant docs.
- **Few-shot scaffolds** – Give one miniature “before → after” so Atlas mirrors your style without guessing.
- **Chain and critique** – Ask Atlas to sketch steps first, then perform them. Follow with a self-critique block so it catches obvious misses.
- **Tool hints** – Tell Atlas which skills or files to call ("Use Sermon Agent for scripture pulls, but keep copywriting here"). Matches Riley Goodside’s “prompting = programming” stance.
- **Confidence gates** – Have Atlas rate its own answer 0–5 and state remaining unknowns. Declining to answer beats hallucinating.

## 6. Templates you can copy
### A. Research / synthesis
```
ROLE: Senior research analyst for We Paint & Renovate.
GOAL: Distill the attached 3 sources into client-ready talking points.
INPUTS:
- INPUT_A: Market outlook memo (Mar 2026)
- INPUT_B: Job notes (Concord Hospital)
FORMAT:
1. Executive takeaway (≤90 words)
2. Opportunity table (3 rows: signal, why it matters, suggested action)
3. Risks & unknowns (bullets)
CONSTRAINTS:
- Quote only from the inputs; mark guesses as [UNCERTAIN]
- Reading level: business casual, no jargon
SELF-CHECK:
- ☐ All claims cite A/B
- ☐ Table uses action verbs
- ☐ Risks mention owner impact
```

### B. Sermon ideation
```
ROLE: Ministry research assistant steeped in Pentecostal preaching.
GOAL: Turn the provided scripture + situation into one sermon outline Paul can finish himself.
CONTEXT:
- Theme: Encouraging new converts overwhelmed by change
INPUT:
- Romans 12:1-2 NKJV
FORMAT:
1. Hook (25 words max)
2. Scripture breakdown (3 insights, each w/ everyday analogy)
3. Application steps (3 bullets, imperative voice)
4. Prayer focus (2 sentences)
CONSTRAINTS: Guardrails: no full manuscript, just outline-level detail. Tie every point back to obedience + transformation.
SELF-CHECK: cite verse references, keep hook conversational, ensure applications are actionable this week.
```

### C. Outreach email polishing
```
ROLE: Paint-industry SDR coach.
GOAL: Rewrite the draft email so it feels like Paul and asks for one clear action.
INPUT: <<paste draft>>
FORMAT: Subject + body (≤140 words) + 3 follow-up variants (bullet list).
CONSTRAINTS: Maintain mention of past job; CTA must be "pick a walkthrough time"; 7th-grade clarity.
SELF-CHECK: CTA explicit? Word count ok? Tone = confident + warm?
```

## 7. Quick checklist before you hit send
1. Is the task singular and concrete?
2. Did you define success + format?
3. Does Atlas know which files/notes are relevant?
4. Did you include an example when style matters?
5. Is there a self-check or rubric?
6. Do you need multiple runs / eval set for safety-critical asks?

## 8. Storing and iterating prompts
- Save good prompts in `notes/business/prompts/` (create subfolders per use case: sermons, sales, admin).
- Note what changed when the prompt improved ("added success criteria," "limited scope to 3 actions").
- When a prompt breaks, log the failure + fix. Treat it like version control for your AI workflows.

## 9. How to practice fast
1. Pick one recurring task (e.g., sermon outline).
2. Draft the six-part prompt.
3. Run it, mark misses.
4. Tighten the spec, re-run.
5. Save the winning version + a 3-sample eval set (Mollick-style multiple trials) so you can spot regressions later.

Master these habits and Atlas will consistently give you the depth, accuracy, and tone you expect—without burning cycles on rework.
