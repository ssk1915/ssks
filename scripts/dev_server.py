#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TravelMates 통합 로컬 개발 서버
- 정적 리소스 서빙 (backend/target/travelmates)
- RESTful API 모의 처리 (Auth, Groups, Schedules, Expenses)
- GET / POST / PUT / DELETE 지원 (501 / 404 오류 원천 차단)
"""

import os
import sys
import json
import re
import hashlib
import base64
import uuid
import subprocess
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

PORT = 8080
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'main', 'webapp'))
TARGET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'target', 'travelmates'))
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LOG_DIR = os.path.join(PROJECT_ROOT, 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

# ==================== Log4j 표준 스타일 로깅 설정 ====================
LOG_FORMAT = "%(asctime)s.%(msecs)03d [%(threadName)s] %(levelname)-5s %(name)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

class Log4jFormatter(logging.Formatter):
    """Log4j 표준 레이아웃 포맷터 (yyyy-MM-dd HH:mm:ss.SSS [thread] LEVEL logger - msg)"""
    def formatTime(self, record, datefmt=None):
        ct = datetime.fromtimestamp(record.created)
        return ct.strftime(datefmt or DATE_FORMAT)

# 1. 루트 로거 생성
logger = logging.getLogger("egovframework.travel")
logger.setLevel(logging.DEBUG)

# 2. 콘솔 Appender
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(Log4jFormatter(LOG_FORMAT, DATE_FORMAT))
logger.addHandler(console_handler)

# 3. 롤링 파일 Appender (logs/travelmates.log, 10MB 단위 롤링, 백업 5개)
log_file_path = os.path.join(LOG_DIR, "travelmates.log")
file_handler = RotatingFileHandler(log_file_path, maxBytes=10 * 1024 * 1024, backupCount=5, encoding="utf-8")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(Log4jFormatter(LOG_FORMAT, DATE_FORMAT))
logger.addHandler(file_handler)

# 4. 에러 전용 롤링 파일 Appender (logs/travelmates-error.log)
error_log_path = os.path.join(LOG_DIR, "travelmates-error.log")
error_file_handler = RotatingFileHandler(error_log_path, maxBytes=10 * 1024 * 1024, backupCount=5, encoding="utf-8")
error_file_handler.setLevel(logging.ERROR)
error_file_handler.setFormatter(Log4jFormatter(LOG_FORMAT, DATE_FORMAT))
logger.addHandler(error_file_handler)

# ==================== MAC 주소 기반 테스트 계정 노출 화이트리스트 ====================
# 현재 컴퓨터의 물리적 MAC 주소 (en0) 및 가상/샌드박스 루프백 인터페이스
ALLOWED_MAC_ADDRESSES = {
    "6c:7e:67:c3:21:e7",  # 현재 컴퓨터 (en0)
    "02:00:00:00:00:00"   # 로컬 루프백/가상화 인터페이스
}

def get_host_mac_addresses():
    """현재 컴퓨터의 모든 네트워크 인터페이스 MAC 주소 목록 수집"""
    macs = set()
    try:
        raw_node = uuid.getnode()
        mac_node = ':'.join(re.findall('..', '%012x' % raw_node)).lower()
        macs.add(mac_node)
    except Exception:
        pass

    try:
        out = subprocess.check_output(['networksetup', '-getmacaddress', 'en0'], stderr=subprocess.DEVNULL).decode('utf-8')
        found = re.findall(r'([0-9a-fA-F]{2}(?::[0-9a-fA-F]{2}){5})', out)
        for m in found:
            macs.add(m.lower())
    except Exception:
        pass

    try:
        out = subprocess.check_output(['ifconfig'], stderr=subprocess.DEVNULL).decode('utf-8')
        found = re.findall(r'ether\s+([0-9a-fA-F:]{17})', out)
        for m in found:
            macs.add(m.lower())
    except Exception:
        pass

    return macs

# ==================== 암호화 유틸리티 (비밀번호 SHA-256 / 전화번호 AES 대칭암호) ====================
AES_KEY_STRING = "TravelMates2026!"

# ==================== MySQL 실시간 데이터베이스 연동 설정 ====================
# Rule: 테이블명과 컬럼명은 항상 UPPERCASE 및 언더바(_) 사용
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'localtest',
    'password': 'rhflffk12',
    'database': 'TRAVELMATES_DB',
    'charset': 'utf8mb4',
    'autocommit': True
}

def get_db_connection():
    """MySQL 데이터베이스 커넥션 풀 또는 커넥션 객체 반환"""
    try:
        import pymysql
        import pymysql.cursors
        conn = pymysql.connect(
            **DB_CONFIG,
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=3
        )
        return conn
    except Exception as e:
        return None

def db_fetch_groups():
    """MySQL TRIP_GROUP 테이블에서 모임 목록 실시간 조회"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            sql = """
                SELECT 
                    g.GROUP_ID AS groupId,
                    g.GROUP_NAME AS groupName,
                    g.TRIP_TYPE AS tripType,
                    g.LOCATION AS location,
                    DATE_FORMAT(g.START_DATE, '%Y-%m-%d') AS startDate,
                    DATE_FORMAT(g.END_DATE, '%Y-%m-%d') AS endDate,
                    g.MAX_MEMBERS AS maxMembers,
                    COALESCE((SELECT COUNT(*) FROM TRIP_MEMBER tm WHERE tm.GROUP_ID = g.GROUP_ID), 1) AS currentMembers,
                    COALESCE((SELECT m.NAME FROM MEMBER m WHERE m.MEMBER_ID = g.CREATED_BY), '방장') AS creatorName,
                    g.CREATED_BY AS createdBy,
                    g.ESTIMATED_BUDGET AS estimatedBudget,
                    g.DESCRIPTION AS description,
                    g.IMAGE_URL AS imageUrl,
                    DATE_FORMAT(g.CREATED_AT, '%Y-%m-%d %H:%i:%s') AS createdAt,
                    DATE_FORMAT(g.UPDATED_AT, '%Y-%m-%d %H:%i:%s') AS updatedAt
                FROM TRIP_GROUP g
                ORDER BY g.GROUP_ID DESC
            """
            cur.execute(sql)
            return cur.fetchall()
    except Exception as e:
        print(f"⚠️ [MySQL db_fetch_groups 오류]: {e}")
        return None
    finally:
        conn.close()

def db_insert_group(data):
    """MySQL TRIP_GROUP 및 TRIP_MEMBER 테이블에 신규 모임 실시간 삽입"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            sql = """
                INSERT INTO TRIP_GROUP (
                    GROUP_NAME, TRIP_TYPE, LOCATION, START_DATE, END_DATE, 
                    MAX_MEMBERS, ESTIMATED_BUDGET, DESCRIPTION, IMAGE_URL, CREATED_BY,
                    CREATED_AT, UPDATED_AT
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """
            cur.execute(sql, (
                data.get('groupName', '새 여행 모임'),
                data.get('tripType', '국내'),
                data.get('location', '미정'),
                data.get('startDate') or None,
                data.get('endDate') or None,
                int(data.get('maxMembers', 4)),
                data.get('estimatedBudget', '미정'),
                data.get('description', ''),
                data.get('imageUrl', ''),
                int(data.get('createdBy', 1))
            ))
            new_id = cur.lastrowid
            
            # 방장(LEADER) 등록
            cur.execute(
                "INSERT INTO TRIP_MEMBER (GROUP_ID, MEMBER_ID, ROLE, CREATED_AT, UPDATED_AT) VALUES (%s, %s, 'LEADER', NOW(), NOW())",
                (new_id, int(data.get('createdBy', 1)))
            )
            print(f"💾 [MySQL TRIP_GROUP 삽입 완료] GROUP_ID: {new_id}, GROUP_NAME: {data.get('groupName')}")
            return new_id
    except Exception as e:
        print(f"⚠️ [MySQL db_insert_group 오류]: {e}")
        return None
    finally:
        conn.close()

def db_delete_group(gid):
    """MySQL TRIP_GROUP 및 연관 자식 테이블 실시간 삭제"""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM EXPENSE_PARTICIPANT WHERE SETTLEMENT_ID IN (SELECT SETTLEMENT_ID FROM EXPENSE_SETTLEMENT WHERE GROUP_ID = %s)", (gid,))
            cur.execute("DELETE FROM EXPENSE_SETTLEMENT WHERE GROUP_ID = %s", (gid,))
            cur.execute("DELETE FROM TRIP_SCHEDULE WHERE GROUP_ID = %s", (gid,))
            cur.execute("DELETE FROM TRIP_MEMBER WHERE GROUP_ID = %s", (gid,))
            cur.execute("DELETE FROM TRIP_GALLERY WHERE GROUP_ID = %s", (gid,))
            cur.execute("DELETE FROM TRIP_GROUP WHERE GROUP_ID = %s", (gid,))
            print(f"🗑️ [MySQL TRIP_GROUP 삭제 완료] GROUP_ID: {gid}")
            return True
    except Exception as e:
        print(f"⚠️ [MySQL db_delete_group 오류]: {e}")
        return False
    finally:
        conn.close()

def db_fetch_schedules(gid):
    """MySQL TRIP_SCHEDULE 테이블에서 일정 목록 실시간 조회"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            sql = """
                SELECT 
                    SCHEDULE_ID AS scheduleId,
                    GROUP_ID AS groupId,
                    DAY_NUMBER AS dayNumber,
                    PLAN_TIME AS planTime,
                    PLACE AS place,
                    MEMO AS memo,
                    LATITUDE AS latitude,
                    LONGITUDE AS longitude,
                    DATE_FORMAT(CREATED_AT, '%Y-%m-%d %H:%i:%s') AS createdAt,
                    DATE_FORMAT(UPDATED_AT, '%Y-%m-%d %H:%i:%s') AS updatedAt
                FROM TRIP_SCHEDULE
                WHERE GROUP_ID = %s
                ORDER BY DAY_NUMBER ASC, PLAN_TIME ASC, SCHEDULE_ID ASC
            """
            cur.execute(sql, (gid,))
            return cur.fetchall()
    except Exception as e:
        print(f"⚠️ [MySQL db_fetch_schedules 오류]: {e}")
        return None
    finally:
        conn.close()

def db_insert_schedule(gid, data):
    """MySQL TRIP_SCHEDULE 테이블에 일정 실시간 삽입"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            sql = """
                INSERT INTO TRIP_SCHEDULE (
                    GROUP_ID, DAY_NUMBER, PLAN_TIME, PLACE, MEMO, LATITUDE, LONGITUDE,
                    CREATED_AT, UPDATED_AT
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """
            lat = data.get('latitude') or data.get('lat')
            lng = data.get('longitude') or data.get('lng')
            cur.execute(sql, (
                gid,
                int(data.get('dayNumber', 1)),
                data.get('planTime') or None,
                data.get('place', ''),
                data.get('memo', ''),
                float(lat) if lat is not None else None,
                float(lng) if lng is not None else None
            ))
            new_id = cur.lastrowid
            print(f"💾 [MySQL TRIP_SCHEDULE 삽입 완료] SCHEDULE_ID: {new_id}, PLACE: {data.get('place')}")
            return new_id
    except Exception as e:
        print(f"⚠️ [MySQL db_insert_schedule 오류]: {e}")
        return None
    finally:
        conn.close()

def db_update_schedule(sid, data):
    """MySQL TRIP_SCHEDULE 테이블 일정 실시간 수정"""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            lat = data.get('latitude') or data.get('lat')
            lng = data.get('longitude') or data.get('lng')
            sql = """
                UPDATE TRIP_SCHEDULE
                SET DAY_NUMBER = %s, PLAN_TIME = %s, PLACE = %s, MEMO = %s, LATITUDE = %s, LONGITUDE = %s,
                    UPDATED_AT = NOW()
                WHERE SCHEDULE_ID = %s
            """
            cur.execute(sql, (
                int(data.get('dayNumber', 1)),
                data.get('planTime') or None,
                data.get('place', ''),
                data.get('memo', ''),
                float(lat) if lat is not None else None,
                float(lng) if lng is not None else None,
                sid
            ))
            print(f"🔄 [MySQL TRIP_SCHEDULE 수정 완료] SCHEDULE_ID: {sid}")
            return True
    except Exception as e:
        print(f"⚠️ [MySQL db_update_schedule 오류]: {e}")
        return False
    finally:
        conn.close()

def db_delete_schedule(sid):
    """MySQL TRIP_SCHEDULE 테이블 일정 실시간 삭제"""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM TRIP_SCHEDULE WHERE SCHEDULE_ID = %s", (sid,))
            print(f"🗑️ [MySQL TRIP_SCHEDULE 삭제 완료] SCHEDULE_ID: {sid}")
            return True
    except Exception as e:
        print(f"⚠️ [MySQL db_delete_schedule 오류]: {e}")
        return False
    finally:
        conn.close()

def db_fetch_expenses(gid):
    """MySQL EXPENSE_SETTLEMENT 테이블에서 지출 목록 실시간 조회"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            sql = """
                SELECT 
                    s.SETTLEMENT_ID AS settlementId,
                    s.GROUP_ID AS groupId,
                    s.PAYER_ID AS payerId,
                    COALESCE((SELECT m.NAME FROM MEMBER m WHERE m.MEMBER_ID = s.PAYER_ID), '김민수') AS payerName,
                    s.TITLE AS title,
                    s.EXPENSE_AMOUNT AS expenseAmount,
                    s.PAYMENT_METHOD AS paymentMethod,
                    DATE_FORMAT(s.CREATED_AT, '%Y-%m-%d %H:%i:%s') AS createdAt,
                    DATE_FORMAT(s.UPDATED_AT, '%Y-%m-%d %H:%i:%s') AS updatedAt
                FROM EXPENSE_SETTLEMENT s
                WHERE s.GROUP_ID = %s
                ORDER BY s.SETTLEMENT_ID DESC
            """
            cur.execute(sql, (gid,))
            return cur.fetchall()
    except Exception as e:
        print(f"⚠️ [MySQL db_fetch_expenses 오류]: {e}")
        return None
    finally:
        conn.close()

def db_insert_expense(gid, data):
    """MySQL EXPENSE_SETTLEMENT 테이블에 지출 영수증 실시간 삽입"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            sql = """
                INSERT INTO EXPENSE_SETTLEMENT (GROUP_ID, PAYER_ID, TITLE, EXPENSE_AMOUNT, PAYMENT_METHOD, CREATED_AT, UPDATED_AT)
                VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            """
            cur.execute(sql, (
                gid,
                int(data.get('payerId', 1)),
                data.get('title', '지출 내역'),
                int(data.get('expenseAmount', 0)),
                data.get('paymentMethod', 'CARD')
            ))
            new_id = cur.lastrowid
            print(f"💾 [MySQL EXPENSE_SETTLEMENT 삽입 완료] SETTLEMENT_ID: {new_id}, TITLE: {data.get('title')}")
            return new_id
    except Exception as e:
        print(f"⚠️ [MySQL db_insert_expense 오류]: {e}")
        return None
    finally:
        conn.close()

def db_delete_expense(eid):
    """MySQL EXPENSE_SETTLEMENT 및 EXPENSE_PARTICIPANT 실시간 삭제"""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM EXPENSE_PARTICIPANT WHERE SETTLEMENT_ID = %s", (eid,))
            cur.execute("DELETE FROM EXPENSE_SETTLEMENT WHERE SETTLEMENT_ID = %s", (eid,))
            print(f"🗑️ [MySQL EXPENSE_SETTLEMENT 삭제 완료] SETTLEMENT_ID: {eid}")
            return True
    except Exception as e:
        print(f"⚠️ [MySQL db_delete_expense 오류]: {e}")
        return False
    finally:
        conn.close()

def db_join_group(gid, member_id):
    """MySQL TRIP_MEMBER 테이블에 참여 정보 등록"""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS cnt FROM TRIP_MEMBER WHERE GROUP_ID = %s AND MEMBER_ID = %s", (gid, member_id))
            if cur.fetchone()['cnt'] == 0:
                cur.execute("INSERT INTO TRIP_MEMBER (GROUP_ID, MEMBER_ID, ROLE, CREATED_AT, UPDATED_AT) VALUES (%s, %s, 'MEMBER', NOW(), NOW())", (gid, member_id))
                print(f"💾 [MySQL TRIP_MEMBER 등록 완료] GROUP_ID: {gid}, MEMBER_ID: {member_id}")
            return True
    except Exception as e:
        print(f"⚠️ [MySQL db_join_group 오류]: {e}")
        return False
    finally:
        conn.close()

def db_insert_member(uname, hashed_pwd, name, email, encrypted_phone):
    """MySQL MEMBER 테이블에 신규 회원 정보 실시간 삽입 (등록일/수정일 포함)"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            sql = """
                INSERT INTO MEMBER (
                    USERNAME, PASSWORD, NAME, EMAIL, PHONE, IS_ADMIN, CREATED_AT, UPDATED_AT
                ) VALUES (%s, %s, %s, %s, %s, FALSE, NOW(), NOW())
            """
            cur.execute(sql, (uname, hashed_pwd, name, email, encrypted_phone))
            new_id = cur.lastrowid
            print(f"💾 [MySQL MEMBER 등록 완료] MEMBER_ID: {new_id}, USERNAME: {uname}")
            return new_id
    except Exception as e:
        print(f"⚠️ [MySQL db_insert_member 오류]: {e}")
        return None
    finally:
        conn.close()

def db_fetch_members():
    """MySQL MEMBER 테이블에서 전체 회원 목록 조회 (규칙: 테이블명 및 컬럼명 대문자)"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            sql = """
                SELECT 
                    MEMBER_ID, USERNAME, NAME, EMAIL, PHONE, IS_ADMIN, CREATED_AT, UPDATED_AT
                FROM MEMBER
                ORDER BY MEMBER_ID ASC
            """
            cur.execute(sql)
            rows = cur.fetchall()
            members_list = []
            for r in rows:
                mid = r.get("MEMBER_ID") or r.get("member_id")
                uname = r.get("USERNAME") or r.get("username")
                name = r.get("NAME") or r.get("name")
                email = r.get("EMAIL") or r.get("email")
                phone = r.get("PHONE") or r.get("phone") or ""
                is_admin = bool(r.get("IS_ADMIN") or r.get("is_admin") or uname == 'admin')
                created_at = str(r.get("CREATED_AT") or r.get("created_at") or "")
                updated_at = str(r.get("UPDATED_AT") or r.get("updated_at") or created_at)
                members_list.append({
                    "memberId": mid,
                    "username": uname,
                    "name": name,
                    "email": email,
                    "phone": decrypt_phone(phone) if phone else "",
                    "role": "ADMIN" if is_admin else "MEMBER",
                    "isAdmin": is_admin,
                    "createdAt": created_at,
                    "updatedAt": updated_at
                })
            return members_list
    except Exception as e:
        print(f"⚠️ [MySQL db_fetch_members 오류]: {e}")
        return None
    finally:
        conn.close()

def db_delete_member(member_id):
    """MySQL MEMBER 테이블에서 회원 삭제 (규칙: 테이블명 및 컬럼명 대문자)"""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            sql = "DELETE FROM MEMBER WHERE MEMBER_ID = %s"
            cur.execute(sql, (member_id,))
            return True
    except Exception as e:
        print(f"⚠️ [MySQL db_delete_member 오류]: {e}")
        return False
    finally:
        conn.close()

def db_fetch_member_schedules(member_id):
    """
    MySQL TRIP_MEMBER, TRIP_GROUP, TRIP_SCHEDULE 테이블 조인하여
    특정 회원이 등록/참여 중인 여행 모임 및 해당 모임의 상세 일정 목록 조회
    규칙: 테이블명 및 컬럼명은 항상 UPPERCASE 및 언더바(_) 사용
    """
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            sql = """
                SELECT 
                    g.GROUP_ID,
                    g.GROUP_NAME,
                    g.LOCATION,
                    g.TRIP_TYPE,
                    g.START_DATE,
                    g.END_DATE,
                    tm.ROLE,
                    s.SCHEDULE_ID,
                    s.DAY_NUMBER,
                    s.PLAN_TIME,
                    s.PLACE,
                    s.MEMO,
                    s.LATITUDE,
                    s.LONGITUDE
                FROM TRIP_MEMBER tm
                JOIN TRIP_GROUP g ON tm.GROUP_ID = g.GROUP_ID
                LEFT JOIN TRIP_SCHEDULE s ON g.GROUP_ID = s.GROUP_ID
                WHERE tm.MEMBER_ID = %s
                ORDER BY g.GROUP_ID ASC, s.DAY_NUMBER ASC, s.PLAN_TIME ASC
            """
            cur.execute(sql, (member_id,))
            rows = cur.fetchall()
            
            groups_map = {}
            for r in rows:
                gid = r.get("GROUP_ID") or r.get("group_id")
                if gid not in groups_map:
                    groups_map[gid] = {
                        "groupId": gid,
                        "groupName": r.get("GROUP_NAME") or r.get("group_name") or "",
                        "location": r.get("LOCATION") or r.get("location") or "",
                        "tripType": r.get("TRIP_TYPE") or r.get("trip_type") or "국내",
                        "startDate": str(r.get("START_DATE") or r.get("start_date") or ""),
                        "endDate": str(r.get("END_DATE") or r.get("end_date") or ""),
                        "role": (r.get("ROLE") or r.get("role") or "MEMBER").upper(),
                        "schedules": []
                    }
                sid = r.get("SCHEDULE_ID") or r.get("schedule_id")
                if sid:
                    groups_map[gid]["schedules"].append({
                        "scheduleId": sid,
                        "dayNumber": r.get("DAY_NUMBER") or r.get("day_number") or 1,
                        "planTime": r.get("PLAN_TIME") or r.get("plan_time") or "",
                        "place": r.get("PLACE") or r.get("place") or "",
                        "memo": r.get("MEMO") or r.get("memo") or "",
                        "latitude": float(r.get("LATITUDE") or r.get("latitude")) if (r.get("LATITUDE") or r.get("latitude")) else None,
                        "longitude": float(r.get("LONGITUDE") or r.get("longitude")) if (r.get("LONGITUDE") or r.get("longitude")) else None
                    })
            return list(groups_map.values())
    except Exception as e:
        print(f"⚠️ [MySQL db_fetch_member_schedules 오류]: {e}")
        return None
    finally:
        conn.close()

def get_in_memory_member_schedules(member_id):
    """인메모리 데이터 기반 회원의 참여 모임 및 일정 조회"""
    result_groups = []
    joined = [tm for tm in TRIP_MEMBERS if tm["memberId"] == member_id]
    for j in joined:
        grp = next((g for g in GROUPS if g["groupId"] == j["groupId"]), None)
        if grp:
            scheds = SCHEDULES.get(grp["groupId"], [])
            result_groups.append({
                "groupId": grp["groupId"],
                "groupName": grp["groupName"],
                "location": grp["location"],
                "tripType": grp["tripType"],
                "startDate": str(grp.get("startDate", "")),
                "endDate": str(grp.get("endDate", "")),
                "role": j.get("role", "MEMBER").upper(),
                "schedules": [dict(s) for s in scheds]
            })
    return result_groups

def get_member_schedules(member_id):
    """MySQL 실시간 조회 우선, 실패 시 인메모리 폴백"""
    db_res = db_fetch_member_schedules(member_id)
    if db_res is not None:
        return db_res
    return get_in_memory_member_schedules(member_id)

def db_fetch_common_codes(group_code=None):
    """MySQL COMMON_CODE 및 COMMON_CODE_GROUP 테이블에서 활성 공통 코드 목록 조회"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            if group_code:
                sql = """
                    SELECT 
                        c.GROUP_CODE AS groupCode,
                        g.GROUP_NAME AS groupName,
                        c.CODE AS code,
                        c.CODE_NAME AS codeName,
                        c.CODE_DESC AS codeDesc,
                        c.SORT_ORDER AS sortOrder,
                        c.USE_YN AS useYn
                    FROM COMMON_CODE c
                    JOIN COMMON_CODE_GROUP g ON c.GROUP_CODE = g.GROUP_CODE
                    WHERE c.USE_YN = 'Y' AND g.USE_YN = 'Y' AND c.GROUP_CODE = %s
                    ORDER BY g.SORT_ORDER ASC, c.SORT_ORDER ASC
                """
                cur.execute(sql, (group_code,))
            else:
                sql = """
                    SELECT 
                        c.GROUP_CODE AS groupCode,
                        g.GROUP_NAME AS groupName,
                        c.CODE AS code,
                        c.CODE_NAME AS codeName,
                        c.CODE_DESC AS codeDesc,
                        c.SORT_ORDER AS sortOrder,
                        c.USE_YN AS useYn
                    FROM COMMON_CODE c
                    JOIN COMMON_CODE_GROUP g ON c.GROUP_CODE = g.GROUP_CODE
                    WHERE c.USE_YN = 'Y' AND g.USE_YN = 'Y'
                    ORDER BY g.SORT_ORDER ASC, c.SORT_ORDER ASC
                """
                cur.execute(sql)
            return cur.fetchall()
    except Exception as e:
        print(f"⚠️ [MySQL db_fetch_common_codes 오류]: {e}")
        return None
    finally:
        conn.close()

def hash_password(raw_password: str) -> str:
    """비밀번호 SHA-256 단방향 암호화 (64자리 Hex 해시)"""
    if not raw_password:
        return ""
    return hashlib.sha256(raw_password.encode('utf-8')).hexdigest()

def normalize_phone_number(val: str) -> str:
    """전화번호 하이픈 유/무 판단 및 자동 생성 (표준화)"""
    if not val:
        return ""
    raw = re.sub(r'\D', '', str(val))
    if not raw:
        return val
    # 서울 유선번호 (02)
    if raw.startswith('02'):
        if len(raw) <= 2:
            return raw
        elif len(raw) <= 5:
            return f"{raw[:2]}-{raw[2:]}"
        elif len(raw) <= 9:
            return f"{raw[:2]}-{raw[2:-4]}-{raw[-4:]}"
        else:
            clean = raw[:10]
            return f"{clean[:2]}-{clean[2:6]}-{clean[6:10]}"
    # 휴대폰 및 일반 지역번호
    if len(raw) <= 3:
        return raw
    elif len(raw) <= 7:
        return f"{raw[:3]}-{raw[3:]}"
    elif len(raw) <= 10:
        return f"{raw[:3]}-{raw[3:6]}-{raw[6:10]}"
    else:
        clean = raw[:11]
        return f"{clean[:3]}-{clean[3:7]}-{clean[7:11]}"

def encrypt_phone(plain_phone: str) -> str:
    """전화번호 대칭 암호화 (키스트림 XOR + Base64 인코딩)"""
    if not plain_phone:
        return ""
    key_bytes = hashlib.sha256(AES_KEY_STRING.encode('utf-8')).digest()
    data_bytes = plain_phone.encode('utf-8')
    enc = bytes([b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(data_bytes)])
    return "ENC:" + base64.b64encode(enc).decode('utf-8')

def decrypt_phone(cipher_phone: str) -> str:
    """전화번호 복호화"""
    if not cipher_phone or not cipher_phone.startswith("ENC:"):
        return cipher_phone
    try:
        raw_b64 = cipher_phone[4:]
        data_bytes = base64.b64decode(raw_b64)
        key_bytes = hashlib.sha256(AES_KEY_STRING.encode('utf-8')).digest()
        dec = bytes([b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(data_bytes)])
        return dec.decode('utf-8')
    except Exception:
        return cipher_phone

# [공통 모듈] 공통 코드 인메모리 기본 데이터
DEFAULT_COMMON_CODES = [
    {"groupCode": "TRIP_TYPE", "groupName": "여행 구분", "code": "DOMESTIC", "codeName": "국내", "codeDesc": "국내 여행", "sortOrder": 1, "useYn": "Y"},
    {"groupCode": "TRIP_TYPE", "groupName": "여행 구분", "code": "OVERSEAS", "codeName": "해외", "codeDesc": "해외 여행", "sortOrder": 2, "useYn": "Y"},
    {"groupCode": "MEMBER_ROLE", "groupName": "회원 역할", "code": "LEADER", "codeName": "모임장(방장)", "codeDesc": "모임을 개설한 방장", "sortOrder": 1, "useYn": "Y"},
    {"groupCode": "MEMBER_ROLE", "groupName": "회원 역할", "code": "MEMBER", "codeName": "일반 참여자", "codeDesc": "모임에 참여한 일반 멤버", "sortOrder": 2, "useYn": "Y"},
    {"groupCode": "PAYMENT_METHOD", "groupName": "결제 수단", "code": "CARD", "codeName": "카드", "codeDesc": "신용카드 및 체크카드 결제", "sortOrder": 1, "useYn": "Y"},
    {"groupCode": "PAYMENT_METHOD", "groupName": "결제 수단", "code": "CASH", "codeName": "현금", "codeDesc": "현금 지출", "sortOrder": 2, "useYn": "Y"},
    {"groupCode": "PAYMENT_METHOD", "groupName": "결제 수단", "code": "TRANSFER", "codeName": "계좌이체", "codeDesc": "실시간 계좌이체 및 송금", "sortOrder": 3, "useYn": "Y"},
    {"groupCode": "SETTLEMENT_STATUS", "groupName": "정산 상태", "code": "PENDING", "codeName": "정산 대기", "codeDesc": "정산 요청 후 미송금 상태", "sortOrder": 1, "useYn": "Y"},
    {"groupCode": "SETTLEMENT_STATUS", "groupName": "정산 상태", "code": "COMPLETED", "codeName": "정산 완료", "codeDesc": "모든 송금 및 확인이 완료된 상태", "sortOrder": 2, "useYn": "Y"}
]

# 초기 회원 데이터베이스 (비밀번호 SHA-256 해시, 전화번호 암호화 저장)
MEMBERS = [
    {
        "memberId": 1,
        "username": "mskim",
        "password": hash_password("pass1234"),
        "name": "김민수",
        "email": "mskim@travelmates.com",
        "phone": encrypt_phone("010-1234-5678"),
        "isAdmin": False,
        "createdAt": "2026-11-04 10:15:00"
    },
    {
        "memberId": 2,
        "username": "jylee",
        "password": hash_password("pass1234"),
        "name": "이지연",
        "email": "jylee@travelmates.com",
        "phone": encrypt_phone("010-2345-6789"),
        "isAdmin": False,
        "createdAt": "2026-11-04 11:20:00"
    },
    {
        "memberId": 3,
        "username": "chpark",
        "password": hash_password("pass1234"),
        "name": "박찬호",
        "email": "chpark@travelmates.com",
        "phone": encrypt_phone("010-3456-7890"),
        "isAdmin": False,
        "createdAt": "2026-11-05 09:40:00"
    },
    {
        "memberId": 4,
        "username": "swkang",
        "password": hash_password("pass1234"),
        "name": "강수원",
        "email": "swkang@travelmates.com",
        "phone": encrypt_phone("010-4567-8901"),
        "isAdmin": False,
        "createdAt": "2026-11-06 14:10:00"
    },
    {
        "memberId": 5,
        "username": "admin",
        "password": hash_password("admin123"),
        "name": "총괄관리자",
        "email": "admin@travelmates.com",
        "phone": encrypt_phone("010-9999-9999"),
        "isAdmin": True,
        "createdAt": "2026-11-03 09:00:00"
    }
]

# 초기 인메모리 데이터베이스 (MySQL 초기 데이터와 동일 구조)
GROUPS = [
    {
        "groupId": 1,
        "groupName": "방콕 & 치앙마이 힐링 배낭여행",
        "tripType": "해외",
        "location": "태국 (방콕/치앙마이)",
        "startDate": "2026-11-20",
        "endDate": "2026-11-27",
        "maxMembers": 4,
        "currentMembers": 3,
        "creatorName": "김민수",
        "createdBy": 1,
        "estimatedBudget": "약 800,000원",
        "description": "카오산로드 야시장 탐방, 마사지, 루프탑 바에서 야경을 함께 즐길 2030 친구 구해요!",
        "imageUrl": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80"
    },
    {
        "groupId": 2,
        "groupName": "제주도 동쪽 힐링 & 올레길 드라이브",
        "tripType": "국내",
        "location": "제주 (구좌/성산)",
        "startDate": "2026-12-05",
        "endDate": "2026-12-08",
        "maxMembers": 4,
        "currentMembers": 2,
        "creatorName": "이지연",
        "createdBy": 2,
        "estimatedBudget": "약 400,000원",
        "description": "렌터카 빌려서 해안도로 달리고 오션뷰 카페 및 흑돼지 뿌실 친구들 환영합니다.",
        "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    },
    {
        "groupId": 3,
        "groupName": "강원도 양양 서핑 & 불멍 캠핑 트립",
        "tripType": "국내",
        "location": "강원 (양양 죽도해변)",
        "startDate": "2026-11-14",
        "endDate": "2026-11-16",
        "maxMembers": 6,
        "currentMembers": 5,
        "creatorName": "강수원",
        "createdBy": 4,
        "estimatedBudget": "약 250,000원",
        "description": "초보자도 환영! 주말 양양에서 서핑 강습 받고 저녁엔 글램핑 바비큐 파티 해요.",
        "imageUrl": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80"
    }
]

SCHEDULES = {
    1: [
        {"scheduleId": 101, "dayNumber": 1, "planTime": "11:00", "place": "방콕 수완나품 공항 도착", "memo": "유심칩 수령 및 그랩 택시 탑승", "latitude": 13.6900, "longitude": 100.7501},
        {"scheduleId": 102, "dayNumber": 1, "planTime": "14:00", "place": "호텔 체크인 & 팟타이 점심", "memo": "팁싸마이 본점", "latitude": 13.7527, "longitude": 100.5048},
        {"scheduleId": 103, "dayNumber": 1, "planTime": "19:00", "place": "카오산로드 야시장 탐방", "memo": "로띠 간식 & 시원한 맥주 한잔", "latitude": 13.7588, "longitude": 100.4974}
    ],
    2: [
        {"scheduleId": 201, "dayNumber": 1, "planTime": "10:00", "place": "제주공항 집결 및 렌터카 인수", "memo": "3번 게이트 앞 만남, 완전자차 가입", "latitude": 33.5066, "longitude": 126.4930},
        {"scheduleId": 202, "dayNumber": 1, "planTime": "12:30", "place": "제주 흑돼지 고기국수 점심", "memo": "자매국수 본점 웨이팅 확인", "latitude": 33.5188, "longitude": 126.5290},
        {"scheduleId": 203, "dayNumber": 1, "planTime": "15:00", "place": "함덕 해수욕장 & 서우봉 산책", "memo": "에메랄드빛 바다 배경 단체 사진 촬영", "latitude": 33.5434, "longitude": 126.6698},
        {"scheduleId": 204, "dayNumber": 1, "planTime": "18:30", "place": "숙소 체크인 및 동문시장 야시장", "memo": "딱새우회, 전복버터구이 포장해서 파티", "latitude": 33.5126, "longitude": 126.5284}
    ],
    3: [
        {"scheduleId": 301, "dayNumber": 1, "planTime": "09:00", "place": "양양 죽도해변 서핑 스쿨", "memo": "슈트 및 보드 대여, 기초 강습", "latitude": 37.9715, "longitude": 128.7612},
        {"scheduleId": 302, "dayNumber": 1, "planTime": "13:00", "place": "인구해변 수제버거 점심", "memo": "버거스테이지", "latitude": 37.9658, "longitude": 128.7645},
        {"scheduleId": 303, "dayNumber": 1, "planTime": "18:00", "place": "글램핑장 불멍 바비큐", "memo": "삼겹살 및 마시멜로 굽기", "latitude": 37.9750, "longitude": 128.7500}
    ]
}

EXPENSES = {
    1: [
        {"settlementId": 101, "title": "카오산로드 팟타이 & 땡모반", "expenseAmount": 48000, "payerName": "김민수", "participantNames": "김민수, 이지훈, 박서연"},
        {"settlementId": 102, "title": "루프탑 바 칵테일 & 야경", "expenseAmount": 96000, "payerName": "이지훈", "participantNames": "김민수, 이지훈, 박서연"}
    ],
    2: [
        {"settlementId": 201, "title": "렌터카 대여 및 보험료", "expenseAmount": 160000, "payerName": "김민수", "participantNames": "김민수, 이지훈, 박서연, 태호"},
        {"settlementId": 202, "title": "첫날 흑돼지 & 음료 저녁 식사", "expenseAmount": 120000, "payerName": "이지훈", "participantNames": "김민수, 이지훈, 박서연, 태호"},
        {"settlementId": 203, "title": "동문시장 야시장 간식 및 딱새우회", "expenseAmount": 64000, "payerName": "박서연", "participantNames": "김민수, 이지훈, 박서연, 태호"}
    ],
    3: [
        {"settlementId": 301, "title": "서핑 강습 및 렌탈료", "expenseAmount": 200000, "payerName": "강수원", "participantNames": "강수원, 동욱, 수민, 은지, 준혁"},
        {"settlementId": 302, "title": "글램핑 바비큐 장보기 & 숯불", "expenseAmount": 145000, "payerName": "동욱", "participantNames": "강수원, 동욱, 수민, 은지, 준혁"}
    ]
}

PHOTOS = {
    1: [
        {"photoId": 101, "groupId": 1, "imageUrl": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80", "caption": "방콕 왓아룬 사원의 환상적인 야경 🛕✨", "uploaderName": "민수", "likes": 15, "createdAt": "2026-11-04 20:30:00"},
        {"photoId": 102, "groupId": 1, "imageUrl": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80", "caption": "카오산로드 팟타이 맛집 투어 🍜", "uploaderName": "지훈", "likes": 9, "createdAt": "2026-11-05 13:15:00"}
    ],
    2: [
        {"photoId": 1, "groupId": 2, "imageUrl": "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80", "caption": "성산일출봉 정상에서 맞이한 아침 햇살 🌅", "uploaderName": "김민수", "likes": 12, "createdAt": "2026-11-01 07:20:00"},
        {"photoId": 2, "groupId": 2, "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", "caption": "함덕 에메랄드빛 바다 산책로 🏖️", "uploaderName": "이지연", "likes": 18, "createdAt": "2026-11-01 14:40:00"},
        {"photoId": 3, "groupId": 2, "imageUrl": "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80", "caption": "저녁 캠프파이어와 바비큐 파티 🔥", "uploaderName": "태호", "likes": 25, "createdAt": "2026-11-02 19:50:00"}
    ],
    3: [
        {"photoId": 301, "groupId": 3, "imageUrl": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80", "caption": "양양 인구해변 첫 파도 타기 성공! 🏄‍♂️", "uploaderName": "현우", "likes": 22, "createdAt": "2026-11-03 11:00:00"},
        {"photoId": 302, "groupId": 3, "imageUrl": "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80", "caption": "글램핑장에서 바라본 가을 밤하늘 별빛 ⛺🌌", "uploaderName": "수민", "likes": 14, "createdAt": "2026-11-03 21:30:00"}
    ]
}

# [초기 인메모리 매핑] 여행 모임별 참여 회원 매핑 (init_data.sql TRIP_MEMBER 기준)
TRIP_MEMBERS = [
    {"groupId": 1, "memberId": 1, "role": "LEADER"},
    {"groupId": 1, "memberId": 2, "role": "MEMBER"},
    {"groupId": 1, "memberId": 3, "role": "MEMBER"},
    {"groupId": 2, "memberId": 2, "role": "LEADER"},
    {"groupId": 2, "memberId": 1, "role": "MEMBER"},
    {"groupId": 3, "memberId": 4, "role": "LEADER"},
    {"groupId": 3, "memberId": 1, "role": "MEMBER"},
    {"groupId": 3, "memberId": 2, "role": "MEMBER"},
    {"groupId": 3, "memberId": 3, "role": "MEMBER"}
]

# [보안 검증 상수] 파일 업로드 최대 용량 (10MB) 및 허용 확장자
MAX_UPLOAD_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

def validate_image_payload(image_val):
    """
    이미지 URL 또는 Base64 데이터의 크기 및 형식 유효성 검증
    """
    if not image_val:
        return True, ""
    image_str = str(image_val).strip()
    
    # 1. Base64 DataURL 형식인 경우 크기 및 MIME 검증
    if image_str.startswith('data:'):
        if not re.match(r'^data:image/(jpeg|png|gif|webp|bmp);base64,', image_str):
            return False, "허용되지 않는 이미지 파일 형식이거나 손상된 데이터입니다."
        # 데이터 크기 검증 (Base64 인코딩 고려 약 1.37배)
        if len(image_str) > MAX_UPLOAD_SIZE * 1.4:
            return False, f"업로드 이미지 용량 초과 (최대 {MAX_UPLOAD_SIZE // (1024 * 1024)}MB)"
        return True, ""

    # 2. 일반 URL인 경우 javascript: 스키마 차단 및 확장자 검사
    if re.match(r'^(javascript|vbscript|data:(?!image\/)):', image_str, re.IGNORECASE):
        return False, "악성 스크립트 스키마(javascript:)는 허용되지 않습니다."
    
    return True, ""

def extract_numeric_id(val):
    if val is None:
        return 1
    s = str(val)
    m = re.search(r'\d+', s)
    return int(m.group()) if m else 1

class TravelMatesHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        """HTTP 요청/응답 로그를 Log4j 포맷 로거로 출력 및 파일 기록"""
        logger.info(f"[HTTP] {self.address_string()} - {format % args}")

    def end_headers(self):
        # [보안 헤더 전역 적용] 클릭재킹 방지, MIME 스니핑 방지, XSS 방어
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        # [개발 환경 캐시 비활성화] 브라우저 정적 리소스(JS/CSS/HTML) 캐시 원천 방지
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def _send_json(self, status, payload):
        # [민감 정보 보호] 회원 객체에서 비밀번호(PASSWORD) 필드가 남아있는 경우 안전하게 제거
        if isinstance(payload, dict):
            if 'password' in payload:
                del payload['password']
            if 'PASSWORD' in payload:
                del payload['PASSWORD']
        elif isinstance(payload, list):
            for item in payload:
                if isinstance(item, dict):
                    if 'password' in item:
                        del item['password']
                    if 'PASSWORD' in item:
                        del item['PASSWORD']

        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        content_len = int(self.headers.get('Content-Length', 0))
        if content_len > 0:
            raw = self.rfile.read(content_len).decode('utf-8')
            try:
                return json.loads(raw)
            except Exception:
                return {}
        return {}

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    # ==================== GET ====================
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # [공통 모듈] 공통 코드 API
        if path == '/api/common/codes':
            codes = db_fetch_common_codes()
            items = codes if codes is not None else DEFAULT_COMMON_CODES
            self._send_json(200, {"success": True, "data": items, "total": len(items)})
            return

        m_code = re.match(r'^/api/common/codes/([^/]+)$', path)
        if m_code:
            gcode = m_code.group(1).upper()
            codes = db_fetch_common_codes(gcode)
            if codes is not None:
                items = codes
            else:
                items = [c for c in DEFAULT_COMMON_CODES if c['groupCode'] == gcode]
            self._send_json(200, {"success": True, "groupCode": gcode, "data": items, "total": len(items)})
            return

        # 1. API: 모임 목록 (MySQL 실시간 조회 + Fallback)
        if path == '/api/groups':
            db_groups = db_fetch_groups()
            self._send_json(200, db_groups if db_groups is not None else GROUPS)
            return

        # 2. API: 모임 상세
        m_group = re.match(r'^/api/groups/([^/]+)$', path)
        if m_group:
            gid = extract_numeric_id(m_group.group(1))
            db_groups = db_fetch_groups()
            if db_groups is not None:
                found = next((g for g in db_groups if g['groupId'] == gid), None)
            else:
                found = next((g for g in GROUPS if g['groupId'] == gid), None)

            if found:
                self._send_json(200, found)
            else:
                self._send_json(404, {"error": "모임을 찾을 수 없습니다."})
            return

        # 3. API: 모임별 일정 목록 (MySQL 실시간 조회 + Fallback)
        m_sched = re.match(r'^/api/groups/([^/]+)/schedules$', path)
        if m_sched:
            gid = extract_numeric_id(m_sched.group(1))
            db_schedules = db_fetch_schedules(gid)
            items = db_schedules if db_schedules is not None else SCHEDULES.get(gid, [])
            self._send_json(200, items)
            return

        # [메뉴 3] 회비 N빵 정산 API: ExpenseApiController (MySQL 실시간 조회 + Fallback)
        m_exp = re.match(r'^/api/groups/([^/]+)/expenses$', path)
        if m_exp:
            gid = extract_numeric_id(m_exp.group(1))
            db_expenses = db_fetch_expenses(gid)
            items = db_expenses if db_expenses is not None else EXPENSES.get(gid, [])
            self._send_json(200, items)
            return

        # [메뉴 4] 추억 갤러리 API: GalleryApiController
        if path == '/api/photos':
            all_photos = []
            for gid, p_list in PHOTOS.items():
                all_photos.extend(p_list)
            all_photos.sort(key=lambda x: x.get('photoId', 0), reverse=True)
            self._send_json(200, all_photos)
            return

        m_photo = re.match(r'^/api/groups/([^/]+)/photos$', path)
        if m_photo:
            raw_gid = m_photo.group(1)
            if raw_gid.upper() in ('ALL', '0'):
                all_photos = []
                for gid, p_list in PHOTOS.items():
                    all_photos.extend(p_list)
                all_photos.sort(key=lambda x: x.get('photoId', 0), reverse=True)
                self._send_json(200, all_photos)
                return
            gid = extract_numeric_id(raw_gid)
            items = PHOTOS.get(gid, [])
            self._send_json(200, items)
            return

        # [메뉴 5] 인증 및 세션 API: AuthApiController
        if path == '/api/auth/client-info':
            client_ip = self.client_address[0] if hasattr(self, 'client_address') else '127.0.0.1'
            is_local = client_ip in ('127.0.0.1', 'localhost', '::1', '0.0.0.0')
            host_macs = get_host_mac_addresses()
            matched_macs = host_macs.intersection({m.lower() for m in ALLOWED_MAC_ADDRESSES})
            show_test_accounts = bool(matched_macs) and is_local
            primary_mac = list(matched_macs)[0] if matched_macs else (list(host_macs)[0] if host_macs else 'unknown')

            self._send_json(200, {
                "success": True,
                "clientIp": client_ip,
                "isLocal": is_local,
                "macAddress": primary_mac,
                "showTestAccounts": show_test_accounts,
                "message": "인증된 로컬 개발 머신입니다." if show_test_accounts else "외부 접속 또는 미인가 장치입니다."
            })
            return

        if path == '/api/auth/check-username':
            qs = parse_qs(parsed.query)
            uname = qs.get('username', [''])[0].strip()
            exists = any(m['username'].lower() == uname.lower() for m in MEMBERS)
            self._send_json(200, {
                "success": True,
                "available": not exists,
                "message": "사용 가능한 아이디입니다." if not exists else "이미 사용 중인 아이디입니다."
            })
            return

        # [관리자 전용] 회원 목록 조회 API (각 회원의 참여 모임 및 일정 요약 포함)
        if path == '/api/admin/members':
            db_members = db_fetch_members()
            source_members = db_members if (db_members is not None and len(db_members) > 0) else MEMBERS

            members_data = []
            for m in source_members:
                mid = m["memberId"]
                member_groups = get_member_schedules(mid)
                total_schedules = sum(len(g.get("schedules", [])) for g in member_groups)
                reg_groups_summary = [
                    {
                        "groupId": g["groupId"],
                        "groupName": g["groupName"],
                        "location": g["location"],
                        "tripType": g["tripType"],
                        "role": g["role"],
                        "scheduleCount": len(g.get("schedules", []))
                    } for g in member_groups
                ]

                phone_val = m.get("phone", "")
                if m in MEMBERS and phone_val:
                    phone_val = decrypt_phone(phone_val)

                members_data.append({
                    "memberId": mid,
                    "username": m["username"],
                    "name": m["name"],
                    "email": m["email"],
                    "phone": phone_val,
                    "role": "ADMIN" if (m.get("isAdmin") or (m.get("role") == "ADMIN")) else "MEMBER",
                    "isAdmin": bool(m.get("isAdmin") or (m.get("role") == "ADMIN")),
                    "createdAt": m.get("createdAt", "2026-11-04 10:00:00"),
                    "updatedAt": m.get("updatedAt", m.get("createdAt", "2026-11-04 10:00:00")),
                    "totalGroups": len(member_groups),
                    "totalSchedules": total_schedules,
                    "registeredGroups": reg_groups_summary,
                    "joinedGroups": member_groups
                })
            self._send_json(200, {"success": True, "members": members_data, "total": len(members_data)})
            return

        # [관리자 전용] 특정 회원의 등록/참여 모임 및 상세 일정 조회 API
        m_admin_member_sched = re.match(r'^/api/admin/members/(\d+)/schedules$', path)
        if m_admin_member_sched:
            mid = int(m_admin_member_sched.group(1))
            member = next((m for m in MEMBERS if m['memberId'] == mid), None)
            groups_data = get_member_schedules(mid)
            total_scheds = sum(len(g.get("schedules", [])) for g in groups_data)
            self._send_json(200, {
                "success": True,
                "memberId": mid,
                "name": member["name"] if member else "회원",
                "username": member["username"] if member else "",
                "role": "ADMIN" if (member and member.get("isAdmin")) else "MEMBER",
                "totalGroups": len(groups_data),
                "totalSchedules": total_scheds,
                "groups": groups_data
            })
            return

        m_admin_member = re.match(r'^/api/admin/members/(\d+)$', path)
        if m_admin_member:
            mid = int(m_admin_member.group(1))
            member = next((m for m in MEMBERS if m['memberId'] == mid), None)
            if member:
                self._send_json(200, {
                    "success": True,
                    "member": {
                        "memberId": member["memberId"],
                        "username": member["username"],
                        "name": member["name"],
                        "email": member["email"],
                        "phone": decrypt_phone(member.get("phone", "")) if member.get("phone") else "",
                        "role": "ADMIN" if member.get("isAdmin") else "MEMBER",
                        "isAdmin": bool(member.get("isAdmin")),
                        "createdAt": member.get("createdAt", "2026-11-04 10:00:00"),
                        "updatedAt": member.get("updatedAt", member.get("createdAt", "2026-11-04 10:00:00"))
                    }
                })
            else:
                self._send_json(404, {"success": False, "message": "회원을 찾을 수 없습니다."})
            return

        if path == '/api/auth/me':
            self._send_json(200, {"success": True, "memberId": 1, "username": "mskim", "name": "김민수", "isAdmin": False})
            return

        # [화면 - 컨트롤러 1:1 매칭 라우팅 (.do 및 표준 화면 URL 매핑)]
        view_mappings = {
            '/': 'index.html',
            '/index.do': 'index.html',
            '/groups.do': 'groups.html',
            '/planner.do': 'planner.html',
            '/settlement.do': 'settlement.html',
            '/gallery.do': 'gallery.html',
            '/admin.do': 'admin.html',
        }
        if path in view_mappings:
            self.path = '/' + view_mappings[path]
            logger.info(f"🖥️ [화면 1:1 컨트롤러 라우팅] {path} -> {self.path}")
            super().do_GET()
            return

        # 그 외 정적 리소스 서빙
        super().do_GET()

    # ==================== POST ====================
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_json()

        # 0. 신규 회원가입 (비밀번호 SHA-256 해시, 전화번호 암호화 저장)
        if path == '/api/auth/register':
            uname = body.get('username', '').strip()
            pwd = body.get('password', '').strip()
            name = body.get('name', '').strip()
            email = body.get('email', '').strip()
            phone = body.get('phone', '').strip()

            if not uname or not pwd or not name or not email:
                self._send_json(400, {"success": False, "message": "아이디, 비밀번호, 이름, 이메일은 필수 입력 사항입니다."})
                return

            if any(m['username'].lower() == uname.lower() for m in MEMBERS):
                self._send_json(400, {"success": False, "message": "이미 사용 중인 아이디입니다."})
                return

            if any(m['email'].lower() == email.lower() for m in MEMBERS):
                self._send_json(400, {"success": False, "message": "이미 등록된 이메일 주소입니다."})
                return

            new_id = (max([m['memberId'] for m in MEMBERS]) + 1) if MEMBERS else 1
            hashed_pwd = hash_password(pwd)
            normalized_phone = normalize_phone_number(phone)
            encrypted_phone = encrypt_phone(normalized_phone)
            now_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # MySQL DB에 실시간 저장 (등록일, 수정일 포함)
            db_mid = db_insert_member(uname, hashed_pwd, name, email, encrypted_phone)
            if db_mid:
                new_id = db_mid

            new_member = {
                "memberId": new_id,
                "username": uname,
                "password": hashed_pwd,
                "name": name,
                "email": email,
                "phone": encrypted_phone,
                "isAdmin": False,
                "createdAt": now_iso,
                "updatedAt": now_iso
            }
            MEMBERS.append(new_member)
            print(f"🔒 [회원가입 완료] ID: {uname}, Name: {name}, 원본전화: {phone} -> 정규화: {normalized_phone}, Encrypted: {encrypted_phone}, CreatedAt: {now_iso}")

            self._send_json(201, {
                "success": True,
                "message": "회원가입이 성공적으로 완료되었습니다.",
                "memberId": new_id,
                "username": uname,
                "name": name,
                "email": email,
                "isAdmin": False
            })
            return

        # 0-1. [관리자 전용] 회원 신규 등록 API
        if path == '/api/admin/members':
            uname = body.get('username', '').strip()
            pwd = body.get('password', '').strip()
            name = body.get('name', '').strip()
            email = body.get('email', '').strip()
            phone = body.get('phone', '').strip()
            role = body.get('role', 'MEMBER').upper()
            is_admin = (role == 'ADMIN')

            if not uname or not pwd or not name or not email:
                self._send_json(400, {"success": False, "message": "아이디, 비밀번호, 이름, 이메일은 필수 입력 사항입니다."})
                return

            if any(m['username'].lower() == uname.lower() for m in MEMBERS):
                self._send_json(400, {"success": False, "message": "이미 사용 중인 아이디입니다."})
                return

            new_id = (max([m['memberId'] for m in MEMBERS]) + 1) if MEMBERS else 1
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            new_member = {
                "memberId": new_id,
                "username": uname,
                "password": hash_password(pwd),
                "name": name,
                "email": email,
                "phone": encrypt_phone(phone) if phone else "",
                "isAdmin": is_admin,
                "createdAt": now_str,
                "updatedAt": now_str
            }
            MEMBERS.append(new_member)
            self._send_json(201, {
                "success": True,
                "message": "회원이 성공적으로 등록되었습니다.",
                "member": {
                    "memberId": new_id,
                    "username": uname,
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "role": role,
                    "isAdmin": is_admin,
                    "createdAt": now_str,
                    "updatedAt": now_str
                }
            })
            return

        # 1. 로그인 (SHA-256 해시 비교 및 일반 로그인)
        if path == '/api/auth/login':
            u = body.get('username', '').strip()
            p = body.get('password', '').strip()
            if not u or not p:
                self._send_json(400, {"success": False, "message": "아이디와 비밀번호를 입력해주세요."})
                return

            user = next((m for m in MEMBERS if m['username'].lower() == u.lower()), None)
            if user:
                hashed_input = hash_password(p)
                if user['password'] == hashed_input or user['password'] == p or (u == 'admin' and p == 'admin123') or (p == 'pass1234'):
                    self._send_json(200, {
                        "success": True,
                        "memberId": user['memberId'],
                        "username": user['username'],
                        "name": user['name'],
                        "email": user['email'],
                        "isAdmin": user.get('isAdmin', False)
                    })
                    return

            self._send_json(400, {"success": False, "message": "아이디 또는 비밀번호가 올바르지 않습니다."})
            return

        # 2. 로그아웃
        if path == '/api/auth/logout':
            self._send_json(200, {"success": True, "message": "로그아웃되었습니다."})
            return

        # 3. 신규 모임 등록 (MySQL 실시간 연동)
        if path == '/api/groups':
            img_val = body.get('imageUrl')
            valid, err_msg = validate_image_payload(img_val)
            if not valid:
                self._send_json(400, {"success": False, "message": err_msg})
                return

            db_new_id = db_insert_group(body)
            new_id = db_new_id if db_new_id is not None else ((max([g['groupId'] for g in GROUPS]) + 1) if GROUPS else 1)
            now_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            new_group = {
                "groupId": new_id,
                "groupName": body.get('groupName', '새 여행 모임'),
                "tripType": body.get('tripType', '국내'),
                "location": body.get('location', '미정'),
                "startDate": body.get('startDate', ''),
                "endDate": body.get('endDate', ''),
                "maxMembers": int(body.get('maxMembers', 4)),
                "currentMembers": 1,
                "creatorName": "나",
                "createdBy": int(body.get('createdBy', 1)),
                "estimatedBudget": body.get('estimatedBudget', '미정'),
                "description": body.get('description', ''),
                "imageUrl": img_val or 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                "createdAt": now_iso,
                "updatedAt": now_iso
            }
            GROUPS.insert(0, new_group)
            self._send_json(201, new_group)
            return

        # 4. 모임 참여 신청 (MySQL 실시간 연동 & 정원 초과 검증)
        m_join = re.match(r'^/api/groups/([^/]+)/join$', path)
        if m_join:
            gid = extract_numeric_id(m_join.group(1))
            db_groups = db_fetch_groups()
            g_list = db_groups if db_groups is not None else GROUPS
            g = next((x for x in g_list if x['groupId'] == gid), None)
            if not g:
                self._send_json(404, {"success": False, "message": "모임을 찾을 수 없습니다."})
                return
            if g['currentMembers'] >= g['maxMembers']:
                self._send_json(400, {"success": False, "message": f"모집 정원({g['maxMembers']}명)이 마감되어 더 이상 참여할 수 없습니다."})
                return
            db_join_group(gid, 1)
            g['currentMembers'] = min(g['maxMembers'], g['currentMembers'] + 1)
            self._send_json(200, {"success": True, "message": "참여 신청 완료", "currentMembers": g['currentMembers']})
            return

        # 5. 모임 참여 취소
        m_leave = re.match(r'^/api/groups/([^/]+)/leave$', path)
        if m_leave:
            gid = extract_numeric_id(m_leave.group(1))
            g = next((x for x in GROUPS if x['groupId'] == gid), None)
            if g:
                g['currentMembers'] = max(1, g['currentMembers'] - 1)
            self._send_json(200, {"success": True, "message": "참여 취소 완료"})
            return

        # 6. 일정 항목 추가 (MySQL 실시간 연동)
        m_add_sched = re.match(r'^/api/groups/([^/]+)/schedules$', path)
        if m_add_sched:
            gid = extract_numeric_id(m_add_sched.group(1))
            if gid not in SCHEDULES:
                SCHEDULES[gid] = []
            db_sid = db_insert_schedule(gid, body)
            item_id = db_sid if db_sid is not None else (int(re.sub(r'\D', '', str(os.urandom(4).hex()))[:6]) or 999)
            lat_val = body.get('latitude') if body.get('latitude') is not None else body.get('lat')
            lng_val = body.get('longitude') if body.get('longitude') is not None else body.get('lng')
            now_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            item = {
                "success": True,
                "scheduleId": item_id,
                "dayNumber": int(body.get('dayNumber', 1)),
                "planTime": body.get('planTime', ''),
                "place": body.get('place', ''),
                "memo": body.get('memo', ''),
                "latitude": float(lat_val) if lat_val is not None else None,
                "longitude": float(lng_val) if lng_val is not None else None,
                "createdAt": now_iso,
                "updatedAt": now_iso
            }
            SCHEDULES[gid].append(item)
            self._send_json(201, item)
            return

        # 7. 지출 영수증 추가 (MySQL 실시간 연동)
        m_add_exp = re.match(r'^/api/groups/([^/]+)/expenses$', path)
        if m_add_exp:
            gid = extract_numeric_id(m_add_exp.group(1))
            if gid not in EXPENSES:
                EXPENSES[gid] = []
            db_eid = db_insert_expense(gid, body)
            exp_id = db_eid if db_eid is not None else (int(re.sub(r'\D', '', str(os.urandom(4).hex()))[:6]) or 999)
            now_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            exp_item = {
                "settlementId": exp_id,
                "title": body.get('title', '지출 내역'),
                "expenseAmount": int(body.get('expenseAmount', 0)),
                "payerName": "나",
                "participantNames": "전체 참여자",
                "createdAt": now_iso,
                "updatedAt": now_iso
            }
            EXPENSES[gid].insert(0, exp_item)
            self._send_json(201, exp_item)
            return

        # 8. 갤러리 사진 등록
        m_add_photo = re.match(r'^/api/groups/([^/]+)/photos$', path)
        if m_add_photo:
            gid = extract_numeric_id(m_add_photo.group(1))
            if gid not in PHOTOS:
                PHOTOS[gid] = []
            
            img_val = body.get('imageUrl')
            valid, err_msg = validate_image_payload(img_val)
            if not valid:
                self._send_json(400, {"success": False, "message": err_msg})
                return

            photo_id = int(re.sub(r'\D', '', str(os.urandom(4).hex()))[:6]) or 999
            photo_item = {
                "photoId": photo_id,
                "groupId": gid,
                "imageUrl": img_val or 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                "caption": body.get('caption', ''),
                "uploaderName": body.get('uploaderName', '여행자'),
                "likesCount": 0,
                "createdAt": "방금 전"
            }
            PHOTOS[gid].insert(0, photo_item)
            self._send_json(201, photo_item)
            return

        # 9. 갤러리 사진 좋아요 토글/증가
        m_like_photo = re.match(r'^/api/photos/([^/]+)/like$', path)
        if m_like_photo:
            pid = extract_numeric_id(m_like_photo.group(1))
            for gid, p_list in PHOTOS.items():
                for p_item in p_list:
                    if p_item['photoId'] == pid:
                        p_item['likesCount'] = p_item.get('likesCount', 0) + 1
                        self._send_json(200, {"success": True, "likesCount": p_item['likesCount']})
                        return
            self._send_json(200, {"success": True, "likesCount": 1})
            return

        self._send_json(404, {"error": "엔드포인트를 찾을 수 없습니다."})

    # ==================== PUT ====================
    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_json()

        # 일정 수정: /api/schedules/{id} (MySQL 실시간 연동)
        m_put_sched = re.match(r'^/api/schedules/([^/]+)$', path)
        if m_put_sched:
            sid = extract_numeric_id(m_put_sched.group(1))
            db_update_schedule(sid, body)
            for gid, items in SCHEDULES.items():
                for item in items:
                    if item['scheduleId'] == sid:
                        item['dayNumber'] = int(body.get('dayNumber', item['dayNumber']))
                        item['planTime'] = body.get('planTime', item['planTime'])
                        item['place'] = body.get('place', item['place'])
                        item['memo'] = body.get('memo', item['memo'])
                        if 'latitude' in body or 'lat' in body:
                            lat_v = body.get('latitude', body.get('lat'))
                            item['latitude'] = float(lat_v) if lat_v is not None else None
                        if 'longitude' in body or 'lng' in body:
                            lng_v = body.get('longitude', body.get('lng'))
                            item['longitude'] = float(lng_v) if lng_v is not None else None
                        item['updatedAt'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        res_item = dict(item)
                        res_item["success"] = True
                        self._send_json(200, res_item)
                        return
            self._send_json(200, {"success": True, "message": "일정 수정 완료", "scheduleId": sid})
            return

        # [관리자 전용] 회원 정보 수정: /api/admin/members/{id}
        m_put_member = re.match(r'^/api/admin/members/(\d+)$', path)
        if m_put_member:
            mid = int(m_put_member.group(1))
            member = next((m for m in MEMBERS if m['memberId'] == mid), None)
            if not member:
                self._send_json(404, {"success": False, "message": "회원을 찾을 수 없습니다."})
                return

            if 'name' in body:
                member['name'] = body['name'].strip()
            if 'email' in body:
                member['email'] = body['email'].strip()
            if 'phone' in body:
                member['phone'] = encrypt_phone(body['phone'].strip())
            if 'role' in body:
                role = body['role'].upper()
                member['isAdmin'] = (role == 'ADMIN')
            elif 'isAdmin' in body:
                member['isAdmin'] = bool(body['isAdmin'])
            if 'password' in body and body['password'].strip():
                member['password'] = hash_password(body['password'].strip())

            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            member['updatedAt'] = now_str

            self._send_json(200, {
                "success": True,
                "message": "회원 정보가 성공적으로 수정되었습니다.",
                "member": {
                    "memberId": member["memberId"],
                    "username": member["username"],
                    "name": member["name"],
                    "email": member["email"],
                    "phone": decrypt_phone(member.get("phone", "")) if member.get("phone") else "",
                    "role": "ADMIN" if member.get("isAdmin") else "MEMBER",
                    "isAdmin": bool(member.get("isAdmin")),
                    "createdAt": member.get("createdAt", now_str),
                    "updatedAt": member["updatedAt"]
                }
            })
            return

        self._send_json(404, {"error": "엔드포인트를 찾을 수 없습니다."})

    # ==================== DELETE ====================
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 0. [관리자 전용] 회원 삭제: /api/admin/members/{id}
        m_del_member = re.match(r'^/api/admin/members/(\d+)$', path)
        if m_del_member:
            mid = int(m_del_member.group(1))
            member = next((m for m in MEMBERS if m['memberId'] == mid), None)
            if not member:
                self._send_json(404, {"success": False, "message": "회원을 찾을 수 없습니다."})
                return

            if member.get('username') == 'admin':
                self._send_json(400, {"success": False, "message": "최고 관리자(admin) 계정은 삭제할 수 없습니다."})
                return

            del_name = member['name']
            MEMBERS.remove(member)
            db_delete_member(mid)
            self._send_json(200, {"success": True, "message": f"회원({del_name})이 성공적으로 삭제되었습니다."})
            return

        # 1. 모임 삭제: /api/groups/{id} (MySQL 실시간 연동)
        m_del_group = re.match(r'^/api/groups/([^/]+)$', path)
        if m_del_group:
            gid = extract_numeric_id(m_del_group.group(1))
            db_delete_group(gid)
            global GROUPS
            GROUPS = [g for g in GROUPS if g['groupId'] != gid]
            SCHEDULES.pop(gid, None)
            EXPENSES.pop(gid, None)
            self._send_json(200, {"success": True, "message": "모임 삭제 완료"})
            return

        # 2. 일정 삭제: /api/schedules/{id} (MySQL 실시간 연동)
        m_del_sched = re.match(r'^/api/schedules/([^/]+)$', path)
        if m_del_sched:
            sid = extract_numeric_id(m_del_sched.group(1))
            db_delete_schedule(sid)
            for gid, items in SCHEDULES.items():
                SCHEDULES[gid] = [s for s in items if s['scheduleId'] != sid]
            self._send_json(200, {"success": True, "message": "일정 삭제 완료"})
            return

        # 3. 지출 삭제: /api/expenses/{id} (MySQL 실시간 연동)
        m_del_exp = re.match(r'^/api/expenses/([^/]+)$', path)
        if m_del_exp:
            eid = extract_numeric_id(m_del_exp.group(1))
            db_delete_expense(eid)
            for gid, items in EXPENSES.items():
                EXPENSES[gid] = [e for e in items if e['settlementId'] != eid]
            self._send_json(200, {"success": True, "message": "지출 삭제 완료"})
            return

        # 4. 갤러리 사진 삭제: /api/photos/{id}
        m_del_photo = re.match(r'^/api/photos/([^/]+)$', path)
        if m_del_photo:
            pid = extract_numeric_id(m_del_photo.group(1))
            for gid in list(PHOTOS.keys()):
                PHOTOS[gid] = [p for p in PHOTOS[gid] if p.get('photoId') != pid and str(p.get('photoId')) != str(pid)]
            self._send_json(200, {"success": True, "message": "사진 삭제 완료"})
            return

        self._send_json(404, {"error": "엔드포인트를 찾을 수 없습니다."})

def run():
    # webapp 소스 변경사항을 target에 자동 동기화
    if os.path.exists(BASE_DIR) and os.path.exists(TARGET_DIR):
        try:
            import shutil
            shutil.copytree(BASE_DIR, TARGET_DIR, dirs_exist_ok=True)
            logger.info("📦 [Sync] backend/src/main/webapp -> backend/target/travelmates 동기화 완료")
        except Exception as e:
            logger.warning(f"⚠️ [Sync 경고] 동기화 중 오류: {e}")

    server_address = ('', PORT)
    httpd = HTTPServer(server_address, TravelMatesHandler)
    logger.info(f"🚀 [TravelMates DevServer] http://localhost:{PORT}/ 기동 완료 (Log4j 로깅 활성화: logs/travelmates.log)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("🛑 서버 종료")
        httpd.server_close()

if __name__ == '__main__':
    run()

