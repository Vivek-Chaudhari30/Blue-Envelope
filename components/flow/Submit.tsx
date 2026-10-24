"use client";

import { useState } from "react";
import Link from "next/link";
import { useFlow } from "./FlowContext";
import { Button } from "@/components/ui";
import { t } from "@/lib/i18n";
import { logEvent } from "@/lib/community/client";
import { HelpNeighbor } from "./HelpNeighbor";
import { ReadyToSend } from "./ReadyToSend";
import { evaluate } from "@/lib/rules/engine";
import { loadValues } from "@/lib/chat/store";

const MASSHEALTH_URL = "https://www.mass.gov/topics/masshealth";

export function Submit() {
  const { state, dispatch } = useFlow();
  const L = state.lang;
  const [sent, setSent] = useState(false);

  const result = evaluate({ age: state.age, exemptions: state.exemptions, act: state.act });
  const edited = loadValues().deadline;
  const deadline = edited && edited.provenance === "edited" ? edited.value : "December 15, 2026";
  const partnerHours = state.partner === "confirmed" ? 22 : undefined;

  function markSent() {
    setSent(true);
    logEvent(L, "marked_sent");
  }

  return (
    <>
      <div>
        <span className="label">{t("submit_label", L)}</span>
        <h2 className="title">{t("submit_title", L)}</h2>
        <p className="sub">{t("submit_sub", L)}</p>
      </div>

      <div className="ways">
        <div className="way">
          <b>{t("way_online_title", L)}</b>
          <p>{t("way_online_body", L)}</p>
          <a className="btn small" href={MASSHEALTH_URL} target="_blank" rel="noopener noreferrer">
            {t("go_masshealth", L)}
          </a>
        </div>
        <div className="way">
          <b>{t("way_mail_title", L)}</b>
          <p>{t("way_mail_body", L)}</p>
        </div>
        <div className="way">
          <b>{t("way_phone_title", L)}</b>
          <p>{t("way_phone_body", L)}</p>
        </div>
      </div>

      <div className="card">
        <span className="label">{t("help_label", L)}</span>
        <p>{t("help_211", L)}</p>
        <div className="copyrow">
          <code>2-1-1</code>
        </div>
        {state.share ? (
          <p className="sub" style={{ fontSize: ".875rem" }}>
            {t("share_on_body", L)}
          </p>
        ) : (
          <p className="sub" style={{ fontSize: ".875rem" }}>
            {t("share_off_body", L)}
          </p>
        )}
      </div>

      <ReadyToSend lang={L} result={result} deadline={deadline} partnerHours={partnerHours} />

      <div className="decides">{t("decides_watch", L)}</div>

      {sent ? (
        <p className="note">{t("sent_logged", L)}</p>
      ) : (
        <Button onClick={markSent}>{t("sent_it", L)}</Button>
      )}

      {/* Help a neighbor — recognition only, core help is never gated. */}
      {sent && <HelpNeighbor lang={L} firstName="Maria" />}

      <Link className="btn secondary" href="/community" style={{ textDecoration: "none" }}>
        {t("community_open", L)}
      </Link>

      <Button variant="secondary" onClick={() => dispatch({ type: "restart" })}>
        {t("start_over", L)}
      </Button>
    </>
  );
}
