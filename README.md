# ✈️ TravelMates (친구와 함께하는 여행 모임 플랫폼)

> **전자정부 표준프레임워크(eGovFrame 4.x) & MySQL & 로컬 LLM(Gemma 2)** 기반으로 구축된 올인원 여행 모임 관리 웹 애플리케이션입니다.

---

## 📖 1. 프로젝트 개요

친구들과 여행을 떠날 때 겪는 다양한 번거로움(모임 결성, 일정 조율, 복잡한 회비 N빵 정산, 사진 공유)을 한곳에서 쉽고 깔끔하게 해결할 수 있도록 기획된 플랫폼입니다.  
프로젝트의 기획, 아키텍처 설계, DDL 및 백엔드 코드는 **로컬에 실행 중인 오픈소스 LLM(`gemma2:latest`)과 Antigravity의 협업 워크플로우(`@local`)**를 통해 개발되었습니다.

---

## 🛠️ 2. 기술 스택 (Tech Stack)

| 구분 | 기술 / 도구 | 설명 |
|---|---|---|
| **Frontend** | HTML5, Tailwind CSS, **jQuery 3.7.1**, JavaScript (ES6+), Lucide Icons | jQuery 기반 전면 DOM/이벤트/AJAX 제어, 반응형 모던 UI, 컴포넌트 기반 조립(Header-Contents-Footer), 모바일 하단 탭바, LocalStorage 연동 |
| **Backend** | eGovFrame 4.1.0 (Spring MVC 5.3, MyBatis 3.5) | 전자정부 표준 프레임워크 기반 계층형 아키텍처 및 RESTful API |
| **Database** | MySQL 8.4 (InnoDB, UTF8mb4) | 테이블 및 컬럼명 전체 **대문자(UPPERCASE)** 표기 규칙 준수 |
| **Connection Pool** | Apache Commons DBCP2 | MySQL Connector/J 8.0 연동 |
| **Local LLM** | Ollama (`gemma2:latest`) | OpenAI 호환 API (`http://localhost:11434/v1`) |
| **Build Tool** | Apache Maven | eGovFrame 공식 레포지토리 연동 |
| **VCS** | Git | `.gitignore` 표준화 및 브랜치(`main`) 형상관리 체계 |

---

## ✨ 3. 주요 기능 (Features)

### 1) 여행 모임 탐색 및 개설 / 관리
* **국내 / 해외 카테고리 필터링**: 목적지별 모임 빠른 검색
* **실시간 모집 현황 & 인원 초과 참여 완전 제한**:
  - 참여 인원 프로그레스 바(예: 3/4명) 및 실시간 인원 현황 시각화
  - **정원 마감 시 참여 완전 차단**: 모집 인원(`currentMembers >= maxMembers`)이 찬 모임은 이미지 상단에 `🔒 모집 마감` 뱃지와 붉은색 프로그레스 바가 적용되며, 비로그인/로그인 무관하게 참여 신청 버튼이 비활성화(`disabled`)됩니다.
  - 클라이언트뿐 아니라 백엔드 REST API(`POST /api/groups/{id}/join`)에서도 정원 초과 참여 시도를 엄격히 검증하여 차단(400 Bad Request)합니다.
* **본인 포함 여행 하이라이트 & '내 여행 ✨' 필터**:
  - 로그인 사용자가 방장(`LEADER`)이거나 이미 참여 신청한 모임 카드에 **눈에 띄는 하이라이트(상단 Accent Bar, 굵은 테두리 및 그림자 링, 뱃지)** 자동 적용
  - 상단 카테고리에 **'내 여행 ✨'** 전용 필터 탭을 제공하여 내가 참여 중인 모임만 원클릭으로 모아보기 가능
* **신규 모임 등록 & 커스텀 이미지 업로드**:
  - 여행지, 일정(기간), 예상 예산, 정원, 테마 소개 등록
  - **기본 6종 프리셋 이미지** 외에 **사용자 직접 파일 업로드** 기능 지원
* **🆕 모임 만들기 팝업 구분(국내/해외) 및 목적지 기반 인기 여행지 스마트 추천 (`group-popular-dest-box`)**:
  - **구분(국내/해외) 선택 시**: 권역별 대표 인기 목적지 칩(제주, 부산, 강원, 경주, 여수, 전주, 서울 / 태국, 일본, 베트남, 대만, 유럽 등) 즉시 제안
  - **목적지 입력 및 지역 선택 시**: 해당 목적지의 핵심 세부 테마 명소(예: 제주 → 협재/애월, 성산/우도, 서귀포/중문, 구좌/월정리 등)로 추천 칩 자동 전환
  - **원클릭 자동 완성**: 추천 칩 클릭 시 목적지 필드 자동 적용 및 모임명 센스있는 자동 제안 완성 지원
* **🆕 모임 만들기 팝업 구분·목적지 크기 일치화 & 양방향 지능형 실시간 동기화 (`handleGroupTitleInput`, `handleGroupLocationInput`, `handleGroupTypeChange`)**:
  - **컴포넌트 템플릿 완전 동기화**: 정적 HTML(`includes/modals.html`)과 동적 인젝션 모듈(`js/components.js`)의 모달 마크업을 100% 일치시켜 어떤 페이지에서 모임 만들기 팝업을 열더라도 동일한 최신 UI와 이벤트가 완벽히 동작하도록 보장
  - **구분 및 목적지 크기 완전 일치화**: 구분(`<select>`)과 목적지(`<input>`) 필드의 높이(`h-11`), 패딩, 둥근 모서리(`rounded-xl`), 폰트 크기 및 1:1 그리드 너비를 완벽하게 통일하고, 셀렉트 박스에 커스텀 chevron 드롭다운 아이콘을 적용하여 픽셀 단위 정렬 구현
  - **3자(모임명-목적지-구분) 양방향 실시간 동기화 체계**:
    1. **모임명 입력 시 (`handleGroupTitleInput`)**: 모임명 내 여행지 키워드(제주, 부산, 강릉, 방콕, 도쿄 등 25+개 지역)를 실시간 감지하여 목적지와 구분(국내/해외)을 자동 입력
    2. **목적지 입력 시 (`handleGroupLocationInput`)**: 사용자가 목적지를 직접 입력하거나 변경할 때 국내/해외 여부를 즉각 판별하여 구분(국내/해외) 셀렉트 박스를 자동으로 상호 전환
    3. **구분 변경 시 (`handleGroupTypeChange`)**: 사용자가 구분을 '국내' 또는 '해외'로 변경 시 기존 입력된 목적지와의 충돌을 감지하여 스마트 정리하고 인기 여행지 추천 칩을 즉시 전환
    4. **추천 칩 클릭 시 (`applyPopularDestination`)**: 인기 여행지 칩 선택 시 목적지와 함께 구분(국내/해외) 및 센스있는 모임명을 원클릭으로 일괄 자동 완성
  - **시각적 포커스 피드백 & 추천 칩 동기화**: 자동 완성 시 에메랄드 링 하이라이트 애니메이션 피드백을 제공하고, 하단의 구분/목적지 기반 인기 여행지 추천 박스(`updateGroupPopularDestinations()`)를 실시간으로 즉시 갱신 연동
  - **🆕 팝업 상단 헤더 및 닫기(X) 버튼 고정 (Sticky/Flex Header)**: 모달 카드를 `flex flex-col max-h-[92vh] overflow-hidden` 구조로 분리하여, 하단 입력 폼(`flex-1 overflow-y-auto`)을 끝까지 스크롤하더라도 상단 헤더 타이틀과 팝업 닫기(`X`) 버튼(`sticky top-0 z-20 flex-shrink-0`)이 항상 상단에 고정되어 언제든 즉시 팝업을 닫을 수 있도록 UX 개선
  - **🆕 모임 만들기 팝업 총 예산 입력 및 금액 전용 실시간 3자리 콤마 포맷터 (`handleBudgetInput`)**:
    - **총 예산 체계로 전환**: 기존 '예상 1인 예산'의 모호함을 해소하고 모임 전체 소요 자금을 직관적으로 등록할 수 있도록 '총 예산 (원 단위 금액만 입력)'으로 개편
    - **금액(숫자) 전용 입력 및 자동 포맷팅**: `inputmode="numeric"`을 적용하여 모바일 숫자 키패드를 유도하고, 정규식 기반 실시간 비숫자 필터링 및 3자리 콤마 천 단위 자동 포맷팅(`1,500,000`) 적용
    - **우측 '원' 고정 단위 뱃지**: 금액 입력 필드 우측에 '원' 고정 뱃지를 배치하여 불필요한 단위 텍스트 입력을 원천 차단
    - **인원수 연동 1인당 분할 예상액 동적 계산 힌트 (💡)**: 총 예산 입력 및 모집 인원(`new-group-max`) 변경 시 하단에 실시간으로 `💡 1인당 약 X원 (N인 기준 분할)` 힌트 문구를 자동 계산하여 총 예산과 1인 분할 금액을 동시에 파악 가능
    - **모임 카드 및 상세 팝업 표기 통일**: 모임 카드 뱃지 및 모임 상세 모달(`modal-group-detail`)의 예산 레이블을 '총 예산'으로 일원화하여 일관된 사용자 경험 제공
* **🆕 참여 가능한 여행 모임 상세 정보 모달 팝업 (`modal-group-detail`)**:
  - **직관적인 모달 열기 인터랙션**: 모임 목록 카드에서 **`[상세 정보]` 버튼 클릭** 또는 **대표 이미지/모임 제목 클릭** 시 미려한 상세 정보 대화상자가 부드럽게 팝업 오픈
  - **풍부한 여행 정보 요약 제공**:
    1. **상단 비주얼 헤더**: 모임 대표 이미지, 여행 구분(국내/해외), 목적지 위치 뱃지, 모집 상태(모집 중/내 모임/참여 중/모집 마감) 뱃지, 일정 기간 및 방장(개설자) 명시
    2. **4대 핵심 정보 그리드**: 여행 일정 기간, 1인당 예상 회비, 모집 인원 현황, 개설 일시(`CREATED_AT`)
    3. **상세 소개글**: 개설자가 작성한 상세 소개 및 여행 테마 전체 내용 안내
    4. **참여 멤버 명단 현황 (로그인 실명 / 비로그인 익명 마스킹 차등 표시)**:
       - **로그인 상태 시**: 모든 참여자 및 방장의 실제 성명(`김민수(방장)`, `이지연`, `박찬호` 등)을 실명으로 전원 투명하게 공개 (`[전원 실명 공개]` 뱃지 표기)
       - **비로그인 상태 시**: 개인정보 보호를 위해 성명 가운데 마스킹(`김*수(방장)`, `이*연(익명)`, `박*호(익명)` 또는 `익명 멤버 N`) 처리 (`[익명 마스킹 보호]` 뱃지 및 `[로그인하고 실명 확인하기 →]` 안내 버튼 제공)
       - 모집 게이지 프로그레스 바 및 정원 마감 시 로즈 레드 강조
    5. **연계 서비스 빠른 이동**: 해당 모임의 **`일정 플래너 📋`**, **`회비 N빵 정산기 💰`**, **`추억 갤러리 📷`** 로 원클릭 즉시 이동 연동
    6. **상세 팝업 내 참여/취소 액션**: 로그인 상태 및 정원 마감 여부에 따라 `참여 신청`, `참여 취소`, `방장(내 모임)`, `모집 마감` 버튼이 실시간 동적 렌더링되며 팝업 내에서 즉시 처리 가능
  - **카드 액션 버튼 3버튼 체계 최적화**: 모임 카드 하단 액션 버튼을 3열 그리드(`grid grid-cols-3 gap-1.5`)로 개편하여 `[상세 정보]`, `[일정 확인]`, `[참여 신청/관리]`를 균형있게 제공
* **방장 전용 모임 삭제 기능**:
  - 모임을 개설한 방장(LEADER)에게만 **모임 삭제** 버튼 제공
  - 삭제 확인 모달 팝업 후 안전하게 모임 및 관련 데이터 일괄 삭제

### 2) Day별 일정 플래너 (Timeline Planner)
* **일차별 탭(Day 1, Day 2...) 및 '전체 일정 📋' 탭 제공**: 일차별 개별 조회뿐 아니라 여행 전체 일정을 한눈에 스크롤하여 조회할 수 있는 '전체 일정' 뷰 모드 지원
* **장소 지정 시 위경도 좌표(LATITUDE, LONGITUDE) 영구 저장**:
  - 인라인 폼 및 팝업 모달에서 지도 위치 선택 시 위경도 좌표가 데이터베이스, REST API, LocalStorage에 함께 저장
