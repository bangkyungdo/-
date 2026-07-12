export type ConsultationType = "romance" | "career" | "business" | "money" | "relationship" | "general";

export type CustomerReading = {
  hook: string;
  directAnswer: string;
  core: string;
  currentFlow: string;
  actions: string[];
  teaser: string;
};

export type OperatorInsight = {
  aiSummary: string[];
  unresolvedQuestions: string[];
  customerCoreAnxiety: string;
  operatorFirstFocus: string;
  upsellItems: string[];
  accuracyLimitations: string;
};

export type AnalyzePayload = {
  name: string;
  gender: "male" | "female";
  calendar: "solar" | "lunar";
  leapMonth?: boolean;
  year: number;
  month: number;
  day: number;
  hour?: number | null;
  minute?: number | null;
  unknownTime: boolean;
  consultationType: ConsultationType;
  question: string;
  privacyConsent: boolean;
};
