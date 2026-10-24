---
inclusion: always
---

# Product: Blue Envelope

Blue Envelope helps MassHealth members keep their coverage through the 2027 work and education requirements and six-month renewals. A member photographs the renewal notice that arrives in a blue envelope, sees it explained in their language, finds the easiest way they may already meet the rules, builds a proof packet, and sends it through MassHealth's official channels. Health center navigators and community partners help through consented sharing.

Hackathon: Hackachusetts 2026, Healthcare & Biotech track, challenge H2 "Keeping residents connected to health coverage". Judged on potential value, use of Kiro, and quality and design.

Full requirements: #[[file:docs/PRD.md]]
Rules and their sources: #[[file:docs/RULES_SOURCE.md]]
Sample content to use verbatim: #[[file:docs/SAMPLE_CONTENT.md]]
Visual and interaction reference (match it): #[[file:docs/design-reference/blue-envelope-app.html]]

## Non-negotiable principles

1. **The state decides.** Never tell a user they are eligible, approved, guaranteed, or that they qualify. Use "may meet" and "may be excused", and say "MassHealth makes the decision". Every flow ends at MassHealth's official channels.
2. **The member owns the packet.** No one else can read a member's documents unless the member turns sharing on. Sharing can be turned off at any time.
3. **Every rule cites a source** from `docs/RULES_SOURCE.md` (URL and date read).
4. **Plain words in six languages**: English, Spanish, Portuguese, Haitian Creole, Simplified Chinese, Vietnamese. Sixth-grade reading level. Read-aloud available.
5. **Synthetic data only.** All people, letters and amounts are labeled samples. Never use real PHI or real organization names for samples.
6. **Independent tool.** Every screen shows "Independent tool · Not MassHealth · Sample data". Never use MassHealth logos or imitate official letterhead.

## Why these matter

Arkansas's 2018 work requirement removed about 18,000 people, and more than 95% of those targeted were already working or should have been exempt. The failure was paperwork and communication, not eligibility. Our product exists to close that gap without ever replacing the state's decision.