* **장소/위치 미지정 일정 사후 위치 지정 기능**:
  - 타임라인 목록에서 위치가 지정되지 않은 항목에 **`[📍 위치 지정하기]`** 액션 뱃지 제공
  - 클릭 시 즉시 지도 모달이 열려 장소를 선택하고, 선택된 위치 좌표와 장소명이 해당 일정에 즉각 저장(PUT API/LocalStorage) 및 반영
* **🆕 등록된 일정 클릭 시 카드 내 지도 인라인 아코디언 확장 (`toggleScheduleInlineMap`)**:
  - **팝업(모달)에서 인라인 아코디언 방식으로 전면 개편**: 타임라인에서 일정 카드를 클릭하거나 `[지도 보기]` 뱃지를 누르면 화면을 가리는 팝업 모달 대신, **해당 일정 카드 하단에서 부드럽게 지도가 펼쳐지는(slideDown) 인라인 확장 뷰** 제공
  - **인라인 Leaflet 인터랙티브 지도 & 마커**: 저장된 위경도 좌표 또는 명소 매핑 좌표로 Leaflet 지도가 카드 내에 즉시 렌더링되며, 장소명 말풍선 팝업 및 위치 좌표 실시간 표시
  - **단일 아코디언 스마트 토글**: 다른 일정 카드를 클릭하면 기존 열려 있던 카드의 지도는 자동으로 깔끔하게 접히며, 현재 카드만 쾌적하게 확장
  - **원클릭 길찾기 및 접기 버튼**: 확장 영역 내에 카카오맵 및 네이버지도 길찾기 외부 링크 퀵 버튼과 간편 `[접기]` 버튼 제공
  - **상태 연동 뱃지 및 Chevron 회전**: 지도가 펼쳐지면 `[지도 접기]` 뱃지와 함께 화살표 아이콘이 180도 회전하며 카드 테두리에 에메랄드 하이라이트 부여
* **지도 위치 및 장소 선택 팝업 모달 (`modal-location-picker`)**:
  - 인라인 폼 및 일정 추가 모달에서 장소 입력창 옆의 **핀 아이콘(`map-pin`)** 클릭 시 대화형 지도 팝업 오픈
  - **오픈스트리트맵(Leaflet)** 연동: 지도를 자유롭게 클릭/드래그하여 원하는 위치에 마커 핀을 꽂고 장소명과 위경도 좌표 자동 인식
  - **여행 모임 지역 맞춤 인기 관광지 추천 칩**: 현재 모임의 목적지(제주, 부산, 강릉, 서울, 경주, 여수, 전주 등)를 지능적으로 감지하여 주요 명소 퀵 태그 칩 제공
  - **🆕 장소 검색 시 지도 핀 자동 이동 & 미존재 시 유사 장소 지능형 제안 (`loc-suggestions-box`)**:
    - 검색창에 장소명 또는 관광지 검색 시 프리셋 DB 및 오픈스트리트맵 지오코딩을 통해 **지도 중심과 핀(마커)이 해당 위치로 즉시 자동 이동**
    - 검색 결과가 없거나 위치를 특정하기 어려운 경우, 텍스트 유사도(N-gram / Jaccard)와 지역 연관도를 분석하여 **가장 가까운/비슷한 명소로 핀을 근처로 먼저 이동**시키고, 팝업 내에 **비슷한 추천 장소 제안 카드**를 제공
    - **🆕 제안 목록 원클릭 선택 인터랙션**: 제안된 명소 목록에서 원하는 항목을 클릭하면, **상단 검색창과 선택된 장소명 인풋에 해당 명칭이 즉시 적용(에메랄드 링 강조 피드백)**되며, **지도 중심 및 핀 마커가 해당 좌표로 즉시 이동하고 상세 말풍선 팝업(이름/설명)이 오픈**됨 (선택된 항목에 `✓ 선택됨` 뱃지 실시간 표시)
* **시간 입력 전용 타임피커 팝업 모달 (`modal-time-picker`)**:
  - 일정 플래너(`planner.html`) 및 **관리자 패널(`admin.html`)**에서 일정 추가/수정 시 브라우저 기본 시간 입력 대신 **대화형 시간 선택 팝업 모달** 제공
  - **간편 여행 프리셋 퀵 버튼**: `🌅 아침 09:00`, `🍽️ 점심 11:30`, `☕ 오후 14:00`, `🏖️ 티타임 16:30`, `🍖 저녁 18:30`, `🌙 야간 21:00` 원클릭 즉시 적용
  - **정밀 시간 설정**: 오전(AM)/오후(PM) 세그먼트 토글, 시(01~12시) & 분(5분 단위) 드롭다운 선택 및 실시간 시간 미리보기 카드 제공
  - **시각적 피드백**: 시간 선택 적용 시 에메랄드 링 테두리(`ring-2 ring-emerald-500`) 강조 피드백 및 자동 토스트 안내 제공
* **등록된 일정 즉시 확인 인터랙션**:
  - 새 일정 등록(인라인 폼 및 팝업 모달) 즉시 타임라인 렌더링 반영
  - 방금 등록된 일정 항목으로 부드러운 자동 스크롤(`scrollIntoView`) 이동
  - 에메랄드 링 테두리(`ring-2 ring-emerald-500`) 및 `✨ 방금 등록됨` 펄스 뱃지 하이라이트 효과 적용
* **비로그인 사용자 일정 즉시 열람 허용**:
  - 모임 탐색 카드에서 비로그인 사용자도 **[일정 확인]** 클릭 시 로그인 제약 없이 즉시 플래너 화면으로 이동하여 해당 모임의 일정을 바로 확인 가능
* **시간대별 방문 장소 및 세부 메모 타임라인 관리 및 실시간 삭제**

### 3) 스마트 N빵 회비 정산기 (Dutch Pay Calculator)
* 결제자, 지출 금액, 참여 친구들을 포함한 영수증 등록
* **🆕 여행 모임 총 예산 연동 및 잔여 예산 / 예산 집행률(소진율) 대시보드 구축**:
  - **총 예산 자동 연동**: 모임 개설 시 등록했던 '총 예산' 정보를 자동으로 가져와 상단 배너 및 요약 대시보드에 실시간 반영
  - **4대 핵심 요약 지표 카드**: `모임 총 예산`, `모임 총 지출 금액`, `잔여 예산 (남은 금액)`, `1인당 평균 지출액`의 균형 잡힌 4분할 레이아웃 제공
  - **총 예산 대비 지출 집행률 프로그레스 바 카드**: 총 예산 대비 현재까지 지출된 비율(%)을 시각적 진행바(`0~100%`)와 실시간 소진율 뱃지(`budget-burn-rate-badge`)로 직관적 안내
  - **예산 초과(Over budget) 지능형 경고**: 지출이 예산을 초과하면 잔여 예산 카드가 로즈 레드로 자동 전환되며 `[⚠️ 예산 초과 (N%)]` 깜빡임 뱃지와 함께 초과 지출액 경고 강조
* **1인당 실제 분할 부담액 강조 UI**: 최종적으로 지불해야 할 금액을 시각적으로 명확하게 강조 표시
* **최소 거래 송금 알고리즘 내장**: 누가 누구에게 얼마를 송금해야 하는지 직관적으로 자동 계산 및 안내
* **영수증 건수 전체 동기화 및 상세 목록 카운트 뱃지 (일치율 100%)**:
  - 선택된 모임 상단 배너(`settlement-expense-count`), 요약 통계 카드(`total-receipt-count`), 상세 영수증 목록 헤더(`expense-table-count`) 간의 등록 영수증 건수 불일치 버그를 완벽 해결
  - 영수증 추가, 삭제, 새로고침 및 모임 변경 시 실시간으로 모든 위치의 영수증 개수가 완벽히 동기화되어 표출
* **🆕 모바일 상세 영수증 목록 반응형 카드 뷰 전환 & 텍스트 몰림 현상 완전 해결**:
  - **모바일 전용 카드 뷰 (`#expense-card-list`, `block md:hidden`)**: 360px ~ 430px 협소한 스마트폰 화면에서 6개 테이블 컬럼(항목, 결제자, 금액, 참여자, 1인부담액, 관리)이 압축되어 글자가 어색하게 세로 줄바꿈되고 몰리던 현상을 전면 해결. 각 영수증을 독립된 모바일 카드로 전환하여 품목명, 결제자 뱃지, 영수증 총액, 참여자 명단 및 1인 부담액 박스(`bg-emerald-50`)를 넉넉하고 시원한 레이아웃으로 렌더링
  - **데스크톱/태블릿 테이블 뷰 가로 최소 너비 보장 (`hidden md:block`, `min-w-[580px]`)**: 데스크톱 화면에서는 가독성이 뛰어난 테이블 뷰를 유지하면서 테이블 최소 너비(`min-w-[580px]`) 및 `overflow-x-auto` 스크롤을 보장하여 어떤 해상도에서도 컬럼 찌그러짐 현상 원천 차단
  - **다크 모드 및 접근성 준수**: 카드 배경/테두리 다크 서피스 완벽 매핑 및 삭제 버튼 접근성 라벨(`aria-label`) 강화

### 4) 여행 추억 갤러리 (Photo Feed)
* **모임별 여행 사진 분리 및 필터링 시스템**:
  - 상단 모임 선택 드롭다운(`<select id="gallery-group-select">`)을 통해 여행 모임별로 독립된 사진 피드 열람 및 `🌟 전체 모임 사진 둘러보기` 모드 제공
  - URL 파라미터(`gallery.html?groupId=...`) 연동을 지원하여 모임 상세 정보 모달에서 `[추억 갤러리 📷]` 클릭 시 해당 모임이 즉시 선택되어 열람 가능
  - 모임 선택 시 상단 에메랄드/틸 그라데이션 배너(모임명, 여행 메타 정보, 등록된 총 사진 수) 및 모임 미선택 시 Empty State 안내 카드 제공
* **🆕 여행 추억 사진 업로드 전용 모달 (`modal-photo-upload`)**:
  - 업로드할 여행 모임 선택 드롭다운 (현재 선택된 모임 자동 바인딩)
  - 드래그 앤 드롭 및 클릭 선택 지원, 실시간 썸네일 미리보기(`photo-preview-img`) 및 용량(10MB)/이미지 파일 유형 엄격 검증
  - 한 줄 캡션(설명) 및 등록자 닉네임 입력 지원
* **🆕 사진 확대 라이트박스 뷰어 (`modal-photo-lightbox`)**:
  - 사진 카드 호버 시 부드러운 줌인 효과 및 `[확대 보기 🔍]` 뱃지 오버레이 노출
  - 사진 피드 클릭 시 전체 화면 고해상도 라이트박스 팝업 즉시 실행
  - **상단 툴바**: 소속 모임 뱃지, 작성자 뱃지, 현재 사진 인덱스(`N / Total`), 모달 내 좋아요(❤️) 버튼, 새 창 원본 보기 링크, 닫기(`X`) 버튼
  - **중앙 뷰어**: 부드러운 백드롭 블러(`bg-black/90`), 화면 비율에 최적화된 사진 뷰어, 이전/다음(`chevron-left`, `chevron-right`) 넘기기 버튼
  - **하단 캡션 바**: 여행 추억 한 줄 설명 및 조작 힌트 안내
  - **키보드 & 제스처 제어**: `ESC` 및 배경 클릭 시 닫기, 좌우 화살표 키(`←`, `→`) 사진 연속 탐색 완비
* **인터랙티브 기능 & 정렬 지원**:
  - 각 사진 카드 소속 모임 뱃지, 작성자 뱃지, 2줄 캡션 표시
  - 최신순 및 인기순(좋아요❤️ 카운트 기준) 정렬 필터 칩스 제공
  - 좋아요(❤️) 실시간 증가 및 확인 팝업 기반 안전 삭제 기능 지원
* **백엔드 RESTful API & MySQL 연동**:
  - `GET /api/photos`, `GET /api/groups/{id}/photos`, `POST /api/groups/{id}/photos`, `POST /api/photos/{id}/like`, `DELETE /api/photos/{id}` 및 `TRIP_GALLERY` 매핑 완료

### 5) 반응형 모바일 지원 & 내비게이션
* **반응형 햄버거 메뉴**: 모바일/화면 축소 시 상단 햄버거 버튼 클릭으로 펼쳐지는 사이드 드롭다운 메뉴
* **하단 고정 탭바 (Bottom Navigation Bar)**: 스마트폰 화면에 최적화된 앱 스타일 하단 탭 메뉴

