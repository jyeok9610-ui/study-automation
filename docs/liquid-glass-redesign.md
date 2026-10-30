# Liquid Glass 리디자인 — 구현·검증 기록

> 이 문서는 로컬 검증 완료 당시의 기록입니다. 후속 사용자 배포 승인과 검증은 [공개 배포 기록](publish-2026-10-30.md)을 따릅니다.

날짜: 2026-10-30. 기준 커밋: `f15d1eb4281382e541e776da560936aaf3af1598`.

## 환경과 보존 범위

- React 19.3.1, Vite 7.3.7, TypeScript, npm, Node 24.19.0. 기존 Playwright 1.64.1/Chromium 사용.
- 해시 라우팅 및 모든 기존 주소 유지. 분야/학습책/목차/본문, 사전·출처·메모, 문제/학습 활동, 진도·복습, 검색/필터, 읽기 노선/지도, 기록 내보내기·가져오기, 빈 상태·오류 화면을 같은 기능으로 유지.
- 콘텐츠 JSON·학습 ID·스키마·IndexedDB 이름/키/저장 코드·Reader/Widgets 학습 로직·제작실·package-lock.json 변경 없음을 Git diff로 확인.
- 이전 `library-theme=dark` 값도 삭제하지 않는다. 현재 앱은 이 값과 OS 색상 설정에 관계없이 Light Mode로 표시한다.
- 새 런타임 의존성, 외부 CDN/폰트, 분석 SDK, 서비스/API 연결 없음. 로컬 QA는 격리된 브라우저 컨텍스트로 실행했고 사용자 브라우저의 실제 학습 기록을 건드리지 않았다.

## 스킬·도구 검토

- `anthropics/skills/skills/frontend-design`: 공식 Anthropic 소유 저장소, 해당 스킬의 `LICENSE.txt`는 Apache 2.0. 설치 범위는 SKILL.md와 라이선스 문서로, 실행 스크립트나 외부 전송 코드가 없다. 검토한 커밋 `ca45fc496a3436251f191354091d557da31c15b5`를 Codex 공식 skill-installer의 다운로드 방식으로 `C:\Users\hollm\.codex\skills\frontend-design`에 설치하고 SKILL.md를 읽어 적용했다. 임의의 npx 설치 패키지나 저장소 스크립트는 실행하지 않았다. 다음 턴부터 설치된 스킬로도 자동 탐색 가능하다.
- `nextlevelbuilder/ui-ux-pro-max-skill`: 공개 MIT 저장소. `C:\Users\hollm\.codex\skills\ui-ux-pro-max`가 이미 있어 덮어쓰지 않고 기존 스킬과 로컬 검색 도구를 사용했다. 일반적인 자동 추천의 랜딩 페이지/청록색 팔레트는 사용자 지시와 맞지 않아 채택하지 않았다. glassmorphism 및 접근성/안전 영역 지침만 참고하고 명시된 Apple 팔레트를 우선했다.
- `dickwu/apple-design-skill`: 저장소·SKILL.md·README와 `scripts/pull-hig.mjs`를 확인했다. 명시적 오픈소스 라이선스를 찾지 못해 설치하지 않았다. pull-hig는 Apple 공개 문서를 가져와 로컬 참조를 갱신하는 스크립트이며 이번에는 실행하지 않았다. Apple 공식 HIG Materials를 직접 읽어 기능/탐색 계층에만 유리를 적용하는 기준을 확인했다: https://developer.apple.com/design/human-interface-guidelines/materials
- 기존 `impeccable`(컨텍스트/시각 검수/문서화), `ponytail`(변경 범위 최소화), `skill-installer`(충돌 없는 정적 설치)를 사용했다. 인터넷 검토는 사용자 지침에 따라 공식 Aside만 사용했다.
- Playwright와 Chromium이 이미 실행 가능해 추가 설치하지 않았다. 실제 스크린샷 촬영을 수행했다.

## 디자인 시스템과 변경 파일

- `src/styles.css`: 공통 색/재료/간격/반경/모션 토큰과 전체 화면 스타일. #F5F5F7 작업 공간, #FFFFFF 콘텐츠, #1D1D1F 본문, #6E6E73 보조 텍스트, #007AFF 강조. 작은 파란 글자/흰 버튼 글자의 대비를 위해 별도 진한 파란 역할 토큰 사용.
- `.glass`와 공유 소재 규칙: 반투명 화이트, 12–24px backdrop blur, 안쪽 하이라이트, 얇은 밝은 경계, 낮은 불투명도의 다층 그림자. 사이드바·툴바·도움말 패널·모바일 탐색에 한정. 읽기 본문은 불투명한 흰색이다.
- 데스크톱은 인셋 사이드바/경로 툴바, 모바일은 상단 브랜드/하단 플로팅 탐색. 기존 분야 색과 학습책 의미를 유지하며 책 표지와 목록을 정돈했다.
- 버튼 피드백 100–180ms, 패널 진입 240ms, 스크롤 시 툴바의 불투명도·블러·그림자 변화. 명확한 키보드 포커스와 선택 상태, reduced-motion, reduced-transparency, contrast-more, 블러 미지원 대체, safe-area 적용.
- `src/App.tsx`: 탐색 셸과 Light 고정, 스크롤 소재 상태. 지도 SVG 선/버튼 위치 정합을 위한 preserveAspectRatio 설정. 데이터 처리 함수와 라우트 경로는 유지했다.
- `index.html`: Light 색상 스킴과 테마색 메타.
- `scripts/visual-qa.ts`, `tests/browser/liquid-glass.spec.ts`, `package.json`의 visual:qa 명령: 재현 가능한 화면/회귀 검증. DESIGN.md 및 `.impeccable/design.json`은 최종 실제 구현 기준으로 기록한다.

