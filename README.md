# 애동제자의 사주풀이 MVP v5

GitHub와 Vercel에 바로 올릴 수 있도록 정리한 무DB 버전입니다.

## 핵심 기능
- 이름 또는 닉네임, 성별, 양력·음력, 생년월일, 출생시간 입력
- 출생시간 미상 처리
- 만세력 계산
- OpenAI Responses API 기반 사주풀이
- API 키가 없을 때 데모 결과 출력
- 1만 원 심층풀이 카카오 오픈채팅 연결
- Supabase 및 별도 DB 없음

## GitHub 업로드 시 가장 중요한 점
압축을 푼 뒤 **이 폴더 안의 내용 전체**를 GitHub 저장소 최상단에 업로드하세요.

GitHub 저장소 첫 화면에 아래 항목이 바로 보여야 정상입니다.

```text
app/
lib/
package.json
package-lock.json
tsconfig.json
vercel.json
README.md
```

GitHub 주소가 아래처럼 보이면 정상입니다.

```text
저장소/app/api/analyze/route.ts
```

아래처럼 프로젝트 폴더가 한 겹 더 보이면 잘못 업로드된 것입니다.

```text
저장소/aedong-saju-github-v5/app/api/analyze/route.ts
```

## 로컬 실행

```bash
npm ci
cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`

## Vercel 환경변수

```text
OPENAI_API_KEY=OpenAI에서 발급한 비밀키
OPENAI_MODEL=gpt-5-mini
NEXT_PUBLIC_KAKAO_OPENCHAT_URL=https://open.kakao.com/o/고유코드
```

Vercel에서는 Name과 Value 입력칸이 나뉘어 있으므로 `OPENAI_API_KEY=` 문구까지 넣지 말고 실제 값만 입력합니다.
