"use client";

import { useFlow } from "./FlowContext";
import { Button } from "@/components/ui";
import { t } from "@/lib/i18n";

const SCREENER_URL =
  "https://www.mass.gov/info-details/new-work-and-education-requirements-for-masshealth-members";

export function Home() {
  const { state, dispatch } = useFlow();
  const L = state.lang;

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => dispatch({ type: "photo", photo: String(reader.result) });
    reader.readAsDataURL(file);
  }

  return (
    <>
      <div className="env" aria-hidden="true">
        <div className="stampbox" />
        <div className="window">
          <span>MARIA SANTOS</span>
          <span>LOWELL MA 018··</span>
        </div>
      </div>
      <h2 className="title" lang={L}>
        {t("headline", L)}
      </h2>
      <p className="sub" lang={L}>
        {t("sub", L)}
      </p>
      <label className="btn file-btn" lang={L}>
        {"📷 "}
        {t("photo", L)}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPhoto}
        />
      </label>
      <Button variant="secondary" lang={L} onClick={() => dispatch({ type: "go", step: "letter" })}>
        {t("sample", L)}
      </Button>
      <div className="trust">
        <span>{t("trust_free", L)}</span>
        <span>{t("trust_langs", L)}</span>
        <span>{t("trust_read", L)}</span>
        <span>{t("trust_choose", L)}</span>
      </div>
      <p className="note">
        {t("screener_note", L).split(t("screener_link", L))[0]}
        <a href={SCREENER_URL} target="_blank" rel="noopener noreferrer">
          {t("screener_link", L)}
        </a>
        {t("screener_note", L).split(t("screener_link", L))[1] ?? ""}
      </p>
    </>
  );
}
