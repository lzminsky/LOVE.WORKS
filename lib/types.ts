export type ConversationPhase = "INTAKE" | "BUILDING" | "DIAGNOSIS";

export interface Prediction {
  outcome: string;
  probability: number;
  level: "high" | "medium" | "low" | "minimal";
}

export interface Equilibrium {
  id: string;
  name: string;
  description: string;
  confidence: number;
  predictions: Prediction[];
}

export interface Parameter {
  param: string;
  value: string;
  basis: string;
}

export interface Extension {
  id: string;
  name: string;
  status: "ACTIVE" | "LIKELY" | "POSSIBLE";
  detail: string;
}

export interface FormalAnalysis {
  parameters: Parameter[];
  extensions: Extension[];
}

export interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  phase?: ConversationPhase;
  equilibrium?: Equilibrium;
  formalAnalysis?: FormalAnalysis;
}
