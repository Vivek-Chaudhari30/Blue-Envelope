"use client";

import { useFlow, STEPS } from "./FlowContext";
import { LANGS, t, type Lang } from "@/lib/i18n";

export function AppBar() {
  const { state, dispatch } = useFlow();
  const idx = STEPS.findIndex((s) => s.id === state.step);
  const step = STEPS[idx]!;
  const name = t(step.nameKey as never, state.lang);

  return (
    <>
      <div className="appbar">
        <button
          className="back"
          type="button"
          aria-label={t("back", state.lang)}
          disabled={idx === 0}
          onClick={() => {
            if (idx > 0) dispatch({ type: "go", step: STEPS[idx - 1]!.id });
          }}
        >
          ←
        </button>
        <div className="brand">
          <b>{t("brand", state.lang)}</b>
          <span>
            {t("step_of", state.lang, {
              n: idx + 1,
              total: STEPS.length,
              name,
            })}
          </span>
        </div>
        <label className="label" htmlFor="lang" hidden>
          {t("language", state.lang)}
        </label>
        <select
          className="lang"
          id="lang"
          aria-label={t("language", state.lang)}
          value={state.lang}
          onChange={(e) =>
            dispatch({ type: "lang", lang: e.target.value as Lang })
          }
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <div className="progress">
        <i style={{ width: `${((idx + 1) / STEPS.length) * 100}%` }} />
      </div>
    </>
  );
}
