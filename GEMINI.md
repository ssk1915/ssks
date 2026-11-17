# Project Rules & Guidelines

## `@local` Directive Workflow
When the user includes `@local` in their prompt or request:
1. **Target Endpoint**: `http://localhost:11434/v1` (referencing `antigravity.config.json`)
2. **Model**: `gemma2:latest`
3. **Behavior**:
   - Extract the user's prompt and instructions.
   - Query the local model via `POST http://localhost:11434/v1/chat/completions` (or `python3 scripts/query_local.py "<prompt>"`).
   - Use the local model's response/code/instructions to perform the actual development, file creation/modification, and testing in the workspace.
   - Present the implementation and results to the user.

## Database Naming Convention
- **Table Names & Column Names**: 테이블명과 컬럼명은 항상 모두 **대문자(UPPERCASE)** 및 언더바(`_`)를 사용하여 작성합니다.
  - 예시: `MEMBER`, `MEMBER_ID`, `TRIP_GROUP`, `GROUP_NAME`, `TRIP_SCHEDULE`, `PLAN_TIME`, `EXPENSE_SETTLEMENT`, `EXPENSE_AMOUNT`
- DDL, DML 쿼리문 및 MyBatis XML 매퍼 내의 모든 SQL문에서도 테이블명과 컬럼명을 대문자로 표기합니다.

## README.md Always Update Rule
- **원칙**: 프로젝트에 신규 기능 추가, 버그 및 오류 해결, UI/UX 개선, 아키텍처/설정 파일 변경 등의 작업이 수행되면 **항상 `README.md` 파일에 변경 내역을 즉시 반영**합니다.
- **필수 반영 항목**:
  1. **주요 기능 (Features)**: 추가 또는 변경된 사용자 기능 명세 최신화
  2. **변경 이력 (Changelog)**: 버전 번호(v1.x), 작업 일자, 세부 수정 내역 표에 즉시 추가
  3. **실행 가이드 및 구조도**: 새로운 실행 스크립트나 프로젝트 디렉터리 변동 시 동기화
