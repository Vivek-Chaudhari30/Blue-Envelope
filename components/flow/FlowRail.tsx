"use client";

import { useFlow, STEPS } from "./FlowContext";
import { t } from "@/lib/i18n";

export function FlowRail() {
  const { state, dispatch } = useFlow();
  return (
    <aside className="rail" aria-label="Flow">
      <div>
        <div className="eyebrow">Healthcare H2 · Hackachusetts 2026</div>
        <h1>{t("brand", state.lang)}</h1>
      </div>
      <p className="intro">
        The member website, start to finish. Tap through it on the phone, or
        jump to any step here. It opens with Maria&apos;s sample answers filled
        in.
      </p>
      <ol className="steps" id="rail">
        {STEPS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="step-btn"
              aria-current={state.step === s.id ? "step" : undefined}
              onClick={() => dispatch({ type: "go", step: s.id })}
            >
              <span>
                <b>{t(s.nameKey as never, state.lang)}</b>
                <span>{t(s.descKey as never, state.lang)}</span>
                <code>{s.tech}</code>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="fine">
        Independent student prototype for Hackachusetts 2026. Not affiliated
        with MassHealth. Every person, letter and amount shown is a sample.
        Translations are drafts for the demo; have a native speaker check them.
      </p>
    </aside>
  );
}