## 시각 QA 3회

공통: Desktop 1920×1080, Laptop 1440×900, Mobile 390×844. 서재·분야·책 소개·본문·검색·노선·지도·기록·빈/없는 페이지·활동·사전 패널을 촬영했다. 캡처는 `.impeccable/review/liquid-glass/` 아래 로컬에 보존하며 배포 파일에는 넣지 않는다.

1. `before/`: 기존 디자인 36장. 기존 화면 기준의 콘솔/요청 오류·넘침 없음.
2. `cycle-1/`: 첫 구현 36장. 모바일 fixed 탐색 막대가 backdrop-filter가 적용된 부모를 기준으로 배치되어 헤더 위에 겹친 문제를 발견했다. 모바일 헤더의 소재를 `::before`로 옮겨 viewport 기준 위치를 복원하고, 작은 보조 글자와 조작 영역을 확대했다.
3. `cycle-2/`: 수정본 36장. 탐색 위치 정상. 독립 검수에서 모바일 지도의 실제 너비가 413px임을 발견했다. 모바일 브라우저가 레이아웃에 맞춰 확장한 innerWidth만 비교한 검사가 이를 놓쳤다. 지도 그리드를 minmax(0,1fr)로 제한하고 캔버스 최소 너비를 제거했다. QA를 지정한 기대 너비와 비교하도록 강화했다. 지도 선과 버튼은 같은 좌표계를 사용하도록 했다.
4. `cycle-3/`: 최종 프로덕션 빌드에서 세 번째 평가. 본 캡처 36장에 정확한 뷰포트 크기의 서재/지도 6장을 추가한다. 최종 수치와 독립 검수 판정은 아래 최종 결과에 기록한다.

전체 페이지 캡처는 스크롤 높이에 따라 이미지 높이가 달라진다. `*-viewport.png` 및 reader/panel은 지정된 뷰포트 크기로 촬영한다. 이미지 생성·Apple 에셋 복제는 사용하지 않았다.

## 테스트와 한계

- 기존 단위/통합 테스트 8/8, 콘텐츠 검증 1권, 타입 검사, Pages base(`/study-automation/`) 빌드 통과.
- 기존/추가 PC·모바일 E2E 14/14 통과. Light 고정과 과거 테마 값 보존, 모바일 탐색 실제 위치, 지도 기대 너비, 스크롤 상태, 불투명 본문, motion 감소, 사전 Escape/포커스 복원도 검증한다.
- 기계 디자인 검사 1회 실행: `detector.json`은 `[]`. 이는 접근성 전체 적합성이나 미학적 완벽을 보증하는 결과가 아니다.
- 실제 iPhone/Safari의 수동 확인 및 GPU 프레임 시간 측정은 하지 않았다. 모바일 검증은 실제 Chromium 브라우저의 모바일 모드다. CSS 재료 표현이며 Apple 네이티브 시스템 재질 API를 사용한 앱은 아니다.

## 로컬 실행·배포

```powershell
npm ci
npm run dev
# http://127.0.0.1:4173/
npm test
npm run validate
npm run typecheck
npm run e2e
npm run visual:qa -- final
$env:PAGES_BASE='/study-automation/'
npm run build
npm run preview -- --port 4174
# http://127.0.0.1:4174/study-automation/
```

배포는 사용자 지시에 따라 보류한다. 명시적 승인 후 정확한 변경 파일을 커밋·확인하고 `master`를 push하면 기존 `.github/workflows/deploy.yml`이 검사·빌드·Pages 배포를 수행한다. Actions 성공과 실제 HTTPS 화면을 다시 확인해야 공개 반영 완료다. 현재 공개 사이트는 이전 버전이다.

## 최종 결과

- 최종 정적 빌드에서 30개 route/device 조합 모두 기대 너비(1920, 1440, 390px)와 실제 innerWidth/scrollWidth가 일치했다. 콘솔/페이지/요청 오류 0건. 서재/지도/본문/패널의 지정 뷰포트 이미지 12장은 PNG 헤더로 정확한 해상도를 별도 확인했다.
- 독립 finish reviewer가 최종 42장을 모두 읽고 **ship** 판정, 수정이 필요한 material finding 없음. 상세: `.impeccable/review/liquid-glass/finish-review.md`. 판정 범위는 제공한 화면 증거다.
- 주요 색의 수치 대비: 본문/흰색 16.83:1, 보조 글자/작업공간 4.66:1, 링크/흰색 5.71:1, 흰 버튼 글자/진한 파란 버튼 5.27:1. 모든 픽셀의 자동 접근성 인증을 의미하지 않는다.
- 최종 빌드: CSS 43.20kB(압축 9.63kB), JS 404.57kB(압축 125.96kB). 런타임 의존성 추가 없음. 프레임 시간은 측정하지 않았다.
- 3차 촬영 첫 시도는 preview 서버의 base 경로가 빌드와 달라 자료가 로드되지 않았다. UI 성공으로 기록하지 않았고, preview에도 동일한 PAGES_BASE를 설정한 뒤 전체 촬영을 완료했다.
- 변경 전: `.impeccable/review/liquid-glass/before/`. 변경 후: `cycle-3/`. `desktop-home-viewport.png`, `laptop-home-viewport.png`, `mobile-home-viewport.png`가 최종 첫 화면이다. `*-reader.png`, `*-panel.png`, `*-map-viewport.png`로 읽기/패널/지도도 확인한다.
- 공개 반영 없이 로컬 구현과 검증까지 완료했다. 현재 공개 Pages 사이트는 이전 버전이다. 최종 디자인 문서는 실제 소스와 대조해 별도로 확인한다.
