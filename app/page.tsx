"use client";

import { FlowProvider, useFlow } from "@/components/flow/FlowContext";
import { AppBar } from "@/components/flow/AppBar";
import { FlowRail } from "@/components/flow/FlowRail";
import { Home } from "@/components/flow/Home";
import { LetterXRay } from "@/components/flow/LetterXRay";
import { Questions } from "@/components/flow/Questions";
import { Path } from "@/components/flow/Path";
import { Packet } from "@/components/flow/Packet";
import { Submit } from "@/components/flow/Submit";
import { t } from "@/lib/i18n";

function Screen() {
  const { state } = useFlow();
  switch (state.step) {
    case "home":
      return <Home />;
    case "letter":
      return <LetterXRay />;
    case "questions":
      return <Questions />;
    case "path":
      return <Path />;
    case "packet":
      return <Packet />;
    case "submit":
      return <Submit />;
    default:
      return <Home />;
  }
}

function Device() {
  const { state } = useFlow();
  return (
    <div className="device" role="region" aria-label="Blue Envelope app">
      <AppBar />
      <div className="screen" id="screen" tabIndex={-1}>
        <div className="screen-inner" id="view">
          <Screen />
        </div>
      </div>
      <div className="appfoot">{t("footer", state.lang)}</div>
    </div>
  );
}

export default function Page() {
  return (
    <FlowProvider>
      <div className="page">
        <div className="stage">
          <FlowRail />
          <Device />
        </div>
      </div>
    </FlowProvider>
  );
}