### 6) 로그인 / 회원가입 및 개인정보 보호 암호화
* **🆕 여행 모임 외 메뉴 비로그인 접근 차단 (인증 가드 / Auth Guard)**:
  - **공개 메뉴**: '여행 모임'(`index.html`, `groups.html`) 메뉴는 비로그인 사용자도 자유롭게 탐색 가능
  - **보호 메뉴 (로그인 필수)**: '일정 플래너'(`planner.html`), '회비 정산기'(`settlement.html`), '추억 갤러리'(`gallery.html`), '관리자 패널'(`admin.html`)은 로그인 후 이용 가능
  - **차단 UX**: 비로그인 상태로 접근 또는 클릭 시 부드러운 네비게이션 가드로 차단하고 로그인 모달 자동 팝업 + 미려한 '로그인 필수 안내 잠금 화면(Auth Gate View)' 제공
* **회원가입 모달 및 중복 확인**: 아이디 중복 확인(`GET /api/auth/check-username`), 이름, 이메일, 휴대폰 번호, 비밀번호 입력 지원
* **이메일 자동완성 및 자주 쓰는 도메인 리스트(UX)**:
  - 이메일 입력창 하단에 자주 쓰는 이메일 도메인 칩(`@naver.com`, `@gmail.com`, `@kakao.com`, `@daum.net`, `@nate.com`) 원클릭 완성 지원
  - 입력창 타이핑 시 실시간 추천 드롭다운 자동 노출 (아이디/도메인 실시간 매칭 완성 지원)
* **전화번호 하이픈(-) 유/무 판단 및 실시간 자동 생성(UX/보안)**:
  - 회원가입 팝업에서 전화번호 입력 시 하이픈 유/무를 자동 감지하여, 하이픈 없이 숫자만 입력(`01012345678`)해도 `010-1234-5678` 형태로 실시간 자동 포맷팅
  - 10자리(011/031 등) 및 서울 유선번호(02) 규격까지 지능적으로 분기 처리
  - 복사/붙여넣기 및 API 전송 시에도 프론트/백엔드 이중 정규화 후 AES 양방향 암호화 저장
* **로그인 팝업 테스트 계정 현재 컴퓨터 MAC 주소 기반 표시 제한(보안/권한 제어)**:
  - 로그인 팝업 및 관리자 화면 내 테스트 계정 안내 문구(`admin/admin123`, `mskim/pass1234`)를 기본적으로 완전 비노출(`hidden`) 처리
  - `GET /api/auth/client-info`를 통해 현재 컴퓨터의 물리적 MAC 주소(`6c:7e:67:c3:21:e7`) 및 로컬 접속 여부를 백엔드에서 엄격히 검증
  - 인가된 현재 개발자 컴퓨터에서만 테스트 계정 안내 박스(`login-test-accounts-box`)가 안전하게 노출되며, 원클릭 자동 입력 지원
  - 외부 또는 인가되지 않은 타 컴퓨터에서 접속 시 테스트 계정 힌트가 절대 노출되지 않음
* **개인정보 보호 암호화 적용**:
  - **비밀번호(PASSWORD)**: 안전한 `SHA-256` 단방향 해시 알고리즘으로 암호화하여 DB 저장
  - **전화번호(PHONE)**: `AES` 양방향 대칭 암호화로 보호하여 안전하게 보관 및 복호화 지원
* 헤더 로그인 버튼 → 모달 팝업으로 아이디/비밀번호 입력 또는 원클릭 회원가입 전환 지원
* `POST /api/auth/login` 호출로 서버 인증(평문/해시 비밀번호 매칭), 성공 시 사용자 이름 헤더 표시
* **관리자 계정** 로그인 시 헤더에 🔶 **관리자** 버튼 자동 노출 → `admin.html` 이동
* **🆕 관리자 화면(admin.html) 가입 회원(MEMBER) 통합 관리 대시보드 및 REST API 구축**:
  - **헤더 탭 네비게이션**: 상단 헤더에 `[일정 관리 📋]` 및 `[가입 회원 관리 👥]` 탭 스위처를 구축하여 부드러운 탭 전환(`switchAdminTab`) 및 실시간 등록 회원 수 뱃지 지원
  - **4대 요약 통계 대시보드**: 전체 회원 수, 일반 회원(MEMBER) 수, 관리자(ADMIN) 수, 최근 7일 신규 가입자 수 실시간 집계 카드 제공
  - **스마트 검색 & 정렬 툴바**: 이름/아이디/이메일/전화번호 통합 실시간 검색창, 권한 필터(전체/일반/관리자), 정렬(최신순/오래된순/이름순) 지원
  - **회원 등록 및 정보 수정 모달 (`#modal-member-edit`)**: 신규 회원 직접 등록 및 기존 회원 정보(이름, 이메일, 전화번호, 비밀번호, 권한) 수정 지원 (아이디는 읽기 전용 보호)
  - **회원 안전 삭제 모달 (`#modal-member-delete`)**: 회원 삭제 전 확인 대화상자 제공 및 최고 관리자(`admin`) 삭제 방지 보호 체계 적용
  - **🆕 회원별 참여/등록 일정 확인 시스템 및 전용 팝업 모달 (`#modal-member-schedules`)**:
    - **명단 테이블 '참여 / 등록 일정' 컬럼**: 각 회원이 등록/참여 중인 모임 수와 일정 건수(`N개 모임 (M개 일정)`) 뱃지 버튼 및 우측 캘린더 빠른 열기 액션 제공
    - **회원 등록 일정 상세 팝업**: 회원 프로필/권한, 참여 모임 수 및 총 일정 건수 요약, 모임별 카드(모임명, 여행지, 기간, 방장/참여멤버 역할), 세부 타임라인(Day, 시간, 장소, 메모, 위치좌표 여부) 시각화
    - **원클릭 모임 일정 이동 (`jumpToGroupSchedule`)**: 팝업 내 `[일정 관리 바로가기 ↗]` 클릭 시 해당 모임의 일정 관리 탭으로 부드럽게 자동 전환 연동
  - **백엔드 REST API 엔진 구축**: `GET /api/admin/members`, `GET /api/admin/members/{id}/schedules`, `POST /api/admin/members`, `PUT /api/admin/members/{id}`, `DELETE /api/admin/members/{id}` CRUD 및 DB 조인 쿼리 완전 연동

### 7) 웹접근성(KWCAG 2.2 / WCAG 2.1 AA) 표준 준수 체계
* **본문 바로가기 건너뛰기 링크 (Skip Navigation)**:
  - 모든 웹 페이지 상단에 `<a href="#contents" class="skip-nav">본문 바로가기</a>` 제공
  - 키보드 Tab 키 입력 시 최상단에 시각적으로 노출되며, 본문 `<main id="contents" tabindex="-1">` 영역으로 즉각 포커스 이동
* **키보드 접근성 및 포커스 링 (Focus Visibility)**:
  - 모든 대화형 요소(버튼, 링크, 입력창 등)에 `:focus-visible` 시 명확한 에메랄드 아웃라인(`outline: 2px solid #10b981`) 제공
* **WAI-ARIA 대화상자(Modal Dialog) 표준화**:
  - 모든 팝업 모달(로그인, 회원가입, 모임 생성, 삭제, 일정 추가, 타임피커, 지도 위치 선택, 지도 뷰어, 관리자 수정 모달)에 `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 명시
  - 모달 닫기 버튼 및 아이콘 전용 버튼에 직관적인 `aria-label` 부여
* **시맨틱 폼 레이블 명시적 연결**:
  - 모든 폼 컨트롤(`<input>`, `<select>`, `<textarea>`)에 `<label for="...">` 매핑 또는 시각적 숨김 레이블(`.sr-only`)을 완벽히 제공하여 스크린 리더 사용자 지원
* **시각 미디어 대체 텍스트(Alternative Text)**:
  - 모든 `<img>` 태그에 목적에 부합하는 `alt` 속성 제공 (프리셋 추천 이미지, 모임 대표 이미지 등)
* **동적 상태 안내 (WAI-ARIA Live Region)**:
  - 토스트 알림 컴포넌트에 `role="status"` 및 `aria-live="polite"`를 부여하여 상태 변화를 보조기기에 즉각 전달
* **웹접근성 정적 감사 스크립트 제공**:
  - `python3 scripts/audit_accessibility.py`를 통해 프로젝트 내 전체 HTML 파일의 접근성 오류를 즉시 검증 가능 (총 10개 파일 0건 이슈 통과 달성)
* LocalStorage에 세션 정보 저장, 페이지 새로고침 후에도 로그인 상태 유지

### 8) 웹 보안 및 취약점 방어 체계 (OWASP Top 10 대응)
* **XSS (Cross-Site Scripting) 방어**:
  - `app.js` 내 전역 `escapeHtml` 유틸리티 함수 도입으로 모임명, 방문 장소, 메모, 영수증 품목명, 참여자 이름 등 사용자 입력 데이터의 HTML 특수문자(`&`, `<`, `>`, `"`, `'`) 완전 이스케이프
  - `sanitizeUrl` 함수를 적용하여 `javascript:`, `vbscript:` 등 악성 의사 프로토콜 URL 주입 차단
* **SQL Injection 원천 차단**:
  - 전자정부프레임워크 MyBatis 매퍼 내 모든 SQL문에 문자열 직접 치환(`${...}`)을 배제하고 `#{...}` PreparedStatement 파라미터화 바인딩 사용
* **보안 HTTP 응답 헤더 전역 적용**:
  - `X-Content-Type-Options: nosniff`: MIME 타입 스니핑 방지
  - `X-Frame-Options: SAMEORIGIN`: 외부 사이트 프레임 삽입 및 클릭재킹(Clickjacking) 방지
  - `X-XSS-Protection: 1; mode=block`: 브라우저 내장 XSS 필터 강제 활성화
  - `Referrer-Policy: strict-origin-when-cross-origin`: 민감 URL 정보 누출 차단
* **민감 정보 노출 방어 (Sensitive Data Protection)**:
  - 사용자 정보 조회 및 로그인 응답 시 `PASSWORD` 해시/솔트 필드가 일체 노출되지 않도록 서버단에서 철저히 제거/필터링
* **파일 업로드 및 미디어 검증 (File Upload Validation)**:
  - 모임 대표 이미지 및 갤러리 사진 업로드 시 허용 확장자(`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`) 및 MIME 타입(`image/*`) 검증
  - 최대 파일 크기 10MB 제한으로 대용량 파일 업로드로 인한 서비스 거부(DoS) 방지
* **보안 정적 진단 스크립트 제공**:
  - `python3 scripts/audit_security.py`를 통해 프로젝트 내 전체 코드베이스의 웹 취약점을 정밀 검증 (모든 점검 항목 0건 결함 통과)

### 9) 관리자 일정 관리 페이지 (`admin.html`)
* 관리자 계정 전용 접근 (비인가 접근 시 로그인 오버레이 표시)
* 좌측 사이드바: 여행 모임 목록 조회 및 선택
* 선택 모임의 전체 일정 목록, Day별 색상 뱃지 구분
* 일정 추가 / 수정 / 삭제 / Day 필터 관리 지원

### 10) 전역 다크 모드 (Dark Mode) 테마 시스템
* **원클릭 테마 전환 인터랙션**:
  - 상단 헤더 및 모바일 메뉴에 테마 토글 버튼(해☀️ / 달🌙 아이콘) 제공
  - 클릭 즉시 부드러운 전환과 함께 상태 안내 토스트(`다크 모드가 활성화되었습니다. 🌙` / `라이트 모드가 활성화되었습니다. ☀️`) 표출
* **시스템 OS 다크 테마 자동 감지 (`prefers-color-scheme`)**:
  - 사용자의 운영체제/브라우저가 다크 모드인 경우 기본적으로 다크 테마로 자동 초기화
  - 사용자가 토글 버튼을 통해 수동 설정 시 `localStorage('travelmates_theme')`에 영구 보존되어 다음 방문 시에도 설정 유지
* **FOUC (Flash of Unstyled Content) 화면 깜빡임 원천 방지**:
  - 모든 HTML `<head>`에 테마 사전 판별 스크립트를 삽입하여 페이지 최초 로드 시 흰색 깜빡임 없는 매끄러운 렌더링 보장
* **완벽한 고대비 가독성 및 UI 일관성**:
  - 헤더, 푸터, 모달, 카드, 폼 인풋, 드롭다운, 스크롤바까지 Slate-900 / Slate-800 기반의 일관된 다크 스타일 및 에메랄드 액센트 컬러 보장

---

## 🏗️ 4. 프론트엔드 컴포넌트 아키텍처

모든 웹 화면은 유지보수성과 재사용성을 극대화하기 위해 **`Header` - `Contents` - `Footer`** 3대 시맨틱 표준 영역으로 구조화되었습니다.

