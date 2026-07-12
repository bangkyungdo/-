import { NextRequest, NextResponse } from "next/server";
import { calculateFourPillars } from "manseryeok";
import type { AnalyzePayload, CustomerReading, OperatorInsight } from "@/lib/types";
import { normalizeReading, normalizeOperator, demoReading, demoOperator, consultationTypeLabel } from "@/lib/reading";
import { buildHandoffCard, birthText } from "@/lib/consultation";

export const runtime = "nodejs";

function parseOpenAIText(data: any): string {
  if (typeof data?.output_text === "string") return data.output_text;
  const parts: string[] = [];
  for (const item of data?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (content?.type === "output_text" && content?.text) parts.push(content.text);
    }
  }
  return parts.join("\n");
}

function validPayload(p: AnalyzePayload) {
  return Boolean(
    p.name?.trim() && p.year && p.month && p.day && p.gender && p.consultationType &&
    p.question?.trim() && p.privacyConsent
  );
}

async function generateWithOpenAI(input: object): Promise<{ reading: CustomerReading; operator: OperatorInsight }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY_NOT_CONFIGURED");

  const instructions = `
당신은 애동제자의 사주풀이를 보조하는 한국 명리학 기반 서면 상담가다. 무게감 있고 차분한 문체로 풀이한다.
고객이 묻는 질문에 무료 상담 범위 안에서 실제 답을 먼저 제공한다. 일부러 핵심을 숨기거나 불안을 자극하지 않는다.
미래·재회·합격·재물 결과를 확정하지 않으며 건강·생사·도박·투자 수익을 예측하지 않는다.
출생시간이 없으면 시주와 세부 시기 해석의 제한을 명시한다.
출력은 반드시 주어진 JSON Schema만 따른다.

[고객용 글자수]
hook 52자 이내.
directAnswer 190자 이내: 고객 질문에 대한 구체적이고 완결된 1차 답.
core 155자 이내: 타고난 기질과 반복 패턴.
currentFlow 175자 이내: 지금 흐름과 유리한 방향.
actions 정확히 3개, 각 46자 이내.
teaser 100자 이내: 이미 답을 준 뒤 심층 상담에서 더 볼 수 있는 범위만 안내.

[운영자용]
aiSummary 정확히 3개.
unresolvedQuestions 정확히 3개.
customerCoreAnxiety: 고객이 실제로 가장 두려워하는 점 한 문장.
operatorFirstFocus: 유료 상담 첫 진입점. 무료 답변 반복 금지.
upsellItems 정확히 2개.
accuracyLimitations: 정확도 제한 한 문장.

따뜻하고 차분한 존댓말을 사용한다. '소름', '무조건', '운명의 날짜', '반드시 재회', '이 기회를 놓치면'은 금지한다.
`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      customer: {
        type: "object",
        additionalProperties: false,
        properties: {
          hook: { type: "string" },
          directAnswer: { type: "string" },
          core: { type: "string" },
          currentFlow: { type: "string" },
          actions: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          teaser: { type: "string" }
        },
        required: ["hook", "directAnswer", "core", "currentFlow", "actions", "teaser"]
      },
      operator: {
        type: "object",
        additionalProperties: false,
        properties: {
          aiSummary: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          unresolvedQuestions: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          customerCoreAnxiety: { type: "string" },
          operatorFirstFocus: { type: "string" },
          upsellItems: { type: "array", minItems: 2, maxItems: 2, items: { type: "string" } },
          accuracyLimitations: { type: "string" }
        },
        required: ["aiSummary", "unresolvedQuestions", "customerCoreAnxiety", "operatorFirstFocus", "upsellItems", "accuracyLimitations"]
      }
    },
    required: ["customer", "operator"]
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions,
      input: JSON.stringify(input),
      max_output_tokens: 1400,
      text: { format: { type: "json_schema", name: "saju_consultation", strict: true, schema } }
    })
  });

  if (!response.ok) throw new Error(`OPENAI_${response.status}:${await response.text()}`);
  const parsed = JSON.parse(parseOpenAIText(await response.json()));
  return { reading: normalizeReading(parsed.customer), operator: normalizeOperator(parsed.operator) };
}

export async function POST(req: NextRequest) {
  try {
    const p = (await req.json()) as AnalyzePayload;
    if (!validPayload(p)) return NextResponse.json({ error: "필수 정보와 개인정보 동의를 확인해주세요." }, { status: 400 });
    if (p.question.trim().length > 220) return NextResponse.json({ error: "고민은 220자 이내로 입력해주세요." }, { status: 400 });

    const hour = p.unknownTime ? 12 : Number(p.hour);
    const minute = p.unknownTime ? 0 : Number(p.minute ?? 0);
    const chart = calculateFourPillars({
      year: Number(p.year), month: Number(p.month), day: Number(p.day), hour, minute,
      isLunar: p.calendar === "lunar", isLeapMonth: Boolean(p.leapMonth),
      gender: p.gender, dayBoundary: "midnight"
    });
    const pillars = chart.toObject();
    const chartData = {
      pillars,
      tenGods: chart.tenGods,
      voidBranches: chart.voidBranches,
      luckPillars: chart.luckPillars ?? null,
      timeUnknown: p.unknownTime
    };

    let reading: CustomerReading;
    let operator: OperatorInsight;
    let mode = "live";
    try {
      ({ reading, operator } = await generateWithOpenAI({
        customer: { name: p.name, gender: p.gender, birth: birthText(p), type: consultationTypeLabel(p.consultationType), question: p.question },
        chart: chartData,
        timeUnknown: p.unknownTime
      }));
    } catch (error) {
      console.error(error);
      mode = "demo";
      reading = demoReading(p.name, p.question, p.unknownTime);
      operator = demoOperator(p.question, p.unknownTime);
    }

    const handoffCard = buildHandoffCard({ payload: p, pillars, reading, operator });

    return NextResponse.json({
      mode,
      chart: { ...pillars, timeNotice: p.unknownTime ? "출생시간 미상 · 시주와 세부 시간대 해석 제외" : null },
      reading,
      handoffCard,
      handoffSummary: {
        type: consultationTypeLabel(p.consultationType),
        question: p.question,
        unresolvedQuestions: operator.unresolvedQuestions
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
