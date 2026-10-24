"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { t, type Lang, type MessageKey } from "@/lib/i18n";
import { getHelperCode, ensureMember, logEvent } from "@/lib/community/client";
import { badgesFor } from "@/lib/community/aggregate";
import type { Badge } from "@/lib/community/types";

const BADGE_KEY: Record<Badge, MessageKey> = {
  neighbor_helper: "badge_neighbor_helper",
  community_builder: "badge_community_builder",
  envelope_ambassador: "badge_envelope_ambassador",
};

export function HelpNeighbor({ lang, firstName = "Maria" }: { lang: Lang; firstName?: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [optin, setOptin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [helped, setHelped] = useState(0);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    ensureMember(lang).then(() => {
      setCode(getHelperCode());
      // Demo: Maria's seeded impact so "My impact" shows badges in the demo.
      fetch("/api/community")
        .then((r) => r.json())
        .then((d: { helpers?: { firstName: string; helpedDisplay: string }[] }) => {
          const mine = d.helpers?.find((h) => h.firstName === firstName);
          if (mine && mine.helpedDisplay !== "fewer than 10") setHelped(Number(mine.helpedDisplay) || 0);
          else if (mine) setHelped(4); // suppressed display -> show the seeded 4 for the demo
        })
        .catch(() => {});
    });
  }, [lang, firstName]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = code ? `${origin}/r/${code}` : "";
  const waText = `${t("share_msg", lang)} ${link}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  const badges = badgesFor(helped);

  useEffect(() => {
    if (!link) return;
    import("qrcode")
      .then((m) => m.toDataURL(link, { width: 160, margin: 1 }))
      .then(setQr)
      .catch(() => setQr(null));
  }, [link]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the link is visible to copy manually */
    }
  }

  function toggleOptin(next: boolean) {
    setOptin(next);
    logEvent(lang, "marked_sent", { optin: next ? { firstName } : null });
  }

  return (
    <div className="card">
      <span className="label">{t("help_neighbor_title", lang)}</span>
      <p className="sub" style={{ fontSize: ".9rem" }}>{t("help_neighbor_body", lang)}</p>

      {link && (
        <div className="copyrow">
          <code style={{ fontSize: ".85rem", wordBreak: "break-all" }}>{link}</code>
        </div>
      )}
      <div className="row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button small onClick={copy}>{copied ? t("copied", lang) : t("copy_link", lang)}</Button>
        {link && (
          <a className="btn small secondary" href={waHref} target="_blank" rel="noopener noreferrer">
            {t("share_whatsapp", lang)}
          </a>
        )}
      </div>

      {qr && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={qr} alt="QR code for your share link" width={160} height={160} style={{ justifySelf: "center", borderRadius: 8 }} />
      )}

      <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <b style={{ fontSize: ".9rem" }}>{t("show_me_board", lang)}</b>
        <span className="toggle">
          <input type="checkbox" checked={optin} aria-label={t("show_me_board", lang)} onChange={(e) => toggleOptin(e.target.checked)} />
          <i />
        </span>
      </div>

      <div className="card" style={{ background: "var(--app)" }}>
        <span className="label">{t("my_impact", lang)}</span>
        <b style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
          {helped} {t("neighbors_helped", lang)}
        </b>
        {badges.length > 0 && (
          <div className="trust">
            {badges.map((b) => (
              <span key={b} className="pill ok">🏅 {t(BADGE_KEY[b], lang)}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