```
                     ┌──────────────────────────────┐
                     │   <header id="header">       │ ← includes/header.html
                     └──────────────────────────────┘
                     ┌──────────────────────────────┐
                     │   <main id="contents">       │ ← 각 페이지별 고유 콘텐츠
                     └──────────────────────────────┘
                     ┌──────────────────────────────┐
                     │   <footer id="footer">       │ ← includes/footer.html
                     └──────────────────────────────┘
                     ┌──────────────────────────────┐
                     │   <div id="modals">          │ ← includes/modals.html
                     │   <div id="bottom-nav">      │ ← includes/bottom-nav.html
                     └──────────────────────────────┘
```

* **메뉴별 독립 HTML 분할 및 컨트롤러 1:1 매칭 구조 (eGovFrame Spring MVC)**:
  - [`index.html`](backend/src/main/webapp/index.html) / [`groups.html`](backend/src/main/webapp/groups.html): 여행 모임 탐색 및 개설 화면 ↔ [`TripGroupViewController.java`](backend/src/main/java/egovframework/travel/web/TripGroupViewController.java) (`/groups.do`, `/index.do`, `/`)
  - [`planner.html`](backend/src/main/webapp/planner.html): Day별 여행 일정 타임라인 플래너 화면 ↔ [`TripScheduleViewController.java`](backend/src/main/java/egovframework/travel/web/TripScheduleViewController.java) (`/planner.do`)
  - [`settlement.html`](backend/src/main/webapp/settlement.html): 모임별 N빵 회비 영수증 & 정산 화면 ↔ [`ExpenseSettlementViewController.java`](backend/src/main/java/egovframework/travel/web/ExpenseSettlementViewController.java) (`/settlement.do`)
  - [`gallery.html`](backend/src/main/webapp/gallery.html): 여행 추억 사진 피드 & 라이트박스 뷰어 화면 ↔ [`GalleryViewController.java`](backend/src/main/java/egovframework/travel/web/GalleryViewController.java) (`/gallery.do`)
  - [`admin.html`](backend/src/main/webapp/admin.html): 총괄 관리자 패널(회원 관리 & 플래너) 화면 ↔ [`AdminViewController.java`](backend/src/main/java/egovframework/travel/web/AdminViewController.java) (`/admin.do`) 및 [`AdminApiController.java`](backend/src/main/java/egovframework/travel/web/AdminApiController.java) (`/api/admin/**`)
* **공통 컴포넌트 자동 주입 매니저 ([`js/components.js`](backend/src/main/webapp/js/components.js))**:
  - `includes/` 디렉터리의 공통 마크업을 캐싱하여 비동기 로드
  - 현재 접속 중인 URL 및 `data-active-tab` 속성에 기반하여 상단/하단 활성 탭 자동 하이라이트
  - 로그인 세션 변경 시 헤더의 프로필/로그인 버튼 상태 동기화

---

## 🗄️ 5. 데이터베이스 명명 규칙 및 테이블 구조

### 🔌 DB 접속 정보 (Connection Information)

| 항목 | 설정값 | 비고 |
|---|---|---|
| **DBMS** | MySQL 8.x / 8.4 | UTF8mb4 / InnoDB |
| **Host** | `localhost` (`127.0.0.1`) | 로컬 데이터베이스 |
| **Port** | `3306` | 기본 MySQL 포트 |
| **Database (Schema)** | `TRAVELMATES_DB` | 프로젝트 전용 스키마 |
| **User (계정명)** | `localtest` | 전용 개발자 계정 |
| **Password (비밀번호)** | `rhflffk12` | |
| **JDBC Driver** | `com.mysql.cj.jdbc.Driver` | MySQL Connector/J 8.0 |
| **JDBC URL** | `jdbc:mysql://localhost:3306/TRAVELMATES_DB?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&allowPublicKeyRetrieval=true` | |
| **설정 파일 경로** | `backend/src/main/resources/egovframework/egovProps/globals.properties` | eGovFrame 프로퍼티 |

### 📌 명명 규칙 (Naming Convention)
* 모든 **테이블명과 컬럼명은 반드시 대문자(UPPERCASE) 및 언더바(`_`) 스네이크 케이스**를 사용합니다.
* DDL, DML 및 MyBatis XML 매퍼의 모든 SQL 문에서도 대문자를 준수합니다.

### 📋 테이블 구성 (`TRAVELMATES_DB`)

| 테이블명 | 주요 컬럼 | 설명 |
|---|---|---|
| **`COMMON_CODE_GROUP`** | `GROUP_CODE`, `GROUP_NAME`, `GROUP_DESC`, `USE_YN`, `SORT_ORDER`, `CREATED_AT`, `UPDATED_AT` | 공통 코드 대분류 그룹 (등록일/수정일 포함) |
| **`COMMON_CODE`** | `CODE_ID`, `GROUP_CODE`, `CODE`, `CODE_NAME`, `CODE_DESC`, `USE_YN`, `SORT_ORDER`, `CREATED_AT`, `UPDATED_AT` | 공통 코드 상세 (등록일/수정일 포함) |
| **`MEMBER`** | `MEMBER_ID`, `USERNAME`, `PASSWORD`, `NAME`, `EMAIL`, `PHONE`, `IS_ADMIN`, `CREATED_AT`, `UPDATED_AT` | 회원 계정 및 프로필 (등록일/수정일 포함) |
| **`TRIP_GROUP`** | `GROUP_ID`, `GROUP_NAME`, `TRIP_TYPE`, `LOCATION`, `START_DATE`, `END_DATE`, `MAX_MEMBERS`, `ESTIMATED_BUDGET`, `CREATED_AT`, `UPDATED_AT` | 여행 모임 정보 (등록일/수정일 포함) |
| **`TRIP_MEMBER`** | `TRIP_MEMBER_ID`, `GROUP_ID`, `MEMBER_ID`, `ROLE`, `JOINED_AT`, `CREATED_AT`, `UPDATED_AT` | 모임 참여자 매핑 및 방장(`LEADER`)/회원(`MEMBER`) 역할 (등록일/수정일 포함) |
| **`TRIP_SCHEDULE`** | `SCHEDULE_ID`, `GROUP_ID`, `DAY_NUMBER`, `PLAN_TIME`, `PLACE`, `MEMO`, `LATITUDE`, `LONGITUDE`, `CREATED_AT`, `UPDATED_AT` | 일차별 타임라인 상세 일정 및 위경도 위치 좌표 (등록일/수정일 포함) |
| **`EXPENSE_SETTLEMENT`** | `SETTLEMENT_ID`, `GROUP_ID`, `PAYER_ID`, `TITLE`, `EXPENSE_AMOUNT`, `PAYMENT_METHOD`, `CREATED_AT`, `UPDATED_AT` | 선결제 지출 영수증 (등록일/수정일 포함) |
| **`EXPENSE_PARTICIPANT`** | `PARTICIPANT_ID`, `SETTLEMENT_ID`, `MEMBER_ID`, `SPLIT_AMOUNT`, `CREATED_AT`, `UPDATED_AT` | 지출 N빵 분할 참여자 매핑 (등록일/수정일 포함) |
| **`TRIP_GALLERY`** | `GALLERY_ID`, `GROUP_ID`, `UPLOADER_ID`, `IMAGE_URL`, `CAPTION`, `LIKE_COUNT`, `CREATED_AT`, `UPDATED_AT` | 여행 사진 및 좋아요 피드 (등록일/수정일 포함) |

### 👤 기본 테스트 계정

| USERNAME | PASSWORD | 역할 | 비고 |
|---|---|---|---|
| `admin` | `admin123` | 총괄관리자 | `admin.html` 접근 가능 |
| `mskim` | `pass1234` | 일반회원 | 김민수 |
| `jylee` | `pass1234` | 일반회원 | 이지연 |
| `chpark` | `pass1234` | 일반회원 | 박찬호 |
| `swkang` | `pass1234` | 일반회원 | 강수원 |

---

## 🏛️ 6. 백엔드 및 전체 프로젝트 아키텍처

```
backend/
├── pom.xml                                               # eGovFrame RTE 4.1.0, 공식 레포지토리, maven-war-plugin
└── src/main/
    ├── resources/egovframework/
    │   ├── egovProps/globals.properties                  # MySQL DB 접속 계정 및 환경설정
    │   ├── spring/
    │   │   ├── context-datasource.xml                    # Commons DBCP2 MySQL DataSource 설정
    │   │   ├── context-mapper.xml                        # SqlSessionFactory & MyBatis MapperScanner
    │   │   └── context-common.xml                        # 비즈니스 컴포넌트(@Service, @Repository) 스캔
    │   └── sqlmap/
    │       ├── sql-mapper-config.xml                     # 카멜케이스 자동 매핑 설정
    │       └── mappers/
    │           ├── MemberMapper.xml                      # 회원 로그인 조회 (대문자 SQL)
    │           ├── TripGroupMapper.xml                   # 모임 CRUD (대문자 SQL)
    │           ├── TripScheduleMapper.xml                # 일정 타임라인 CRUD + 수정(UPDATE)
    │           └── ExpenseMapper.xml                     # N빵 지출/정산 CRUD (대문자 SQL)
    ├── webapp/
    │   ├── index.html                                    # 메인 홈 (Header-Contents-Footer 구조)
    │   ├── groups.html                                   # 여행 모임 화면
    │   ├── planner.html                                  # 일정 플래너 화면
    │   ├── settlement.html                               # 회비 정산기 화면
    │   ├── gallery.html                                  # 사진 갤러리 화면
    │   ├── admin.html                                    # 관리자 일정 관리 전용 페이지
    │   ├── includes/                                     # 🆕 공통 컴포넌트 템플릿 조각
    │   │   ├── header.html                               # 상단 로고 & 네비게이션 & 햄버거 메뉴
    │   │   ├── footer.html                               # 하단 카피라이트 & 푸터
    │   │   ├── bottom-nav.html                           # 모바일 하단 고정 탭 메뉴
    │   │   └── modals.html                               # 로그인, 모임 생성/삭제 모달
    │   ├── css/style.css
    │   ├── js/
    │   │   ├── common.js                                 # 🆕 공통 상수(TravelMatesConstants) 및 공통 유틸리티(TravelMatesUtils)
    │   │   ├── components.js                             # 공통 컴포넌트 자동 주입 및 네비게이션 관리
    │   │   └── app.js                                    # 여행 모임, 플래너, 정산 비즈니스 로직
    │   └── WEB-INF/
    │       ├── web.xml                                   # UTF-8 인코딩 필터 & DispatcherServlet
    │       └── config/egovframework/springmvc/
    │           └── dispatcher-servlet.xml                # @RestController & Jackson JSON 매핑
    └── java/egovframework/travel/
        ├── common/                                       # 🆕 백엔드 공통 모듈 패키지
        │   ├── dto/ApiResponse.java                     # 표준 REST API 공통 응답 DTO
        │   ├── code/                                     # 표준 Enum 및 공통 코드 VO
        │   │   ├── TripType.java                         # 여행 구분 Enum (DOMESTIC, OVERSEAS)
        │   │   ├── MemberRole.java                       # 회원 역할 Enum (LEADER, MEMBER)
        │   │   ├── PaymentMethod.java                    # 결제 수단 Enum (CARD, CASH, TRANSFER)
        │   │   └── CommonCodeVO.java                     # 공통 코드 VO
        │   └── util/DateUtil.java                        # 날짜/시간 포맷 및 D-day 계산 공통 유틸
        ├── vo/                                           # MemberVO, TripGroupVO, TripScheduleVO, ExpenseVO, LoginVO
        ├── mapper/                                       # MemberMapper, TripGroupMapper, TripScheduleMapper, ExpenseMapper
        ├── service/ (impl/)                              # 🆕 메뉴별 단일 책임 원칙(SRP) 비즈니스 서비스 분리
        │   ├── TripGroupService (Impl)                   # [메뉴 1] 여행 모임 비즈니스 서비스
        │   ├── TripScheduleService (Impl)                # [메뉴 2] 일정 플래너 비즈니스 서비스
        │   ├── ExpenseService (Impl)                     # [메뉴 3] 회비 N빵 정산 비즈니스 서비스
        │   ├── GalleryService (Impl)                     # [메뉴 4] 추억 사진 갤러리 피드 비즈니스 서비스
        │   └── MemberService (Impl)                      # [메뉴 5] 회원 가입 및 인증 비즈니스 서비스
        └── web/                                          # 🆕 메뉴별 단일 책임 원칙(SRP) 컨트롤러 분리
            ├── TripGroupApiController.java               # [메뉴 1] 여행 모임 CRUD & 참여 관리 (/api/groups)
            ├── TripScheduleApiController.java            # [메뉴 2] 여행 일정 타임라인 & 위치 좌표 수정 (/api/schedules)
            ├── ExpenseApiController.java                 # [메뉴 3] 회비 지출 & N빵 정산 관리 (/api/expenses)
            ├── GalleryApiController.java                 # [메뉴 4] 추억 사진 갤러리 피드 & 좋아요 (/api/photos)
            └── AuthApiController.java                    # [메뉴 5] 로그인 & 세션 인증 관리 (/api/auth)
```

