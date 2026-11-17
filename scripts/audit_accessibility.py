#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TravelMates 웹접근성(KWCAG / WCAG AA) 정적 분석 스크립트
"""

import os
import re
from glob import glob

WEBAPP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'main', 'webapp'))

def audit_file(filepath):
    issues = []
    rel_path = os.path.relpath(filepath, WEBAPP_DIR)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. html lang 속성 (완전한 HTML 문서인 경우)
    if '<html' in content:
        if not re.search(r'<html[^>]*lang=["\']ko["\']', content):
            issues.append(("[KWCAG 1.3] 기본 언어", "<html> 태그에 lang=\"ko\" 속성이 누락되었거나 올바르지 않습니다."))

    # 2. title 태그 (완전한 HTML 문서인 경우)
    if '<head' in content:
        if not re.search(r'<title>.*?</title>', content, re.DOTALL):
            issues.append(("[KWCAG 2.4] 페이지 제목", "<title> 태그가 누락되었습니다."))

    # 3. 본문 건너뛰기 링크 (Skip Navigation)
    if '<body' in content and 'admin.html' not in rel_path:
        if not re.search(r'href=["\']#contents["\']|class=["\'][^"\']*skip-nav', content):
            issues.append(("[KWCAG 2.4] 건너뛰기 링크", "반복 네비게이션을 건너뛰는 '본문 바로가기(Skip Navigation)' 링크가 누락되었습니다."))

    # 4. img 태그의 alt 속성 누락 검사
    imgs = re.findall(r'<img([^>]*)>', content)
    for img_attr in imgs:
        if 'alt=' not in img_attr:
            issues.append(("[KWCAG 1.1] 대체 텍스트", f"<img> 태그에 alt 속성이 누락되었습니다: <img{img_attr[:50]}...>"))
        elif re.search(r'alt=["\']\s*["\']', img_attr) and not ('role="presentation"' in img_attr or 'aria-hidden="true"' in img_attr):
            # 빈 alt는 장식용 이미지일 경우 허용되나 명시적인지 확인
            pass

    # 5. input/textarea/select 레이블 연동 (for-id 또는 aria-label)
    inputs = re.findall(r'<(input|select|textarea)([^>]*)>', content)
    for tag, attrs in inputs:
        # hidden, submit, button, reset 타입은 제외
        if 'type="hidden"' in attrs or 'type="submit"' in attrs or 'type="button"' in attrs:
            continue
        id_match = re.search(r'id=["\']([^"\']+)["\']', attrs)
        has_aria_label = 'aria-label=' in attrs or 'aria-labelledby=' in attrs
        if id_match:
            inp_id = id_match.group(1)
            # label for="inp_id" 가 존재하는지 확인
            has_label_for = f'for="{inp_id}"' in content or f"for='{inp_id}'" in content
            if not has_label_for and not has_aria_label:
                issues.append(("[KWCAG 1.3] 폼 레이블", f"<{tag} id=\"{inp_id}\"> 요소에 연결된 <label for=\"{inp_id}\"> 또는 aria-label이 없습니다."))
        else:
            if not has_aria_label:
                issues.append(("[KWCAG 1.3] 폼 레이블", f"<{tag}> 요소에 id(레이블 연결용) 및 aria-label이 누락되었습니다: {attrs[:40]}..."))

    # 6. 버튼 내 텍스트 또는 aria-label 누락 검사
    buttons = re.findall(r'<button([^>]*)>(.*?)</button>', content, re.DOTALL)
    for b_attrs, b_body in buttons:
        # 텍스트가 없고 아이콘(<i> 등)만 있는 경우
        stripped_body = re.sub(r'<[^>]*>', '', b_body).strip()
        has_aria = 'aria-label=' in b_attrs or 'title=' in b_attrs
        if not stripped_body and not has_aria:
            onclick_m = re.search(r'onclick=["\']([^"\']+)["\']', b_attrs)
            btn_id = onclick_m.group(1) if onclick_m else "버튼"
            issues.append(("[KWCAG 2.4] 버튼 식별", f"텍스트 없는 버튼에 aria-label 또는 title이 누락되었습니다: {btn_id}"))

    # 7. 모달 팝업의 dialog role 및 aria 속성 (단순 placeholder <div id="modals">는 제외)
    modals = re.findall(r'<div([^>]*id=["\'][^"\']*(?:(?:-modal|modal-)[^"\']*|id=["\'](?:edit-modal|create-group-modal|login-modal|register-modal|delete-modal|location-picker-modal|custom-timepicker-modal))["\'][^>]*)>', content, re.IGNORECASE)
    for m_attr in modals:
        # id="modals"인 단일 컨테이너는 제외
        if re.search(r'id=["\']modals["\']', m_attr):
            continue
        if 'role="dialog"' not in m_attr and "role='dialog'" not in m_attr:
            issues.append(("[WAI-ARIA] 모달 접근성", f"모달 컨테이너에 role=\"dialog\" 및 aria-modal=\"true\" 속성이 누락되었습니다: {m_attr[:50]}..."))

    return issues

def main():
    html_files = sorted(glob(os.path.join(WEBAPP_DIR, '*.html')) + glob(os.path.join(WEBAPP_DIR, 'includes', '*.html')))
    print(f"🔍 총 {len(html_files)}개 HTML 파일 웹접근성 감사 시작...\n")

    total_issues = 0
    for f in html_files:
        issues = audit_file(f)
        rel = os.path.relpath(f, WEBAPP_DIR)
        if issues:
            print(f"❌ [{rel}] ({len(issues)}건 발견)")
            for cat, desc in issues:
                print(f"   - {cat}: {desc}")
            total_issues += len(issues)
        else:
            print(f"✅ [{rel}] 접근성 우수 (이슈 없음)")
        print()

    print(f"📊 감사 완료: 총 {total_issues}건의 접근성 개선 항목 발견")

if __name__ == '__main__':
    main()
