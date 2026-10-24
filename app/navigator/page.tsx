"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./navigator.module.css";
import { generatePanel } from "@/lib/panel/generate";
import { STATUS_ORDER, type Patient, type PanelStatus } from "@/lib/panel/types";
import { actNow, continuityFlag, staleContact, daysUntil } from "@/lib/panel/flags";
import { getStore, NAVIGATOR_ID } from "@/lib/store";

const COLUMN_LABEL: Record<PanelStatus, string> = {
  not_started: "Not started",
  notice_received: "Notice received",
  proof_gathered: "Proof gathered",
  submitted: "Submitted",
};

export default function NavigatorBoard() {
  // Freeze "now" once per mount so flags are stable during the session.
  const now = useMemo(() => Date.now(), []);
  const panel = useMemo(() => generatePanel(2026, now), [now]);

  // Maria's packet is visible only when she has shared it (consent gate).
  const [mariaShared, setMariaShared] = useState(false);
  useEffect(() => {
    let alive = true;
    getStore()
      .readForViewer("maria", { kind: "navigator", id: NAVIGATOR_ID })
      .then((p) => {
        if (alive) setMariaShared(p !== null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const actNowQueue = panel.filter((p) => actNow(p, now));

  return (
    <main className={styles.wrap}>
      <div className={styles.head}>
        <Link href="/" className={styles.back}>
          ← Member app
        </Link>
        <span className={styles.eyebrow}>
          Navigator Board · Riverside Community Health Center (sample)
        </span>
        <h1 className={styles.title}>Who needs help, and when</h1>
        <p className={styles.sub}>
          A synthetic patient panel (seed 2026). Flags surface coverage risk:
          continuity (care after the deadline), stale contact (over 12 months),
          and act now (14 days or fewer with an incomplete packet). A member&apos;s
          packet opens only after they share it.
        </p>
      </div>

      {actNowQueue.length > 0 && (
        <div className={styles.actnow}>
          <b>Act now · {actNowQueue.length}</b>
          <span className={styles.due}>
            {actNowQueue
              .map((p) => `${p.firstName} ${p.lastInitial}. (${daysUntil(p.renewalDue, now)}d)`)
              .join(" · ")}
          </span>
        </div>
      )}

      <div className={styles.columns}>
        {STATUS_ORDER.map((status) => {
          const inCol = panel.filter((p) => p.status === status);
          return (
            <div className={styles.col} key={status}>
              <div className={styles.colhead}>
                <b>{COLUMN_LABEL[status]}</b>
                <span>{inCol.length}</span>
              </div>
              {inCol.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  now={now}
                  mariaShared={mariaShared}
                />
              ))}
            </div>
          );
        })}
      </div>

      <p className={styles.foot}>
        Independent tool · Not MassHealth · Sample data
      </p>
    </main>
  );
}

function PatientCard({
  patient,
  now,
  mariaShared,
}: {
  patient: Patient;
  now: number;
  mariaShared: boolean;
}) {
  const cont = continuityFlag(patient, now);
  const stale = staleContact(patient, now);
  const act = actNow(patient, now);
  const flagged = cont || stale || act;
  const d = daysUntil(patient.renewalDue, now);
  const isMaria = patient.id === "maria";
  const shared = isMaria ? mariaShared : patient.sharedPacket;

  return (
    <div className={`${styles.card} ${flagged ? styles.flagged : ""}`}>
      <div className={styles.name}>
        <b>
          {patient.firstName} {patient.lastInitial}.
        </b>
        <span className={styles.lang}>{patient.language}</span>
      </div>
      <div className={styles.due}>
        Renews in {d} day{d === 1 ? "" : "s"}
      </div>
      <div className={styles.flags}>
        {act && <span className={`${styles.chip} ${styles.actnow}`}>act now</span>}
        {cont && <span className={`${styles.chip} ${styles.continuity}`}>continuity</span>}
        {stale && <span className={`${styles.chip} ${styles.stale}`}>stale contact</span>}
        {shared && <span className={`${styles.chip} ${styles.shared}`}>shared</span>}
      </div>
      {isMaria && (
        <div className={styles.packet}>
          {mariaShared
            ? "Packet shared: income path, March earnings $612.00. Ready to check."
            : "Packet not shared yet. You can see status only until Maria shares it."}
        </div>
      )}
    </div>
  );
}
