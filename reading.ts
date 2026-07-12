import type { CustomerReading, OperatorInsight, ConsultationType } from "@/lib/types";

export const LIMITS = {
  hook: 52,
  directAnswer: 190,
  core: 155,
  currentFlow: 175,
  actionItem: 46,
  teaser: 100,
  summaryItem: 54,
  unresolvedItem: 58,
  coreAnxiety: 100,
  operatorFocus: 120,
  limitation: 120
};

export function clamp(value: unknown, max: number): string {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function normalizeReading(input: Partial<CustomerReading>): CustomerReading {
  const actions = Array.isArray(input.actions) ? input.actions : [];
  return {
    hook: clamp(input.hook, LIMITS.hook),
    directAnswer: clamp(input.directAnswer, LIMITS.directAnswer),
    core: clamp(input.core, LIMITS.core),
    currentFlow: clamp(input.currentFlow, LIMITS.currentFlow),
    actions: [0, 1, 2].map((i) => clamp(actions[i] ?? "", LIMITS.actionItem)).filter(Boolean),
    teaser: clamp(input.teaser, LIMITS.teaser)
  };
}

export function normalizeOperator(input: Partial<OperatorInsight>): OperatorInsight {
  const summary = Array.isArray(input.aiSummary) ? input.aiSummary : [];
  const unresolved = Array.isArray(input.unresolvedQuestions) ? input.unresolvedQuestions : [];
  const upsell = Array.isArray(input.upsellItems) ? input.upsellItems : [];
  return {
    aiSummary: [0, 1, 2].map((i) => clamp(summary[i] ?? "", LIMITS.summaryItem)).filter(Boolean),
    unresolvedQuestions: [0, 1, 2].map((i) => clamp(unresolved[i] ?? "", LIMITS.unresolvedItem)).filter(Boolean),
    customerCoreAnxiety: clamp(input.customerCoreAnxiety, LIMITS.coreAnxiety),
    operatorFirstFocus: clamp(input.operatorFirstFocus, LIMITS.operatorFocus),
    upsellItems: [0, 1].map((i) => clamp(upsell[i] ?? "", 60)).filter(Boolean),
    accuracyLimitations: clamp(input.accuracyLimitations, LIMITS.limitation)
  };
}

const typeLabels: Record<ConsultationType, string> = {
  romance: "연애·재회",
  career: "직장·이직",
  business: "사업·창업",
  money: "재물·금전",
  relationship: "인간관계",
  general: "전체 흐름"
};

export function consultationTypeLabel(type: ConsultationType) {
  return typeLabels[type] ?? "전체 흐름";
}

export function demoReading(name: string, question: string, unknownTime: boolean): CustomerReading {
  return normalizeReading({
    hook: `${name}님은 선택 앞에서 빠르게 움직이지만, 결정 뒤에는 오래 검토하는 편입니다.`,
    directAnswer: `질문하신 “${question}”은 지금 당장 결론을 확정하기보다, 반복되는 불편의 원인이 환경인지 관계인지 먼저 나누어 보는 게 좋습니다. 현재 흐름은 무작정 버티는 쪽보다 기준을 세우고 선택지를 좁힐 때 더 유리합니다.`,
    core: "겉으로는 추진력이 강해 보여도 실제로는 책임과 주변의 기대를 많이 고려합니다. 그래서 중요한 선택일수록 여러 가능성을 동시에 붙잡고 에너지를 소모하기 쉽습니다.",
    currentFlow: unknownTime
      ? "출생시간을 몰라 시주와 세부 시간대 해석은 제외했습니다. 지금은 새로운 일을 더 늘리기보다 이미 진행 중인 것 중 수익·성장 가능성이 높은 한 가지를 선명하게 만드는 흐름입니다."
      : "지금은 확장보다 선별이 중요합니다. 새로운 제안을 전부 잡기보다 내 이름과 수익 구조를 동시에 키울 수 있는 기회에만 힘을 집중해야 결과가 빠르게 쌓입니다.",
    actions: [
      "현재 고민의 원인을 환경·사람·돈으로 나눠 적어보세요.",
      "결정을 미루는 선택에는 이번 주 안의 마감일을 정하세요.",
      "한 달 뒤에도 남을 이익이 있는 선택부터 우선하세요."
    ],
    teaser: "구체적인 시기와 반복 패턴이 언제 바뀌는지는 대운·세운과 질문 분야를 함께 볼 때 더 선명해집니다."
  });
}

export function demoOperator(question: string, unknownTime: boolean): OperatorInsight {
  return normalizeOperator({
    aiSummary: ["선택지가 많을수록 결정 피로가 커짐", "기준이 정해지면 실행 속도가 빠름", "현재는 확장보다 선별이 유리"],
    unresolvedQuestions: ["구체적으로 움직이기 좋은 시기", "현재 선택의 장기 지속 가능성", "관계와 금전이 미치는 영향"],
    customerCoreAnxiety: `고객은 ${question}의 정답보다 같은 문제가 다시 반복될까 봐 가장 불안해합니다.`,
    operatorFirstFocus: "무료 답변을 반복하지 말고, 반복 패턴이 생긴 현실 조건과 지속 가능성부터 확인합니다.",
    upsellItems: ["10,000원 1:1 심층 사주풀이"],
    accuracyLimitations: unknownTime ? "출생시간 미상으로 시주·세부 시기 해석에 제한이 있습니다." : "명리 해석은 의사결정 참고용이며 결과를 확정하지 않습니다."
  });
}
