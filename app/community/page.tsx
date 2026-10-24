"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./community.module.css";
import { t, type Lang } from "@/lib/i18n";
import { getMyEvents, getTown } from "@/lib/community/client";
import towns from "@/lib/community/towns.json";
import type { Town } from "@/lib/community/types";

interface CommunityData {
  state: { actions: number; helped: number; goal: number };
  towns: { name: string; county: string; pop2020: number; helpedDisplay: string; perThousand: number }[];
  counties: { county: string; helpedDisplay: string }[];
  helpers: { firstName: string; lastInitial: string; town: string; helpedDisplay: string }[];
  demo: boolean;
}

export default function CommunityBoard() {
  const lang: Lang = "en";
  const [data, setData] = useState<CommunityData | null>(null);
  const [county, setCounty] = useState("all");
  const [mine, setMine] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/community")
        .then((r) => r.json())
        .then((d: CommunityData) => alive && setData(d))
        .catch(() => {});
    load();
    const id = setInterval(load, 10_000); // refresh every 10s
    setMine(getMyEvents().length);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // Overlay THIS device's own recent actions so the demo never looks empty.
  const myTownName = useMemo(() => {
    const id = getTown();
    return (towns as Town[]).find((x) => x.id === id)?.name ?? null;
  }, []);
  const myEvents = typeof window !== "undefined" ? getMyEvents() : [];
  const myMarkedSent = myEvents.some((e) => e.type === "marked_sent");

  const counties = useMemo(() => {
    const set = new Set((data?.towns ?? []).map((x) => x.county));
    return Array.from(set).sort();
  }, [data]);

  const rows = useMemo(() => {
    const ts = (data?.towns ?? []).map((x) => ({ ...x }));
    // Overlay this device's marked_sent onto its own town's display.
    if (myMarkedSent && myTownName) {
      const mineRow = ts.find((x) => x.name === myTownName);
      if (mineRow) {
        if (mineRow.helpedDisplay === "fewer than 10") mineRow.helpedDisplay = "fewer than 10";
        else mineRow.helpedDisplay = String(Number(mineRow.helpedDisplay || 0) + 1);
      } else {
        const tw = (towns as Town[]).find((x) => x.name === myTownName);
        if (tw) ts.push({ name: tw.name, county: tw.county, pop2020: tw.pop2020, helpedDisplay: "fewer than 10", perThousand: 0 });
      }
    }
    return county === "all" ? ts : ts.filter((x) => x.county === county);
  }, [data, county, myMarkedSent, myTownName]);

  const stateActions = (data?.state.actions ?? 0) + mine;
  const pct = data ? Math.min(100, (data.state.helped / data.state.goal) * 100) : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <Link href="/" className={styles.back}>← {t("brand", lang)}</Link>
        <h1 className={styles.title}>{t("community_title", lang)}</h1>
        <p className={styles.label}>{t("community_label", lang)}</p>
        <span className={styles.demo}>{t("community_demo", lang)}</span>
        {mine > 0 && (
          <span className={styles.demo} style={{ background: "var(--ok-soft)", color: "var(--ok)" }}>
            {t("community_including_you", lang)}
          </span>
        )}
      </div>

      <div className={styles.progressCard}>
        <b className={styles.big}>{(data?.state.helped ?? 0).toLocaleString("en-US")}</b>
        <span className="sub">{t("community_goal", lang)}</span>
        <div className={styles.bar} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={styles.controls}>
        <label htmlFor="county" className="label">{t("community_ranking", lang)}</label>
        <select id="county" value={county} onChange={(e) => setCounty(e.target.value)}>
          <option value="all">{t("community_county_all", lang)}</option>
          {counties.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <table className={styles.table}>
        <caption>{t("community_table", lang)}</caption>
        <thead>
          <tr>
            <th scope="col">Town</th>
            <th scope="col">County</th>
            <th scope="col" style={{ textAlign: "right" }}>Helped</th>
            <th scope="col" style={{ textAlign: "right" }}>Per 1,000</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((town) => (
            <tr key={town.name}>
              <td>{town.name}</td>
              <td>{town.county}</td>
              <td className={styles.num}>{town.helpedDisplay}</td>
              <td className={styles.num}>{town.perThousand.toFixed(2)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="sub">—</td></tr>
          )}
        </tbody>
      </table>

      {data && data.helpers.length > 0 && (
        <div>
          <span className="label">{t("community_helpers", lang)}</span>
          <div className={styles.helpers}>
            {data.helpers.map((h, i) => (
              <span key={i} className={styles.helper}>
                {h.firstName} {h.lastInitial} · {h.town}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className={styles.foot}>Independent tool · Not MassHealth · Sample data</p>
    </div>
  );
}