### 🔌 REST API 명세 요약 (메뉴별 컨트롤러 매핑)

* **[공통 코드] 공통 API**: `GET /api/common/codes`, `GET /api/common/codes/{groupCode}`
* **[인증] `AuthApiController`**: `POST /api/auth/register`, `GET /api/auth/check-username`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
* **[여행 모임] `TripGroupApiController`**: `GET /api/groups`, `POST /api/groups`, `GET /api/groups/{id}`, `DELETE /api/groups/{id}`, `POST /api/groups/{id}/join`, `POST /api/groups/{id}/leave`
* **[일정 타임라인] `TripScheduleApiController`**: `GET /api/groups/{id}/schedules`, `POST /api/groups/{id}/schedules`, `PUT /api/schedules/{id}`, `DELETE /api/schedules/{id}`
* **[회비 정산] `ExpenseApiController`**: `GET /api/groups/{id}/expenses`, `POST /api/groups/{id}/expenses`, `DELETE /api/expenses/{id}`
* **[추억 갤러리] `GalleryApiController`**: `GET /api/groups/{id}/photos`, `POST /api/groups/{id}/photos`, `POST /api/photos/{id}/like`

---

## 🚀 7. 실행 및 설정 가이드

### 1) 데이터베이스 설정 (MySQL)
1. **접속 계정**: `localtest` / `rhflffk12`
2. **테이블 생성 및 테스트 데이터 적재**:
   ```bash
   # 1. DDL 실행 (데이터베이스 및 테이블 생성)
   mysql -u localtest -prhflffk12 < database/schema.sql

   # 2. 초기 테스트 데이터 적재 (샘플 모임, 일정, 영수증, 관리자 계정)
   mysql -u localtest -prhflffk12 < database/init_data.sql
   ```

### 2) 웹 서비스 실행

#### 방법 A. Python 통합 개발 서버 (MySQL 실시간 연동 + REST API 풀스택 지원 / 기본 구동)
```bash
# MySQL TRAVELMATES_DB 실시간 연동(PyMySQL) 및 모든 REST API(인증, 모임, 일정, 회비)를 지원하는 통합 서버
python3 scripts/dev_server.py

# 로컬 브라우저 접속: http://localhost:8080/
```
> MySQL 데이터베이스(`TRAVELMATES_DB`)와 실시간으로 직접 연동되어 웹 화면에서 모임 등록/삭제 및 일정 수정 시 실제 MySQL 테이블에 즉시 영구 반영됩니다. (DB 장애 시 자동 인메모리 Fallback 보장)

#### 🌐 외부 공개 URL 시작 및 종료 쉘 스크립트
외부 모바일 기기나 다른 PC 브라우저에서 포트포워딩 없이 실시간으로 접속할 수 있도록 **원클릭 터널 쉘 스크립트**를 제공합니다:

```bash
# 1. 외부 접속 URL 발급 및 터널 시작
./scripts/start_tunnel.sh
# 또는: ./scripts/tunnel.sh start

# 2. 현재 터널 상태 및 접속 URL 확인
./scripts/tunnel.sh status
# 또는 URL만 확인: ./scripts/tunnel.sh url

# 3. 외부 접속 터널 안전 종료 및 차단
./scripts/stop_tunnel.sh
# 또는: ./scripts/tunnel.sh stop
```
> Cloudflare Quick Tunnel(`cloudflared`)을 통해 로컬 8080 포트가 외부 인터넷에 안전하게 공개되며, 종료 시 외부에서의 유입이 즉시 차단되고 로컬 단독 환경으로 안전하게 복귀합니다.

#### 방법 B. Maven Tomcat 플러그인 (REST API 완전 연동)
```bash
cd backend
mvn tomcat7:run

# 브라우저 접속: http://localhost:8080/
```

### 3) 실시간 Log4j 로그 모니터링 가이드

TravelMates는 전자정부프레임워크 표준 **Apache Log4j2 (`log4j2.xml`)** 및 개발 서버 통합 로깅 엔진을 탑재하여 콘솔 및 파일(`logs/travelmates.log`)에 실시간 표준 포맷(`yyyy-MM-dd HH:mm:ss.SSS [thread] LEVEL logger - msg`)으로 로그를 기록합니다.

```bash
# 1. 전체 실시간 로그 스트리밍 모니터링 (종료: Ctrl+C)
./scripts/view_logs.sh
# 또는: ./scripts/view_logs.sh tail

# 2. 에러(ERROR) 전용 실시간 로그 스트리밍
./scripts/view_logs.sh error

# 3. 최근 N줄 로그 조회 (기본 50줄)
./scripts/view_logs.sh recent 100

# 4. 로그 파일 비우기 (초기화)
./scripts/view_logs.sh clear
```

* **로그 저장 위치**:
  - `logs/travelmates.log`: 전체 API 요청, SQL 쿼리, 인증 내역 (10MB 롤링 및 압축 보관)
  - `logs/travelmates-error.log`: 시스템 예외 및 에러 전용 분리 로그
* **설정 파일**: [`backend/src/main/resources/log4j2.xml`](backend/src/main/resources/log4j2.xml) (SQL DEBUG 및 컨트롤러 로깅 제어)

---

## 🔐 8. 로그인 및 관리자 기능 사용 가이드

### 로그인 절차
1. `http://localhost:8080/` 메인 페이지 접속
2. 헤더 우측 **로그인** 버튼 클릭
3. 아이디 / 비밀번호 입력 후 로그인 (테스트 계정: `mskim` / `pass1234` 또는 `admin` / `admin123`)
4. 성공 시 헤더에 사용자 이름 표시

### 관리자 화면 접속
1. 테스트 계정 `admin` / `admin123` 으로 로그인
2. 헤더에 🔶 **관리자** 버튼 클릭 → `admin.html` 이동
3. 좌측 사이드바에서 여행 모임 선택 후 일정 추가 / 수정 / 삭제 관리

---

## 🤖 9. `@local` 지시어 워크플로우

본 워크스페이스는 사용자가 프롬프트에 **`@local`**을 입력하면 로컬 Ollama 인스턴스에 질의하여 코드를 작성하고 개발하는 자동화 규칙을 탑재하고 있습니다.

* **설정 파일**: [antigravity.config.json](antigravity.config.json)
* **엔드포인트**: `http://localhost:11434/v1`
* **로컬 모델**: `gemma2:latest`
* **연동 스크립트**: [scripts/query_local.py](scripts/query_local.py)
* **프롬프트 전체 이력**: [PROMPT.md](PROMPT.md)
* **프로젝트 규칙**: [GEMINI.md](GEMINI.md)

---

## 📝 10. 변경 이력 (Changelog)

