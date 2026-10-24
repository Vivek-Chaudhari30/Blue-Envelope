"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { AgeBand, Activities, ExemptionId } from "@/lib/rules/types";
import type { Lang } from "@/lib/i18n";

export type StepId =
  | "home"
  | "letter"
  | "questions"
  | "path"
  | "packet"
  | "submit";

export const STEPS: {
  id: StepId;
  nameKey: string;
  descKey: string;
  tech: string;
}[] = [
  { id: "home", nameKey: "step_home", descKey: "step_home_desc", tech: "Phone camera or photo upload" },
  { id: "letter", nameKey: "step_letter", descKey: "step_letter_desc", tech: "Amazon Textract + Claude on Bedrock" },
  { id: "questions", nameKey: "step_questions", descKey: "step_questions_desc", tech: "Rules engine, plain code" },
  { id: "path", nameKey: "step_path", descKey: "step_path_desc", tech: "Rules engine + image reading" },
  { id: "packet", nameKey: "step_packet", descKey: "step_packet_desc", tech: "Packet + consent" },
  { id: "submit", nameKey: "step_submit", descKey: "step_submit_desc", tech: "Handoff, MassHealth decides" },
];

export type Contact = "recent" | "old" | "unsure";
export type PartnerState = "none" | "sent" | "confirmed";

export interface FlowState {
  step: StepId;
  lang: Lang;
  letterPhoto: string | null;
  age: AgeBand;
  exemptions: ExemptionId[];
  act: Activities;
  contact: Contact;
  earnings: boolean;
  earningsPhotos: number;
  partner: PartnerState;
  reminders: boolean;
  share: boolean;
  contactUpdated: boolean;
}

// Maria's sample answers (docs/SAMPLE_CONTENT.md).
export function freshState(lang: Lang = "en"): FlowState {
  return {
    step: "home",
    lang,
    letterPhoto: null,
    age: "19-64",
    exemptions: ["none"],
    act: {
      work: { on: true, hours: 52, income: 612 },
      volunteer: { on: true, hours: 22 },
      training: { on: false, hours: 10 },
      school: { on: false },
    },
    contact: "old",
    earnings: false,
    earningsPhotos: 0,
    partner: "none",
    reminders: true,
    share: false,
    contactUpdated: false,
  };
}

type Action =
  | { type: "go"; step: StepId }
  | { type: "lang"; lang: Lang }
  | { type: "photo"; photo: string }
  | { type: "age"; age: AgeBand }
  | { type: "toggleExemption"; id: ExemptionId }
  | { type: "contact"; contact: Contact }
  | { type: "toggleActivity"; key: keyof Activities }
  | { type: "num"; path: string; value: number }
  | { type: "earnings"; count?: number }
  | { type: "partner"; state: PartnerState }
  | { type: "contactDone" }
  | { type: "set"; key: "reminders" | "share"; value: boolean }
  | { type: "restart" };

function reducer(s: FlowState, a: Action): FlowState {
  switch (a.type) {
    case "go":
      return { ...s, step: a.step };
    case "lang":
      return { ...s, lang: a.lang };
    case "photo":
      return { ...s, letterPhoto: a.photo, step: "letter" };
    case "age":
      return { ...s, age: a.age };
    case "toggleExemption": {
      if (a.id === "none") return { ...s, exemptions: ["none"] };
      const list = s.exemptions.filter((x) => x !== "none");
      const at = list.indexOf(a.id);
      if (at > -1) list.splice(at, 1);
      else list.push(a.id);
      return { ...s, exemptions: list.length ? list : ["none"] };
    }
    case "contact":
      return { ...s, contact: a.contact, contactUpdated: false };
    case "toggleActivity": {
      const act = structuredClone(s.act);
      act[a.key].on = !act[a.key].on;
      return { ...s, act };
    }
    case "num": {
      const act = structuredClone(s.act);
      const [group, field] = a.path.split(".") as [
        keyof Activities,
        string,
      ];
      // Only work/volunteer/training carry numeric fields.
      (act[group] as unknown as Record<string, number>)[field] = a.value;
      return { ...s, act };
    }
    case "earnings":
      return {
        ...s,
        earnings: true,
        earningsPhotos: a.count ?? s.earningsPhotos,
      };
    case "partner":
      return { ...s, partner: a.state };
    case "contactDone":
      return { ...s, contactUpdated: true };
    case "set":
      return { ...s, [a.key]: a.value };
    case "restart":
      return freshState(s.lang);
    default:
      return s;
  }
}

interface FlowContextValue {
  state: FlowState;
  dispatch: React.Dispatch<Action>;
}

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => freshState());
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow(): FlowContextValue {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used within FlowProvider");
  return ctx;
}
