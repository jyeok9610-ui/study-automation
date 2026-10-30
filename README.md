# 나의 지식 서재

[공개 학습 서재 열기](https://jyeok9610-ui.github.io/study-automation/)

PC에서 학습책을 제작하고 GitHub Pages로 발행한 정적 웹을 iPhone에서 읽는 개인 학습 도서관입니다.

## 실행

Node.js 24 이상. npm ci 후 npm run dev (http://127.0.0.1:4173). npm run studio는 PC 전용 제작실(http://127.0.0.1:4311)을 엽니다.

검증: npm test, npm run validate, npm run build, npm run e2e.

공개 사이트는 public/content의 검수된 학습책만 사용합니다. data/의 원자료·DB·역할 산출물·로그와 studio/는 dist에 포함되지 않습니다. 읽기 기록·메모·북마크는 같은 브라우저 IndexedDB에만 남고, 문제 답·점수·풀이 이력은 저장하지 않습니다.

## 콘텐츠 제작

제작실의 Markdown/텍스트는 자료조사 → 취합 → 제작 → 자동 검사 → 독립 검수 순서로 진행합니다. Codex CLI 기존 인증과 필요 시 Aside MCP만 사용합니다. 검수 실패는 최대 두 번 수정하고 인증·사용량·브라우저 문제에는 대기합니다. 검수 통과와 실제 Pages 배포 완료를 구분합니다.

CODEX_EXE는 설치된 codex 절대 경로, ASIDE_EXE는 공식 Aside CLI 경로, STUDIO_PORT와 STUDY_DATA_DIR는 로컬 실행 설정입니다. 비밀 값을 프로젝트나 공개 빌드에 넣지 마세요.

## 배포

.github/workflows/deploy.yml은 master의 테스트·콘텐츠 검사·정적 빌드 뒤 Pages artifact를 배포합니다. 저장소 Pages source를 GitHub Actions로 설정해야 합니다. PAGES_BASE는 저장소 이름에 맞추고 해시 경로로 직접 읽기를 지원합니다.

공개 전 출처·개인정보·공개 파일 범위를 검사합니다. 제작 DB는 VACUUM INTO로 일관되게 백업하고 자료·콘텐츠를 함께 보관합니다.


## 디자인과 시각 검증

Light Mode UI와 스킬 검토·스크린샷·3차 QA·배포 절차는 [Liquid Glass 리디자인 기록](docs/liquid-glass-redesign.md)을 참고하세요. 로컬 서버 실행 후 `npm run visual:qa -- final`로 세 해상도 캡처를 다시 만들 수 있습니다.

홈 대시보드와 페이지 북마크·기존 백업 호환 검증은 [홈·북마크 확장 기록](docs/home-dashboard.md)을 참고하세요.

## WebKit 호환성 검사

Playwright 브라우저는 최초 한 번 설치합니다. `npm run e2e`는 Chromium과 WebKit의 PC/모바일 프로필을 함께 검사합니다.

```powershell
npx playwright install chromium webkit
npm run e2e
# 로컬 개발 서버가 실행 중인 별도 터미널에서
$env:QA_BROWSER='webkit'
npm run visual:qa -- webkit
```

Windows의 Playwright WebKit 검사는 실제 iPhone Safari 실기기 확인과 구분합니다. 공개 배포와 실기기 결과는 [배포·브라우저 검증 기록](docs/publish-2026-10-30.md)을 참고하세요.
