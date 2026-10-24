"use client";

import { use, useEffect, useState } from "react";
import styles from "./partner.module.css";
import { getStore } from "@/lib/store";
import type { PartnerView } from "@/lib/store/types";
import { parsePartnerToken, PARTNER_ID } from "@/lib/store/partner-token";

export default function PartnerSignOff({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [view, setView] = useState<PartnerView | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "no-consent" | "done" | "bad">(
    "loading",
  );
  const [hours, setHours] = useState("22");

  useEffect(() => {
    const decoded = parsePartnerToken(token);
    if (!decoded || decoded.viewerId !== PARTNER_ID) {
      setState("bad");
      return;
    }
    let alive = true;
    getStore()
      .readForViewer(decoded.packetId, { kind: "partner", id: decoded.viewerId })
      .then((v) => {
        if (!alive) return;
        if (v === null) {
          setState("no-consent");
        } else {
          setView(v as PartnerView);
          setState("ready");
        }
      })
      .catch(() => alive && setState("bad"));
    return () => {
      alive = false;
    };
  }, [token]);

  async function confirm() {
    const res = await fetch("/api/confirm-hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, hours: Number(hours) }),
    });
    if (res.ok) setState("done");
    else setState("no-consent");
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.eyebrow}>Community partner sign-off · Sample</span>
      <h1 className={styles.title}>Confirm volunteer hours</h1>

      {state === "loading" && <p className={styles.note}>Loading…</p>}

      {state === "bad" && (
        <div className={styles.err}>
          This link is not valid. Ask the member to send a new sign-off link.
        </div>
      )}

      {state === "no-consent" && (
        <div className={styles.err}>
          You don&apos;t have access to this packet, or the member turned
          sharing off. Nothing to confirm.
        </div>
      )}

      {state === "ready" && view && (
        <>
          <div className={styles.card}>
            {/* Partner sees ONLY first name, organization, month, hours field. */}
            <div className={styles.row}>
              <span>Member</span>
              <b>{view.firstName}</b>
            </div>
            <div className={styles.row}>
              <span>Organization</span>
              <b>{view.organization}</b>
            </div>
            <div className={styles.row}>
              <span>Month</span>
              <b>{view.month}</b>
            </div>
            <label className={styles.field} htmlFor="hours">
              Hours volunteered this month
              <input
                id="hours"
                type="number"
                inputMode="numeric"
                min={0}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </label>
            <button
              className={styles.btn}
              type="button"
              onClick={confirm}
              disabled={hours === ""}
            >
              Confirm hours
            </button>
          </div>
          <p className={styles.note}>
            You only see the member&apos;s first name, organization and month.
            You never see their letter, earnings or answers.
          </p>
        </>
      )}

      {state === "done" && (
        <div className={styles.done}>
          Thank you. {hours} hours confirmed for {view?.firstName}. It&apos;s now
          in their packet.
        </div>
      )}

      <p className={styles.foot}>Independent tool · Not MassHealth · Sample data</p>
    </div>
  );
}
