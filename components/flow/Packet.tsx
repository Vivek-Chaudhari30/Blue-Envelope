"use client";
"use client";

import { useEffect } from "react";
import { useFlow } from "./FlowContext";
import { Button } from "@/components/ui";
import { t, type MessageKey } from "@/lib/i18n";
import { daysLeft, money } from "@/lib/deadline";
import { evaluate } from "@/lib/rules/engine";
import { getStore, NAVIGATOR_ID, type Packet as PacketRecord } from "@/lib/store";
import { makePartnerToken, PARTNER_ID } from "@/lib/store/partner-token";

const MASSHEALTH_URL = "https://www.mass.gov/topics/masshealth";
const PANEL_STATUS = {
  none: "notice_received",
  sent: "notice_received",
  confirmed: "proof_gathered",
} as const;

type Icon = "done" | "todo" | "warn";

interface Item {
  ic: Icon;
  title: string;
  body: string;
  actions?: React.ReactNode;
}

export function Packet() {
  const { state, dispatch } = useFlow();
  const L = state.lang;
  const tr = (k: MessageKey) => t(k, L);
  const r = evaluate({ age: state.age, exemptions: state.exemptions, act: state.act });

  // Keep Maria's packet record and consent in sync with the store so the
  // Navigator Board (readForViewer) and partner page see the real state.
  useEffect(() => {
    const store = getStore();
    const sharedWith: string[] = [];
    if (state.share) sharedWith.push(NAVIGATOR_ID);
    if (state.partner !== "none") sharedWith.push(PARTNER_ID);
    const packet: PacketRecord = {
      id: "maria",
      firstName: "Maria",
      status: PANEL_STATUS[state.partner],
      sharedWith,
      organization: "Riverside Food Pantry (sample)",
      month: "March",
      hours: state.partner === "confirmed" ? 22 : undefined,
      partner: state.partner,
      earningsTotal: r.status === "income" || r.status === "hours" ? 612 : undefined,
      path: r.status,
    };
    void store.put(packet);
  }, [state.share, state.partner, r.status]);

  const items: Item[] = [];


  if (r.status === "income" || r.status === "hours") {
    items.push(
      state.earnings
        ? {
            ic: "done",
            title: `${tr("march_earnings")}: ${money(612)}`,
            body: tr("earnings_done"),
          }
        : {
            ic: "todo",
            title: tr("earnings_todo"),
            body: tr("prove_body"),
            actions: (
              <Button small variant="secondary" onClick={() => dispatch({ type: "go", step: "path" })}>
                {tr("add_screenshots")}
              </Button>
            ),
          },
    );
  }
  if (r.status === "school") {
    items.push({ ic: "todo", title: tr("school_item_title"), body: tr("school_item_body") });
  }
  if (r.status === "excused") {
    items.push({ ic: "todo", title: tr("excused_item_title"), body: tr("excused_item_body") });
  }
  if (r.status === "short") {
    items.push({ ic: "todo", title: tr("short_item_title"), body: tr("short_item_body") });
  }

  if (state.act.volunteer.on || r.status === "short") {
    if (state.partner === "none") {
      items.push({
        ic: "todo",
        title: tr("partner_none_title"),
        body: tr("partner_none_body"),
        actions: (
          <Button
            small
            onClick={() => dispatch({ type: "partner", state: "sent" })}
          >
            {tr("partner_send")}
          </Button>
        ),
      });
    } else if (state.partner === "sent") {
      const token = makePartnerToken("maria", PARTNER_ID);
      items.push({
        ic: "warn",
        title: tr("partner_sent_title"),
        body: tr("partner_sent_body"),
        actions: (
          <>
            <a className="btn small" href={`/partner/${token}`} target="_blank" rel="noopener noreferrer">
              Open the coordinator link
            </a>
            <Button small variant="secondary" onClick={() => dispatch({ type: "partner", state: "confirmed" })}>
              {tr("partner_confirm")}
            </Button>
          </>
        ),
      });
    } else {
      items.push({
        ic: "done",
        title: tr("partner_confirmed_title"),
        body: tr("partner_confirmed_body"),
      });
    }
  }

  if (state.contact !== "recent" && !state.contactUpdated) {
    items.push({
      ic: "warn",
      title: tr("contact_warn_title"),
      body: tr("contact_warn_body"),
      actions: (
        <>
          <a className="btn small secondary" href={MASSHEALTH_URL} target="_blank" rel="noopener noreferrer">
            {tr("contact_update_btn")}
          </a>
          <Button small variant="secondary" onClick={() => dispatch({ type: "contactDone" })}>
            {tr("contact_done_btn")}
          </Button>
        </>
      ),
    });
  } else if (state.contact !== "recent") {
    items.push({ ic: "done", title: tr("contact_updated_title"), body: tr("contact_updated_body") });
  }

  return (
    <>
      <div>
        <span className="label">{tr("packet_label")}</span>
        <h2 className="title">{tr("packet_title")}</h2>
      </div>

      <div className="due-banner">
        <span>{tr("due_banner")}</span>
        <b>{t("days_left", L, { n: daysLeft() })}</b>
      </div>

      <ul className="items">
        {items.map((it, i) => (
          <li className="item" key={i}>
            <span className={`ic ${it.ic}`}>
              {it.ic === "done" ? "✓" : it.ic === "warn" ? "!" : ""}
            </span>
            <b>{it.title}</b>
            <p>{it.body}</p>
            {it.actions && <div className="actions">{it.actions}</div>}
          </li>
        ))}

        <li className="item">
          <span className={`ic ${state.reminders ? "done" : "todo"}`}>
            {state.reminders ? "✓" : ""}
          </span>
          <div className="row">
            <b>{tr("reminders_title")}</b>
            <span className="toggle">
              <input
                type="checkbox"
                checked={state.reminders}
                aria-label={tr("reminders_title")}
                onChange={(e) => dispatch({ type: "set", key: "reminders", value: e.target.checked })}
              />
              <i />
            </span>
          </div>
          <p>{tr("reminders_body")}</p>
        </li>

        <li className="item">
          <span className={`ic ${state.share ? "done" : "todo"}`}>
            {state.share ? "✓" : ""}
          </span>
          <div className="row">
            <b>{tr("share_title")}</b>
            <span className="toggle">
              <input
                type="checkbox"
                checked={state.share}
                aria-label={tr("share_title")}
                onChange={(e) => dispatch({ type: "set", key: "share", value: e.target.checked })}
              />
              <i />
            </span>
          </div>
          <p>{state.share ? tr("share_on_body") : tr("share_off_body")}</p>
        </li>
      </ul>

      <Button onClick={() => dispatch({ type: "go", step: "submit" })}>
        {tr("how")}
      </Button>
    </>
  );
}
