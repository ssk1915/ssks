-- ========================================================
-- TravelMates Sample Seed Data
-- Rule: 테이블명, 컬럼명 모두 대문자(UPPERCASE) 표기
-- ========================================================

USE TRAVELMATES_DB;

-- 1. 회원 샘플
INSERT INTO MEMBER (MEMBER_ID, USERNAME, PASSWORD, NAME, EMAIL, PHONE) VALUES
(1, 'minsu', '$2a$10$abcdefghijklmnopqrstuv', '김민수', 'minsu@example.com', '010-1111-2222'),
(2, 'jihun', '$2a$10$abcdefghijklmnopqrstuv', '이지훈', 'jihun@example.com', '010-3333-4444'),
(3, 'seoyeon', '$2a$10$abcdefghijklmnopqrstuv', '박서연', 'seoyeon@example.com', '010-5555-6666'),
(4, 'hyunwoo', '$2a$10$abcdefghijklmnopqrstuv', '최현우', 'hyunwoo@example.com', '010-7777-8888'),
(5, 'admin', 'admin123', '총괄관리자', 'admin@travelmates.com', '010-0000-0000');

-- 2. 여행 모임 샘플
INSERT INTO TRIP_GROUP (GROUP_ID, GROUP_NAME, TRIP_TYPE, LOCATION, START_DATE, END_DATE, MAX_MEMBERS, ESTIMATED_BUDGET, DESCRIPTION, IMAGE_URL, CREATED_BY) VALUES
(1, '태국 방콕 & 파타야 미식 힐링 투어', '해외', '태국 (방콕/파타야)', '2026-11-20', '2026-11-25', 4, '약 800,000원', '카오산로드 야시장 탐방, 마사지, 루프탑 바에서 야경을 함께 즐길 친구 구해요!', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', 1),
(2, '제주도 동쪽 힐링 & 올레길 드라이브', '국내', '제주 (구좌/성산)', '2026-12-05', '2026-12-08', 4, '약 400,000원', '렌터카 빌려서 해안도로 달리고 오션뷰 카페 및 흑돼지 뿌실 친구들 환영합니다.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 2),
(3, '강원도 양양 서핑 & 불멍 캠핑 트립', '국내', '강원 (양양 죽도해변)', '2026-11-14', '2026-11-16', 6, '약 250,000원', '초보자도 환영! 주말 양양에서 서핑 강습 받고 저녁엔 글램핑 바비큐 파티 해요.', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80', 4);

-- 3. 모임 참여 멤버
INSERT INTO TRIP_MEMBER (GROUP_ID, MEMBER_ID, ROLE) VALUES
(1, 1, 'LEADER'),
(1, 2, 'MEMBER'),
(1, 3, 'MEMBER'),
(2, 2, 'LEADER'),
(2, 1, 'MEMBER'),
(3, 4, 'LEADER'),
(3, 1, 'MEMBER'),
(3, 2, 'MEMBER'),
(3, 3, 'MEMBER');

-- 4. 일정 샘플 (제주도 모임 기준)
INSERT INTO TRIP_SCHEDULE (GROUP_ID, DAY_NUMBER, PLAN_TIME, PLACE, MEMO, LATITUDE, LONGITUDE) VALUES
(2, 1, '10:00', '제주공항 집결 및 렌터카 인수', '3번 게이트 앞 만남, 완전자차 가입', 33.5066, 126.4930),
(2, 1, '12:30', '제주 흑돼지 고기국수 점심', '자매국수 본점 웨이팅 확인', 33.5188, 126.5290),
(2, 1, '15:00', '함덕 해수욕장 & 서우봉 산책', '에메랄드빛 바다 배경 단체 사진 촬영', 33.5434, 126.6698),
(2, 1, '18:30', '숙소 체크인 및 동문시장 야시장', '딱새우회, 전복버터구이 포장해서 파티', 33.5126, 126.5284),
(2, 2, '09:30', '성산일출봉 하이킹', '편한 운동화 필수, 왕복 약 50분 소요', 33.4586, 126.9427),
(2, 2, '13:00', '구좌 당근케이크 오션뷰 카페', '바다 전망 루프탑에서 힐링 타임', 33.5358, 126.8524),
(2, 3, '10:30', '기념품 샵 및 감귤 체험 농장', '선물용 오메기떡 & 황금향 구매', 33.4721, 126.6853),
(2, 3, '14:00', '렌터카 반납 및 제주공항 이동', '비행기 출발 1시간 반 전 도착', 33.5066, 126.4930);

-- 5. 지출 정산 샘플
INSERT INTO EXPENSE_SETTLEMENT (SETTLEMENT_ID, GROUP_ID, PAYER_ID, TITLE, EXPENSE_AMOUNT) VALUES
(1, 2, 1, '렌터카 대여 및 보험료', 160000),
(2, 2, 2, '첫날 흑돼지 & 음료 저녁 식사', 120000),
(3, 2, 3, '동문시장 야시장 간식 및 딱새우회', 64000);

-- 6. 지출 분할 대상자 (4명 균등 분할)
INSERT INTO EXPENSE_PARTICIPANT (SETTLEMENT_ID, MEMBER_ID, SPLIT_AMOUNT) VALUES
(1, 1, 40000), (1, 2, 40000), (1, 3, 40000), (1, 4, 40000),
(2, 1, 30000), (2, 2, 30000), (2, 3, 30000), (2, 4, 30000),
(3, 1, 16000), (3, 2, 16000), (3, 3, 16000), (3, 4, 16000);

-- 7. 갤러리 샘플
INSERT INTO TRIP_GALLERY (GROUP_ID, UPLOADER_ID, IMAGE_URL, CAPTION, LIKE_COUNT) VALUES
(2, 1, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80', '렌터카 타고 해안도로 드라이브 중 🚗', 12),
(2, 2, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', '바다 색깔 실화인가요?! 제주도 최고 🌊', 18),
(2, 3, 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', '저녁 캠프파이어와 바비큐 파티 🔥', 25);

-- ==============================================================================
-- 8. COMMON_CODE_GROUP 초기 데이터
-- ==============================================================================
INSERT IGNORE INTO COMMON_CODE_GROUP (GROUP_CODE, GROUP_NAME, DESCRIPTION, IS_ACTIVE) VALUES
('TRIP_TYPE', '여행 구분', '국내 및 해외 여행 구분 코드', 'Y'),
('MEMBER_ROLE', '모임 회원 역할', '방장 및 일반 참가자 역할 코드', 'Y'),
('PAYMENT_METHOD', '결제 수단', '회비 지출 결제 수단 코드', 'Y'),
('SETTLEMENT_STATUS', '정산 상태', '회비 정산 진행 상태 코드', 'Y');

-- ==============================================================================
-- 9. COMMON_CODE 초기 데이터
-- ==============================================================================
INSERT IGNORE INTO COMMON_CODE (GROUP_CODE, CODE_ID, CODE_NAME, SORT_ORDER, IS_ACTIVE) VALUES
-- 여행 구분
('TRIP_TYPE', 'DOMESTIC', '국내', 1, 'Y'),
('TRIP_TYPE', 'OVERSEAS', '해외', 2, 'Y'),

-- 회원 역할
('MEMBER_ROLE', 'LEADER', '방장', 1, 'Y'),
('MEMBER_ROLE', 'MEMBER', '일반회원', 2, 'Y'),

-- 결제 수단
('PAYMENT_METHOD', 'CARD', '신용/체크카드', 1, 'Y'),
('PAYMENT_METHOD', 'CASH', '현금', 2, 'Y'),
('PAYMENT_METHOD', 'TRANSFER', '계좌이체', 3, 'Y'),

-- 정산 상태
('SETTLEMENT_STATUS', 'PENDING', '정산대기', 1, 'Y'),
('SETTLEMENT_STATUS', 'IN_PROGRESS', '정산진행중', 2, 'Y'),
('SETTLEMENT_STATUS', 'COMPLETED', '정산완료', 3, 'Y');
