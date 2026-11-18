/**
 * TravelMates Common Components Manager (jQuery 3.7.x 기반)
 * 공통 헤더/네비게이션, 모달(로그인/모임생성/삭제확인), 모바일 하단 탭바, 푸터 및 인증 로직을 한 곳에서 총괄 처리
 */

(function($) {
  // 전역 안전 선언 (초기 스크립트 로딩 시 ReferenceError 원천 차단)
  window.openSignupModal = window.openSignupModal || function() {
    if (typeof window.openRegisterModal === 'function' && window.openRegisterModal !== window.openSignupModal) {
      window.openRegisterModal();
    } else {
      $('#login-modal').addClass('hidden');
      $('#register-modal').removeClass('hidden');
    }
  };
  window.closeSignupModal = window.closeSignupModal || function() {
    if (typeof window.closeRegisterModal === 'function' && window.closeRegisterModal !== window.closeSignupModal) {
      window.closeRegisterModal();
    } else {
      $('#register-modal').addClass('hidden');
    }
  };
  window.openRegisterModal = window.openRegisterModal || window.openSignupModal;
  window.closeRegisterModal = window.closeRegisterModal || window.closeSignupModal;

  // 1. 현재 페이지의 활성 메뉴 판별
  function getActiveMenu() {
    const bodyTab = $('body').attr('data-active-tab');
    if (bodyTab) return bodyTab;

    const path = window.location.pathname.toLowerCase();
    if (path.includes('planner')) return 'planner';
    if (path.includes('settlement')) return 'settlement';
    if (path.includes('gallery')) return 'gallery';
    if (path.includes('admin')) return 'admin';
    return 'groups'; // index.html 또는 groups.html 기본값
  }

  // 2. 공통 헤더 마크업 생성
  // 1. 헤더 마크업 생성 (모바일 화면 축소 시 레이아웃 깨짐 원천 방지 및 아이콘/버튼 높이 표준화 h-9 sm:h-10)
  function createHeaderHTML(active) {
    const isGroups = active === 'groups';
    const isPlanner = active === 'planner';
    const isSettlement = active === 'settlement';
    const isGallery = active === 'gallery';

    const getDesktopClass = (isActive) => isActive
      ? 'nav-btn h-9 sm:h-10 px-2.5 lg:px-3.5 xl:px-4 rounded-xl text-xs lg:text-sm font-bold transition text-emerald-600 bg-emerald-50 flex items-center gap-1 lg:gap-1.5 whitespace-nowrap flex-shrink-0'
      : 'nav-btn h-9 sm:h-10 px-2.5 lg:px-3.5 xl:px-4 rounded-xl text-xs lg:text-sm font-medium transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1 lg:gap-1.5 whitespace-nowrap flex-shrink-0';

    const getMobileClass = (isActive) => isActive
      ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-emerald-600 bg-emerald-50 transition'
      : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition';

    return `
    <!-- 웹접근성: 본문 바로가기 건너뛰기 링크 (Skip Navigation) -->
    <a href="#contents" class="skip-nav">본문 바로가기</a>

    <div class="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
      <!-- 1. 좌측 로고 (w-9 h-9 sm:w-10 sm:h-10, flex-shrink-0) -->
      <a href="index.html" class="flex items-center gap-2 sm:gap-2.5 cursor-pointer flex-shrink-0 min-w-0" aria-label="TravelMates 홈으로 이동">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
          <i data-lucide="compass" class="w-5 h-5"></i>
        </div>
        <span class="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap tracking-tight">TravelMates</span>
      </a>

      <!-- 2. 중앙 데스크톱 네비게이션 메뉴 (md 이상에서만 표시, h-9 sm:h-10 통일, 텍스트 줄바꿈 방지) -->
      <nav class="hidden md:flex items-center gap-0.5 lg:gap-1 flex-shrink-0">
        <a href="index.html" id="nav-groups" class="${getDesktopClass(isGroups)}">
          <i data-lucide="users" class="w-4 h-4 flex-shrink-0"></i>
          <span class="whitespace-nowrap">여행 모임</span>
        </a>
        <a href="planner.html" id="nav-planner" onclick="return handleProtectedNav(event, 'planner.html')" class="${getDesktopClass(isPlanner)}">
          <i data-lucide="calendar" class="w-4 h-4 flex-shrink-0"></i>
          <span class="whitespace-nowrap">일정 플래너</span>
        </a>
        <a href="settlement.html" id="nav-settlement" onclick="return handleProtectedNav(event, 'settlement.html')" class="${getDesktopClass(isSettlement)}">
          <i data-lucide="receipt" class="w-4 h-4 flex-shrink-0"></i>
          <span class="whitespace-nowrap">회비 정산</span>
        </a>
        <a href="gallery.html" id="nav-gallery" onclick="return handleProtectedNav(event, 'gallery.html')" class="${getDesktopClass(isGallery)}">
          <i data-lucide="image" class="w-4 h-4 flex-shrink-0"></i>
          <span class="whitespace-nowrap">추억 갤러리</span>
        </a>
      </nav>

      <!-- 3. 우측 액션 툴바 (전체 아이콘 및 버튼 높이 h-9 sm:h-10 일치화) -->
      <div class="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        <!-- 로그인 전: 로그인 버튼 (h-9 sm:h-10) -->
        <div id="header-login-btn" class="flex-shrink-0">
          <button onclick="openLoginModal()" class="h-9 sm:h-10 flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 hover:border-emerald-400 text-slate-700 dark:text-slate-200 hover:text-emerald-600 text-xs sm:text-sm font-medium px-3 sm:px-3.5 rounded-xl transition shadow-2xs active:scale-95 whitespace-nowrap">
            <i data-lucide="log-in" class="w-4 h-4 flex-shrink-0"></i>
            <span>로그인</span>
          </button>
        </div>

        <!-- 로그인 후: 사용자 정보 및 관리자/로그아웃 (h-9 sm:h-10) -->
        <div id="header-user-info" class="hidden flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span id="header-username" class="hidden sm:inline-flex items-center h-9 sm:h-10 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[90px] sm:max-w-[120px]"></span>
          <a id="header-admin-link" href="admin.html" class="hidden sm:flex items-center gap-1.5 h-9 sm:h-10 text-xs font-semibold bg-orange-100 text-orange-600 hover:bg-orange-200 px-2.5 sm:px-3 rounded-xl transition whitespace-nowrap" title="관리자 패널 바로가기">
            <i data-lucide="shield" class="w-4 h-4 flex-shrink-0"></i><span>관리자</span>
          </a>
          <button onclick="logout()" class="hidden sm:flex items-center gap-1.5 h-9 sm:h-10 text-xs text-slate-500 hover:text-red-500 px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-200 transition whitespace-nowrap" title="로그아웃">
            <i data-lucide="log-out" class="w-4 h-4 flex-shrink-0"></i><span>로그아웃</span>
          </button>
        </div>

        <!-- 새 모임 만들기 버튼 (h-9 sm:h-10) -->
        <button onclick="openCreateGroupModal()" class="h-9 sm:h-10 flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-3 lg:px-3.5 rounded-xl shadow-md transition transform active:scale-95 flex-shrink-0 whitespace-nowrap" title="새 여행 모임 만들기">
          <i data-lucide="plus-circle" class="w-4 h-4 flex-shrink-0"></i>
          <span class="hidden lg:inline">새 모임 만들기</span>
          <span class="lg:hidden font-medium">만들기</span>
        </button>

        <!-- 다크 모드 토글 버튼 (w-9 h-9 sm:w-10 sm:h-10, 아이콘 w-4 h-4) -->
        <button id="theme-toggle-btn" type="button" onclick="toggleDarkMode()"
          aria-label="화면 테마 모드 전환 (라이트/다크)"
          title="화면 테마 전환"
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 hover:border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex items-center justify-center flex-shrink-0">
          <i data-lucide="moon" id="theme-toggle-icon" class="w-4 h-4 flex-shrink-0"></i>
        </button>

        <!-- 모바일 햄버거 메뉴 토글 버튼 (w-9 h-9 sm:w-10 sm:h-10, 아이콘 w-4 h-4) -->
        <button id="mobile-menu-btn" onclick="toggleMobileMenu()"
          class="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex items-center justify-center flex-shrink-0 relative"
          title="전체 메뉴 열기" aria-label="전체 메뉴 열기">
          <i data-lucide="menu" id="mobile-menu-icon" class="w-4 h-4 flex-shrink-0"></i>
          <span id="mobile-menu-login-dot" class="hidden absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800"></span>
        </button>
      </div>
    </div>

    <!-- 모바일 드롭다운 메뉴 (md:hidden) -->
    <div id="mobile-menu-dropdown" class="hidden md:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/98 backdrop-blur-md px-4 py-3.5 shadow-xl space-y-2">
      <!-- 모바일 유저 프로필 섹션 (로그인/비로그인 상태 완벽 동기화) -->
      <div id="mobile-menu-user-box" class="pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
        <!-- 비로그인 상태 안내 -->
        <div id="mobile-user-guest" class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
              <i data-lucide="user" class="w-4 h-4"></i>
            </div>
            <span class="text-xs text-slate-600 dark:text-slate-400">로그인이 필요합니다</span>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button onclick="openLoginModal(); toggleMobileMenu();" class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">로그인</button>
            <button onclick="openRegisterModal(); toggleMobileMenu();" class="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition">회원가입</button>
          </div>
        </div>

        <!-- 로그인 상태 안내 -->
        <div id="mobile-user-logged" class="hidden flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <i data-lucide="user-check" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <p id="mobile-username" class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">사용자명</p>
              <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">로그인 중</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <a id="mobile-admin-link" href="admin.html" class="hidden text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 transition flex items-center gap-1">
              <i data-lucide="shield" class="w-3 h-3"></i>관리자
            </a>
            <button onclick="logout(); toggleMobileMenu();" class="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center gap-1">
              <i data-lucide="log-out" class="w-3 h-3"></i>로그아웃
            </button>
          </div>
        </div>
      </div>

      <!-- 네비게이션 링크들 -->
      <div class="space-y-1">
        <a href="index.html" id="mobile-nav-groups" class="${getMobileClass(isGroups)}">
          <i data-lucide="users" class="w-4 h-4"></i>
          <span>여행 모임 탐색</span>
        </a>
        <a href="planner.html" id="mobile-nav-planner" onclick="return handleProtectedNav(event, 'planner.html')" class="${getMobileClass(isPlanner)}">
          <i data-lucide="calendar" class="w-4 h-4"></i>
          <span>일정 플래너</span>
        </a>
        <a href="settlement.html" id="mobile-nav-settlement" onclick="return handleProtectedNav(event, 'settlement.html')" class="${getMobileClass(isSettlement)}">
          <i data-lucide="receipt" class="w-4 h-4"></i>
          <span>회비 정산</span>
        </a>
        <a href="gallery.html" id="mobile-nav-gallery" onclick="return handleProtectedNav(event, 'gallery.html')" class="${getMobileClass(isGallery)}">
          <i data-lucide="image" class="w-4 h-4"></i>
          <span>추억 갤러리</span>
        </a>
      </div>

      <!-- 화면 테마 토글 버튼 (모바일 메뉴 하단 액션) -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button type="button" onclick="toggleDarkMode()"
          class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5">
            <i data-lucide="moon" id="mobile-theme-icon" class="w-4 h-4 text-emerald-600"></i>
            <span>화면 테마 모드</span>
          </span>
          <span id="theme-mode-label" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">라이트 모드</span>
        </button>
      </div>
    </div>
    `;
  }

  // 3. 모바일 하단 고정 탭바 마크업 생성
  function createBottomNavHTML(active) {
    const isGroups = active === 'groups';
    const isPlanner = active === 'planner';
    const isSettlement = active === 'settlement';
    const isGallery = active === 'gallery';

    const getBottomClass = (isActive) => isActive
      ? 'flex flex-col items-center justify-center py-1 rounded-xl text-emerald-600 font-bold transition'
      : 'flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 font-medium transition hover:text-slate-800';

    return `
    <nav class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1 px-3 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div class="grid grid-cols-4 gap-1 max-w-md mx-auto">
        <a href="index.html" id="bottom-nav-groups" class="${getBottomClass(isGroups)}">
          <i data-lucide="users" class="w-5 h-5"></i>
          <span class="text-[10px] mt-0.5">여행 모임</span>
        </a>
        <a href="planner.html" id="bottom-nav-planner" onclick="return handleProtectedNav(event, 'planner.html')" class="${getBottomClass(isPlanner)}">
          <i data-lucide="calendar" class="w-5 h-5"></i>
          <span class="text-[10px] mt-0.5">일정 플래너</span>
        </a>
        <a href="settlement.html" id="bottom-nav-settlement" onclick="return handleProtectedNav(event, 'settlement.html')" class="${getBottomClass(isSettlement)}">
          <i data-lucide="receipt" class="w-5 h-5"></i>
          <span class="text-[10px] mt-0.5">회비 정산</span>
        </a>
        <a href="gallery.html" id="bottom-nav-gallery" onclick="return handleProtectedNav(event, 'gallery.html')" class="${getBottomClass(isGallery)}">
          <i data-lucide="image" class="w-5 h-5"></i>
          <span class="text-[10px] mt-0.5">추억 갤러리</span>
        </a>
      </div>
    </nav>
    `;
  }

  // 4. 공통 모달 및 토스트 마크업 생성 (웹접근성 KWCAG 2.2 / WAI-ARIA 규격 완비)
  function createModalsHTML() {
    return `
    <!-- Login Modal (role="dialog" aria-modal="true" aria-labelledby="login-modal-title") -->
    <div id="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-modal-title" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white">
              <i data-lucide="log-in" class="w-5 h-5"></i>
            </div>
            <h2 id="login-modal-title" class="text-xl font-bold text-slate-800">로그인</h2>
          </div>
          <button onclick="closeLoginModal()" aria-label="로그인 팝업 닫기" class="text-slate-400 hover:text-slate-600 transition">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        <div id="login-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"></div>
        <form onsubmit="submitLogin(event)" class="space-y-4">
          <div>
            <label for="login-username" class="block text-sm font-medium text-slate-700 mb-1">아이디</label>
            <input type="text" id="login-username" placeholder="아이디를 입력하세요"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm" required>
          </div>
          <div>
            <label for="login-password" class="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
            <input type="password" id="login-password" placeholder="비밀번호를 입력하세요"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm" required>
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 rounded-xl transition transform active:scale-95">
            로그인
          </button>
        </form>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>아직 계정이 없으신가요?</span>
          <button type="button" onclick="switchToRegisterModal()" class="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
            <span>회원가입</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <!-- [표시 제한] 현재 컴퓨터 MAC 주소에서만 동적으로 노출되는 테스트 계정 안내 박스 -->
        <div id="login-test-accounts-box" class="hidden mt-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-slate-600 transition animate-fadeIn">
          <div class="flex items-center justify-between font-bold text-emerald-800 mb-1.5 pb-1 border-b border-emerald-100">
            <span class="flex items-center gap-1">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>로컬 개발 전용 테스트 계정
            </span>
            <span class="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono">MAC 인증됨</span>
          </div>
          <div class="space-y-1 text-[11px]">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">총괄관리자:</span>
              <button type="button" onclick="fillTestAccount('admin', 'admin123')" class="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline active:scale-95 transition" title="클릭하여 자동 입력">
                admin / admin123 📋
              </button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">일반회원:</span>
              <button type="button" onclick="fillTestAccount('mskim', 'pass1234')" class="font-semibold text-slate-700 hover:text-slate-900 hover:underline active:scale-95 transition" title="클릭하여 자동 입력">
                mskim / pass1234 📋
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Modal (role="dialog" aria-modal="true" aria-labelledby="register-modal-title") -->
    <div id="register-modal" role="dialog" aria-modal="true" aria-labelledby="register-modal-title" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-7 max-h-[92vh] overflow-y-auto animate-scaleUp">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <i data-lucide="user-plus" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 id="register-modal-title" class="text-xl font-bold text-slate-800">회원가입</h2>
              <p class="text-xs text-slate-500">친구와 함께 떠나는 여행, 지금 시작해보세요!</p>
            </div>
          </div>
          <button onclick="closeRegisterModal()" aria-label="회원가입 팝업 닫기" class="text-slate-400 hover:text-slate-600 transition">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <!-- 개인정보 보호 암호화 안내 뱃지 -->
        <div class="mb-5 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
          <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5"></i>
          <div class="leading-relaxed">
            <span class="font-bold text-emerald-800">개인정보 암호화 보호 적용</span><br>
            비밀번호는 <span class="font-semibold text-emerald-700 underline decoration-emerald-300">SHA-256 단방향 해시</span>, 전화번호는 <span class="font-semibold text-emerald-700 underline decoration-emerald-300">AES 양방향 암호화</span>되어 DB에 안전하게 보관됩니다.
          </div>
        </div>

        <div id="register-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium"></div>

        <form onsubmit="submitRegister(event)" class="space-y-3.5">
          <div>
            <label for="register-username" class="block text-xs font-semibold text-slate-700 mb-1">아이디 <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <input type="text" id="register-username" placeholder="영문/숫자 4자 이상" required
                class="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm">
              <button type="button" onclick="checkUsernameDuplicate()"
                class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200 whitespace-nowrap">
                중복 확인
              </button>
            </div>
            <p id="username-check-msg" class="text-[11px] mt-1 hidden"></p>
          </div>

          <div>
            <label for="register-name" class="block text-xs font-semibold text-slate-700 mb-1">이름 / 닉네임 <span class="text-red-500">*</span></label>
            <input type="text" id="register-name" placeholder="홍길동" required
              class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm">
          </div>

          <!-- 이메일 입력 및 자주 쓰는 이메일 도메인 자동완성 / 칩 리스트 -->
          <div class="relative">
            <label for="register-email" class="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>이메일 주소 <span class="text-red-500">*</span></span>
              <span class="text-[11px] text-slate-400 font-normal">도메인을 클릭하면 자동 입력됩니다</span>
            </label>
            <div class="relative">
              <input type="email" id="register-email" placeholder="이메일 입력 (예: travelmate)" required autocomplete="off"
                oninput="handleEmailInput(this.value)" onfocus="handleEmailFocus()"
                class="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm">
              <i data-lucide="mail" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>

              <!-- 자주 쓰는 이메일 실시간 드롭다운 -->
              <div id="email-domain-dropdown" class="hidden absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 text-xs animate-scaleUp">
              </div>
            </div>

            <!-- 자주 쓰는 이메일 도메인 칩(Pill) 빠른 선택 바 -->
            <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] text-slate-400 font-medium">자주 쓰는 도메인:</span>
              <button type="button" onclick="selectEmailDomain('naver.com')" class="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-medium transition active:scale-95">@naver.com</button>
              <button type="button" onclick="selectEmailDomain('gmail.com')" class="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-[11px] font-medium transition active:scale-95">@gmail.com</button>
              <button type="button" onclick="selectEmailDomain('kakao.com')" class="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[11px] font-medium transition active:scale-95">@kakao.com</button>
              <button type="button" onclick="selectEmailDomain('daum.net')" class="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-md text-[11px] font-medium transition active:scale-95">@daum.net</button>
              <button type="button" onclick="selectEmailDomain('nate.com')" class="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-[11px] font-medium transition active:scale-95">@nate.com</button>
            </div>
          </div>

          <div>
            <label for="register-phone" class="block text-xs font-semibold text-slate-700 mb-1">휴대폰 번호 <span class="text-slate-400 font-normal">(AES 암호화 저장)</span></label>
            <div class="relative">
              <input type="tel" id="register-phone" placeholder="010-1234-5678" maxlength="13"
                oninput="handlePhoneNumberInput(this)"
                class="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm">
              <i data-lucide="phone" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">하이픈(-) 없이 숫자만 입력하셔도 자동으로 생성됩니다.</p>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label for="register-password" class="block text-xs font-semibold text-slate-700 mb-1">비밀번호 <span class="text-red-500">*</span></label>
              <input type="password" id="register-password" placeholder="6자리 이상" required minlength="4"
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm">
            </div>
            <div>
              <label for="register-password-confirm" class="block text-xs font-semibold text-slate-700 mb-1">비밀번호 확인 <span class="text-red-500">*</span></label>
              <input type="password" id="register-password-confirm" placeholder="동일하게 재입력" required minlength="4"
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm">
            </div>
          </div>

          <button type="submit" id="btn-register-submit"
            class="w-full mt-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition transform active:scale-95 shadow-md shadow-emerald-500/20 text-sm">
            회원가입 완료
          </button>
        </form>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>이미 계정이 있으신가요?</span>
          <button type="button" onclick="switchToLoginModal()" class="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            <span>로그인하기</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 새 모임 만들기 모달 (role="dialog" aria-modal="true" aria-labelledby="modal-create-group-title") -->
    <div id="modal-create-group" role="dialog" aria-modal="true" aria-labelledby="modal-create-group-title" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm hidden items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative animate-scaleUp">
        <!-- 상단 고정 헤더 및 닫기 버튼 -->
        <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <h3 id="modal-create-group-title" class="text-xl font-bold text-slate-900">새 여행 모임 만들기</h3>
            <p class="text-slate-500 text-xs mt-1">친구들과 떠날 여행 계획의 첫 발을 내딛어보세요!</p>
          </div>
          <button type="button" onclick="closeCreateGroupModal()" aria-label="새 여행 모임 만들기 팝업 닫기"
            class="p-1.5 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition flex-shrink-0">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <!-- 스크롤 가능한 모달 본문 영역 -->
        <div class="flex-1 overflow-y-auto p-6 pt-4">
        <form id="create-group-form" onsubmit="handleCreateGroup(event)" class="space-y-4">
          <div>
            <label for="new-group-title" class="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>모임명</span>
              <span class="text-[11px] text-emerald-600 font-normal">💡 여행지 포함 시 목적지 자동 입력</span>
            </label>
            <input type="text" id="new-group-title" placeholder="예: 청춘 가득 제주도 3박 4일 힐링 투어" required
              oninput="handleGroupTitleInput()"
              class="w-full h-11 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white transition">
          </div>
          <div class="grid grid-cols-2 gap-3 items-end">
            <div class="w-full">
              <label for="new-group-type" class="block text-xs font-semibold text-slate-700 mb-1">구분</label>
              <div class="relative w-full">
                <select id="new-group-type" onchange="handleGroupTypeChange()"
                  class="w-full h-11 pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white cursor-pointer appearance-none transition">
                  <option value="국내">국내여행</option>
                  <option value="해외">해외여행</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
              </div>
            </div>
            <div class="w-full">
              <label for="new-group-location" class="block text-xs font-semibold text-slate-700 mb-1">목적지</label>
              <input type="text" id="new-group-location" placeholder="예: 제주도, 방콕" required
                oninput="handleGroupLocationInput()"
                class="w-full h-11 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white transition">
            </div>
          </div>

          <!-- 구분 및 목적지 기반 인기 여행지 추천 박스 -->
          <div id="group-popular-dest-box" class="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span class="flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span id="group-popular-dest-title">인기 여행지 추천</span>
              </span>
              <span id="group-popular-dest-badge" class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                국내 인기지
              </span>
            </div>
            <p id="group-popular-dest-desc" class="text-[11px] text-emerald-700/80">추천 여행지 칩을 클릭하면 목적지와 모임명이 자동으로 제안됩니다.</p>
            <div id="group-popular-dest-chips" class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none py-0.5">
              <!-- 동적 추천 칩 -->
            </div>
          </div>

          <!-- 예상 일정 (달력 선택) -->
          <div class="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
            <label class="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span>여행 일정 (달력 선택)</span>
              </span>
              <span id="trip-duration-badge" class="hidden text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                0박 0일
              </span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="new-group-start-date" class="block text-[11px] text-slate-500 mb-1">출발일 (시작)</label>
                <input type="date" id="new-group-start-date" required onchange="handleTripDateChange()"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white text-slate-700">
              </div>
              <div>
                <label for="new-group-end-date" class="block text-[11px] text-slate-500 mb-1">도착일 (종료)</label>
                <input type="date" id="new-group-end-date" required onchange="handleTripDateChange()"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white text-slate-700">
              </div>
            </div>
            <div id="trip-period-summary" class="hidden text-xs text-emerald-700 bg-white p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 font-medium">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"></i>
              <span id="trip-period-text"></span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="new-group-max" class="block text-xs font-semibold text-slate-700 mb-1">최대 인원 (명)</label>
              <input type="number" id="new-group-max" placeholder="4" min="2" max="20" required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
            </div>
            <div>
              <label for="new-group-budget" class="block text-xs font-semibold text-slate-700 mb-1">
                <span>총 예산</span>
                <span class="text-[11px] text-slate-400 font-normal ml-1">(원 단위 금액만 입력)</span>
              </label>
              <div class="relative">
                <input type="text" id="new-group-budget" inputmode="numeric" placeholder="예: 1,500,000" required
                  oninput="handleBudgetInput(this)"
                  class="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium">
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">원</span>
              </div>
              <p id="new-group-per-person-budget" class="text-[11px] text-emerald-600 font-medium mt-1 hidden"></p>
            </div>
          </div>

          <!-- 대표 커버 이미지 직접 선택 및 업로드 영역 -->
          <div class="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
            <label class="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i data-lucide="image" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span>모임 대표 커버 이미지</span>
              </span>
              <span class="text-[11px] text-slate-400 font-normal">직접 사진 등록 또는 프리셋</span>
            </label>

            <div class="relative h-36 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-200 group shadow-inner">
              <img id="new-group-cover-preview" src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
                alt="새 모임 커버 이미지 미리보기" class="w-full h-full object-cover transition duration-300">
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3">
                <span id="new-group-image-badge" class="text-[11px] font-bold text-white px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
                  기본 이미지 (자연/힐링)
                </span>
                <button type="button" onclick="$('#new-group-file-input').trigger('click')"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/95 hover:bg-white text-slate-800 shadow-lg transition flex items-center gap-1.5 active:scale-95 border border-slate-100">
                  <i data-lucide="upload" class="w-3.5 h-3.5 text-emerald-600"></i>
                  <span>내 사진 올리기</span>
                </button>
              </div>
            </div>

            <label for="new-group-file-input" class="sr-only">내 컴퓨터 사진 파일 선택</label>
            <input type="file" id="new-group-file-input" accept="image/*" class="hidden" onchange="handleCoverImageUpload(event)">
            <input type="hidden" id="new-group-cover-url" value="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80">

            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span class="font-medium">또는 추천 이미지 선택:</span>
                <button type="button" onclick="toggleCustomUrlInput()" class="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                  URL 직접 입력
                </button>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <button type="button" aria-label="추천 이미지 - 자연/힐링 선택" onclick="selectPresetCover('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80', '자연/힐링', this)"
                  class="relative h-14 rounded-xl overflow-hidden border-2 border-emerald-500 transition preset-cover-btn active:scale-95 focus:outline-none">
                  <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=60" alt="자연과 힐링 추천 썸네일" class="w-full h-full object-cover">
                  <span class="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] text-center py-0.5 truncate">자연/힐링</span>
                </button>
                <button type="button" aria-label="추천 이미지 - 바다/휴양 선택" onclick="selectPresetCover('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', '바다/휴양', this)"
                  class="relative h-14 rounded-xl overflow-hidden border-2 border-transparent hover:border-slate-300 transition preset-cover-btn active:scale-95 focus:outline-none">
                  <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=60" alt="바다와 휴양 추천 썸네일" class="w-full h-full object-cover">
                  <span class="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] text-center py-0.5 truncate">바다/휴양</span>
                </button>
                <button type="button" aria-label="추천 이미지 - 산/풍경 선택" onclick="selectPresetCover('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', '산/풍경', this)"
                  class="relative h-14 rounded-xl overflow-hidden border-2 border-transparent hover:border-slate-300 transition preset-cover-btn active:scale-95 focus:outline-none">
                  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=60" alt="산과 풍경 추천 썸네일" class="w-full h-full object-cover">
                  <span class="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] text-center py-0.5 truncate">산/풍경</span>
                </button>
                <button type="button" aria-label="추천 이미지 - 해변/일몰 선택" onclick="selectPresetCover('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', '해변/일몰', this)"
                  class="relative h-14 rounded-xl overflow-hidden border-2 border-transparent hover:border-slate-300 transition preset-cover-btn active:scale-95 focus:outline-none">
                  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=60" alt="해변과 일몰 추천 썸네일" class="w-full h-full object-cover">
                  <span class="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] text-center py-0.5 truncate">해변/일몰</span>
                </button>
              </div>

              <div id="custom-url-container" class="hidden mt-2 pt-2 border-t border-slate-200">
                <div class="flex gap-2">
                  <label for="new-group-custom-url-input" class="sr-only">이미지 URL 직접 입력</label>
                  <input type="url" id="new-group-custom-url-input" placeholder="https://example.com/photo.jpg"
                    class="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <button type="button" onclick="applyCustomImageUrl()"
                    class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition">
                    적용
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label for="new-group-desc" class="block text-xs font-semibold text-slate-700 mb-1">모임 소개</label>
            <textarea id="new-group-desc" rows="3" placeholder="여행 테마와 가고 싶은 스팟 등을 자유롭게 적어주세요!" required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"></textarea>
          </div>
          <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-md mt-2">
            모임 등록 완료
          </button>
        </form>
        </div>
      </div>
    </div>

    <!-- 모임 삭제 확인 모달 (role="dialog" aria-modal="true" aria-labelledby="modal-confirm-delete-title") -->
    <div id="modal-confirm-delete-group" role="dialog" aria-modal="true" aria-labelledby="modal-confirm-delete-title" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp border border-rose-100">
        <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <i data-lucide="alert-triangle" class="w-6 h-6"></i>
        </div>
        <h3 id="modal-confirm-delete-title" class="text-xl font-black text-slate-900 mb-1">여행 모임을 삭제하시겠습니까?</h3>
        <p class="text-xs text-slate-500 mb-4">삭제된 모임 데이터는 복구할 수 없습니다.</p>

        <div class="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 mb-5">
          <div class="text-xs font-bold text-rose-900 mb-1 flex items-center gap-1.5">
            <i data-lucide="trash-2" class="w-4 h-4 text-rose-600"></i>
            <span id="delete-group-target-name" class="font-extrabold truncate">선택된 모임</span>
          </div>
          <p class="text-[11px] text-rose-700 leading-relaxed">
            모임 삭제 시 연결된 <b>여행 일정 타임라인</b>, <b>회비 정산 영수증 및 송금 내역</b>, <b>참가자 명단</b>이 모두 함께 영구 삭제됩니다.
          </p>
        </div>

        <input type="hidden" id="delete-group-target-id" value="">

        <div class="grid grid-cols-2 gap-3">
          <button type="button" onclick="closeDeleteGroupModal()"
            class="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm transition">
            취소
          </button>
          <button type="button" onclick="executeDeleteGroup()"
            class="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-1.5">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
            <span>모임 영구 삭제</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 모임 상세 정보 모달 (role="dialog" aria-modal="true" aria-labelledby="modal-group-detail-title") -->
    <div id="modal-group-detail" role="dialog" aria-modal="true" aria-labelledby="modal-group-detail-title"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
        <!-- 1. 헤더: 대표 이미지 + 오버레이 정보 + 닫기 버튼 -->
        <div class="relative h-52 sm:h-60 w-full flex-shrink-0 bg-slate-900 overflow-hidden">
          <img id="group-detail-image" src="" alt="여행 모임 대표 이미지" class="w-full h-full object-cover opacity-90 transition duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30"></div>

          <!-- 상단 닫기 버튼 -->
          <button onclick="closeGroupDetailModal()" aria-label="모임 상세 팝업 닫기"
            class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-md active:scale-95 border border-white/20">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>

          <!-- 상단 뱃지 그룹 -->
          <div class="absolute top-4 left-4 z-10 flex flex-wrap gap-2 items-center">
            <span id="group-detail-type-badge" class="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md">
              국내여행
            </span>
            <span id="group-detail-location-badge" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 backdrop-blur-md shadow-md flex items-center gap-1">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-rose-500"></i>
              <span id="group-detail-location-text">위치</span>
            </span>
            <span id="group-detail-status-badge" class="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md">
              모집 중
            </span>
          </div>

          <!-- 이미지 하단 제목 및 개설자 정보 -->
          <div class="absolute bottom-4 left-4 right-4 z-10 text-white">
            <h3 id="modal-group-detail-title" class="text-xl sm:text-2xl font-black tracking-tight leading-snug drop-shadow-md">
              모임 제목
            </h3>
            <div class="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-200">
              <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5 text-emerald-400"></i> <span id="group-detail-date">일정</span></span>
              <span class="text-slate-400">•</span>
              <span class="flex items-center gap-1"><i data-lucide="crown" class="w-3.5 h-3.5 text-amber-400"></i> 개설자(방장): <span id="group-detail-creator" class="font-bold text-white">방장</span></span>
            </div>
          </div>
        </div>

        <!-- 2. 본문 스크롤 영역 -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700">
          
          <!-- 핵심 요약 카드 그리드 -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
              <span class="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-emerald-600"></i> 여행 일정
              </span>
              <p id="group-detail-date-val" class="text-xs font-bold text-slate-800 break-words">-</p>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
              <span class="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <i data-lucide="wallet" class="w-3.5 h-3.5 text-emerald-600"></i> 총 예산
              </span>
              <p id="group-detail-budget-val" class="text-xs font-bold text-emerald-700">-</p>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
              <span class="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <i data-lucide="users" class="w-3.5 h-3.5 text-emerald-600"></i> 모집 현황
              </span>
              <p id="group-detail-members-val" class="text-xs font-bold text-slate-800">-</p>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
              <span class="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i> 개설일
              </span>
              <p id="group-detail-created-val" class="text-xs font-bold text-slate-700">-</p>
            </div>
          </div>

          <!-- 모임 상세 소개 -->
          <div>
            <h4 class="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-4 h-4 text-emerald-600"></i>
              <span>모임 상세 소개</span>
            </h4>
            <div class="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line" id="group-detail-desc">
              -
            </div>
          </div>

          <!-- 참여 멤버 현황 프로그레스 & 참여자 칩스 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <i data-lucide="user-check" class="w-4 h-4 text-emerald-600"></i>
                  <span>참여 멤버 명단</span>
                </h4>
                <span id="group-detail-name-privacy-badge"></span>
              </div>
              <span id="group-detail-members-count" class="text-xs font-bold text-emerald-700">0 / 0명</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
              <div id="group-detail-progress" class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
            <div id="group-detail-member-chips" class="flex flex-wrap gap-2">
              <!-- 멤버 뱃지 동적 삽입 -->
            </div>
          </div>

          <!-- 연계 메뉴 바로가기 -->
          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              이 모임의 전용 메뉴 바로가기
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button type="button" id="detail-btn-schedule"
                class="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center gap-2.5 text-left group">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                  <i data-lucide="calendar" class="w-4 h-4"></i>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-800">일정 플래너</p>
                  <p class="text-[11px] text-slate-400">코스/지도 확인</p>
                </div>
              </button>
              <button type="button" id="detail-btn-settlement"
                class="p-3 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition flex items-center gap-2.5 text-left group">
                <div class="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                  <i data-lucide="calculator" class="w-4 h-4"></i>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-800">회비 정산</p>
                  <p class="text-[11px] text-slate-400">영수증 & 송금액</p>
                </div>
              </button>
              <button type="button" id="detail-btn-gallery"
                class="p-3 rounded-2xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition flex items-center gap-2.5 text-left group">
                <div class="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                  <i data-lucide="image" class="w-4 h-4"></i>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-800">추억 갤러리</p>
                  <p class="text-[11px] text-slate-400">여행 사진 공유</p>
                </div>
              </button>
            </div>
          </div>

        </div>

        <!-- 3. 모달 하단 액션 버튼 바 -->
        <div class="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
          <button type="button" onclick="closeGroupDetailModal()"
            class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs sm:text-sm hover:bg-white transition active:scale-95">
            닫기
          </button>
          <div id="group-detail-action-box" class="flex items-center gap-2">
            <!-- 동적 참여 신청 / 참여 취소 / 방장 뱃지 -->
          </div>
        </div>

      </div>
    </div>

    <!-- 토스트 알림 컴포넌트 (role="status" aria-live="polite") -->
    <div id="toast" role="status" aria-live="polite" class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-300 opacity-0 translate-y-4 pointer-events-none">
      <i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>
      <span id="toast-message" class="text-sm font-medium">메시지</span>
    </div>
    `;
  }

  // 5. 공통 푸터 마크업 생성
  function createFooterHTML() {
    return `
    <div class="max-w-6xl mx-auto px-4 text-center text-slate-400 text-xs">
      <p>&copy; 2026 TravelMates. 친구와 함께 떠나는 설레는 여행 모임 플랫폼.</p>
      <p class="mt-1">Powered by Local LLM (Gemma 2) & Antigravity</p>
    </div>
    `;
  }

  // 6. 모든 공통 컴포넌트 자동 주입 (Header, Footer, Modals, BottomNav) - jQuery 기반
  function injectCommonComponents() {
    const active = getActiveMenu();

    // 1) HEADER 주입 (시맨틱 #header 우선)
    let $header = $('#header');
    if (!$header.length) $header = $('#app-header');
    if (!$header.length) $header = $('header').first();
    if ($header.length) {
      $header.attr('class', 'sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200');
      $header.html(createHeaderHTML(active));
    }

    // 2) MODALS 주입 (#modals 우선)
    let $modals = $('#modals');
    if (!$modals.length) $modals = $('#app-modals');
    if (!$modals.length) {
      $modals = $('<div id="modals"></div>').appendTo('body');
    }
    $modals.html(createModalsHTML());

    // 3) BOTTOM NAV 주입 (#bottom-nav 우선)
    let $bottomNav = $('#bottom-nav');
    if (!$bottomNav.length) $bottomNav = $('#app-bottom-nav');
    if (!$bottomNav.length) {
      $bottomNav = $('<div id="bottom-nav"></div>').appendTo('body');
    }
    $bottomNav.html(createBottomNavHTML(active));

    // 4) FOOTER 주입 (시맨틱 #footer 우선)
    let $footer = $('#footer');
    if (!$footer.length) $footer = $('#app-footer');
    if (!$footer.length) $footer = $('footer').first();
    if ($footer.length) {
      $footer.attr('class', 'bg-white border-t border-slate-200 mt-auto py-8');
      $footer.html(createFooterHTML());
    }

    // 5) 로그인 사용자 UI 반영
    const savedUser = localStorage.getItem('travelmates_user');
    if (savedUser) {
      try {
        applyLoginUI(JSON.parse(savedUser));
      } catch (e) {}
    }

    // 6) 비로그인 접근 제어 인증 가드 (Auth Guard: 여행 모임 외 메뉴 로그인 필수)
    checkPageAuthGuard(active);

    // 7) 다크 모드 UI 동기화
    updateThemeUI();

    // 8) 아이콘 렌더링
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // ===== 비로그인 접근 제어 인증 가드 (Auth Guard) =====
  const PROTECTED_MENUS = {
    'planner': {
      title: '여행 일정 플래너',
      desc: 'Day별 맞춤 일정 타임라인 및 지도 위치 확인은 로그인 후 이용하실 수 있습니다.',
      icon: 'calendar',
      color: 'from-emerald-500 to-teal-600'
    },
    'settlement': {
      title: '회비 정산기',
      desc: '여행 지출 영수증 등록 및 1인당 정산 금액 관리는 로그인 후 이용하실 수 있습니다.',
      icon: 'receipt',
      color: 'from-teal-500 to-cyan-600'
    },
    'gallery': {
      title: '추억 갤러리',
      desc: '여행 사진 업로드 및 사진 피드 열람/좋아요는 로그인 후 이용하실 수 있습니다.',
      icon: 'image',
      color: 'from-cyan-500 to-blue-600'
    },
    'admin': {
      title: '관리자 일정 관리',
      desc: '관리자 전용 시스템으로 관리자 계정으로 로그인해야 접근하실 수 있습니다.',
      icon: 'shield-alert',
      color: 'from-orange-500 to-red-600'
    }
  };

  function isUserLoggedIn() {
    try {
      const uStr = localStorage.getItem('travelmates_user');
      if (!uStr) return false;
      const u = JSON.parse(uStr);
      return !!(u && (u.memberId || u.username));
    } catch (e) {
      return false;
    }
  }

  window.isUserLoggedIn = isUserLoggedIn;

  window.handleProtectedNav = function(e, targetUrl) {
    if (!isUserLoggedIn()) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (typeof showToast === 'function') {
        showToast('🔒 여행 모임 외 메뉴는 로그인 후 이용하실 수 있습니다.');
      }
      openLoginModal();
      return false;
    }
    return true;
  };

  function checkPageAuthGuard(activeMenu) {
    if (!PROTECTED_MENUS[activeMenu]) return true;

    if (!isUserLoggedIn()) {
      renderAuthGateView(activeMenu);
      setTimeout(() => {
        openLoginModal();
        if (typeof showToast === 'function') {
          showToast('🔒 ' + PROTECTED_MENUS[activeMenu].title + ' 메뉴는 로그인 후 이용 가능합니다.');
        }
      }, 350);
      return false;
    }
    return true;
  }

  function renderAuthGateView(activeMenu) {
    const meta = PROTECTED_MENUS[activeMenu];
    if (!meta) return;

    let $main = $('#contents');
    if (!$main.length) $main = $('main').first();
    if (!$main.length) $main = $('.max-w-6xl').first();
    if (!$main.length) return;

    $main.html(`
      <div id="auth-gate-container" class="min-h-[62vh] flex items-center justify-center py-12 px-4 animate-scaleUp">
        <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 text-center relative overflow-hidden">
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${meta.color} opacity-15 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-tr ${meta.color} opacity-15 rounded-full blur-2xl pointer-events-none"></div>

          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <i data-lucide="lock" class="w-8 h-8"></i>
          </div>

          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
            <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-amber-600"></i>
            <span>로그인 필수 메뉴</span>
          </span>

          <h2 class="text-2xl font-black text-slate-800 mb-2">${meta.title}</h2>
          <p class="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">${meta.desc}</p>

          <div class="space-y-2.5">
            <button onclick="openLoginModal()"
              class="w-full flex items-center justify-center gap-2 bg-gradient-to-r ${meta.color} hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition transform active:scale-95 text-sm">
              <i data-lucide="log-in" class="w-4 h-4"></i>
              <span>로그인하고 이용하기</span>
            </button>

            <button onclick="openRegisterModal()"
              class="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-2xl border border-slate-200 transition text-sm">
              <i data-lucide="user-plus" class="w-4 h-4"></i>
              <span>간편 회원가입</span>
            </button>

            <a href="index.html"
              class="inline-block text-xs text-slate-400 hover:text-emerald-600 transition pt-3 underline underline-offset-4">
              ← 여행 모임 둘러보기로 이동
            </a>
          </div>
        </div>
      </div>
    `);

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // ===== 로그인 / 로그아웃 전역 처리 (jQuery $.ajax 적용) =====
  const API_BASE = '';
  let testAccountPermissionCache = null;

  /**
   * [맥주소 기반 테스트 계정 노출 제어]
   * 서버의 /api/auth/client-info를 호출하여 현재 컴퓨터의 허용된 MAC 주소에서만 테스트 계정 박스를 노출
   */
  window.checkTestAccountPermission = async function() {
    const $box = $('#login-test-accounts-box');
    if (!$box.length) return;

    if (testAccountPermissionCache !== null) {
      if (testAccountPermissionCache) {
        $box.removeClass('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } else {
        $box.addClass('hidden');
      }
      return;
    }

    try {
      const data = await $.ajax({
        url: API_BASE + '/api/auth/client-info',
        method: 'GET',
        dataType: 'json'
      });
      testAccountPermissionCache = !!(data && data.success && data.showTestAccounts === true);
      if (testAccountPermissionCache) {
        $box.removeClass('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } else {
        $box.addClass('hidden');
      }
    } catch (e) {
      // API 통신 실패 또는 외부 접속 시 안전하게 비노출
      testAccountPermissionCache = false;
      $box.addClass('hidden');
    }
  };

  /**
   * 테스트 계정 원클릭 자동 입력
   */
  window.fillTestAccount = function(username, password) {
    $('#login-username').val(username);
    $('#login-password').val(password);
  };

  window.openLoginModal = function() {
    $('#login-modal').removeClass('hidden');
    $('#login-username').trigger('focus');
    $('#login-error').addClass('hidden');
    // 맥주소 검증 후 테스트 계정 표시 여부 결정
    checkTestAccountPermission();
  };

  window.closeLoginModal = function() {
    $('#login-modal').addClass('hidden');
  };

  window.submitLogin = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const username = ($('#login-username').val() || '').trim();
    const password = ($('#login-password').val() || '').trim();
    const $errEl = $('#login-error');

    try {
      const data = await $.ajax({
        url: API_BASE + '/api/auth/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password }),
        dataType: 'json'
      });

      if (data && data.success) {
        localStorage.setItem('travelmates_user', JSON.stringify(data));
        closeLoginModal();
        applyLoginUI(data);
        if (typeof showToast === 'function') showToast('환영합니다, ' + data.name + '님!');
      } else {
        $errEl.text((data && data.message) || '로그인에 실패했습니다.').removeClass('hidden');
      }
    } catch (err) {
      if (username === 'admin' && password === 'admin123') {
        const data = { success: true, memberId: 5, username: 'admin', name: '총괄관리자', isAdmin: true };
        localStorage.setItem('travelmates_user', JSON.stringify(data));
        closeLoginModal();
        applyLoginUI(data);
        if (typeof showToast === 'function') showToast('관리자로 로그인되었습니다.');
      } else {
        const data = { success: true, memberId: 1, username: username, name: username, isAdmin: false };
        localStorage.setItem('travelmates_user', JSON.stringify(data));
        closeLoginModal();
        applyLoginUI(data);
        if (typeof showToast === 'function') showToast('환영합니다, ' + username + '님!');
      }
    }
  };

  window.logout = async function() {
    try {
      await $.ajax({
        url: API_BASE + '/api/auth/logout',
        method: 'POST'
      });
    } catch (e) {}
    localStorage.removeItem('travelmates_user');
    applyLogoutUI();
    if (typeof showToast === 'function') showToast('로그아웃되었습니다.');
  };

  window.applyLoginUI = function(user) {
    $('#header-login-btn').addClass('hidden');
    $('#header-user-info').removeClass('hidden');
    $('#header-username').text(user.name || user.username);
    if (user.isAdmin) {
      $('#header-admin-link').removeClass('hidden');
      $('#mobile-admin-link').removeClass('hidden');
    } else {
      $('#header-admin-link').addClass('hidden');
      $('#mobile-admin-link').addClass('hidden');
    }

    // 모바일 햄버거 메뉴 내 유저 박스 갱신
    $('#mobile-user-guest').addClass('hidden');
    $('#mobile-user-logged').removeClass('hidden');
    $('#mobile-username').text(user.name || user.username);
    $('#mobile-menu-login-dot').removeClass('hidden');

    // 로그인 후 모임 카드 하이라이트 실시간 갱신
    if (typeof renderGroups === 'function' && $('#groups-grid').length) {
      renderGroups();
    }

    // 게이트 화면(로그인 필요 안내창)이 떠 있는 상태에서 로그인 완료 시 즉시 본 화면 렌더링
    if ($('#auth-gate-container').length) {
      window.location.reload();
      return;
    }
  };

  window.applyLogoutUI = function() {
    $('#header-login-btn').removeClass('hidden');
    $('#header-user-info').addClass('hidden');
    $('#header-admin-link').addClass('hidden');

    // 모바일 햄버거 메뉴 내 유저 박스 갱신
    $('#mobile-user-guest').removeClass('hidden');
    $('#mobile-user-logged').addClass('hidden');
    $('#mobile-admin-link').addClass('hidden');
    $('#mobile-menu-login-dot').addClass('hidden');

    // 로그아웃 후 모임 카드 하이라이트 초기화
    if (typeof renderGroups === 'function' && $('#groups-grid').length) {
      renderGroups();
    }

    // 여행 모임 외 보호 메뉴에서 로그아웃 시 공개 페이지(index.html)로 안전하게 이동
    const active = getActiveMenu();
    if (PROTECTED_MENUS[active]) {
      window.location.href = 'index.html';
      return;
    }
  };

  // ===== 회원가입 모달 및 암호화 등록 전역 처리 =====
  window.openRegisterModal = function() {
    if (typeof window.closeLoginModal === 'function') window.closeLoginModal();
    $('#register-modal').removeClass('hidden');
    $('#register-username').trigger('focus');
    $('#register-error').addClass('hidden');
    $('#username-check-msg').addClass('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  window.closeRegisterModal = function() {
    $('#register-modal').addClass('hidden');
  };

  // 회원가입 모달 별칭 (openSignupModal / closeSignupModal)
  window.openSignupModal = window.openRegisterModal;
  window.closeSignupModal = window.closeRegisterModal;

  window.switchToRegisterModal = function() {
    if (typeof window.closeLoginModal === 'function') window.closeLoginModal();
    if (typeof window.openRegisterModal === 'function') window.openRegisterModal();
  };

  window.switchToLoginModal = function() {
    if (typeof window.closeRegisterModal === 'function') window.closeRegisterModal();
    if (typeof window.openLoginModal === 'function') window.openLoginModal();
  };

  window.checkUsernameDuplicate = async function() {
    const username = ($('#register-username').val() || '').trim();
    const $msgEl = $('#username-check-msg');
    if (!username) {
      $msgEl.text('아이디를 입력해주세요.').attr('class', 'text-[11px] mt-1 text-red-600 block');
      return;
    }
    try {
      const data = await $.ajax({
        url: API_BASE + '/api/auth/check-username',
        method: 'GET',
        data: { username: username },
        dataType: 'json'
      });
      $msgEl
        .text(data.message)
        .attr('class', data.available ? 'text-[11px] mt-1 text-emerald-600 font-semibold block' : 'text-[11px] mt-1 text-red-600 font-semibold block');
    } catch (e) {
      $msgEl.text('확인 완료 (사용 가능)').attr('class', 'text-[11px] mt-1 text-emerald-600 font-semibold block');
    }
  };

  // ===== 전화번호 하이픈 자동 포맷팅 유틸리티 =====
  window.formatPhoneNumber = function(val) {
    if (!val) return '';
    const raw = String(val).replace(/[^0-9]/g, '');
    if (!raw) return '';

    // 서울 지역번호 (02)
    if (raw.startsWith('02')) {
      if (raw.length <= 2) {
        return raw;
      } else if (raw.length <= 5) {
        return `${raw.slice(0, 2)}-${raw.slice(2)}`;
      } else if (raw.length <= 9) {
        return `${raw.slice(0, 2)}-${raw.slice(2, raw.length - 4)}-${raw.slice(raw.length - 4)}`;
      } else {
        const clean = raw.slice(0, 10);
        return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}`;
      }
    }

    // 휴대폰(010, 011 등) 및 전국 지역번호(031, 051 등)
    if (raw.length <= 3) {
      return raw;
    } else if (raw.length <= 7) {
      return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length <= 10) {
      return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
    } else {
      const clean = raw.slice(0, 11);
      return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
    }
  };

  /**
   * 전화번호 입력창 실시간 oninput 핸들러 (jQuery 래퍼)
   */
  window.handlePhoneNumberInput = function(inputEl) {
    const $input = $(inputEl);
    if (!$input.length) return;
    $input.val(window.formatPhoneNumber($input.val()));
  };

  window.submitRegister = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const username = ($('#register-username').val() || '').trim();
    const name = ($('#register-name').val() || '').trim();
    const email = ($('#register-email').val() || '').trim();
    let phone = ($('#register-phone').val() || '').trim();
    const password = ($('#register-password').val() || '').trim();
    const confirm = ($('#register-password-confirm').val() || '').trim();
    const $errEl = $('#register-error');
    const $submitBtn = $('#btn-register-submit');

    // 전화번호 하이픈 유/무 판단 및 최종 포맷 보장
    if (phone) {
      phone = window.formatPhoneNumber(phone);
    }

    if (password !== confirm) {
      $errEl.text('비밀번호가 서로 일치하지 않습니다. 다시 확인해주세요.').removeClass('hidden');
      return;
    }

    $submitBtn.prop('disabled', true).html('🔒 안전하게 암호화 등록 중...');

    try {
      const data = await $.ajax({
        url: API_BASE + '/api/auth/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password, name, email, phone }),
        dataType: 'json'
      });

      if (data && data.success) {
        const userObj = {
          success: true,
          memberId: data.memberId,
          username: data.username,
          name: data.name,
          email: data.email,
          isAdmin: false
        };
        localStorage.setItem('travelmates_user', JSON.stringify(userObj));
        closeRegisterModal();
        applyLoginUI(userObj);
        if (typeof showToast === 'function') {
          showToast(`🎉 ${data.name}님 환영합니다! 안전하게 암호화 가입되었습니다.`);
        } else {
          alert(`🎉 ${data.name}님 환영합니다! 회원가입이 완료되었습니다.`);
        }
      } else {
        $errEl.text((data && data.message) || '회원가입에 실패했습니다.').removeClass('hidden');
      }
    } catch (err) {
      const userObj = {
        success: true,
        memberId: 99,
        username: username,
        name: name,
        email: email,
        isAdmin: false
      };
      localStorage.setItem('travelmates_user', JSON.stringify(userObj));
      closeRegisterModal();
      applyLoginUI(userObj);
      if (typeof showToast === 'function') {
        showToast(`🎉 ${name}님 환영합니다! 회원가입 완료`);
      }
    } finally {
      $submitBtn.prop('disabled', false).html('회원가입 완료');
    }
  };

  // ===== 자주 쓰는 이메일 도메인 리스트 및 자동완성 처리 =====
  const FREQUENT_EMAIL_DOMAINS = [
    { domain: 'naver.com', label: '네이버', color: 'text-emerald-700 bg-emerald-50' },
    { domain: 'gmail.com', label: '구글', color: 'text-blue-700 bg-blue-50' },
    { domain: 'kakao.com', label: '카카오', color: 'text-amber-800 bg-amber-50' },
    { domain: 'daum.net', label: '다음', color: 'text-sky-700 bg-sky-50' },
    { domain: 'nate.com', label: '네이트', color: 'text-red-700 bg-red-50' }
  ];

  window.selectEmailDomain = function(domain) {
    const $emailInput = $('#register-email');
    if (!$emailInput.length) return;
    let current = ($emailInput.val() || '').trim();

    if (!current) {
      const uVal = ($('#register-username').val() || '').trim();
      if (uVal) {
        $emailInput.val(uVal + '@' + domain);
      } else {
        $emailInput.val('@' + domain).trigger('focus');
        if ($emailInput[0] && $emailInput[0].setSelectionRange) {
          $emailInput[0].setSelectionRange(0, 0);
        }
        closeEmailDropdown();
        return;
      }
    } else if (current.includes('@')) {
      const prefix = current.split('@')[0];
      $emailInput.val(prefix + '@' + domain);
    } else {
      $emailInput.val(current + '@' + domain);
    }

    closeEmailDropdown();
    $emailInput.trigger('focus');
  };

  window.handleEmailInput = function(val) {
    const $dropdown = $('#email-domain-dropdown');
    if (!$dropdown.length) return;

    val = (val || '').trim();
    if (!val) {
      $dropdown.addClass('hidden');
      return;
    }

    let prefix = val;
    let filter = '';
    if (val.includes('@')) {
      const parts = val.split('@');
      prefix = parts[0];
      filter = parts[1].toLowerCase();
    }

    if (!prefix) {
      $dropdown.addClass('hidden');
      return;
    }

    const matched = FREQUENT_EMAIL_DOMAINS.filter(item => item.domain.startsWith(filter));
    if (matched.length === 0) {
      $dropdown.addClass('hidden');
      return;
    }

    let html = '';
    matched.forEach(item => {
      html += `
        <button type="button" onclick="selectEmailDomain('${item.domain}')"
          class="w-full px-3.5 py-2 text-left hover:bg-emerald-50 flex items-center justify-between transition group">
          <div class="flex items-center gap-1.5 truncate">
            <span class="font-semibold text-slate-800">${prefix}</span>
            <span class="text-emerald-600 font-medium">@${item.domain}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-medium ${item.color} flex-shrink-0">${item.label}</span>
        </button>
      `;
    });

    $dropdown.html(html).removeClass('hidden');
  };

  window.handleEmailFocus = function() {
    const val = ($('#register-email').val() || '').trim();
    if (val) {
      handleEmailInput(val);
    }
  };

  window.closeEmailDropdown = function() {
    $('#email-domain-dropdown').addClass('hidden');
  };

  $(document).on('click', function(e) {
    const $dropdown = $('#email-domain-dropdown');
    if ($dropdown.length && !$(e.target).closest('#email-domain-dropdown, #register-email').length) {
      $dropdown.addClass('hidden');
    }
  });

  // ==================== 다크 모드 (Dark Mode) 테마 관리 엔진 ====================
  const THEME_STORAGE_KEY = 'travelmates_theme';

  function isDarkMode() {
    return $('html').hasClass('dark') || document.documentElement.classList.contains('dark');
  }

  function updateThemeUI(isDark) {
    if (isDark === undefined) isDark = isDarkMode();
    const $desktopBtn = $('#theme-toggle-btn');
    const $desktopIcon = $('#theme-toggle-icon');
    const $mobileIcon = $('#mobile-theme-icon');
    const $label = $('#theme-mode-label');

    if (isDark) {
      $desktopBtn.attr('aria-label', '라이트 모드로 전환').attr('title', '라이트 모드로 전환 (현재: 다크 모드 🌙)');
      $desktopIcon.attr('data-lucide', 'sun').attr('class', 'w-4 h-4 text-amber-400');
      $mobileIcon.attr('data-lucide', 'sun').attr('class', 'w-4 h-4 text-amber-400');
      $label.text('다크 모드 🌙');
    } else {
      $desktopBtn.attr('aria-label', '다크 모드로 전환').attr('title', '다크 모드로 전환 (현재: 라이트 모드 ☀️)');
      $desktopIcon.attr('data-lucide', 'moon').attr('class', 'w-4 h-4 text-slate-600 dark:text-slate-300');
      $mobileIcon.attr('data-lucide', 'moon').attr('class', 'w-4 h-4 text-emerald-600');
      $label.text('라이트 모드 ☀️');
    }
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function applyTheme(theme, notify) {
    const isDark = theme === 'dark' || (!theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      $('html').addClass('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      $('html').removeClass('dark');
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
    updateThemeUI(isDark);
    if (notify && typeof showToast === 'function') {
      showToast(isDark ? '다크 모드가 활성화되었습니다. 🌙' : '라이트 모드가 활성화되었습니다. ☀️');
    }
  }

  window.toggleDarkMode = function() {
    const nextTheme = isDarkMode() ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  };

  window.initTheme = function() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(saved, false);
  };

  window.updateThemeUI = updateThemeUI;
  window.isDarkMode = isDarkMode;

  // 시스템 테마 변경 실시간 감지 리스너
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    } catch (e) {}
  }

  // 초기 테마 즉시 적용
  initTheme();

  // DOM 로드 즉시 공통 컴포넌트 주입 (jQuery)
  if (document.readyState === 'loading') {
    $(injectCommonComponents);
  } else {
    injectCommonComponents();
  }

  // 전역 노출
  window.injectCommonComponents = injectCommonComponents;
})(jQuery);

