"use client";

import { useFlow } from "./FlowContext";
import { Button, Meter } from "@/components/ui";
import { t } from "@/lib/i18n";
import { money } from "@/lib/deadline";
import { evaluate, INCOME_RULE, HOURS_RULE } from "@/lib/rules/engine";
import type { ExemptionId } from "@/lib/rules/types";
import { SAMPLE_WEEKS, SAMPLE_EARNINGS_TOTAL } from "@/content/sample-earnings";

const EX_KEY: Record<Exclude<ExemptionId, "none">, Parameters<typeof t>[0]> = {
  pregnant: "ex_pregnant",
  caregiver: "ex_caregiver",
  medicare: "ex_medicare",
  health: "ex_health",
  treatment: "ex_treatment",
  veteran: "ex_veteran",
};

export function Path() {
  const { state, dispatch } = useFlow();
  const L = state.lang;
  const r = evaluate({ age: state.age, exemptions: state.exemptions, act: state.act });

  const earningsBlock =
    (r.status === "income" || (r.status === "hours" && state.act.work.on)) && (
      <EarningsBlock />
    );

  let head: React.ReactNode = null;
  let cls = "result";

  if (r.status === "age") {
    head = (
      <>
        <h2>{t("path_age_title", L)}</h2>
        <p>{t("path_age_body", L)}</p>
      </>
    );
  } else if (r.status === "excused") {
    const reasons = (r.reasons ?? [])
      .filter((x): x is Exclude<ExemptionId, "none"> => x !== "none")
      .map((x) => t(EX_KEY[x], L))
      .join("; ");
    head = (
      <>
        <h2>{t("path_excused_title", L)}</h2>
        <p>{reasons}</p>
      </>
    );
  } else if (r.status === "income") {
    head = (
      <>
        <span className="label">{t("path_income_label", L)}</span>
        <span className="big">{money(r.income)}</span>
        <h2>{t("path_income_title", L)}</h2>
        <p>{t("path_income_body", L)}</p>
      </>
    );
  } else if (r.status === "school") {
    head = (
      <>
        <h2>{t("path_school_title", L)}</h2>
        <p>{t("path_school_body", L)}</p>
      </>
    );
  } else if (r.status === "hours") {
    head = (
      <>
        <span className="label">{t("path_hours_label", L)}</span>
        <span className="big">{r.hours} hrs</span>
        <h2>{t("path_hours_title", L)}</h2>
        <p>{t("path_hours_body", L)}</p>
      </>
    );
  } else {
    cls = "result warn";
    head = (
      <>
        <span className="label">{t("path_short_label", L)}</span>
        <span className="big">{r.short} hrs</span>
        <h2>{t("path_short_title", L)}</h2>
        <p>{t("path_short_body", L)}</p>
      </>
    );
  }

  const showMeters = r.status !== "age" && r.status !== "excused";

  return (
    <>
      <div className={cls}>{head}</div>

      {showMeters && (
        <div className="card">
          <span className="label">{t("compare_label", L)}</span>
          <Meter
            label={t("meter_income", L)}
            shown={`${money(r.income)} of ${money(INCOME_RULE)}`}
            value={r.income}
            target={INCOME_RULE}
          />
          <Meter
            label={t("meter_hours", L)}
            shown={`${r.hours} of ${HOURS_RULE} hours`}
            value={r.hours}
            target={HOURS_RULE}
          />
          <div className="meter">
            <div className="top">
              <b>{t("meter_school", L)}</b>
              <span>{r.school ? t("meter_school_yes", L) : t("meter_school_no", L)}</span>
            </div>
          </div>
        </div>
      )}

      {earningsBlock}

      <div className="decides">{t("decides_guide", L)}</div>

      <Button onClick={() => dispatch({ type: "go", step: "packet" })}>
        {t("build_packet", L)}
      </Button>
    </>
  );
}

function EarningsBlock() {
  const { state, dispatch } = useFlow();
  const L = state.lang;

  if (!state.earnings) {
    return (
      <div className="card">
        <span className="label">{t("prove_label", L)}</span>
        <p>{t("prove_body", L)}</p>
        <label className="btn file-btn">
          {t("add_earnings", L)}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              dispatch({ type: "earnings", count: e.target.files?.length ?? 0 })
            }
          />
        </label>
        <Button variant="secondary" onClick={() => dispatch({ type: "earnings" })}>
          {t("use_sample", L)}
        </Button>
      </div>
    );
  }

  const over = SAMPLE_EARNINGS_TOTAL >= INCOME_RULE;
  return (
    <div className="card">
      <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span className="label">{t("march_earnings", L)}</span>
        <span className="pill ok">{t("read_from", L)}</span>
      </div>
      {state.earningsPhotos > 0 && <p className="note">{t("got_screenshots", L)}</p>}
      <div className="weeks">
        {SAMPLE_WEEKS.map((w) => (
          <div className="week" key={w.label}>
            <span>{w.label}</span>
            <span className="amt">{money(w.amount)}</span>
            <span>{t("gig_payout", L)}</span>
          </div>
        ))}
      </div>
      <div className="total">
        <span>{t("total_march", L)}</span>
        <b>{money(SAMPLE_EARNINGS_TOTAL)}</b>
      </div>
      <p className="sub" style={{ fontSize: ".875rem" }}>
        {over ? t("over_580", L) : t("under_580", L)}
      </p>
    </div>
  );
}
