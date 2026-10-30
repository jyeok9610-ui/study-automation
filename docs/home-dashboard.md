# 홈 대시보드·북마크 확장 — 2026-10-30

## 승인과 구현

사용자 제공 사진 1.jpg의 첫 화면 구성을 적용했다. 이후 사용자 답변 ‘북마크 기능도 함께 추가’로 실제 페이지 북마크를 추가했다. 이미 승인된 Light Liquid Glass의 색·폰트·소재는 유지한다. 이미지의 24/68%와 예시 책 이름은 복제하지 않고 실제 발행 자료와 읽음 표시를 사용한다.

- `/`: ‘오늘도, 한 걸음 더.’, 전체 학습책 수, 읽음 페이지 기준 진행률, 최근 읽기/첫 자료 목록.
- `/library`: 기존 분야 서재와 학습책 탐색. 기존 `/subjects/*`, `/books/*`, `/paths`, `/map`, `/search`, `/settings` 주소 유지.
- `/bookmarks`: 저장한 페이지로 이동·해제·빈 상태.
- `/progress`: 실제 페이지별 읽음 표시/복습 표시를 조회한다. 문제 점수나 풀이 이력은 만들지 않는다.
- 주 메뉴: 홈/내 서재/북마크/학습 현황. 검색은 상단, 읽기 노선·지식 지도는 기존 서재와 보조 탐색에서 접근한다.
- 읽기 도구막대: 페이지 북마크 추가/해제. 저장 실패 시 안내한다. 재진입해도 학습 문제를 저장하지 않는다.

## 저장·이전 데이터 보존

IndexedDB `study-library`의 버전1 및 progress/notes/settings 스토어를 유지한다. 북마크만 settings에 `bookmark/<bookId>/<pageId>` 키로 저장한다. 사용자 기존 메모·진도·설정은 삭제하거나 변환하지 않는다. 내보내기 version1에 선택적 bookmarks 배열을 추가했고, 예전 북마크 없는 백업도 읽는다. 북마크 입력은 식별자·시간·목록 길이를 검증하고 알 수 없는 필드는 저장하지 않는다.

진도 집계는 현재 책에 실제로 있는 페이지의 중복 없는 읽음 표시만 계산한다. 삭제된 페이지 ID는 진도와 최근 링크에 사용하지 않는다. 현재 책 8쪽 중 1쪽 읽음은 반올림해 13%다. 독서 기록이 없으면 ‘최근’으로 꾸미지 않고 ‘처음 펼쳐볼 자료’를 보여준다.

## 변경·검증

- 핵심: src/components/Dashboard.tsx, BookmarkButton.tsx, src/lib/overview.ts, storage.ts, App.tsx, Reader.tsx, styles.css.
- 기존 학습 콘텐츠 JSON·학습 ID·문항/조작 활동·PC 제작실·의존성과 잠금 파일은 변경하지 않았다.
- 단위/통합 10/10, PC·모바일 E2E 20/20, 콘텐츠 1권 검증, 타입 검사, Pages base 빌드 통과.
- E2E는 실제 진도 변경, 북마크 저장/새로고침/목록/해제/내보내기/복원, 이전 메모·다른 settings 행 보존, DB 버전1 유지와 기존 모든 학습 흐름을 확인한다.
- 첫 검사에서 새 검색 바로가기와 검색 입력이 같은 접근성 이름으로 잡힌 문제를 발견해 이동 링크를 ‘검색 화면 열기’로 구분했다. 화면용 숨김 단위를 포함한 자료 수 검사도 실제 접근성 텍스트에 맞췄다. 이후 전체 20개가 통과했다.
- 화면 캡처: `.impeccable/review/liquid-glass/dashboard-1/` 51장, `dashboard-final/` 60장. Desktop 1920×1080/Laptop 1440×900/Mobile 390×844. 39개 일반 화면·기기 조합의 실제 너비가 일치하고 넘침/콘솔/요청 오류 없음.
- 별도의 격리된 QA 브라우저에서 실제 클릭으로 읽음1·북마크1을 만든 상태도 캡처했다(`*-home-with-progress.png`, `*-saved-bookmark.png`, `*-reading-progress.png`). 사용자 브라우저의 실제 기록에는 테스트 데이터를 넣지 않았다.
- 독립 검수는 참고 이미지 및 최종 홈/북마크/현황/읽기/패널/서재 캡처를 읽고 SHIP, 수정이 필요한 항목 없음으로 판정했다. 재캡처 요구 없음.
- 기계 검사는 323개 advisory(색71/글자크기221/반경31)를 보고했다. 대부분 기존 전체 CSS와 문서 토큰 범위 차이이며 차단 오류가 아니다. 별도의 독립 시각 검수와 구분하며, 관계없는 기존 스타일을 일괄 교체하지 않았다.
- DESIGN.md 및 `.impeccable/design.json`은 기존 세계·글로벌 토큰을 유지하고 Home/북마크/현황/새 탐색만 확장했다. 문서화 검증 통과.

## 미리보기·배포 경계

로컬 정적 빌드 주소: http://127.0.0.1:4174/study-automation/ . 실제 HTTP200과 제목·수치·런타임 오류 없음을 확인했다. `production-home.png`도 저장했다. 포트는 이 PC의 loopback에만 바인딩한다. PC 재시작 뒤에는 서버를 다시 실행해야 한다.

```powershell
npm ci
npm run dev
# 다른 터미널에서 테스트
npm test
npm run typecheck
npm run validate
npm run e2e
npm run visual:qa -- final
$env:PAGES_BASE='/study-automation/'
npm run build
npm run preview -- --port 4174
```

원격 코드 push와 Pages 배포는 하지 않는다. 실제 iPhone/Safari 및 GPU 프레임 시간은 이번에도 미검증이다. 공개판은 기존 배포이며 새 홈은 로컬 검증판이다.
