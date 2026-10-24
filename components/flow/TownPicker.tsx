"use client";

import { useMemo, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { setTownLocal } from "@/lib/community/client";
import towns from "@/lib/community/towns.json";
import type { Town } from "@/lib/community/types";

export function TownPicker({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const all = towns as Town[];

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return all.filter((town) => town.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, all]);

  function choose(town: Town | null) {
    setSelected(town ? town.name : t("town_skip", lang));
    setTownLocal(town ? town.id : null);
    setQuery("");
  }

  return (
    <div className="q">
      <h3>{t("town_q", lang)}</h3>
      {selected ? (
        <div className="row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="pill ok">{selected}</span>
          <button type="button" className="btn secondary small" onClick={() => { setSelected(null); setTownLocal(null); }}>
            {t("edit", lang)}
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            aria-label={t("town_q", lang)}
            placeholder={t("town_search", lang)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: "1px solid var(--rule)", background: "var(--app)", borderRadius: 10, padding: 10, color: "var(--ink)", width: "100%" }}
          />
          {matches.length > 0 && (
            <div className="opt-list">
              {matches.map((town) => (
                <button key={town.id} type="button" className="opt" onClick={() => choose(town)}>
                  {town.name} <span className="sub" style={{ fontSize: ".8rem" }}>· {town.county}</span>
                </button>
              ))}
            </div>
          )}
          <button type="button" className="opt" onClick={() => choose(null)}>
            {t("town_skip", lang)}
          </button>
        </>
      )}
    </div>
  );
}
