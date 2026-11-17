#!/usr/bin/env bash
# ==============================================================================
# TravelMates 외부 접속 URL 종료 스크립트 (Cloudflare Quick Tunnel)
# ==============================================================================

PID_FILE="/tmp/travelmates_tunnel.pid"
LOG_FILE="/tmp/travelmates_tunnel.log"

echo "🛑 [TravelMates] 외부 접속 URL 터널 종료 중..."

STOPPED=false

# 1. PID 파일 기반 종료
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE" 2>/dev/null)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        echo "   PID $PID 프로세스 종료 시도..."
        kill -TERM "$PID" 2>/dev/null
        sleep 1
        if kill -0 "$PID" 2>/dev/null; then
            kill -KILL "$PID" 2>/dev/null
        fi
        STOPPED=true
    fi
    rm -f "$PID_FILE"
fi

# 2. 잔류 cloudflared 터널 프로세스 점검 및 완전 종료
REMAINING_PIDS=$(pgrep -f "cloudflared tunnel --url" 2>/dev/null)
if [ -n "$REMAINING_PIDS" ]; then
    echo "   잔류 터널 프로세스 발견 ($REMAINING_PIDS), 강제 종료..."
    pkill -f "cloudflared tunnel --url" 2>/dev/null
    STOPPED=true
fi

# 3. 로그 파일 정리
rm -f "$LOG_FILE"

# 4. 결과 출력
if [ "$STOPPED" = true ]; then
    echo "✅ [완료] 외부 접속 URL 터널이 안전하게 종료되었습니다."
    echo "🔒 외부에서의 접근이 완전히 차단되었습니다 (로컬 포트 8080만 단독 유지)."
else
    echo "ℹ️ [알림] 현재 실행 중인 외부 터널 프로세스가 없습니다."
fi

