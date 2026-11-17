# TravelMates MySQL 데이터베이스 가이드

## 📌 명명 규칙 (Database Naming Convention)
* **테이블명 및 컬럼명**: 항상 모두 **대문자(UPPERCASE)** 및 언더바(`_`) 스네이크 케이스를 사용합니다.
  * 예시 테이블: `MEMBER`, `TRIP_GROUP`, `TRIP_MEMBER`, `TRIP_SCHEDULE`, `EXPENSE_SETTLEMENT`, `EXPENSE_PARTICIPANT`, `TRIP_GALLERY`
  * 예시 컬럼: `MEMBER_ID`, `GROUP_NAME`, `START_DATE`, `PLAN_TIME`, `EXPENSE_AMOUNT`

---

## 1. 데이터베이스 및 테이블 생성 (DDL)
MySQL 클라이언트(Workbench, DBeaver, 또는 터미널 CLI)에서 아래 스크립트를 실행합니다:

```bash
mysql -u root -p < database/schema.sql
```

## 2. 초기 샘플 데이터 입력 (Seed Data)
기본적인 회원, 여행 모임, 일정, N빵 정산 영수증, 갤러리 샘플 데이터를 등록합니다:

```bash
mysql -u root -p < database/init_data.sql
```

## 3. 전자정부프레임워크 DB 연결 설정
`backend/src/main/resources/egovframework/egovProps/globals.properties` 파일에서 본인의 MySQL 계정 및 비밀번호를 설정하세요:

```properties
Globals.Url=jdbc:mysql://localhost:3306/TRAVELMATES_DB?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
Globals.UserName=root
Globals.Password=본인_비밀번호
```
