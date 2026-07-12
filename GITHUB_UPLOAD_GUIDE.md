# GitHub 업로드 핵심

GitHub 저장소 첫 화면에 아래 항목이 바로 보여야 합니다.

- package.json
- package-lock.json
- app/
- lib/
- tsconfig.json

`aedong-saju-mvp-v4` 폴더가 한 겹 더 보이거나 ZIP 파일만 보이면 잘못 업로드된 것입니다.
압축을 푼 뒤, 이 폴더 안의 파일 전체를 GitHub 저장소 최상단에 업로드하세요.

Vercel 설정:
- Framework Preset: Next.js
- Root Directory: ./
- Build Command: 기본값
- Install Command: npm install 또는 기본값
