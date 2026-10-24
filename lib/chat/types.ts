// Letter-chat types. All device-only.

export type Evidence =
  | { kind: "line"; lineId: string }
  | { kind: "source"; sourceId: string };

export type Provenance = "letter" | "edited" | "suggested";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
  evidence?: Evidence;
  notSure?: boolean;
}

export interface ExtractedValues {
  deadline?: { value: string; provenance: Provenance };
  send?: { value: string; provenance: Provenance };
  how?: { value: string; provenance: Provenance };
}

export interface LetterState {
  turns: ChatTurn[];
  values: ExtractedValues;
}
