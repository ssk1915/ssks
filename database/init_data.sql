-- ========================================================
-- TravelMates Seed Data
-- Rule: 테이블명, 컬럼명 모두 대문자(UPPERCASE) 표기
-- ========================================================

USE TRAVELMATES_DB;

-- 외래키 제약조건 역순 정리
DELETE FROM EXPENSE_PARTICIPANT;
DELETE FROM EXPENSE_SETTLEMENT;
DELETE FROM TRIP_GALLERY;
DELETE FROM TRIP_SCHEDULE;
DELETE FROM TRIP_MEMBER;
DELETE FROM TRIP_GROUP;
DELETE FROM MEMBER;

-- 1. 회원 데이터 (MEMBER)
INSERT INTO MEMBER (MEMBER_ID, USERNAME, PASSWORD, NAME, EMAIL, PHONE, CREATED_AT, UPDATED_AT) VALUES
(1, 'minsu', 'pass1234', '김민수', 'minsu@travelmates.com', '010-1234-5678', '2026-11-04 10:15:00', '2026-11-04 10:15:00'),
(2, 'jihun', 'pass1234', '이지훈', 'jihun@travelmates.com', '010-2345-6789', '2026-11-04 11:20:00', '2026-11-04 11:20:00'),
(3, 'seoyeon', 'pass1234', '박서연', 'seoyeon@travelmates.com', '010-3456-7890', '2026-11-05 09:40:00', '2026-11-05 09:40:00'),
(4, 'hyunwoo', 'pass1234', '최현우', 'hyunwoo@travelmates.com', '010-4567-8901', '2026-11-06 14:10:00', '2026-11-06 14:10:00'),
(5, 'admin', 'admin123', '총괄관리자', 'admin@travelmates.com', '010-9999-9999', '2026-11-03 09:00:00', '2026-11-03 09:00:00');

