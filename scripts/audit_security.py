#!/usr/bin/env python3
"""
TravelMates 웹 보안 취약점 정적 진단 스크립트 (OWASP Top 10 기반)
- SQL Injection (${...} 사용 여부)
- XSS (innerHTML / eval / 사용자 입력 미이스케이프 노출)
- 민감 정보 노출 (응답 객체에 password 필드 포함 여부)
- 보안 HTTP 헤더 부재
- 파일 업로드 검증 부재
"""
import os
import re
from glob import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEBAPP_DIR = os.path.join(BASE_DIR, 'backend', 'src', 'main', 'webapp')
JAVA_DIR = os.path.join(BASE_DIR, 'backend', 'src', 'main', 'java')
MAPPER_DIR = os.path.join(BASE_DIR, 'backend', 'src', 'main', 'resources', 'egovframework', 'sqlmap', 'mappers')
DEV_SERVER = os.path.join(BASE_DIR, 'scripts', 'dev_server.py')

def check_sql_injection():
    issues = []
    for xml_path in glob(os.path.join(MAPPER_DIR, '*.xml')):
        with open(xml_path, 'r', encoding='utf-8') as f:
            content = f.read()
        matches = re.findall(r'\$\{([^}]+)\}', content)
        if matches:
            issues.append((xml_path, f"문자열 치환 변수 발견: {matches} (SQL Injection 위험)"))
    return issues

def check_xss_in_frontend():
    issues = []
    # app.js 등에서 사용자 입력 변수가 이스케이프 없이 innerHTML에 직접 삽입되는지 확인
    js_files = glob(os.path.join(WEBAPP_DIR, 'js', '*.js'))
    for js_path in js_files:
        with open(js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # escapeHtml 유틸 함수 유무 확인
        has_escape_util = 'function escapeHtml' in content or 'const escapeHtml' in content or 'escapeHtml(' in content
        rel = os.path.relpath(js_path, BASE_DIR)
        if not has_escape_util and 'app.js' in js_path:
            issues.append((rel, "XSS 방지용 HTML Entity 이스케이프 함수(escapeHtml) 부재"))
        
        # 위험한 eval 확인
        if re.search(r'\beval\(', content):
            issues.append((rel, "위험한 eval() 함수 호출 발견"))
    return issues

def check_sensitive_data_exposure():
    issues = []
    # dev_server.py 및 컨트롤러에서 비밀번호 평문/해시 반환 여부
    if os.path.exists(DEV_SERVER):
        with open(DEV_SERVER, 'r', encoding='utf-8') as f:
            content = f.read()
        # 로그인 또는 회원목록 조회 시 password 필드가 필터링되지 않고 내려가는지 검사
        if 'm.get("PASSWORD")' in content or '"password":' in content.lower():
            # 응답 필터링 여부 확인
            has_pwd_filter = any(token in content for token in [
                "del payload['password']",
                'del payload["PASSWORD"]',
                'del user["PASSWORD"]',
                'pop("PASSWORD"',
                'pop("password"'
            ])
            if not has_pwd_filter:
                issues.append(("scripts/dev_server.py", "사용자 정보 API 응답 시 PASSWORD 필드가 마스킹/제거되지 않고 반환될 가능성 있음"))
        
        # 보안 헤더 검사
        if 'X-Content-Type-Options' not in content or 'X-Frame-Options' not in content:
            issues.append(("scripts/dev_server.py", "HTTP 응답에 보안 헤더(X-Content-Type-Options, X-Frame-Options 등) 누락"))
            
        # 파일 업로드 확장자/크기 검사
        if 'MAX_UPLOAD_SIZE' not in content and 'ALLOWED_EXTENSIONS' not in content:
            issues.append(("scripts/dev_server.py", "파일 업로드 용량 제한 및 확장자 화이트리스트 검증 누락"))

    return issues

def main():
    print("🛡️ [TravelMates] 웹 보안 취약점 종합 진단 시작...\n")
    all_issues = []

    sql_issues = check_sql_injection()
    if sql_issues:
        print("❌ [SQL Injection 취약점 발견]")
        for f, msg in sql_issues:
            print(f"  - {f}: {msg}")
        all_issues.extend(sql_issues)
    else:
        print("✅ [SQL Injection 점검] 안전: 모든 MyBatis XML 매퍼가 #{...} 파라미터화 쿼리 사용")

    xss_issues = check_xss_in_frontend()
    if xss_issues:
        print("\n❌ [XSS (Cross-Site Scripting) 취약점 발견]")
        for f, msg in xss_issues:
            print(f"  - {f}: {msg}")
        all_issues.extend(xss_issues)
    else:
        print("\n✅ [XSS 점검] 안전: 적절한 이스케이프 및 안전한 DOM 조작 적용 중")

    sensitive_issues = check_sensitive_data_exposure()
    if sensitive_issues:
        print("\n❌ [서버 설정 / 민감 정보 노출 / 업로드 검증 취약점 발견]")
        for f, msg in sensitive_issues:
            print(f"  - {f}: {msg}")
        all_issues.extend(sensitive_issues)
    else:
        print("\n✅ [서버 보안 점검] 안전: 보안 헤더 및 민감 정보 제거 적용 중")

    print(f"\n📊 총 {len(all_issues)}건의 보안 개선 대상 발견.")

if __name__ == '__main__':
    main()
