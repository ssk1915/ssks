#!/usr/bin/env bash
# ==============================================================================
# TravelMates 외부 접속 URL 시작 스크립트 (Cloudflare Quick Tunnel)
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="/tmp/travelmates_tunnel.pid"
LOG_FILE="/tmp/travelmates_tunnel.log"
PORT=8080

echo "🚀 [TravelMates] 외부 접속 URL 발급 및 터널 시작 중..."

# 1. cloudflared 설치 여부 확인
if ! command -v cloudflared &> /dev/null; then
    echo "❌ [오류] cloudflared CLI 도구가 설치되어 있지 않습니다."
    echo "💡 Homebrew를 통해 설치할 수 있습니다: brew install cloudflared"
    exit 1
fi

# 2. 이미 실행 중인지 확인
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE" 2>/dev/null)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        echo "⚠️ [알림] 외부 터널이 이미 실행 중입니다 (PID: $PID)."
        # 기존 URL 확인
        EXISTING_URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$LOG_FILE" 2>/dev/null | tail -n 1)
        if [ -n "$EXISTING_URL" ]; then
            echo "🌐 [현재 접속 URL]: $EXISTING_URL"
        fi
        exit 0
    else
        rm -f "$PID_FILE"
    fi
fi

# 3. 로컬 8080 포트 활성 여부 체크 (선택 경고)
if ! lsof -i :$PORT > /dev/null 2>&1; then
    echo "⚠️ [주의] 로컬 웹 서버(포트 $PORT)가 현재 실행 중이 아닙니다."
    echo "💡 별도 터미널에서 로컬 서버를 먼저 시작하세요: python3 scripts/dev_server.py"
fi

# 4. 백그라운드로 Cloudflare Tunnel 실행
> "$LOG_FILE"
cloudflared tunnel --url "http://localhost:$PORT" > "$LOG_FILE" 2>&1 &
TUNNEL_PID=$!
echo "$TUNNEL_PID" > "$PID_FILE"

# 5. 접속 URL이 로그에 기록될 때까지 대기 (최대 15초)
echo -n "⏳ 외부 공개 URL 생성 대기 중"
PUBLIC_URL=""
for i in {1..15}; do
    if ! kill -0 "$TUNNEL_PID" 2>/dev/null; then
        echo ""
        echo "❌ [오류] cloudflared 프로세스가 예기치 않게 종료되었습니다."
        cat "$LOG_FILE"
        rm -f "$PID_FILE"
        exit 1
    fi

    PUBLIC_URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$LOG_FILE" 2>/dev/null | head -n 1)
    if [ -n "$PUBLIC_URL" ]; then
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# 6. 결과 출력
if [ -n "$PUBLIC_URL" ]; then
    echo "=================================================================="
    echo "🎉 [외부 접속 URL 발급 완료!]"
    echo ""
    echo "   🌐 공개 URL : $PUBLIC_URL"
    echo "   🔒 대상 포트 : http://localhost:$PORT"
    echo "   🆔 터널 PID  : $TUNNEL_PID"
    echo ""
    echo "👉 외부 모바일 기기 및 다른 PC 브라우저에서 위 주소로 바로 접속 가능합니다."
    echo "💡 터널 종료 시: ./scripts/stop_tunnel.sh"
    echo "=================================================================="
else
    echo "⚠️ [안내] 터널 프로세스는 실행되었으나(PID: $TUNNEL_PID), URL 감지에 시간이 걸리고 있습니다."
    echo "💡 로그 확인: cat $LOG_FILE"
fi

