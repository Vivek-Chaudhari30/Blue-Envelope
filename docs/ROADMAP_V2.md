# Production roadmap (not built in the hackathon)

Everything below is **future work**. None of it is built, and none of it should be built for the hackathon. It records how Blue Envelope would become a real service after legal and compliance review.

- **Accounts and roles.** Member, navigator, and partner accounts with authentication and role-based access, replacing the demo's device-local identity.
- **Admin dashboard.** For health-center administrators: panel management, assignment, and reporting — strictly aggregate, never exposing member documents.
- **Audit log.** An append-only record of every consented read of a packet (who, when, what projection), reviewable by the member.
- **Data-rights requests.** Self-service export and deletion of a member's data, with verified identity, satisfying data-rights obligations.
- **Services directory.** A real, maintained directory of health centers, community partners, and 211 services by town, replacing the sample organizations.
- **Events.** Enrollment events and deadlines surfaced to members and navigators.
- **Rewards — disabled until legal/compliance review.** Any recognition beyond badges and town progress (and anything of monetary value) stays OFF until reviewed. The hackathon build has recognition only, by design.
- **SMS reminders.** Real text reminders at 30/14/3 days. Requires 10DLC registration and a messaging provider; not built.
- **Partnerships with health centers.** Formal data-sharing agreements and onboarding for navigators and community partners.

Scaling note: the hackathon architecture already separates concerns to make this feasible — on-device OCR keeps documents off the server, the rules engine is pure and portable, Supabase holds only shared summaries behind a consent gate, and every aggregate is small-cell suppressed before it leaves the server.
