#!/usr/bin/env bash
# ==============================================================================
# TravelMates 외부 접속 URL 통합 관리 스크립트 (start / stop / status / url)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="/tmp/travelmates_tunnel.pid"
LOG_FILE="/tmp/travelmates_tunnel.log"

case "$1" in
    start)
        "$SCRIPT_DIR/start_tunnel.sh"
        ;;
    stop)
        "$SCRIPT_DIR/stop_tunnel.sh"
        ;;
    status)
        echo "🔍 [TravelMates] 외부 터널 상태 확인..."
        if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE" 2>/dev/null)" 2>/dev/null; then
            PID=$(cat "$PID_FILE")
            URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$LOG_FILE" 2>/dev/null | tail -n 1)
            echo "   상태: ✅ 실행 중 (PID: $PID)"
            if [ -n "$URL" ]; then
                echo "   URL : 🌐 $URL"
            fi
        else
            echo "   상태: ⏹️ 중지됨 (외부 접속 차단됨)"
        fi
        ;;
    url)
        if [ -f "$LOG_FILE" ]; then
            URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$LOG_FILE" 2>/dev/null | tail -n 1)
            if [ -n "$URL" ]; then
                echo "$URL"
            else
                echo "URL을 찾을 수 없습니다 (터널이 시작 중이거나 로그가 비어있음)."
            fi
        else
            echo "터널이 실행 중이지 않습니다."
        fi
        ;;
    *)
        echo "사용법: $0 {start|stop|status|url}"
        echo "  start  : 외부 접속 공개 URL 생성 및 터널 시작"
        echo "  stop   : 외부 접속 터널 안전 종료 및 차단"
        echo "  status : 현재 터널 상태 및 실행 여부 확인"
        echo "  url    : 현재 활성화된 외부 공개 URL 출력"
        exit 1
        ;;
esac