-- 2. 여행 모임 데이터 (TRIP_GROUP)
INSERT INTO TRIP_GROUP (GROUP_ID, GROUP_NAME, TRIP_TYPE, LOCATION, START_DATE, END_DATE, MAX_MEMBERS, ESTIMATED_BUDGET, DESCRIPTION, IMAGE_URL, STATUS, CREATED_BY, CREATED_AT, UPDATED_AT) VALUES
(1, '태국 방콕 & 파타야 미식 힐링 투어', '해외', '태국 (방콕/파타야)', '2026-11-20', '2026-11-25', 4, '800,000', '카오산로드 야시장 탐방, 마사지, 루프탑 바에서 야경을 함께 즐길 친구 구해요!', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', 'RECRUITING', 1, '2026-11-04 10:30:00', '2026-11-04 10:30:00'),
(2, '제주도 동쪽 힐링 & 올레길 드라이브', '국내', '제주 (구좌/성산)', '2026-12-05', '2026-12-08', 4, '400,000', '렌터카 빌려서 해안도로 달리고 오션뷰 카페 및 흑돼지 뿌실 친구들 환영합니다.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'RECRUITING', 2, '2026-11-04 11:45:00', '2026-11-04 11:45:00'),
(3, '강원도 양양 서핑 & 불멍 캠핑 트립', '국내', '강원 (양양 죽도해변)', '2026-11-14', '2026-11-16', 6, '250,000', '초보자도 환영! 주말 양양에서 서핑 강습 받고 저녁엔 글램핑 바비큐 파티 해요.', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80', 'RECRUITING', 4, '2026-11-06 14:30:00', '2026-11-06 14:30:00');

-- 3. 모임 참여 멤버 매핑 (TRIP_MEMBER)
INSERT INTO TRIP_MEMBER (GROUP_ID, MEMBER_ID, ROLE, JOINED_AT, CREATED_AT, UPDATED_AT) VALUES
(1, 1, 'LEADER', '2026-11-04 10:30:00', '2026-11-04 10:30:00', '2026-11-04 10:30:00'),
(1, 2, 'MEMBER', '2026-11-04 12:00:00', '2026-11-04 12:00:00', '2026-11-04 12:00:00'),
(1, 3, 'MEMBER', '2026-11-05 15:30:00', '2026-11-05 15:30:00', '2026-11-05 15:30:00'),
(2, 2, 'LEADER', '2026-11-04 11:45:00', '2026-11-04 11:45:00', '2026-11-04 11:45:00'),
(2, 1, 'MEMBER', '2026-11-04 13:20:00', '2026-11-04 13:20:00', '2026-11-04 13:20:00'),
(2, 3, 'MEMBER', '2026-11-05 16:40:00', '2026-11-05 16:40:00', '2026-11-05 16:40:00'),
(3, 4, 'LEADER', '2026-11-06 14:30:00', '2026-11-06 14:30:00', '2026-11-06 14:30:00'),
(3, 1, 'MEMBER', '2026-11-06 15:10:00', '2026-11-06 15:10:00', '2026-11-06 15:10:00'),
(3, 2, 'MEMBER', '2026-11-06 16:00:00', '2026-11-06 16:00:00', '2026-11-06 16:00:00'),
(3, 3, 'MEMBER', '2026-11-06 17:30:00', '2026-11-06 17:30:00', '2026-11-06 17:30:00');

-- 4. 여행 일정 타임라인 (TRIP_SCHEDULE)
INSERT INTO TRIP_SCHEDULE (SCHEDULE_ID, GROUP_ID, DAY_NUMBER, PLAN_TIME, PLACE, MEMO, LATITUDE, LONGITUDE, CREATED_AT, UPDATED_AT) VALUES
-- 모임 1 (태국 방콕)
(101, 1, 1, '11:00', '방콕 수완나품 공항 도착', '유심칩 수령 및 그랩 택시 탑승', 13.6900, 100.7501, NOW(), NOW()),
(102, 1, 1, '14:00', '호텔 체크인 & 팟타이 점심', '팁싸마이 본점 웨이팅 확인', 13.7527, 100.5048, NOW(), NOW()),
(103, 1, 1, '19:00', '카오산로드 야시장 탐방', '로띠 간식 & 시원한 맥주 한잔', 13.7588, 100.4974, NOW(), NOW()),
(104, 1, 2, '10:00', '왓아룬(새벽사원) & 왕궁 투어', '복장 규정 확인(긴바지 필수)', 13.7437, 100.4889, NOW(), NOW()),
(105, 1, 2, '18:00', '차오프라야강 디너 크루즈', '야경 관람 및 뷔페 디너', 13.7230, 100.5140, NOW(), NOW()),

-- 모임 2 (제주도)
(201, 2, 1, '10:00', '제주공항 집결 및 렌터카 인수', '3번 게이트 앞 만남, 완전자차 가입', 33.5066, 126.4930, NOW(), NOW()),
(202, 2, 1, '12:30', '제주 흑돼지 고기국수 점심', '자매국수 본점 웨이팅 확인', 33.5188, 126.5290, NOW(), NOW()),
(203, 2, 1, '15:00', '함덕 해수욕장 & 서우봉 산책', '에메랄드빛 바다 배경 단체 사진 촬영', 33.5434, 126.6698, NOW(), NOW()),
(204, 2, 1, '18:30', '숙소 체크인 및 동문시장 야시장', '딱새우회, 전복버터구이 포장해서 파티', 33.5126, 126.5284, NOW(), NOW()),
(205, 2, 2, '09:30', '성산일출봉 하이킹', '편한 운동화 필수, 왕복 약 50분 소요', 33.4586, 126.9427, NOW(), NOW()),
(206, 2, 2, '13:00', '구좌 당근케이크 오션뷰 카페', '바다 전망 루프탑에서 힐링 타임', 33.5358, 126.8524, NOW(), NOW()),
(207, 2, 3, '10:30', '기념품 샵 및 감귤 체험 농장', '선물용 오메기떡 & 황금향 구매', 33.4721, 126.6853, NOW(), NOW()),
(208, 2, 3, '14:00', '렌터카 반납 및 제주공항 이동', '비행기 출발 1시간 반 전 도착', 33.5066, 126.4930, NOW(), NOW()),

-- 모임 3 (강원도 양양)
(301, 3, 1, '09:00', '양양 죽도해변 서핑 스쿨', '슈트 및 보드 대여, 기초 강습', 37.9715, 128.7612, NOW(), NOW()),
(302, 3, 1, '13:00', '인구해변 수제버거 점심', '버거스테이지', 37.9658, 128.7645, NOW(), NOW()),
(303, 3, 1, '18:00', '글램핑장 불멍 바비큐', '삼겹살 및 마시멜로 굽기', 37.9750, 128.7500, NOW(), NOW()),
(304, 3, 2, '10:00', '낙산사 해수관음상 산책', '동해 바다 절경 감상', 38.1250, 128.6275, NOW(), NOW()),
(305, 3, 2, '12:30', '메밀 막국수 & 수육 점심', '동해막국수 본점', 37.9890, 128.7420, NOW(), NOW());

-- 5. 지출 정산 영수증 (EXPENSE_SETTLEMENT)
INSERT INTO EXPENSE_SETTLEMENT (SETTLEMENT_ID, GROUP_ID, PAYER_ID, TITLE, EXPENSE_AMOUNT, PAYMENT_METHOD, CREATED_AT, UPDATED_AT) VALUES
-- 모임 1 지출
(101, 1, 1, '카오산로드 팟타이 & 땡모반', 48000, 'CARD', NOW(), NOW()),
(102, 1, 2, '루프탑 바 칵테일 & 야경', 96000, 'CARD', NOW(), NOW()),

-- 모임 2 지출
(201, 2, 1, '렌터카 대여 및 보험료', 160000, 'CARD', NOW(), NOW()),
(202, 2, 2, '첫날 흑돼지 & 음료 저녁 식사', 120000, 'CARD', NOW(), NOW()),
(203, 2, 3, '동문시장 야시장 간식 및 딱새우회', 64000, 'CASH', NOW(), NOW()),

-- 모임 3 지출
(301, 3, 4, '서핑 강습 및 렌탈료', 200000, 'CARD', NOW(), NOW()),
(302, 3, 2, '글램핑 바비큐 장보기 & 숯불', 145000, 'CARD', NOW(), NOW());

-- 6. 지출 분할 대상자 (EXPENSE_PARTICIPANT)
INSERT INTO EXPENSE_PARTICIPANT (SETTLEMENT_ID, MEMBER_ID, SPLIT_AMOUNT, CREATED_AT, UPDATED_AT) VALUES
-- 101번 (48,000원 3인 분할: 김민수, 이지훈, 박서연)
(101, 1, 16000, NOW(), NOW()), (101, 2, 16000, NOW(), NOW()), (101, 3, 16000, NOW(), NOW()),
-- 102번 (96,000원 3인 분할)
(102, 1, 32000, NOW(), NOW()), (102, 2, 32000, NOW(), NOW()), (102, 3, 32000, NOW(), NOW()),

-- 201번 (160,000원 3인 분할)
(201, 1, 53334, NOW(), NOW()), (201, 2, 53333, NOW(), NOW()), (201, 3, 53333, NOW(), NOW()),
-- 202번 (120,000원 3인 분할)
(202, 1, 40000, NOW(), NOW()), (202, 2, 40000, NOW(), NOW()), (202, 3, 40000, NOW(), NOW()),
-- 203번 (64,000원 3인 분할)
(203, 1, 21334, NOW(), NOW()), (203, 2, 21333, NOW(), NOW()), (203, 3, 21333, NOW(), NOW()),

-- 301번 (200,000원 4인 분할: 최현우, 김민수, 이지훈, 박서연)
(301, 4, 50000, NOW(), NOW()), (301, 1, 50000, NOW(), NOW()), (301, 2, 50000, NOW(), NOW()), (301, 3, 50000, NOW(), NOW()),
-- 302번 (145,000원 4인 분할)
(302, 4, 36250, NOW(), NOW()), (302, 1, 36250, NOW(), NOW()), (302, 2, 36250, NOW(), NOW()), (302, 3, 36250, NOW(), NOW());

-- 7. 여행 추억 갤러리 (TRIP_GALLERY)
INSERT INTO TRIP_GALLERY (GALLERY_ID, GROUP_ID, UPLOADER_ID, IMAGE_URL, CAPTION, LIKE_COUNT, CREATED_AT, UPDATED_AT) VALUES
-- 모임 1 (방콕)
(101, 1, 1, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', '방콕 왓아룬 사원의 환상적인 야경 🛕✨', 15, NOW(), NOW()),
(102, 1, 2, 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80', '카오산로드 팟타이 맛집 투어 🍜', 9, NOW(), NOW()),

-- 모임 2 (제주도)
(201, 2, 1, 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80', '성산일출봉 정상에서 맞이한 아침 햇살 🌅', 12, NOW(), NOW()),
(202, 2, 3, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', '함덕 에메랄드빛 바다 산책로 🏖️', 18, NOW(), NOW()),
(203, 2, 2, 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', '저녁 캠프파이어와 바비큐 파티 🔥', 25, NOW(), NOW()),

-- 모임 3 (강원도 양양)
(301, 3, 4, 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80', '양양 인구해변 첫 파도 타기 성공! 🏄‍♂️', 22, NOW(), NOW()),
(302, 3, 2, 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80', '글램핑장에서 바라본 가을 밤하늘 별빛 ⛺🌌', 14, NOW(), NOW());

-- ==============================================================================
-- 8. COMMON_CODE_GROUP 데이터
-- ==============================================================================
INSERT IGNORE INTO COMMON_CODE_GROUP (GROUP_CODE, GROUP_NAME, DESCRIPTION, IS_ACTIVE) VALUES
('TRIP_TYPE', '여행 구분', '국내 및 해외 여행 구분 코드', 'Y'),
('MEMBER_ROLE', '모임 회원 역할', '방장 및 일반 참가자 역할 코드', 'Y'),
('PAYMENT_METHOD', '결제 수단', '회비 지출 결제 수단 코드', 'Y'),
('SETTLEMENT_STATUS', '정산 상태', '회비 정산 진행 상태 코드', 'Y');

-- ==============================================================================
-- 9. COMMON_CODE 데이터
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
