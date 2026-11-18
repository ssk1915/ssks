#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
사용자 실제 프롬프트 히스토리 PROMPT.md 생성 스크립트
"""
import json

def categorize(idx, prompt):
    p = prompt.lower()
    if idx <= 5 or "baseurl" in p or "인공지능 모델" in p:
        return "환경 설정 및 @local 연동"
    elif "대문자" in p or "mysql" in p or "pom.xml" in p or "전자정부프레임워크" in p or "홈페이지를 개발" in p or "톰켓" in p:
        return "아키텍처 및 DB 구축"
    elif "로그인" in p or "관리자" in p or "회원 가입" in p or "암호화" in p:
        return "인증/보안 및 사용자 관리"
    elif "일정" in p or "플래너" in p or "지도" in p or "좌표" in p or "시간" in p:
        return "일정 플래너 및 위치 연동"
    elif "회비" in p or "정산" in p or "지출" in p:
        return "회비 정산 시스템"
    elif "모임" in p or "인원" in p or "이미지" in p or "삭제" in p:
        return "여행 모임 기능"
    elif "반응형" in p or "메뉴" in p or "html" in p or "header" in p or "화면" in p:
        return "UI/UX 및 컴포넌트 구조화"
    elif "문제" in p or "오류" in p or "error" in p or "jre" in p or "nature" in p or "import" in p:
        return "호환성 및 오류 해결"
    elif "readme" in p or "기록" in p or "요약" in p:
        return "문서화 및 형상 관리"
    elif "서버" in p or "로그" in p or "터미널" in p:
        return "서버 운영 및 모니터링"
    else:
        return "기타 개발"

def main():
    with open('/tmp/prompts_dump.json', 'r', encoding='utf-8') as f:
        items = json.load(f)

    start_date = items[0]['time'][:10]
    end_date = items[-1]['time'][:10]

    md_lines = []
    md_lines.append("# 📜 TravelMates 프롬프트 히스토리 및 개발 기록 (PROMPT.md)\n")
    md_lines.append("> 본 문서는 **TravelMates (친구와 여행 모임)** 프로젝트 진행 과정에서 사용자가 입력한 **실제 프롬프트(User Prompt) 전체 60건 내역**을 발생 순서대로 체계적으로 기록한 개발 일지입니다.\n")
    md_lines.append("## 📊 프롬프트 통계 및 개요\n")
    md_lines.append(f"- **총 실행 프롬프트 수**: {len(items)}건")
    md_lines.append(f"- **기록 기간**: {start_date} ~ {end_date}")
    md_lines.append("- **대상 프로젝트**: TravelMates (전자정부프레임워크 + MySQL + TailwindCSS 반응형 웹)")
    md_lines.append("- **연동 로컬 모델**: Ollama `gemma2:latest` (`http://localhost:11434/v1`)\n")
    md_lines.append("---\n")
    md_lines.append("## 📋 프롬프트 카테고리 분류\n")
    md_lines.append("| 카테고리 | 설명 | 주요 프롬프트 번호 |")
    md_lines.append("|---|---|---|")
    md_lines.append("| **환경 설정 및 @local 연동** | Ollama API 통신 테스트, 모델 확인, `@local` 디렉티브 설정 | #1 ~ #5, #19, #29 |")
    md_lines.append("| **아키텍처 및 DB 구축** | 전자정부프레임워크 세팅, MySQL DB 스키마/계정/대문자 규칙 수립 | #6 ~ #11, #13, #14 |")
    md_lines.append("| **인증/보안 및 사용자 관리** | 세션 로그인/로그아웃, 관리자 권한, 비밀번호 SHA-256 해시, 전화번호 AES 암호화 | #15, #16, #20, #23, #59 |")
    md_lines.append("| **여행 모임 기능** | 모임 개설 달력 팝업, 방장 권한 삭제, 인원 초과 참여 차단, 사진 업로드 | #22, #31, #33, #34, #40, #49 |")
    md_lines.append("| **회비 정산 시스템** | 모임별 영수증 등록, 1인당 분할 부담액 산정, 최종 납부액 강조 UI | #24 ~ #26, #32 |")
    md_lines.append("| **UI/UX 및 컴포넌트 구조화** | Header-Contents-Footer 분리, 공통 컴포넌트 자동 주입, 모바일 햄버거/하단 탭바 | #35 ~ #38 |")
    md_lines.append("| **호환성 및 오류 해결** | JRE 25/JavaSE-11 호환성, .project Facet Nature 정리, 미사용 import 제거 | #10, #31, #41 ~ #48, #51 |")
    md_lines.append("| **일정 플래너 및 위치 연동** | Day별 타임라인, 등록 즉시 렌더링, 타임피커 모달, OpenStreetMap 위치 및 위경도 영구 저장 | #18, #43, #52 ~ #56 |")
    md_lines.append("| **백엔드 리팩토링 및 서버 운영** | 메뉴별 SRP 컨트롤러 분리 (5개 클래스), 개발 서버 재기동, 로그 점검 | #27, #28, #30, #57, #58 |")
    md_lines.append("| **문서화 및 형상 관리** | README.md 항시 최신화 규칙 수립 및 PROMPT.md 생성 | #12, #17, #39, #50, #60 |\n")
    md_lines.append("---\n")
    md_lines.append("## 📝 전체 실제 프롬프트 상세 로그 (1 ~ 60)\n")

    for idx, it in enumerate(items, 1):
        category = categorize(idx, it["prompt"])
        t = it["time"].replace("T", " ").replace("Z", " UTC")
        first_line = it["prompt"].splitlines()[0]
        md_lines.append(f"### #{idx}. {first_line}")
        md_lines.append(f"- **입력 일시**: `{t}`")
        md_lines.append(f"- **분류 태그**: `{category}`")
        md_lines.append("- **실제 원문 프롬프트**:")
        md_lines.append("```text")
        md_lines.append(it["prompt"])
        md_lines.append("```\n")

    with open("PROMPT.md", "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))

    print(f"PROMPT.md successfully generated with {len(items)} prompts.")

if __name__ == '__main__':
    main()

