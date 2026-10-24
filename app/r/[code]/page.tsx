"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";
import { captureReferral, ensureMember, logEvent } from "@/lib/community/client";

export default function ReferralLanding({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const lang: Lang = "en";
  const [greeting, setGreeting] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Capture the code on the device, create/attach the member, log the open.
    captureReferral(code);
    ensureMember(lang).then(() => logEvent(lang, "referral_opened"));

    fetch(`/api/referral/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((d: { optedIn: boolean; firstName?: string; town?: string }) => {
        if (d.optedIn && d.firstName) {
          setGreeting(
            t("ref_shared_by", lang, { name: d.firstName, town: d.town ?? "" }),
          );
        } else {
          setGreeting(t("ref_shared_anon", lang));
        }
        setReady(true);
      })
      .catch(() => {
        setGreeting(t("ref_shared_anon", lang));
        setReady(true);
      });
  }, [code]);

  return (
    <div className="page">
      <div style={{ maxWidth: 420, margin: "0 auto", display: "grid", gap: 16, paddingTop: 48 }}>
        <div className="env" aria-hidden="true" style={{ maxWidth: 240, justifySelf: "center" }}>
          <div className="stampbox" />
          <div className="window">
            <span>BLUE ENVELOPE</span>
          </div>
        </div>
        <h1 className="title" style={{ textAlign: "center" }}>
          {greeting ?? "…"}
        </h1>
        <Link className="btn" href="/">
          {ready ? t("ref_continue", lang) : "…"}
        </Link>
        <p className="appfoot" style={{ border: "none" }}>
          Independent tool · Not MassHealth · Sample data
        </p>
      </div>
    </div>
  );
}
