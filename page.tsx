"use client";

import { FormEvent, useMemo, useState } from "react";

type Result = {
  mode: string;
  chart: { year?: string; month?: string; day?: string; hour?: string; timeNotice?: string | null };
  reading: { hook: string; directAnswer: string; core: string; currentFlow: string; actions: string[]; teaser: string };
  handoffCard: string;
  handoffSummary: { type: string; question: string; unresolvedQuestions: string[] };
};

const categories = [
  ["romance", "연애·재회"], ["career", "직장·이직"], ["business", "사업·창업"],
  ["money", "재물·금전"], ["relationship", "인간관계"], ["general", "전체 흐름"]
] as const;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [category, setCategory] = useState("career");
  const [question, setQuestion] = useState("");
  const [copied, setCopied] = useState(false);
  const kakaoUrl = process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL || "#";
  const count = useMemo(() => question.length, [question]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      gender: form.get("gender"),
      calendar,
      leapMonth: Boolean(form.get("leapMonth")),
      year: Number(form.get("year")),
      month: Number(form.get("month")),
      day: Number(form.get("day")),
      hour: unknownTime ? null : Number(form.get("hour")),
      minute: unknownTime ? null : Number(form.get("minute")),
      unknownTime,
      consultationType: category,
      question: question.trim(),
      privacyConsent: Boolean(form.get("privacyConsent"))
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석에 실패했습니다.");
      setResult(data);
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyHandoff() {
    if (!result) return;
    await navigator.clipboard.writeText(result.handoffCard);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return <main>
    <section className="hero">
      <div className="brandMark"><span>愛童</span></div>
      <div className="eyebrow">애동제자의 사주풀이</div>
      <h1>당신이 태어난 순간부터<br />흐름은 시작되었습니다.</h1>
      <p className="lead">타고난 기질과 지금의 고민을 함께 살펴, 현재 필요한 방향을 차분히 풀어드립니다.</p>

      <form className="card formCard" onSubmit={submit}>
        <label><span>이름 또는 닉네임</span><input name="name" maxLength={20} placeholder="홍길동" required /></label>

        <div className="segRow">
          <label className="segment"><input type="radio" name="gender" value="female" defaultChecked /><span>여성</span></label>
          <label className="segment"><input type="radio" name="gender" value="male" /><span>남성</span></label>
        </div>

        <div className="segRow">
          <button type="button" className={calendar === "solar" ? "seg active" : "seg"} onClick={() => setCalendar("solar")}>양력</button>
          <button type="button" className={calendar === "lunar" ? "seg active" : "seg"} onClick={() => setCalendar("lunar")}>음력</button>
        </div>

        <div className="dateGrid">
          <label><span>년</span><input name="year" type="number" min="1900" max="2050" placeholder="1988" required /></label>
          <label><span>월</span><input name="month" type="number" min="1" max="12" placeholder="11" required /></label>
          <label><span>일</span><input name="day" type="number" min="1" max="31" placeholder="17" required /></label>
        </div>

        {calendar === "lunar" && <label className="checkline standalone"><input type="checkbox" name="leapMonth" />윤달입니다</label>}

        <div className="timeHeader">
          <span>태어난 시간</span>
          <label className="checkline"><input type="checkbox" checked={unknownTime} onChange={(e) => setUnknownTime(e.target.checked)} />모르면 X</label>
        </div>
        <div className={`timeGrid ${unknownTime ? "disabled" : ""}`}>
          <label><span>시</span><input name="hour" type="number" min="0" max="23" placeholder="14" disabled={unknownTime} required={!unknownTime} /></label>
          <label><span>분</span><input name="minute" type="number" min="0" max="59" placeholder="20" disabled={unknownTime} required={!unknownTime} /></label>
        </div>

        <div className="fieldTitle">가장 궁금한 분야</div>
        <div className="categoryGrid">
          {categories.map(([value, label]) => <button key={value} type="button" className={category === value ? "category active" : "category"} onClick={() => setCategory(value)}>{label}</button>)}
        </div>

        <label className="questionLabel">
          <span>지금 가장 궁금한 한 가지</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 220))} placeholder="예: 올해 안에 이직을 준비해도 괜찮을까요?" required />
          <small>{count}/220</small>
        </label>

        <label className="consent">
          <input type="checkbox" name="privacyConsent" required />
          <span>입력정보가 결과 생성에 사용되며, 사이트 데이터베이스에는 저장되지 않는 것에 동의합니다.</span>
        </label>

        <button className="primary" disabled={loading}>{loading ? "사주의 흐름을 살펴보고 있습니다…" : "애동제자의 풀이 확인하기"}</button>
        <p className="privacy">의료·법률·투자 판단을 대신하지 않는 자기이해용 참고 콘텐츠입니다.</p>
        {error && <p className="error">{error}</p>}
      </form>
    </section>

    {result && <section id="result" className="resultWrap">
      <div className="resultHead">
        <span className="tiny">애동제자가 읽은 첫 번째 흐름</span>
        <h2>{result.reading.hook}</h2>
      </div>

      <div className="pillars">
        {["year", "month", "day", "hour"].map((key, i) => {
          const value = (result.chart as any)[key];
          if (!value || (key === "hour" && result.chart.timeNotice)) return null;
          return <div key={key}><small>{["년주", "월주", "일주", "시주"][i]}</small><strong>{value}</strong></div>;
        })}
      </div>
      {result.chart.timeNotice && <p className="notice">{result.chart.timeNotice}</p>}

      <article className="card reading">
        <Section no="01" title="질문에 대한 풀이" body={result.reading.directAnswer} accent />
        <Section no="02" title="타고난 중심" body={result.reading.core} />
        <Section no="03" title="지금의 흐름" body={result.reading.currentFlow} />
        <div className="section">
          <div className="sectionTitle"><b>04</b><h3>지금 해볼 일</h3></div>
          <ol>{result.reading.actions.map((a, i) => <li key={i}>{a}</li>)}</ol>
        </div>
      </article>

      <div className="teaser"><span>조금 더 깊이 풀어보면</span><p>{result.reading.teaser}</p></div>

      <div className="handoff card">
        <div className="handoffTop">
          <div><span className="tiny">1:1 상담 이어가기</span><h3>무료 풀이 다음 내용부터 바로 이어서 봅니다.</h3></div>
        </div>
        <p>상담 카드를 복사해 카카오 상담방에 붙여넣으면 생년월일과 고민을 다시 설명하지 않아도 됩니다.</p>
        <div className="unresolved">
          <b>심층 상담에서 이어볼 내용</b>
          <ul>{result.handoffSummary.unresolvedQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </div>
        <button className="copyButton" onClick={copyHandoff}>{copied ? "상담 카드가 복사되었습니다" : "상담 이어가기 카드 복사"}</button>
        <a className="secondary" href={kakaoUrl} target="_blank" rel="noreferrer">1만원 심층풀이 신청하기</a>
        <p className="miniPrice">1:1 심층 사주풀이 · 10,000원</p>
      </div>

      <p className="disclaimer">본 결과는 명리학적 해석을 활용한 참고 콘텐츠이며 미래를 확정하지 않습니다.</p>
    </section>}
  </main>;
}

function Section({ no, title, body, accent = false }: { no: string; title: string; body: string; accent?: boolean }) {
  return <div className={`section ${accent ? "answerSection" : ""}`}>
    <div className="sectionTitle"><b>{no}</b><h3>{title}</h3></div>
    <p>{body}</p>
  </div>;
}
