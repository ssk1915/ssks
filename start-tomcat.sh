#!/bin/bash

# ========================================================
# TravelMates 톰캣(Tomcat) 서비스 실행 스크립트
# ========================================================

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$BASE_DIR/backend"

echo "=========================================================="
echo "🚀 TravelMates 톰캣(Tomcat) 서비스 시작 가이드"
echo "=========================================================="

# 1. 메이븐(Maven) 톰캣 플러그인 확인 및 실행
if command -v mvn &> /dev/null; then
    echo ">> [방법 1] Maven Tomcat 플러그인을 사용하여 서비스를 구동합니다..."
    echo ">> 주소: http://localhost:8080/"
    cd "$BACKEND_DIR"
    mvn tomcat7:run
    exit 0
fi

# 2. 독립형 톰캣(CATALINA_HOME) 환경 확인
if [ -n "$CATALINA_HOME" ] && [ -d "$CATALINA_HOME" ]; then
    echo ">> [방법 2] 시스템 톰캣(CATALINA_HOME=$CATALINA_HOME)을 발견했습니다."
    echo ">> WAR 파일을 $CATALINA_HOME/webapps/ 로 복사 및 기동합니다..."
    if [ -f "$BACKEND_DIR/target/travelmates.war" ]; then
        cp "$BACKEND_DIR/target/travelmates.war" "$CATALINA_HOME/webapps/"
        "$CATALINA_HOME/bin/catalina.sh" run
        exit 0
    fi
fi

# 3. 개발환경(Eclipse, IntelliJ, eGovFrame IDE) 연동 안내
echo ""
echo "💡 터미널에 Maven 또는 Tomcat 환경변수가 등록되지 않은 경우:"
echo "----------------------------------------------------------"
echo "1. 이클립스 / 전자정부 표준프레임워크 개발환경(eGovFrame Dev):"
echo "   - [Servers] 탭 -> [New Server] -> [Apache Tomcat v8.5/v9.0] 등록"
echo "   - 'backend' 프로젝트를 Add -> [Start] 클릭"
echo "   - 브라우저 접속: http://localhost:8080/travelmates/ 또는 http://localhost:8080/"
echo ""
echo "2. IntelliJ IDEA Ultimate:"
echo "   - [Run] -> [Edit Configurations] -> [Tomcat Server] -> [Local] 추가"
echo "   - Deployment 탭에서 'travelmates-backend:war exploded' 등록 후 실행"
echo ""
echo "3. Homebrew를 이용한 톰캣 설치 시 (터미널 실행):"
echo "   brew install maven tomcat"
echo "   cd backend && mvn tomcat7:run"
echo "=========================================================="

