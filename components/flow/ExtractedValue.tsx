"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";
import type { Provenance } from "@/lib/chat/types";

const PROV_KEY = {
  letter: "prov_letter",
  edited: "prov_edited",
  suggested: "prov_suggested",
} as const;

/**
 * A single extracted value with a provenance chip and an Edit control.
 * Editing flips provenance to "edited" ("You changed this") and reports the
 * new value up so it can flow to the packet banner and .ics reminders (F3).
 */
export function ExtractedValue({
  lang,
  label,
  value,
  provenance,
  onChange,
}: {
  lang: Lang;
  label: string;
  value: string;
  provenance: Provenance;
  onChange: (value: string, provenance: Provenance) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <div className="card" style={{ gap: 6 }}>
      <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span className="label">{label}</span>
        <span className={`pill ${provenance === "edited" ? "warn" : "ok"}`}>
          {t(PROV_KEY[provenance], lang)}
        </span>
      </div>
      {editing ? (
        <div className="row" style={{ display: "flex", gap: 8 }}>
          <input
            aria-label={label}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{
              border: "1px solid var(--rule)",
              background: "var(--app)",
              borderRadius: 10,
              padding: 10,
              color: "var(--ink)",
              flex: 1,
            }}
          />
          <Button
            small
            onClick={() => {
              onChange(draft, "edited");
              setEditing(false);
            }}
          >
            {t("save", lang)}
          </Button>
        </div>
      ) : (
        <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <b style={{ fontVariantNumeric: "tabular-nums" }}>{value}</b>
          <Button small variant="secondary" onClick={() => { setDraft(value); setEditing(true); }}>
            {t("edit", lang)}
          </Button>
        </div>
      )}
    </div>
  );
}
