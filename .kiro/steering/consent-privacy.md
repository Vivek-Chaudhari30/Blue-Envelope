---
inclusion: fileMatch
fileMatchPattern: ["lib/store/**", "app/navigator/**", "app/partner/**", "app/api/**", "components/flow/Packet*"]
---

# Consent and privacy

- A member's packet is private by default. `sharedWith` is empty until the member turns on "Share with my health center".
- Every read of a packet from the navigator or partner side must go through `PacketStore.readForViewer(packetId, viewer)`, which checks consent and returns nothing when consent is missing or revoked. Never read the raw store from a page.
- Partners only see the member's first name, the organization, the month and the hours field. They never see the letter, earnings or answers.
- Uploaded photos are processed in memory for reading and are not stored server-side. Do not log image bytes or extracted personal text.
- All data in this project is synthetic. Never add real names, member IDs, addresses or phone numbers.
- Show "Independent tool · Not MassHealth · Sample data" on every page.
