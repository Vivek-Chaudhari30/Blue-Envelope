"use client";

import { useFlow } from "./FlowContext";
import { Button } from "@/components/ui";
import { t } from "@/lib/i18n";

const MASSHEALTH_URL = "https://www.mass.gov/topics/masshealth";

export function Submit() {
  const { state, dispatch } = useFlow();
  const L = state.lang;

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

      <div className="decides">{t("decides_watch", L)}</div>

      <Button variant="secondary" onClick={() => dispatch({ type: "restart" })}>
        {t("start_over", L)}
      </Button>
    </>
  );
}
