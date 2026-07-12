import type { AnalyzePayload, CustomerReading, OperatorInsight } from "@/lib/types";
import { consultationTypeLabel } from "@/lib/reading";

export function birthText(p: AnalyzePayload) {
  const date = `${p.year}.${String(p.month).padStart(2, "0")}.${String(p.day).padStart(2, "0")}`;
  const cal = p.calendar === "solar" ? "양력" : p.leapMonth ? "음력 윤달" : "음력";
  const time = p.unknownTime ? "시간 미상" : `${String(p.hour).padStart(2, "0")}:${String(p.minute ?? 0).padStart(2, "0")}`;
  return `${date} ${cal} / ${time}`;
}

export function buildHandoffCard(args: {
  payload: AnalyzePayload;
  pillars: Record<string, string>;
  reading: CustomerReading;
  operator: OperatorInsight;
}) {
  const { payload, pillars, reading, operator } = args;
  const dayPillar = pillars.day ? ` / ${pillars.day}일주` : "";
  return [
    "[애동제자의 사주풀이 · 상담 이어가기]",
    `[상담 유형] ${consultationTypeLabel(payload.consultationType)}`,
    `[상담자] ${payload.name} / ${payload.gender === "female" ? "여성" : "남성"}`,
    `[기본정보] ${birthText(payload)}${dayPillar}`,
    `[현재 고민] ${payload.question}`,
    `[무료 풀이 핵심] ${reading.directAnswer}`,
    `[추가로 궁금한 내용] ${operator.unresolvedQuestions.join(" / ")}`,
    "",
    "위 내용을 바탕으로 1:1 상담을 이어서 진행해 주세요."
  ].join("\n");
}
