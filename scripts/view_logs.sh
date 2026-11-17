#!/usr/bin/env bash
# ==============================================================================
# TravelMates Log4j 실시간 로그 확인 스크립트
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/travelmates.log"
ERROR_LOG_FILE="$PROJECT_DIR/logs/travelmates-error.log"

# 로그 디렉터리 생성 확인
mkdir -p "$PROJECT_DIR/logs"
touch "$LOG_FILE"
touch "$ERROR_LOG_FILE"

MODE="${1:-tail}"

case "$MODE" in
    tail|follow|-f)
        echo "📄 [TravelMates] 실시간 Log4j 로그 스트리밍 시작... (종료: Ctrl+C)"
        echo "   대상 로그 파일: $LOG_FILE"
        echo "------------------------------------------------------------------"
        tail -f "$LOG_FILE"
        ;;
    error|err|-e)
        echo "🚨 [TravelMates] 실시간 에러(ERROR) 로그 스트리밍 시작... (종료: Ctrl+C)"
        echo "   대상 에러 파일: $ERROR_LOG_FILE"
        echo "------------------------------------------------------------------"
        tail -f "$ERROR_LOG_FILE"
        ;;
    recent|last|-n)
        LINES="${2:-50}"
        echo "📋 [TravelMates] 최근 ${LINES}줄 로그 확인:"
        echo "------------------------------------------------------------------"
        tail -n "$LINES" "$LOG_FILE"
        ;;
    clear)
        > "$LOG_FILE"
        > "$ERROR_LOG_FILE"
        echo "🧹 [완료] logs/travelmates.log 및 travelmates-error.log 초기화 완료"
        ;;
    help|--help|-h)
        echo "사용법: $0 [명령어]"
        echo "  tail (기본값) : 전체 실시간 로그 스트리밍 (tail -f logs/travelmates.log)"
        echo "  error         : 에러 전용 실시간 로그 스트리밍 (tail -f logs/travelmates-error.log)"
        echo "  recent [N]    : 최근 N줄 로그 확인 (기본 50줄)"
        echo "  clear         : 로그 파일 비우기"
        ;;
    *)
        echo "알 수 없는 옵션: $MODE"
        echo "사용법: $0 {tail|error|recent|clear}"
        exit 1
        ;;
esac
