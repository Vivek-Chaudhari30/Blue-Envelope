"use client";

import { useFlow } from "./FlowContext";
import { Button, Option } from "@/components/ui";
import { t, type MessageKey } from "@/lib/i18n";
import type { AgeBand, ExemptionId } from "@/lib/rules/types";
import type { Contact } from "./FlowContext";

const AGES: { id: AgeBand; key: MessageKey }[] = [
  { id: "under-19", key: "age_under" },
  { id: "19-64", key: "age_1964" },
  { id: "65-plus", key: "age_65" },
];

const EXEMPTIONS: { id: ExemptionId; key: MessageKey }[] = [
  { id: "pregnant", key: "ex_pregnant" },
  { id: "caregiver", key: "ex_caregiver" },
  { id: "medicare", key: "ex_medicare" },
  { id: "health", key: "ex_health" },
  { id: "treatment", key: "ex_treatment" },
  { id: "veteran", key: "ex_veteran" },
  { id: "none", key: "ex_none" },
];

const CONTACTS: { id: Contact; key: MessageKey }[] = [
  { id: "recent", key: "contact_recent" },
  { id: "old", key: "contact_old" },
  { id: "unsure", key: "contact_unsure" },
];

export function Questions() {
  const { state, dispatch } = useFlow();
  const L = state.lang;
  const a = state.act;

  function numField(
    id: string,
    labelKey: MessageKey,
    path: string,
    value: number,
    mode: "numeric" | "decimal",
  ) {
    return (
      <label className="field" htmlFor={id}>
        {t(labelKey, L)}
        <input
          type="number"
          inputMode={mode}
          min={0}
          id={id}
          value={value}
          onChange={(e) =>
            dispatch({
              type: "num",
              path,
              value: e.target.value === "" ? 0 : Number(e.target.value),
            })
          }
        />
      </label>
    );
  }

  return (
    <>
      <div>
        <span className="label">{t("q_label", L)}</span>
        <h2 className="title">{t("q_title", L)}</h2>
        <p className="sub">{t("q_sub", L)}</p>
      </div>

      <div className="q">
        <span className="qn">QUESTION 1 OF 4</span>
        <h3>{t("q1_title", L)}</h3>
        <div className="seg">
          {AGES.map((o) => (
            <Option
              key={o.id}
              pressed={state.age === o.id}
              onClick={() => dispatch({ type: "age", age: o.id })}
            >
              {t(o.key, L)}
            </Option>
          ))}
        </div>
      </div>

      <div className="q">
        <span className="qn">QUESTION 2 OF 4</span>
        <h3>{t("q2_title", L)}</h3>
        <div className="opt-list">
          {EXEMPTIONS.map((o) => (
            <Option
              key={o.id}
              pressed={state.exemptions.includes(o.id)}
              onClick={() => dispatch({ type: "toggleExemption", id: o.id })}
            >
              {t(o.key, L)}
            </Option>
          ))}
        </div>
      </div>

      <div className="q">
        <span className="qn">QUESTION 3 OF 4</span>
        <h3>{t("q3_title", L)}</h3>
        <div className="opt-list">
          <div className={`activity${a.work.on ? " on" : ""}`}>
            <div className="row">
              <span>{t("work_label", L)}</span>
              <span className="toggle">
                <input
                  type="checkbox"
                  checked={a.work.on}
                  aria-label={t("work_label", L)}
                  onChange={() => dispatch({ type: "toggleActivity", key: "work" })}
                />
                <i />
              </span>
            </div>
            {a.work.on && (
              <div className="fields">
                {numField("work-hours", "hours_last_month", "work.hours", a.work.hours, "numeric")}
                {numField("work-income", "earned_last_month", "work.income", a.work.income, "decimal")}
              </div>
            )}
          </div>

          <div className={`activity${a.volunteer.on ? " on" : ""}`}>
            <div className="row">
              <span>{t("volunteer_label", L)}</span>
              <span className="toggle">
                <input
                  type="checkbox"
                  checked={a.volunteer.on}
                  aria-label={t("volunteer_label", L)}
                  onChange={() => dispatch({ type: "toggleActivity", key: "volunteer" })}
                />
                <i />
              </span>
            </div>
            {a.volunteer.on && (
              <div className="fields">
                {numField("vol-hours", "hours_last_month", "volunteer.hours", a.volunteer.hours, "numeric")}
              </div>
            )}
          </div>

          <div className={`activity${a.training.on ? " on" : ""}`}>
            <div className="row">
              <span>{t("training_label", L)}</span>
              <span className="toggle">
                <input
                  type="checkbox"
                  checked={a.training.on}
                  aria-label={t("training_label", L)}
                  onChange={() => dispatch({ type: "toggleActivity", key: "training" })}
                />
                <i />
              </span>
            </div>
            {a.training.on && (
              <div className="fields">
                {numField("train-hours", "hours_last_month", "training.hours", a.training.hours, "numeric")}
              </div>
            )}
          </div>

          <div className={`activity${a.school.on ? " on" : ""}`}>
            <div className="row">
              <span>{t("school_label", L)}</span>
              <span className="toggle">
                <input
                  type="checkbox"
                  checked={a.school.on}
                  aria-label={t("school_label", L)}
                  onChange={() => dispatch({ type: "toggleActivity", key: "school" })}
                />
                <i />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="q">
        <span className="qn">QUESTION 4 OF 4</span>
        <h3>{t("q4_title", L)}</h3>
        <div className="opt-list">
          {CONTACTS.map((o) => (
            <Option
              key={o.id}
              pressed={state.contact === o.id}
              onClick={() => dispatch({ type: "contact", contact: o.id })}
            >
              {t(o.key, L)}
            </Option>
          ))}
        </div>
      </div>

      <Button onClick={() => dispatch({ type: "go", step: "path" })}>
        {t("see_path", L)}
      </Button>
    </>
  );
}
