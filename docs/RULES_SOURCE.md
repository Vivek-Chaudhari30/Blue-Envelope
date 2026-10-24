# Rules Source

Every rule the engine encodes must trace to a line in this file. When the official page changes, update this file first, then the spec, then the code.

## Sources

| id | Title | URL | Read on |
|---|---|---|---|
| `mh-work-req` | New work and education requirements for MassHealth members (published July 21, 2026) | https://www.mass.gov/info-details/new-work-and-education-requirements-for-masshealth-members | 2026-10-24 |
| `mh-federal` | MassHealth federal updates and impact | https://www.mass.gov/info-details/masshealth-federal-updates-and-impact | 2026-10-24 |
| `kff-hardship` | KFF: high-unemployment hardship exception | https://www.kff.org/medicaid/a-look-at-the-high-unemployment-hardship-exception-to-medicaid-work-requirements-based-on-unemployment-data-from-february-2025-to-january-2026/ | 2026-10-24 |

## 1. Ways to meet the requirement in a month (`mh-work-req`)

- Work **80 or more hours** per month (can include unpaid work or work done for goods or services).
- MassHealth determines income to be **$580 or more per month**, no matter the hours. Seasonal workers can average $580 per month over a six-month period.
- Volunteer **80 hours or more** per month with a non-partisan public or nonprofit organization.
- Participate in an approved job training program for **at least 80 hours** per month.
- Be enrolled in an educational program (high school, GED, community college, university) **at least half-time**.
- Do a **total** of work, volunteer, work program, or school for **80 or more hours** per month.

## 2. Who is affected, and exemptions (`mh-work-req`)

Mostly affects adults **19 through 64** who do **not** have young children, a disability, or a medical condition that significantly impairs ability to work.

A member may be exempt (excused) if they:
- are pregnant or less than 12 months postpartum;
- are a parent, guardian, caretaker relative or family caregiver of a child **younger than 14** or a disabled individual (including providing at least 80 hours of care a month);
- are eligible for Medicare Part A or enrolled in Medicare Part B;
- are younger than 26 and had Medicaid when they aged out of foster care;
- are a certain American Indian or Alaska Native;
- live with a disability limiting daily tasks, an alcohol or drug addiction, a serious mental health condition, a serious or complex medical condition needing frequent care, or blindness/disability under Social Security rules (may need to show it significantly impairs ability to work);
- receive TAFDC and meet TAFDC work rules;
- are a veteran with a total disability rating from the VA;
- are in a SNAP household where DTA said someone must meet work rules;
- participate in certain substance use disorder treatment programs;
- are an inmate of a public institution, or were in the previous three months.

The prototype's Q2 groups these into six plain-language options; the rest are covered in the spec as additional exemption codes.

## 3. Timing (`mh-work-req`)

- Current members are not affected until their **first renewal of 2027** (or a change affecting coverage). They must meet the requirement for **one month between their last renewal and their next renewal**.
- New applicants must meet it **the month before they apply**.
- If MassHealth lacks data, the renewal notice arrives **in a blue envelope**.
- Many affected members will renew **every six months** (`mh-federal`).
- States may exempt counties with unemployment **≥ 8%** or **≥ 1.5× the national rate** (`kff-hardship`). Used only as a Coverage Twin lever.

## 4. Properties for property-based tests (fast-check)

Rules engine:
1. Any exemption present ⇒ status is `excused`, regardless of hours or income.
2. Age band `under-19` or `65-plus` ⇒ status is `age`.
3. In the 19–64 band with no exemption, income ≥ 580 ⇒ status is `income`, regardless of hours.
4. Hours add across activities: work + volunteer + training ≥ 80 (and no earlier rule fired) ⇒ `hours`.
5. Monotonicity: increasing any hours or income never moves a result from a passing status (`income`, `school`, `hours`) to `short`.
6. `short` ⇒ `short === 80 − hours` and `short > 0`.
7. Every result includes ≥ 1 source whose id exists in the table above.
8. Determinism: same input ⇒ same output.

Content:
9. No user-facing string in any locale contains a banned phrase: "you are eligible", "you're eligible", "approved", "guaranteed", "you qualify" (and locale equivalents listed in `.kiro/steering/plain-language.md`).
10. Every locale file has exactly the same keys as `en`.

Coordination (Phase B):
11. A navigator can read a packet ⇒ the member's consent is recorded and not revoked.
12. Deadline ≤ 14 days and packet incomplete ⇒ case is in the "act now" queue.
13. A refill or appointment after the deadline and status ≠ submitted ⇒ continuity flag set.

Coverage Twin (Phase C):
14. For every month: members in = covered + lost.
15. Raising navigator reach never increases the number lost.
16. Same seed ⇒ same output.
