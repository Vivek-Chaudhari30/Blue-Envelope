# i18n keys to create (A3 build note — delete after Phase A if desired)

All six locale files (`locales/en.json` is the key master; es/pt/ht/zh/vi must have the identical key set) contain these keys.

## Ported VERBATIM from the prototype `T` object (docs/design-reference/blue-envelope-app.html ~lines 520-610), per language
`headline, sub, photo, sample, deadline, asking, send, how, e_deadline, e_asking, e_send, e_how`

## Added UI keys (translate into all six; drafts OK — flag unsure ones for native review)
- App chrome: `brand` (keep "Blue Envelope" in every language), `footer` ("Independent tool · Not MassHealth · Sample data" — translate the words), `back`, `step_of` (template "Step {n} of {total} · {name}"), `language`
- Trust chips: `trust_free, trust_langs, trust_read, trust_choose`
- Screener note: `screener_note, screener_link`
- Letter X-Ray: `xray_label, xray_title, read_aloud, read_aloud_working, read_aloud_unavailable, photo_got, check_applies`
- Questions: `q_label, q_title, q_sub, q1_title, age_under, age_1964, age_65, q2_title, q3_title, q4_title, contact_recent, contact_old, contact_unsure, work_label, volunteer_label, training_label, school_label, hours_last_month, earned_last_month, see_path`
- Exemptions: `ex_pregnant, ex_caregiver, ex_medicare, ex_health, ex_treatment, ex_veteran, ex_none`
- Path: `path_label, path_age_title, path_age_body, path_excused_title, path_income_label, path_income_title, path_income_body, path_school_title, path_school_body, path_hours_label, path_hours_title, path_hours_body, path_short_label, path_short_title, path_short_body, meter_income, meter_hours, meter_school, meter_school_yes, meter_school_no, compare_label`
- Earnings: `prove_label, prove_body, add_earnings, use_sample, march_earnings, read_from, got_screenshots, total_march, over_580, under_580, gig_payout`
- Decides note: `decides_guide` = "This is a guide, not a decision. MassHealth makes the decision about your coverage."
- Packet: `packet_label, packet_title, due_banner, days_left, earnings_done, earnings_todo, add_screenshots, school_item_title, school_item_body, excused_item_title, excused_item_body, short_item_title, short_item_body, partner_none_title, partner_none_body, partner_send, partner_sent_title, partner_sent_body, partner_confirm, partner_confirmed_title, partner_confirmed_body, contact_warn_title, contact_warn_body, contact_update_btn, contact_done_btn, contact_updated_title, contact_updated_body, reminders_title, reminders_body, share_title, share_on_body, share_off_body`
- Submit: `submit_label, submit_title, submit_sub, way_online_title, way_online_body, go_masshealth, way_mail_title, way_mail_body, way_phone_title, way_phone_body, help_label, help_211, decides_watch` ("MassHealth makes the decision. Watch for a letter, text or email with the answer."), `start_over`

## Rules
- No value in ANY language may contain a banned phrase from `.kiro/steering/plain-language.md`. Use "may meet"/"may be excused". Reword any verbatim port that would include one.
- Numbers as digits. Sixth-grade reading level. Identical key sets across all six files.

## BANNED list (mirror into lib/i18n BANNED, case-insensitive intent)
- en: "you are eligible","you're eligible","you qualify","approved","guaranteed","you will keep your coverage"
- es: "usted es elegible","aprobado","garantizado"
- pt: "você é elegível","aprovado","garantido"
- ht: "ou kalifye","apwouve","garanti"
- zh: "您符合资格","已批准","保证"
- vi: "bạn đủ điều kiện","đã được chấp thuận","đảm bảo"

## LANGS (lib/i18n)
en/English/en-US, es/Español/es-US, pt/Português/pt-BR, ht/Kreyòl/ht-HT, zh/中文/zh-CN, vi/Tiếng Việt/vi-VN