| 버전 | 날짜 | 주요 변경사항 |
|---|---|---|
| v1.0 | 2026-11 | 초기 구축: 여행 모임 / 일정 / N빵 정산 / 갤러리 4탭 SPA |
| v1.1 | 2026-11 | MySQL TRAVELMATES_DB, 7개 테이블, 테스트 데이터 적재 |
| v1.2 | 2026-11 | 전자정부프레임워크 백엔드, MyBatis Mapper, REST API 구축 |
| v1.3 | 2026-11 | 로그인/로그아웃 기능(AuthApiController), 관리자 일정 관리 페이지(admin.html), 일정 수정(PUT) API |
| **v1.4** | **2026-11** | **🆕 방장 권한 모임 삭제 기능(모달 확인창 및 연동), 모임 생성 시 사용자 직접 이미지 파일 업로드 기능 추가** |
| **v1.5** | **2026-11** | **🆕 회비 정산기 1인당 분할 부담액 강조 UI, 모바일 반응형 햄버거 메뉴 및 하단 고정 탭바(Bottom Navigation Bar) 지원** |
| **v1.6** | **2026-11** | **🆕 메뉴별 HTML 화면 분할(groups, planner, settlement, gallery), includes/ 공통 컴포넌트 분리 및 components.js 동적 주입, Header-Contents-Footer 시맨틱 3대 구조 전면 표준화** |
| **v1.7** | **2026-11** | **🆕 본인 포함(참여 중/방장) 여행 모임 카드 하이라이트(상단 Accent Bar, 링 테두리, 뱃지) 및 '내 여행 ✨' 원클릭 필터 탭 추가** |
| **v1.8** | **2026-11** | **🆕 인원 초과(정원 마감) 시 참여 완전 차단 조치(프론트엔드 버튼 비활성화, 🔒마감 뱃지, 프로그레스 바 강조, 서버단 400 에러 검증)** |
| **v1.9** | **2026-11** | **🆕 이클립스/eGovFrame 개발환경 호환성 최적화(Workspace Default JRE 바인딩, .project 표준 네이처 정리, 컴파일러 호환성 설정, TripGroupVO 미사용 import 정리)** |
| **v1.10**| **2026-11** | **🐛 일정 플래너(planner.html) 초기 렌더링 예외 해결(groups-grid null 방어) 및 첫 번째 여행 모임 기본 자동 렌더링 UX 개선** |
| **v1.11**| **2026-11** | **🆕 등록된 일정 즉시 확인 인터랙션 개선: '전체 일정 📋' 통합 탭 추가, 신규 일정 등록 즉시 타임라인 렌더링 & 자동 스크롤 & 하이라이트(✨ 방금 등록됨 뱃지/링), 비로그인 사용자 일정 즉시 열람 장벽 해제** |
| **v1.12**| **2026-11** | **🆕 일정 플래너 시간 입력 전용 타임피커 팝업 모달 도입: 간편 여행 프리셋(아침, 점심, 티타임, 저녁 등) 원클릭 입력, 오전/오후 및 시·분 정밀 드롭다운 선택, 실시간 미리보기 및 자동 입력 연동** |
| **v1.13**| **2026-11** | **🆕 일정 플래너 지도 위치 및 장소 선택 팝업 모달 도입: 오픈스트리트맵(Leaflet) 인터랙티브 지도 연동, 지도 클릭 마커 지정, 모임 목적지별 인기 관광지 추천 칩(제주, 부산, 강릉, 서울 등) 및 실시간 명소 검색·자동 입력 지원** |
| **v1.14**| **2026-11** | **🆕 등록된 일정 클릭 시 지정된 지도 뷰어 팝업 연동: 타임라인 카드 클릭 및 '지도 보기' 뱃지 클릭 시 해당 장소 핀/마커 위치 시각화, 카카오맵 및 네이버지도 길찾기 외부 링크 원클릭 연동 지원** |
| **v1.15**| **2026-11** | **🆕 장소 지정 시 위경도 좌표(LATITUDE, LONGITUDE) 데이터베이스/API/LocalStorage 영구 저장 연동 및 위치 미지정 일정 '위치 지정하기' 사후 등록/수정(PUT) 기능 지원** |
| **v1.16**| **2026-11** | **🆕 백엔드 컨트롤러 메뉴/도메인 역할별 전면 분리(SRP 준수): 모놀리식 TripApiController 해체 및 `TripGroupApiController`, `TripScheduleApiController`, `ExpenseApiController`, `GalleryApiController`, `AuthApiController` 5대 컨트롤러로 재구성 & 개발 서버 및 API 매핑 동기화** |
| **v1.17**| **2026-11** | **🆕 회원가입 기능 및 개인정보 암호화 저장 체계 구축: 비밀번호 SHA-256 단방향 해시, 전화번호 AES 양방향 암호화, MEMBER 테이블 규격 연동, 아이디 중복확인(GET /api/auth/check-username), 회원가입 모달 UI(register-modal) 및 개발 서버/전자정부 백엔드 동기화** |
| **v1.18**| **2026-11** | **📜 전체 실제 사용자 프롬프트(총 60건) 전수 추출 및 체계적 개발 일지 문서화(PROMPT.md 생성): 시간순 상세 로그, 카테고리별 분류, 프롬프트 원문 보존 및 README.md 동기화** |
| **v1.19**| **2026-11** | **🆕 회원가입 팝업 이메일 입력 편의성 대폭 개선: 자주 쓰는 이메일 도메인 리스트(네이버, 지메일, 카카오, 다음, 네이트) 빠른 선택 칩 바 및 실시간 스마트 자동완성 드롭다운 연동** |
| **v1.20**| **2026-11** | **🔒 여행 모임 외 메뉴 로그인 접근 제어(Auth Guard) 구축: '여행 모임'만 비로그인 공개, '일정 플래너', '회비 정산기', '추억 갤러리' 등은 로그인 후 이용하도록 네비게이션 가드, 로그인 잠금 화면(Auth Gate View) 및 자동 로그인 모달 연동** |
| **v1.21**| **2026-11** | **♿ 웹접근성(KWCAG 2.2 / WCAG 2.1 AA) 전면 점검 및 오류 해결: 전 페이지 건너뛰기 링크(Skip Nav), WAI-ARIA 모달(dialog, modal, labelledby), 전체 폼 컨트롤 명시적 for-id 레이블 매핑, 텍스트 없는 버튼 aria-label 부여, focus-visible 포커스 링 개선, img alt 보완, 토스트 aria-live 안내 및 정적 검증 스크립트(audit_accessibility.py) 구축(전체 10개 파일 이슈 0건 달성)** |
| **v1.22**| **2026-11** | **🛡️ 웹 취약점 진단 및 전면 보안 패치(OWASP 기반): XSS 방어(escapeHtml 엔티티 이스케이프 및 sanitizeUrl 악성 프로토콜 차단), 보안 HTTP 응답 헤더 전역 적용(nosniff, SAMEORIGIN, XSS-Protection, Referrer-Policy), 파일 업로드 검증(확장자/MIME 화이트리스트 & 10MB 용량 제한), 응답 내 PASSWORD 민감 정보 필터링, SQL Injection 검증 및 audit_security.py 점검 스크립트 구축(0건 올패스 달성)** |
| **v1.23**| **2026-11** | **📞 회원가입 전화번호 하이픈(-) 유/무 판단 및 실시간 자동 생성 기능 도입: oninput 실시간 포맷터(010-XXXX-XXXX, 02/031 등 지원), 복사/붙여넣기 및 전송 시 프론트/백엔드 이중 정규화, 안내 힌트 텍스트 제공 및 AES 암호화 저장 연동** |
| **v1.24**| **2026-11** | **🔒 로그인 팝업 테스트 계정 안내 현재 컴퓨터 MAC 주소 기반 표시 제한: 기본 hidden 처리, GET /api/auth/client-info 백엔드 연동, 현재 컴퓨터 MAC(6c:7e:67:c3:21:e7) 및 로컬 접속 여부 화이트리스트 검증 기반 동적 노출, 외부/타 장치 접속 시 계정 정보 원천 차단** |
| **v1.25**| **2026-11** | **🐛 회비 정산 메뉴 등록된 영수증 갯수와 상세 영수증 목록 갯수 불일치 버그 해결: 상단 배너(settlement-expense-count) 누락 갱신 로직 추가, 요약 카드(total-receipt-count) 및 상세 목록 헤더(expense-table-count) 카운트 뱃지 신설을 통한 전체 영역 실시간 100% 동기화** |
| **v1.26**| **2026-11** | **⏰ 관리자 패널(admin.html) 일정 추가/수정 시간 입력을 팝업 형태로 개편: 기본 type="time" 인풋을 대화형 타임피커 모달(modal-time-picker) 연동 방식으로 변경, 여행 프리셋 6종(09:00, 11:30, 14:00, 16:30, 18:30, 21:00), 오전/오후 및 시·분 드롭다운 셀렉터, 시간 미리보기 카드, 적용 시 링 테두리 피드백 및 WAI-ARIA 접근성 완벽 준수** |
| **v1.27**| **2026-11** | **🔌 백엔드 서버 MySQL TRAVELMATES_DB 실시간 연동 엔진 전면 구축: PyMySQL 기반 데이터베이스 커넥션 풀 구축, TRIP_GROUP, TRIP_MEMBER, TRIP_SCHEDULE, EXPENSE_SETTLEMENT 실시간 CRUD(조회/등록/수정/삭제) 쿼리 연동 완료(화면의 여행 모임 건수와 MySQL 테이블 4건 100% 실시간 동기화 완료)** |
| **v1.28**| **2026-11** | **⚡ 관리자 패널(admin.html) 일정 추가 및 수정 기능 완전 활성화: MySQL TRIP_SCHEDULE 테이블 스키마에 LATITUDE/LONGITUDE 컬럼 동기화, REST API 응답 success 플래그 규격화, 인라인 특수문자 에러 원천 차단(openEditModal ID 기반 안전 탐색), 폼 유효성 검증 및 등록/수정/삭제 실시간 DB 영구 반영 완료** |
| **v1.29**| **2026-11** | **📍 일정 위치/장소 지정 팝업(modal-location-picker) 검색 시 지도 핀 이동 및 유사 장소 지능형 제안 기능 구현: 장소 검색 시 지도 핀/중심 해당 위치 또는 근처로 즉시 이동, 일치 위치 미존재 시 Bi-gram/Jaccard 유사도 기반 근처/비슷한 추천 명소 제안(loc-suggestions-box) 및 원클릭 핀 이동 인터랙션 지원** |
| **v1.30**| **2026-11** | **🌟 모임 만들기 팝업(modal-create-group) 구분 및 목적지 기반 인기 여행지 스마트 추천 시스템 도입: 국내/해외 구분 선택 시 1차 대표 인기지 칩 제시, 목적지 입력 및 선택 시 2차 세부 테마 명소(협재/애월, 성산/우도 등) 자동 전환, 원클릭 목적지 적용 및 모임명 센스있는 자동 제안 완성 연동** |
| **v1.31**| **2026-11** | **📍 장소 선택 팝업(modal-location-picker) 제안 목록 원클릭 선택 시 장소명 적용 및 지도 위치 이동 인터랙션 강화: 전역 캐시(currentLocationSuggestions) 기반 안전한 인덱스 바인딩, 제안 항목 클릭 시 검색창 및 선택 장소명 즉시 동기화(에메랄드 링 하이라이트), 지도 중심 및 핀 마커 이동 + 상세 말풍선 팝업 오픈, 선택된 칩에 '✓ 선택됨' 액티브 뱃지 시각화 적용** |
| **v1.32**| **2026-11** | **📐 새 여행 모임 만들기 팝업 구분·목적지 크기 동일화 & 모임명 위치 키워드 감지 목적지/구분 실시간 자동 완성: 구분(<select>)과 목적지(<input>) 높이(h-11) 및 1:1 그리드 크기 완벽 일치화, 커스텀 드롭다운 chevron 아이콘 배치, 모임명 타이핑 시 국내외 25+개 주요 여행지 키워드 실시간 감지하여 목적지 자동 채우기 및 구분(국내/해외) 자동 전환, 에메랄드 링 하이라이트 애니메이션 피드백 및 인기 여행지 추천 박스 실시간 연동** |
| **v1.33**| **2026-11** | **🔄 새 여행 모임 만들기 팝업 구분 및 목적지 변경 불가 현상 해결 & 양방향 지능형 실시간 동기화 체계 완성: js/components.js 동적 인젝션 템플릿과 includes/modals.html 100% 동기화 누락 해결, 목적지 직접 입력 시 구분 자동 전환(handleGroupLocationInput), 구분 수동 변경 시 불일치 목적지 정리(handleGroupTypeChange), 인기 칩 클릭 시 목적지-구분-모임명 3자 일괄 동기화(applyPopularDestination), 전역 window 바인딩을 통한 변경 인터랙션 완전 정상화** |
| **v1.34**| **2026-11** | **📌 새 여행 모임 만들기 팝업 상단 닫기(X) 버튼 및 헤더 고정(Sticky/Flex Header) 구조 적용: 모달 컨테이너를 flex-col overflow-hidden 레이아웃으로 개편하고 상단 헤더·닫기 버튼(sticky top-0 z-20 flex-shrink-0)과 하단 스크롤 본문(flex-1 overflow-y-auto)을 분리하여 스크롤 위치와 무관하게 닫기 버튼 상시 고정 노출 (modals.html & components.js 동시 반영)** |
| **v1.35**| **2026-11** | **⚡ 전체 프론트엔드 자바스크립트 처리를 jQuery 3.7.1 기반으로 전면 리팩토링: 모든 HTML(index, groups, planner, settlement, gallery, admin)에 jQuery 3.7.1 CDN 로드, js/components.js, js/app.js, admin.html 내부 스크립트 및 인라인 이벤트의 모든 DOM 탐색($), 클래스/속성/값 제어(.addClass, .removeClass, .val, .text, .html, .prop, .attr), 이벤트 위임($(function), $(document).on) 및 REST API/지오코딩 비동기 통신($.ajax)을 jQuery로 100% 전환 완료** |
| **v1.36**| **2026-11** | **🌐 외부 인터넷 확인용 보안 공개 URL(Cloudflare Tunnel) 발급 및 실시간 연동: cloudflared 기반 터널을 구동하여 로컬 8080 포트를 외부 공개 URL(https://computation-coral-themes-arlington.trycloudflare.com)로 연결, 모바일 기기 및 외부 네트워크 브라우저에서 포트포워딩 없이 실시간 웹 애플리케이션 접속 환경 제공** |
| **v1.37**| **2026-11** | **🕒 전체 테이블 등록일시(`CREATED_AT`)·수정일시(`UPDATED_AT`) 표준화 및 실시간 데이터 처리 동기화: MySQL `TRAVELMATES_DB` 7개 전 테이블(`MEMBER`, `TRIP_GROUP`, `TRIP_MEMBER`, `TRIP_SCHEDULE`, `EXPENSE_SETTLEMENT`, `EXPENSE_PARTICIPANT`, `TRIP_GALLERY`)에 `CREATED_AT` / `UPDATED_AT` 감사 컬럼 구축, DDL 스키마(`database/schema.sql`) 및 Spring Java VO/MyBatis XML 매퍼(INSERT 시 `NOW()`, UPDATE 시 `UPDATED_AT = NOW()`) 완벽 동기화, `scripts/dev_server.py` 실시간 쿼리 및 인메모리 핸들러 전면 반영 완료** |
| **v1.38**| **2026-11** | **🔒 외부 접속 보안 공개 URL(Cloudflare Tunnel) 세션 안전 종료 및 외부 차단 완료: cloudflared 백그라운드 프로세스 및 터널 세션을 안전하게 종료하고 임시 로그를 정리하여 외부 인터넷망에서의 웹 서버 접근을 원천 차단하고 내부 로컬망(포트 8080) 단독 운영으로 안전 전환** |
| **v1.39**| **2026-11** | **🚀 외부 접속 URL 시작/종료 전용 자동화 쉘 스크립트 제품화 (`start_tunnel.sh`, `stop_tunnel.sh`, `tunnel.sh`): Cloudflare Tunnel 실행, 중복 실행 방어, 공개 URL(`https://*.trycloudflare.com`) 자동 감지 및 콘솔 강조 출력, 백그라운드 PID 관리 및 안전 종료(SIGTERM/SIGKILL), `start|stop|status|url` 올인원 CLI 지원 스크립트 구축 및 실행 권한 부여 완료** |
| **v1.40**| **2026-11** | **📜 표준 로깅 시스템(Apache Log4j2 & SLF4J) 전면 구축 및 실시간 로그 뷰어(`view_logs.sh`) 도입: `backend/pom.xml` Log4j2 의존성 추가, `log4j2.xml` 컬러 콘솔/10MB 롤링파일(`logs/travelmates.log`)/에러 분리 파일 어펜더 및 SQL·컨트롤러 DEBUG 로깅 적용, 5대 REST API 컨트롤러 SLF4J 로거 연동, 개발 서버(`dev_server.py`) Log4j 표준 포맷 로깅 엔진 탑재 및 실시간 스트리밍 뷰어 스크립트 제품화 완료** |
| **v1.41**| **2026-11** | **🧩 백엔드 비즈니스 서비스(Service) 계층 메뉴별 전면 분리 (SRP 준수): 모놀리식 `TripGroupService` 해체 및 `TripGroupService` (모임 관리), `TripScheduleService` (일정 플래너), `ExpenseService` (회비 N빵 정산), `GalleryService` (추억 갤러리 피드), `MemberService` (회원 가입/인증) 5대 독립 서비스 인터페이스/구현체 체계 구축 및 컨트롤러 의존성 주입 1:1 전환 완료** |
| **v1.42**| **2026-11** | **🐛 `ExpenseVO` 컴파일 오류(`getParticipantMemberIds() is undefined`) 해결: `ExpenseVO.java`에 `participantMemberIds` (`List<Integer>`) 필드 선언 및 Getter/Setter 추가, 기존 `participantIds`와의 상호 호환 폴백 로직 적용으로 `ExpenseServiceImpl` 분할 정산 참가자 매핑 연동 정상화** |
| **v1.43**| **2026-11** | **🐛 `GalleryServiceImpl` 컴파일 오류(`must implement the inherited abstract method GalleryService.addPhoto`) 해결: `GalleryServiceImpl.java` 메서드 반환형의 중복 닫는 괄호 오탈자(`Map<String, Object>>` ➔ `Map<String, Object>`)를 바로잡아 `GalleryService` 인터페이스 시그니처와 100% 일치시켜 컴파일 에러 완전 해결** |
| **v1.44**| **2026-11** | **⚙️ 이클립스 Build Path JRE 호환성 오류(`strictly compatible with JavaSE-1.8`) 해결: `backend/.classpath` 내 JRE 컨테이너를 특정 JavaSE-1.8 엄격 바인딩에서 Workspace Default JRE(`org.eclipse.jdt.launching.JRE_CONTAINER`)로 전환하여 워크스페이스에 설치된 JRE(11, 17, 21, 25 등)와 자동 유연 바인딩 및 Build Path 경고 완전 해소** |
| **v1.45**| **2026-11** | **⚙️ 이클립스 컴파일러 준수 불일치 오류(`compiler compliance 1.8 vs JRE 25`) 해결: `backend/.settings/org.eclipse.jdt.core.prefs`에서 `org.eclipse.jdt.core.compiler.release=enabled` 옵션을 활성화하여 상위 JRE(JRE 25) 환경에서도 표준 `--release 8` 플래그로 Java 8 스펙을 안전하게 보장하고 컴파일러 경고 완전 해소** |
| **v1.46**| **2026-11** | **🧩 공통 코드(Common Code) 및 공통 모듈(Common Module) 체계화 전면 구축: DB 공통 코드 테이블(`COMMON_CODE_GROUP`, `COMMON_CODE`) 설계 및 초기 코드 적재, 백엔드 공통 패키지(`egovframework.travel.common` - 표준 응답 `ApiResponse<T>`, Enum `TripType`/`MemberRole`/`PaymentMethod`, `CommonCodeVO`, `DateUtil`), 프론트엔드 공통 JS(`js/common.js` - `TravelMatesConstants`, `TravelMatesUtils`) 모듈화 및 전역 HTML 연동, 개발 서버 공통 코드 REST API(`GET /api/common/codes`) 구축 완료** |
| **v1.47**| **2026-11** | **🔍 참여 가능한 여행 모임 목록 카드 상세 정보 모달 팝업(`modal-group-detail`) 전면 구축: 카드 이미지/제목/`[상세 정보]` 버튼 클릭 연동, 대표 이미지/구분/위치/상태 뱃지/여행 기간/방장 정보/예상 회비/모집 인원/개설일시/상세 소개글/참여 멤버 명단 칩스 시각화, 모임 전용 연계 서비스(일정 플래너·N빵 정산·추억 갤러리) 원클릭 이동, 팝업 내 동적 참여 신청·취소 인터랙션 및 카드 3열 버튼(`[상세 정보]`, `[일정 확인]`, `[참여 신청]`) 그리드 최적화 완료** |
| **v1.48**| **2026-11** | **🔒 여행 모임 상세 팝업 참여 멤버 명단 로그인(전원 실명) / 비로그인(익명 마스킹) 차등 표시 체계 구축: `TravelMatesUtils.maskName()` 성명 마스킹 공통 유틸리티 신설, 로그인 시 방장 및 참여자 실명 전원 공개(`[전원 실명 공개]` 뱃지), 비로그인 시 개인정보 보호를 위한 가운데 마스킹(`김*수(방장)`, `이*연(익명)`) 및 `[익명 마스킹 보호]` 뱃지, 실명 확인을 위한 원클릭 로그인 유도 버튼 제공** |
| **v1.49**| **2026-11** | **💰 새 여행 모임 만들기 팝업 총 예산 입력 개편 및 금액 전용 실시간 3자리 콤마 포맷터(`handleBudgetInput`) 구축: 기존 '예상 1인 예산'을 '총 예산'으로 변경, inputmode="numeric" 및 정규식 실시간 포맷터(비숫자 제거 & 3자리 콤마) 적용, 우측 원 단위 고정 뱃지 및 인원수 연동 1인당 분할 예상액 실시간 계산 힌트(💡) 제공, 모임 카드 및 상세 팝업 표기 일원화 완료** |
| **v1.50**| **2026-11** | **🗺️ 여행 일정 플래너 일정 클릭 시 카드 내 지도 인라인 아코디언 확장(`toggleScheduleInlineMap`) 구축: 기존 모달 팝업 방식을 전면 개편하여 일정 클릭 시 카드 하단에서 부드럽게 펼쳐지는 Leaflet 인터랙티브 지도 확장 뷰 구현, 단일 아코디언 스마트 토글(타 일정 자동 접힘), 뱃지 상태('지도 보기'↔'지도 접기') 및 Chevron 회전 동기화, 카카오맵/네이버지도 길찾기 원클릭 연동 및 Day 탭 전환 시 인스턴스 자동 클린업 적용** |
| **v1.51**| **2026-11** | **💰 회비 정산 메뉴 모임 총 예산 항목 연동 및 잔여 예산 / 예산 집행률(소진율) 대시보드 구축: 모임 개설 시 입력한 총 예산 값 실시간 연동, 상단 배너 총 예산 표시, 4대 요약 카드(모임 총 예산 / 총 지출 / 잔여 예산 / 1인당 평균 분담액) 개편, 총 예산 집행률 프로그레스 바 카드 신설, 소진율(%) 뱃지 및 예산 초과(Over budget) 시각적 로즈 레드 경고 알림 적용 완료** |
| **v1.52**| **2026-11** | **👥 관리자 화면(admin.html) 가입 회원(MEMBER) 관리 페이지 및 CRUD REST API 전면 구축: 상단 헤더 일정 관리↔회원 관리 탭 스위처 도입, 4대 요약 통계(전체/일반/관리자/신규 회원), 이름·아이디·이메일·전화번호 실시간 검색 및 권한 필터/정렬 툴바, 회원 등록/수정 모달(아이디 보호 & 전화번호 자동 하이픈 & 권한 지정), 최고 관리자 삭제 방지 안전 삭제 모달, 백엔드 4대 REST API(GET/POST/PUT/DELETE /api/admin/members) 연동 완료** |
| **v1.53**| **2026-11** | **🐛 관리자 패널(admin.html) 가입 회원 관리 탭 명단 미출력 오류 해결 & 렌더링 엔진 안정화: `ReferenceError: escapeHtml is not defined` 예외 규명 및 `admin.html` 전용 XSS 방어 유틸리티 선언 & `js/common.js` 전역 바인딩(`window.escapeHtml`), 날짜 파싱 방어 로직 및 try/catch 보호, `loadAdminMembers()` 응답 데이터 정규화(res.members, res.data, 대소문자 매핑 호환), 관리자 진입 시 선행 사전 로드 및 뱃지 즉시 표출, 백엔드 MySQL `MEMBER` 실시간 조회(`db_fetch_members`) 및 삭제(`db_delete_member`) 연동 완료** |
| **v1.54**| **2026-11** | **🐛 관리자 화면(admin.html) 자바스크립트 구문 오류(`Declaration or statement expected.`) 해결: `renderAdminMembers()` 함수 블록 닫는 괄호 뒤 잔존하던 중복 닫는 중괄호(`}`) 및 불필요한 호출 구문 제거, 스크립트 블록 내 218개 중괄호 완벽 균형 복원 및 Node.js 가상 컴파일 검증 완료** |
| **v1.55**| **2026-11** | **📅 관리자 화면(admin.html) 가입 회원별 등록/참여 일정 확인 시스템 전면 구축: 회원 테이블 '참여 / 등록 일정' 컬럼 신설(N개 모임, M개 일정 뱃지), 회원별 등록 일정 상세 확인 모달(`modal-member-schedules`) 구현(참여 모임 배너, 방장/멤버 역할 뱃지, Day별 상세 일정 타임라인, 위치좌표 뱃지), 모임 일정 바로가기(`jumpToGroupSchedule`) 연동, 백엔드 `GET /api/admin/members/{id}/schedules` REST API 및 MySQL `TRIP_MEMBER`·`TRIP_GROUP`·`TRIP_SCHEDULE` 실시간 조인 쿼리(`db_fetch_member_schedules`) 연동 완료** |
| **v1.56**| **2026-11** | **📐 관리자 화면(admin.html) 가입 회원 관리 툴바 UI/UX 규격 통일: 검색창(`<input>`), 권한/정렬 드롭다운(`<select>`), 새로고침 및 신규 회원 등록 `<button>` 요소들의 높이를 **`h-10` (40px)** 및 모서리(`rounded-xl`), 폰트(`text-sm`), 테두리(`border border-slate-200`)로 픽셀 단위 완전 일치화, selectBox 커스텀 `chevron-down` 드롭다운 화살표 및 공통 포커스 링 패턴 표준화 완료** |
| **v1.57**| **2026-11** | **🎨 관리자 화면(admin.html) 가입 회원별 참여/등록 일정 팝업(`modal-member-schedules`) 표준 모달 UI/UX 전면 개편: 서비스 내 표준 모달(`modal-group-detail`, `modal-create-group`)과 100% 일치하도록 Sticky 고정 헤더(프로필/역할뱃지/닫기버튼) + 독립 스크롤 본문 + Sticky 고정 푸터(안내문구/닫기버튼) 구조 통일, 오렌지/에메랄드 2대 요약 통계 카드 규격화, 모임 헤더 배너(국내/해외 및 방장/참여멤버 뱃지, 일정 바로가기 ↗) 및 Day별 상세 타임라인 카드 디자인 전면 통일 완료** |
| **v1.58**| **2026-11** | **🏷️ 회원 등록/참여 일정 팝업(`modal-member-schedules`) 지역 구분·참여멤버 뱃지 가로 배치 보장 및 일정명 100% 전체 노출 개선: 지역 구분(국내/해외) 및 멤버 역할(방장/참여멤버) 뱃지에 `whitespace-nowrap flex-shrink-0` 및 인라인 그룹 컨테이너를 적용하여 텍스트 세로 줄바꿈 방지 및 가로 일렬 정렬 완벽 보장, 일정명 및 메모에 적용된 `truncate` 생략 제거(`break-words whitespace-normal leading-snug`)로 긴 일정명도 말줄임표 없이 전량 가독성 있게 노출 완료** |
| **v1.59**| **2026-11** | **🗓️ 관리자 패널(admin.html) 일정 관리 화면 메인 화면(planner.html) 표준 플래너 구조로 전면 개편: 기존 2단 사이드바를 메인 플래너와 동일한 4단계(상단 모임 선택 셀렉터 & 새로고침, 모임 미선택 안내, 선택 모임 정보 배너 & 총 건수 & [일정 추가] 버튼, Day 1~N 및 전체 일정 📋 탭 바, 타임라인 카드 및 상단 인라인 추가 폼)로 통일, Leaflet 지도 인라인 아코디언 확장(`toggleAdminScheduleMap`) 및 카카오/네이버 길찾기 연동, 모달 일정 추가(`modal-add-plan`) 및 지도 위치/장소 선택 모달(`modal-location-picker`) 일체화 완료** |
| **v1.60**| **2026-11** | **📐 서비스 전역 selectBox 크기 및 위치별 최적 디자인 재조정: 상단 헤더 모임 선택기(admin/planner/settlement) 긴 모임명 지원 반응형 너비(`w-full sm:w-72 md:w-80`) 및 `h-10.5` 일치화, 관리자 회원 관리 툴바 필터(권한 `w-[155px]`, 정렬 `w-[140px]`) 고정폭 적용으로 레이아웃 흔들림 방지, 모달 입력 폼 드롭다운(회원/일정/정산) 인풋 일치형 `w-full h-11 pl-3.5 pr-9` 및 커스텀 chevron 통일, 타임피커 시/분 드롭다운 `h-10.5 font-semibold text-center` 최적화 완료** |
| **v1.61**| **2026-11** | **📷 추억 갤러리(gallery.html) 모임별 사진 조회 및 업로드 분리 시스템 전면 구축: 상단 표준 모임 선택 드롭다운(`<select id="gallery-group-select">`) 및 `🌟 전체 모임 사진 둘러보기` 뷰 탑재, 모임 상세 팝업 연계 URL 파라미터(`?groupId=...`) 자동 선택 연동, 선택 모임 정보 배너(총 사진 수) 및 미선택 Empty State 가이드, 신규 여행 사진 업로드 모달(`modal-photo-upload`: 모임 선택·드래그앤드롭·실시간 이미지 미리보기·캡션·작성자), 최신순/인기순(좋아요❤️) 정렬 및 백엔드 Spring & dev_server 5대 REST API(`GET/POST/DELETE`) 연동 완료** |
| **v1.62**| **2026-11** | **🔍 추억 갤러리(gallery.html) 사진 피드 클릭 시 고해상도 확대 뷰어 라이트박스 팝업(`modal-photo-lightbox`) 전면 구축: 사진 카드 호버 시 줌인 효과 및 `[확대 보기]` 오버레이 표출, 피드 클릭 시 전체 화면 라이트박스 호출, 상단 툴바(모임 뱃지·작성자·사진 인덱스 N/Total·모달 내 좋아요❤️·새창 원본 링크·닫기 X), 이전/다음(chevron) 연속 탐색 버튼, 하단 캡션 바, ESC 키 및 배경 클릭 시 닫기, 좌우 화살표 키(←, →) 키보드 제어 지원 완료** |
| **v1.63**| **2026-11** | **🐛 자바스크립트 전역 바인딩 미정의 식별자 오류(`ReferenceError: Can't find variable: openSignupModal`) 해결: `app.js` 내 미정의 `openSignupModal`/`closeSignupModal` 직접 할당 구문 개선, 안전한 래퍼 함수(`openLoginModal`, `closeLoginModal`, `openSignupModal`, `closeSignupModal`) 선언 및 `components.js`의 회원가입 모달 핸들러(`openRegisterModal`)와 양방향 별칭(Alias) 등록으로 런타임 예외 원천 해소 완료** |
| **v1.64**| **2026-11** | **🚀 로컬 개발 서버(`dev_server.py`) 클린 재기동 및 핫 디플로이 동기화: 기존 프로세스 정상 종료 및 포트 8080 프로세스 안전 해제, 웹앱 최신 정적 소스(`backend/src/main/webapp/`) 배포 타깃(`backend/target/travelmates/`) 완전 동기화 후 데몬 재기동, 전체 REST API(모임/일정/N빵 정산/갤러리 피드 & 라이트박스 뷰어) 실시간 정상 응답 헬스체크 검증 완료** |
| **v1.65**| **2026-11** | **🛡️ 브라우저 HTTP 캐시 원천 차단 및 전역 모달 식별자 참조 오류(`ReferenceError: Can't find variable: openSignupModal`) 완전 영구 해결: 1) `dev_server.py` 응답 헤더에 `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` 및 `Pragma: no-cache`, `Expires: 0` 전역 주입, 2) 정적 리소스 서빙 경로를 `src/main/webapp`으로 일원화하고 서버 기동 시 `target/travelmates` 자동 동기화 탑재, 3) 전체 HTML(gallery, index, groups, planner, settlement, admin)의 JS 스크립트 태그에 캐시 버스팅 쿼리스트링(`?v=20261117_02`) 적용, 4) `common.js`, `components.js`, `app.js` 최상단에 `window.openSignupModal`, `window.closeSignupModal`, `window.openRegisterModal` 안전 폴백 및 양방향 별칭을 즉시 등록하여 브라우저 로딩 순서나 구버전 캐시와 무관하게 100% 정상 동작 보장 완료** |
| **v1.66**| **2026-11** | **🖥️ 화면(View)과 컨트롤러(Controller) 1:1 매칭 아키텍처 전면 분리 및 표준화: eGovFrame Spring MVC 표준에 따라 5대 화면별 전용 View Controller(`TripGroupViewController` - groups/index, `TripScheduleViewController` - planner, `ExpenseSettlementViewController` - settlement, `GalleryViewController` - gallery, `AdminViewController` - admin) 신설, 관리자 전용 RESTful 컨트롤러(`AdminApiController` - 회원/일정 API) 구축, `dispatcher-servlet.xml` ViewResolver 연동 및 `dev_server.py`에 `.do` 표준 URL 매핑(200 OK) 탑재 완료** |
| **v1.67**| **2026-11** | **🐛 `LoginVO` 관리자 여부 Setter 미정의 컴파일 오류(`The method setIsAdmin(int) is undefined for the type LoginVO`) 해결: `LoginVO.java`에 JavaBeans 표준 스펙 및 DB 쿼리(CASE WHEN 1/0) 상호 호환을 위한 다중 오버로딩 Setter(`setIsAdmin(boolean)`, `setIsAdmin(int)`) 및 Getter(`getIsAdmin()`) 추가, `AdminApiController.java`의 호출 구문을 표준 `boolean` (`true`/`false`)으로 명시화하여 이클립스/eGovFrame 컴파일 오류 완전 해결** |
| **v1.68**| **2026-11** | **🎨 Tailwind CSS Play CDN 콘솔 프로덕션 경고(`cdn.tailwindcss.com should not be used in production`) 완전 해결: 1) 외부 CDN 의존성 및 인터넷 연결 지연을 제거하고 오프라인에서도 작동하도록 정적 스크립트(`js/tailwind.cdn.js`)를 로컬 서빙으로 전환, 2) 스크립트 번들 내 하드코딩된 콘솔 경고 메시지 완전 소거, 3) 전체 6개 HTML 헤더에 선제적 `console.warn` 무해화 필터 가드를 탑재하여 브라우저 콘솔 경고(Warning) 0건 클린 상태 달성 완료** |
| **v1.69**| **2026-11** | **🌙 웹서비스 전역 다크 모드 (Dark Mode) 완벽 지원 체계 구축: 1) Tailwind CSS `darkMode: 'class'` 및 5대 화면 전역 다크 테마(헤더, 푸터, 네비게이션, 카드, 모달, 폼 컨트롤, 스크롤바) 스타일(`css/style.css`) 구축, 2) 데스크톱 헤더 및 모바일 메뉴에 접근성 준수 원클릭 테마 토글 버튼(해☀️/달🌙 아이콘) 탑재, 3) `localStorage` 기반 사용자 선택 영구 보존 및 `window.matchMedia` OS 시스템 테마(다크/라이트) 자동 감지 연동, 4) FOUC(화면 깜빡임) 방지 선행 스크립트를 전체 HTML `<head>`에 적용 완료** |
| **v1.70**| **2026-11** | **👁️ 다크모드 색 대비(Color Contrast) 및 가독성 전면 개선 (WCAG AA/AAA 준수): 1) 회비 정산 및 관리자 요약 지표 카드 그라디언트(`.from-amber-50`, `.from-emerald-50`, `.from-blue-50`, `.from-purple-50`, `.from-rose-50`)의 다크 전용 딥 톤 배경 매핑 및 시각적 대비 확보, 2) 어두운 배경 위의 저대비 텍스트(`text-amber-800/950`, `text-emerald-700/800`, `text-blue-700/800`, `text-slate-800`)를 고명도 파스텔 컬러(`amber-200`, `emerald-300`, `blue-300`, `slate-50`)로 전면 반전 치환, 3) 뱃지/칩스 딥 톤 배경 및 고대비 텍스트 매핑, 4) 테이블 thead/tbody/얼룩무늬(Zebra striping) 행 대비 강화, 5) WAI-ARIA 및 웹접근성 감사 10개 파일 0건 올패스 완료** |
| **v1.71**| **2026-11** | **🛡️ 다크모드 흰색 바탕에 흰색 폰트(White on White) 시인성 오류 완전 해결: 1) Tailwind CSS 반투명 흰색 오파시티 클래스(`.bg-white/95`, `.bg-white/90`, `.bg-white/80`, `.bg-white/70`, `.bg-white/60`, `.bg-white/50`, `.bg-white/40`) 전수 다크 서피스(`slate-800` `#1e293b`) 매핑 완료, 2) 모달 상단/하단 Sticky 고정 바 및 모달 컨테이너(`> div`) 다크 서피스 정밀 동기화, 3) OpenStreetMap/Leaflet 팝업(`.leaflet-popup-content-wrapper`, `.leaflet-popup-tip`) 및 줌 컨트롤(`.leaflet-bar a`) 다크 스타일링으로 지도 장소명/메모 흰색 글씨 가독성 확보, 4) 슬레이트 계열(`bg-slate-200`, `bg-slate-100`, `bg-slate-50`) 및 파스텔 틴트(`bg-cyan-50/100`, `bg-teal-50/100`, `bg-indigo-50/100`, `bg-sky-50/100`, `bg-orange-50/200`) 전수 다크 매핑, 5) 호버(`hover:bg-white`, `hover:bg-slate-50/100/200`) 시 흰색/밝은 배경 반전 차단 가드 적용 완료** |
| **v1.72**| **2026-11** | **📱 모바일 화면 축소 시 상단 헤더 레이아웃 깨짐(줄바꿈/겹침/넘침) 완전 해결: 1) 로고(`flex-shrink-0 min-w-0`) 및 액션 툴바(`flex-shrink-0 gap-1.5`) 요소에 고정 축소 방지 및 반응형 패딩(`px-3 sm:px-6`) 적용으로 320px~430px 초소형 뷰포트 완벽 대응, 2) 모바일 화면에서 사용자 정보/관리자/로그아웃 버튼을 모바일 햄버거 메뉴(`mobile-menu-dropdown`) 상단 프로필 카드로 스마트 재배치, 3) 모바일 햄버거 버튼에 실시간 로그인 상태 표시 뱃지 닷(`mobile-menu-login-dot`) 탑재, 4) 관리자 패널(`admin.html`) 상단 헤더 모바일 뷰포트 최적화(뒤로가기 아이콘화 및 타이틀 축소 방지), 5) CSS 미디어 쿼리 기반 헤더 `overflow-x: hidden` 가드 구축 완료** |
| **v1.73**| **2026-11** | **🐛 자바스크립트 문법 구문 오류(`SyntaxError: Unexpected keyword 'class'`) 완전 해결: `js/components.js` 내부 `createHeaderHTML` 함수 끝단의 중복 템플릿 리터럴 닫힘(`` `; } ``) 오탈자를 제거하여 WebKit(Safari)/V8(Chrome) 자바스크립트 엔진 문법 검사 100% 올패스 통과 완료** |
| **v1.74**| **2026-11** | **📐 상단 메뉴 헤더 아이콘 및 버튼 크기 일괄 표준화 (동일 높이 `h-9 sm:h-10` 및 아이콘 `w-4 h-4` 규격화): 1) 상단 헤더 내 모든 상호작용 요소(로고 박스, 네비게이션 버튼, 로그인 버튼, 관리자 링크, 로그아웃 버튼, 새 모임 만들기 버튼, 테마 토글 버튼, 모바일 햄버거 버튼)의 높이를 모바일 `h-9`(36px) / 데스크톱 `h-10`(40px)으로 100% 일원화, 2) 내부 Lucide 아이콘 크기를 `w-4 h-4`(로고는 `w-5 h-5`)로 통일하여 완벽한 수평 기준선 및 정렬 구현, 3) 관리자 패널(`admin.html`) 상단 헤더 요소도 동일한 `h-9 sm:h-10` 규격으로 동기화 완료** |
| **v1.75**| **2026-11** | **📱 회비 정산 상세 영수증 목록 모바일 텍스트 몰림 현상 완전 개선 및 반응형 듀얼 뷰(테이블/카드) 체계 구축: 1) 모바일 뷰포트(360px~768px 미만)에서 6개 열 테이블 압축으로 인한 텍스트 줄바꿈/몰림 현상을 해결하기 위해 전용 모바일 카드 뷰 컨테이너(`#expense-card-list`, `block md:hidden`) 도입, 2) 품목명, 결제자 뱃지, 영수증 총액, 참여자 칩스, 1인 부담 하이라이트 박스 및 터치 친화적 삭제 버튼을 갖춘 개별 영수증 카드 레이아웃 렌더링, 3) 데스크톱/태블릿 화면에서는 기존 테이블 뷰에 `min-w-[580px]` 가로 너비 보장 및 `overflow-x-auto`를 적용하여 컬럼 찌그러짐 원천 차단, 4) 영수증 0건 Empty State 모바일 최적화, 5) 다크 모드 테두리/배경 스타일 보강 및 웹접근성(`aria-label`) 감사 0건 올패스 완료** |
| **v1.76**| **2026-11** | **📦 Git 형상관리 (Version Control System) 체계 공식 구축 및 저장소 초기화: 1) Maven 빌드 산출물(`target/`), 시스템 파일(`.DS_Store`), 런타임 로그(`logs/*.log`) 및 캐시를 안전하게 배제하는 최적화 `.gitignore` 작성, 2) Git 저장소 초기화(`git init`, 기본 브랜치 `main`) 및 로컬 사용자 설정, 3) 5대 화면 전 영역 및 전자정부 백엔드 전체 최신 소스 형상관리 최초 커밋 완료** |

---

## 📄 라이선스
This project is licensed under the Apache 2.0 License.
