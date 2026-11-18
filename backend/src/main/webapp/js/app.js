// TravelMates - Main Application Logic (with Tomcat REST API & Offline LocalStorage Sync)

/**
 * [보안 강화] XSS (Cross-Site Scripting) 방어용 HTML Entity 이스케이프 함수
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * [보안 강화] javascript:, vbscript: 등 악성 URL 스키마 차단 살균 함수
 */
function sanitizeUrl(url) {
  if (!url) return '';
  const clean = String(url).trim();
  if (/^(javascript|vbscript|data:(?!image\/))/i.test(clean)) {
    return 'about:blank';
  }
  return clean;
}

// ==================== 전역 안전 모달 함수 선언 (초기 스크립트 실행 시 ReferenceError 원천 차단) ====================
function openSignupModal() {
  if (typeof window.openRegisterModal === 'function' && window.openRegisterModal !== openSignupModal) {
    window.openRegisterModal();
  } else if ($('#register-modal').length) {
    if (typeof window.closeLoginModal === 'function') window.closeLoginModal();
    $('#register-modal').removeClass('hidden');
    $('#register-username').trigger('focus');
  }
}

function closeSignupModal() {
  if (typeof window.closeRegisterModal === 'function' && window.closeRegisterModal !== closeSignupModal) {
    window.closeRegisterModal();
  } else if ($('#register-modal').length) {
    $('#register-modal').addClass('hidden');
  }
}

function openLoginModal() {
  if (typeof window.openLoginModal === 'function' && window.openLoginModal !== openLoginModal) {
    window.openLoginModal();
  } else if ($('#login-modal').length) {
    $('#login-modal').removeClass('hidden');
    $('#login-username').trigger('focus');
  }
}

function closeLoginModal() {
  if (typeof window.closeLoginModal === 'function' && window.closeLoginModal !== closeLoginModal) {
    window.closeLoginModal();
  } else if ($('#login-modal').length) {
    $('#login-modal').addClass('hidden');
  }
}

// 브라우저 윈도우 전역 바인딩 즉시 수행
window.openSignupModal = openSignupModal;
window.closeSignupModal = closeSignupModal;
window.openRegisterModal = openSignupModal;
window.closeRegisterModal = closeSignupModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;

// Initial sample data
const DEFAULT_GROUPS = [
  {
    id: 'grp-1',
    groupId: 1,
    title: '태국 방콕 & 파타야 미식 힐링 투어',
    type: '해외',
    location: '태국 (방콕/파타야)',
    date: '2026.11.20 ~ 11.25 (4박 5일)',
    maxMembers: 4,
    currentMembers: 3,
    members: ['민수(방장)', '지훈', '서연'],
    createdBy: 1,
    budget: '약 800,000원',
    desc: '카오산로드 야시장 탐방, 마사지, 루프탑 바에서 야경을 함께 즐길 2030 친구 구해요!',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
    joined: false
  },
  {
    id: 'grp-2',
    groupId: 2,
    title: '제주도 동쪽 힐링 & 올레길 드라이브',
    type: '국내',
    location: '제주 (구좌/성산)',
    date: '2026.12.05 ~ 12.08 (3박 4일)',
    maxMembers: 4,
    currentMembers: 2,
    members: ['태호(방장)', '유진'],
    createdBy: 2,
    budget: '약 400,000원',
    desc: '렌터카 빌려서 해안도로 달리고 오션뷰 카페 및 흑돼지 뿌실 친구들 환영합니다.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    joined: false
  },
  {
    id: 'grp-3',
    groupId: 3,
    title: '강원도 양양 서핑 & 불멍 캠핑 트립',
    type: '국내',
    location: '강원 (양양 죽도해변)',
    date: '2026.11.14 ~ 11.16 (주말)',
    maxMembers: 6,
    currentMembers: 5,
    members: ['현우(방장)', '동욱', '수민', '은지', '준혁'],
    createdBy: 4,
    budget: '약 250,000원',
    desc: '초보자도 환영! 주말 양양에서 서핑 강습 받고 저녁엔 글램핑 바비큐 파티 해요.',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
    joined: false
  }
];

const DEFAULT_PLANS = {
  1: [
    { id: 'p-1', time: '10:00', place: '제주공항 집결 및 렌터카 인수', memo: '3번 게이트 앞 만남, 완전자차 가입' },
    { id: 'p-2', time: '12:30', place: '제주 흑돼지 고기국수 점심', memo: '자매국수 본점 웨이팅 확인' },
    { id: 'p-3', time: '15:00', place: '함덕 해수욕장 & 서우봉 산책', memo: '에메랄드빛 바다 배경 단체 사진 촬영' },
    { id: 'p-4', time: '18:30', place: '숙소 체크인 및 동문시장 야시장', memo: '딱새우회, 전복버터구이 포장해서 파티' }
  ],
  2: [
    { id: 'p-5', time: '09:30', place: '성산일출봉 하이킹', memo: '편한 운동화 필수, 왕복 약 50분 소요' },
    { id: 'p-6', time: '13:00', place: '구좌 당근케이크 오션뷰 카페', memo: '바다 전망 루프탑에서 힐링 타임' },
    { id: 'p-7', time: '16:00', place: '비자림 숲길 힐링 산책', memo: '피톤치드 가득한 숲길 걷기' }
  ],
  3: [
    { id: 'p-8', time: '10:30', place: '기념품 샵 및 감귤 체험 농장', memo: '선물용 오메기떡 & 황금향 구매' },
    { id: 'p-9', time: '14:00', place: '렌터카 반납 및 제주공항 이동', memo: '비행기 출발 1시간 반 전 도착' }
  ]
};

const DEFAULT_EXPENSES = {
  1: [
    { id: 'exp-101', settlementId: null, title: '카오산로드 팟타이 & 땡모반', amount: 48000, payer: '민수', participants: ['민수', '지훈', '서연'] },
    { id: 'exp-102', settlementId: null, title: '루프탑 바 칵테일 & 야경', amount: 96000, payer: '지훈', participants: ['민수', '지훈', '서연'] }
  ],
  2: [
    { id: 'exp-1', settlementId: 1, title: '렌터카 대여 및 보험료', amount: 160000, payer: '민수', participants: ['민수', '지훈', '서연', '태호'] },
    { id: 'exp-2', settlementId: 2, title: '첫날 흑돼지 & 음료 저녁 식사', amount: 120000, payer: '지훈', participants: ['민수', '지훈', '서연', '태호'] },
    { id: 'exp-3', settlementId: 3, title: '동문시장 야시장 간식 및 딱새우회', amount: 64000, payer: '서연', participants: ['민수', '지훈', '서연', '태호'] }
  ],
  3: [
    { id: 'exp-301', settlementId: null, title: '서핑 강습 및 렌탈료', amount: 200000, payer: '현우', participants: ['현우', '동욱', '수민', '은지', '준혁'] },
    { id: 'exp-302', settlementId: null, title: '글램핑 바비큐 장보기 & 숯불', amount: 145000, payer: '동욱', participants: ['현우', '동욱', '수민', '은지', '준혁'] }
  ]
};

const DEFAULT_PHOTOS = [
  { id: 'ph-1', photoId: 1, groupId: 2, url: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80', caption: '성산일출봉 정상에서 맞이한 아침 햇살 🌅', uploaderName: '김민수', likes: 12, createdAt: '2026-11-01 07:20:00' },
  { id: 'ph-2', photoId: 2, groupId: 2, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', caption: '함덕 에메랄드빛 바다 산책로 🏖️', uploaderName: '이지연', likes: 18, createdAt: '2026-11-01 14:40:00' },
  { id: 'ph-3', photoId: 3, groupId: 2, url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', caption: '저녁 캠프파이어와 바비큐 파티 🔥', uploaderName: '태호', likes: 25, createdAt: '2026-11-02 19:50:00' },
  { id: 'ph-101', photoId: 101, groupId: 1, url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', caption: '방콕 왓아룬 사원의 환상적인 야경 🛕✨', uploaderName: '민수', likes: 15, createdAt: '2026-11-04 20:30:00' },
  { id: 'ph-102', photoId: 102, groupId: 1, url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80', caption: '카오산로드 팟타이 맛집 투어 🍜', uploaderName: '지훈', likes: 9, createdAt: '2026-11-05 13:15:00' },
  { id: 'ph-301', photoId: 301, groupId: 3, url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80', caption: '양양 인구해변 첫 파도 타기 성공! 🏄‍♂️', uploaderName: '현우', likes: 22, createdAt: '2026-11-03 11:00:00' },
  { id: 'ph-302', photoId: 302, groupId: 3, url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80', imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80', caption: '글램핑장에서 바라본 가을 밤하늘 별빛 ⛺🌌', uploaderName: '수민', likes: 14, createdAt: '2026-11-03 21:30:00' }
];

// App State
let groups = JSON.parse(localStorage.getItem('travelmates_groups')) || DEFAULT_GROUPS;
let plans = JSON.parse(localStorage.getItem('travelmates_plans')) || DEFAULT_PLANS;
let expenses = JSON.parse(localStorage.getItem('travelmates_expenses')) || DEFAULT_EXPENSES;
let photos = JSON.parse(localStorage.getItem('travelmates_photos')) || DEFAULT_PHOTOS;
let currentDay = 1;
let currentFilter = 'all';
let isBackendLive = false;

// Planner State (모임별 일정 관리)
let plannerGroupId = null;    // 현재 선택된 모임 ID
let plannerGroupObj = null;   // 선택된 모임 객체
let plannerSchedules = [];    // 현재 모임의 전체 일정 목록
let plannerMaxDay = 3;        // 여행 총 일수

// Gallery State (모임별 갤러리 관리)
let galleryGroupId = null;     // 현재 선택된 갤러리 모임 ID (null, 'ALL', 또는 특정 ID)
let gallerySortOrder = 'latest'; // 정렬 순서 ('latest' | 'likes')
let pendingPhotoDataUrl = null;  // 모달 업로드 대기 이미지 DataURL
let currentLightboxIndex = -1;   // 현재 라이트박스 확대 사진 인덱스
let currentLightboxList = [];    // 현재 라이트박스 탐색 사진 목록
let currentLightboxPhotoId = null; // 현재 라이트박스 사진 ID
let settlementGroupId = null;    // 현재 선택된 모임 ID
let settlementGroupObj = null;   // 선택된 모임 객체
let settlementExpenses = [];    // 현재 모임의 지출 목록

// ===== 식별자(ID) 정규화 헬퍼 (문자열 'grp-123' -> 숫자 123) =====
function getNumericId(id) {
  if (id === null || id === undefined) return 1;
  if (typeof id === 'number') return id;
  const cleaned = String(id).replace(/^[^\d]+/, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 1 : parsed;
}

// ===== 로그인 상태 헬퍼 =====
function getLoggedInUser() {
  try {
    const saved = localStorage.getItem('travelmates_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function isLoggedIn() {
  return getLoggedInUser() !== null;
}

// Initialize (jQuery Ready)
$(async function() {
  // 비로그인 상태로 보호된 메뉴(플래너, 정산기, 갤러리 등)에 접근한 경우 렌더링 중단 (Auth Guard 보호 화면 유지)
  if ($('#auth-gate-container').length) {
    lucide.createIcons();
    return;
  }

  if ($('#groups-grid').length) renderGroups();
  if ($('#gallery-grid').length) renderPhotos();
  lucide.createIcons();

  // 톰캣 백엔드 REST API와 실시간 동기화 시도
  await syncBackend();

  // 플래너, 정산 및 갤러리 모임 드롭다운 초기화
  initPlannerGroupSelect();
  initSettlementGroupSelect();
  initGalleryGroupSelect();

  // URL 파라미터(?groupId=...) 자동 선택 지원
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const queryGroupId = urlParams.get('groupId');
    if (queryGroupId) {
      const $plannerSel = $('#planner-group-select');
      if ($plannerSel.length) {
        $plannerSel.val(queryGroupId);
        onPlannerGroupChange();
      }
      const $settleSel = $('#settlement-group-select');
      if ($settleSel.length) {
        $settleSel.val(queryGroupId);
        onSettlementGroupChange();
      }
      const $gallerySel = $('#gallery-group-select');
      if ($gallerySel.length) {
        $gallerySel.val(queryGroupId);
        onGalleryGroupChange();
      }
    }
  } catch (e) {}

  lucide.createIcons();
});

// 백엔드 REST API 연동 (jQuery $.ajax)
async function syncBackend() {
  try {
    const data = await $.ajax({
      url: '/api/groups',
      method: 'GET',
      dataType: 'json'
    });
    if (Array.isArray(data) && data.length > 0) {
      isBackendLive = true;
      groups = data.map(g => ({
        id: 'grp-' + g.groupId,
        groupId: g.groupId,
        title: g.groupName,
        type: g.tripType,
        location: g.location,
        startDate: g.startDate,
        endDate: g.endDate,
        date: `${g.startDate || ''} ~ ${g.endDate || ''}`,
        maxMembers: g.maxMembers,
        currentMembers: g.currentMembers || 1,
        members: [g.creatorName || '방장'],
        creatorName: g.creatorName || '방장',
        createdBy: g.createdBy || 1,
        budget: g.estimatedBudget || '미정',
        desc: g.description || '',
        image: g.imageUrl || 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
        joined: false,
        createdAt: g.createdAt || '',
        updatedAt: g.updatedAt || ''
      }));
      if ($('#groups-grid').length) renderGroups();
      if ($('#planner-group-select').length) initPlannerGroupSelect();
      if ($('#settlement-group-select').length) initSettlementGroupSelect();
      if ($('#gallery-group-select').length) initGalleryGroupSelect();
      console.log('[TravelMates] 백엔드 모임 데이터가 동기화되었습니다.');
    }
  } catch (e) {
    // 백엔드 미기동 시 LocalStorage 모드로 자연스럽게 동작
    console.log('[Client Mode] 로컬스토리지 모드로 동작합니다.');
  }
}

// Toast notification (jQuery)
function showToast(message) {
  const $toast = $('#toast');
  const $toastMsg = $('#toast-message');
  $toastMsg.text(message);
  $toast.removeClass('opacity-0 translate-y-4 pointer-events-none').addClass('opacity-100 translate-y-0');

  setTimeout(() => {
    $toast.removeClass('opacity-100 translate-y-0').addClass('opacity-0 translate-y-4 pointer-events-none');
  }, 2500);
}

// Navigation Tab Switch (데스크톱 네비게이션 + 모바일 드롭다운 + 모바일 하단 탭바 동시 연동)
function switchTab(tabName) {
  const tabs = ['groups', 'planner', 'settlement', 'gallery'];
  const $hero = $('#hero-banner');

  tabs.forEach(t => {
    const $el = $(`#tab-${t}`);
    const $navBtn = $(`#nav-${t}`);
    const $mobileNavBtn = $(`#mobile-nav-${t}`);
    const $bottomNavBtn = $(`#bottom-nav-${t}`);

    if (t === tabName) {
      $el.removeClass('hidden');
      $navBtn.removeClass('text-slate-600 hover:text-slate-900 hover:bg-slate-100').addClass('text-emerald-600 bg-emerald-50');
      $mobileNavBtn.removeClass('text-slate-700 font-medium hover:bg-slate-50').addClass('text-emerald-600 font-bold bg-emerald-50');
      $bottomNavBtn.removeClass('text-slate-400 font-medium').addClass('text-emerald-600 font-bold');
    } else {
      $el.addClass('hidden');
      $navBtn.addClass('text-slate-600 hover:text-slate-900 hover:bg-slate-100').removeClass('text-emerald-600 bg-emerald-50');
      $mobileNavBtn.addClass('text-slate-700 font-medium hover:bg-slate-50').removeClass('text-emerald-600 font-bold bg-emerald-50');
      $bottomNavBtn.addClass('text-slate-400 font-medium').removeClass('text-emerald-600 font-bold');
    }
  });

  if (tabName === 'groups') {
    $hero.removeClass('hidden');
  } else {
    $hero.addClass('hidden');
  }

  // 플래너 탭 전환 시 드롭다운 최신화 (비로그인 사용자도 일정 즉시 열람 허용)
  if (tabName === 'planner') {
    initPlannerGroupSelect();
  }

  // 회비 정산 탭 전환 시 모임 드롭다운 최신화
  if (tabName === 'settlement') {
    initSettlementGroupSelect();
  }

  // 갤러리 탭 전환 시 모임 드롭다운 최신화
  if (tabName === 'gallery') {
    initGalleryGroupSelect();
  }

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 화면 축소/모바일 시 햄버거 메뉴 토글 (jQuery)
function toggleMobileMenu(forceState) {
  const $dropdown = $('#mobile-menu-dropdown');
  const $icon = $('#mobile-menu-icon');
  if (!$dropdown.length) return;

  const willOpen = typeof forceState === 'boolean' ? forceState : $dropdown.hasClass('hidden');

  if (willOpen) {
    $dropdown.removeClass('hidden');
    $icon.attr('data-lucide', 'x');
  } else {
    $dropdown.addClass('hidden');
    $icon.attr('data-lucide', 'menu');
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// --------------------------------------------------------------------------------
// GROUPS MODULE
// --------------------------------------------------------------------------------

function filterGroups(filterType) {
  currentFilter = filterType;
  $('.filter-btn').each(function() {
    const $btn = $(this);
    if ($btn.attr('data-filter') === filterType) {
      $btn.attr('class', 'filter-btn px-3 py-1.5 rounded-lg transition bg-white text-slate-800 shadow-sm font-bold flex items-center gap-1');
    } else {
      $btn.attr('class', 'filter-btn px-3 py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900 flex items-center gap-1');
    }
  });
  renderGroups();
}

function renderGroups() {
  const $container = $('#groups-grid');
  if (!$container.length) return;

  const $countBadge = $('#group-count-badge');
  const user = getLoggedInUser();

  // 본인 참여 여부 헬퍼
  const isUserInGroup = (g) => {
    if (!user) return false;
    const isLeader = (g.createdBy && g.createdBy === user.memberId);
    const isMemberInList = Array.isArray(g.members) && g.members.some(m => {
      if (typeof m === 'string') {
        return m.includes(user.name) || (user.username && m.includes(user.username));
      }
      return m.memberId === user.memberId || m.name === user.name;
    });
    return isLeader || g.joined || isMemberInList;
  };

  const filtered = groups.filter(g => {
    if (currentFilter === 'all') return true;
    if (currentFilter === '국내' || currentFilter === '해외') return g.type === currentFilter;
    if (currentFilter === 'my') {
      return isUserInGroup(g);
    }
    return true;
  });

  $countBadge.text(filtered.length);

  if (filtered.length === 0) {
    const emptyMsg = currentFilter === 'my'
      ? (user ? '아직 참여 중인 여행 모임이 없습니다. 관심 있는 모임에 참여 신청해보세요!' : '로그인 후 내가 참여 중인 여행을 한눈에 확인할 수 있습니다.')
      : '해당 카테고리의 여행 모임이 없습니다. 새 모임을 만들어보세요!';
    $container.html(`
      <div class="col-span-full py-16 text-center text-slate-400">
        <i data-lucide="compass" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
        <p>${emptyMsg}</p>
      </div>
    `);
    lucide.createIcons();
    return;
  }

  $container.html(filtered.map(g => {
    const isFull = g.currentMembers >= g.maxMembers;
    const progressPercent = Math.min(100, Math.round((g.currentMembers / g.maxMembers) * 100));
    const isLeader = user && (g.createdBy && g.createdBy === user.memberId);
    const isAdmin = user && (user.isAdmin === true);

    // 본인이 멤버 목록에 포함되어 있거나 g.joined 플래그가 켜져 있는지 확인
    const isMemberInList = user && Array.isArray(g.members) && g.members.some(m => {
      if (typeof m === 'string') {
        return m.includes(user.name) || (user.username && m.includes(user.username));
      }
      return m.memberId === user.memberId || m.name === user.name;
    });
    const isJoined = !!(user && (g.joined || isMemberInList));
    const isMyTrip = isLeader || isJoined;

    // 본인이 포함된 여행 카드 하이라이트 스타일 & 뱃지
    let cardWrapperClass = 'bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group-card-hover relative transition-all duration-300';
    let topAccentBar = '';
    let highlightBadge = '';

    if (isLeader) {
      cardWrapperClass = 'bg-gradient-to-b from-amber-50/40 via-white to-white rounded-3xl border-2 border-amber-400 ring-4 ring-amber-400/20 overflow-hidden shadow-lg flex flex-col group-card-hover relative transition-all duration-300';
      topAccentBar = `
        <div class="py-1.5 px-4 text-xs font-bold flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-inner">
          <span class="flex items-center gap-1.5">
            <i data-lucide="crown" class="w-3.5 h-3.5 text-amber-200"></i>
            <span>내가 개설한 모임 (방장)</span>
          </span>
          <span class="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm">
            👑 내 모임
          </span>
        </div>
      `;
      highlightBadge = `
        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md flex items-center gap-1 border border-amber-300 backdrop-blur-sm">
          <i data-lucide="crown" class="w-3 h-3"></i> 내 모임
        </span>
      `;
    } else if (isJoined) {
      cardWrapperClass = 'bg-gradient-to-b from-emerald-50/40 via-white to-white rounded-3xl border-2 border-emerald-500 ring-4 ring-emerald-500/20 overflow-hidden shadow-lg flex flex-col group-card-hover relative transition-all duration-300';
      topAccentBar = `
        <div class="py-1.5 px-4 text-xs font-bold flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-inner">
          <span class="flex items-center gap-1.5">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-200"></i>
            <span>내가 참여 중인 여행</span>
          </span>
          <span class="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm">
            ✨ 참여 중
          </span>
        </div>
      `;
      highlightBadge = `
        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1 border border-emerald-300 backdrop-blur-sm animate-pulse">
          <i data-lucide="check" class="w-3 h-3"></i> 참여 중
        </span>
      `;
    } else if (isFull) {
      // 정원 마감 카드 (미참여 사용자)
      highlightBadge = `
        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md flex items-center gap-1 border border-rose-400 backdrop-blur-sm">
          <i data-lucide="user-x" class="w-3 h-3"></i> 모집 마감
        </span>
      `;
    }

    const safeTitle = escapeHtml(g.title);
    const safeLocation = escapeHtml(g.location);
    const safeType = escapeHtml(g.type);
    const safeDesc = escapeHtml(g.desc);
    const safeDate = escapeHtml(g.date);
    const safeBudget = escapeHtml(g.budget);
    const safeImage = sanitizeUrl(g.image);
    const safeId = escapeHtml(g.id);

    return `
      <div class="${cardWrapperClass}">
        ${topAccentBar}
        <div class="relative h-48 w-full overflow-hidden cursor-pointer group/img" onclick="openGroupDetailModal('${safeId}')" title="모임 상세 정보 보기">
          <img src="${safeImage}" alt="${safeTitle}" class="w-full h-full object-cover group-hover/img:scale-105 transition duration-500">
          <div class="absolute inset-0 bg-black/10 group-hover/img:bg-black/0 transition duration-300"></div>
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${g.type === '해외' ? 'bg-cyan-500 text-white' : 'bg-emerald-600 text-white'} shadow-sm">
              ${safeType}여행
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm">
              <i data-lucide="map-pin" class="w-3 h-3 inline mr-0.5 text-rose-500"></i> ${safeLocation}
            </span>
            ${highlightBadge}
          </div>
          <!-- 방장 또는 관리자 전용 모임 삭제 버튼 -->
          ${(isLeader || isAdmin) ? `
            <div class="absolute top-3 right-3 z-10" onclick="event.stopPropagation()">
              <button onclick="confirmDeleteGroup(event, '${safeId}')"
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-black/55 hover:bg-rose-600 text-white backdrop-blur-sm transition-all shadow-sm flex items-center gap-1 active:scale-95 border border-white/20"
                title="모임 삭제 (${isLeader ? '방장 권한' : '관리자 권한'})">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                <span>삭제</span>
              </button>
            </div>
          ` : ''}
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 onclick="openGroupDetailModal('${safeId}')" class="text-lg font-bold text-slate-900 leading-snug line-clamp-1 flex-1 cursor-pointer hover:text-emerald-600 transition" title="모임 상세 정보 보기">${safeTitle}</h3>
            ${isMyTrip ? `
              <span class="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isLeader ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
                ${isLeader ? '👑 방장' : '✨ 참여중'}
              </span>
            ` : ''}
          </div>
          <p class="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">${safeDesc}</p>

          <div class="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> 일정</span>
              <span class="font-medium text-slate-700">${safeDate}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 flex items-center gap-1"><i data-lucide="wallet" class="w-3.5 h-3.5"></i> 총 예산</span>
              <span class="font-semibold text-emerald-600">${safeBudget}</span>
            </div>
          </div>

          <!-- Actions: 회비 정산 링크 & 모집 현황 & 버튼들 -->
          <div class="mt-auto pt-2">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="font-medium text-slate-600">모집 현황</span>
              <button onclick="viewGroupSettlement('${g.groupId || g.id}')"
                class="text-[11px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 hover:underline"
                title="해당 모임의 회비 정산기로 이동">
                <i data-lucide="receipt" class="w-3 h-3"></i>
                <span>회비 정산</span>
              </button>
            </div>
            <div class="flex justify-between items-center text-xs mb-1.5">
              <span class="text-[11px] text-slate-400">참여 멤버</span>
              <span class="font-bold ${isFull ? 'text-rose-600' : 'text-emerald-600'}">
                ${g.currentMembers} / ${g.maxMembers}명 ${isFull ? '(정원 마감)' : ''}
              </span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
              <div class="${isFull ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'} h-2 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
            </div>

            <!-- 버튼 3개 배치: 상세 정보 / 일정 확인 / 참여 관리 -->
            <div class="grid grid-cols-3 gap-1.5">
              <!-- 1. 상세 정보 확인 버튼 -->
              <button onclick="openGroupDetailModal('${safeId}')"
                class="py-2.5 px-1.5 sm:px-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition flex items-center justify-center gap-1 shadow-sm active:scale-95"
                title="여행 모임 상세 정보 팝업 열기">
                <i data-lucide="info" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>상세 정보</span>
              </button>

              <!-- 2. 일정 확인 버튼 (모든 사용자 즉시 열람 허용) -->
              <button onclick="viewGroupSchedule('${g.groupId || g.id}')"
                class="py-2.5 px-1.5 sm:px-2 rounded-xl border border-emerald-500/40 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition flex items-center justify-center gap-1 shadow-sm active:scale-95"
                title="등록된 일정 타임라인 즉시 확인">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span>일정 확인</span>
              </button>

              <!-- 3. 참여/관리 버튼 (로그인 및 정원 마감 여부에 따라 엄격히 제한) -->
              ${(() => {
                // 1. 모임 개설자 / 방장
                if (isLeader) {
                  return `
                    <button onclick="toggleJoinGroup('${g.id}')"
                      class="py-2.5 px-1.5 sm:px-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] transition flex items-center justify-center gap-0.5 shadow-sm"
                      title="본인이 개설한 모임입니다 (방장)">
                      <i data-lucide="crown" class="w-3.5 h-3.5 text-amber-600"></i>
                      <span>내 모임</span>
                    </button>
                  `;
                }

                // 2. 시스템 관리자 (admin)
                if (isAdmin) {
                  return `
                    <button onclick="toggleJoinGroup('${g.id}')"
                      class="py-2.5 px-1.5 sm:px-2 rounded-xl ${isJoined ? 'border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700' : 'border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700'} font-semibold text-[11px] transition flex items-center justify-center gap-0.5 shadow-sm"
                      title="관리자 권한">
                      <i data-lucide="shield" class="w-3.5 h-3.5"></i>
                      <span>${isJoined ? '취소' : '관리자'}</span>
                    </button>
                  `;
                }

                // 3. 이미 참여 중인 회원 (정원 마감 여부와 무관하게 참여 취소 가능)
                if (isJoined) {
                  return `
                    <button onclick="toggleJoinGroup('${g.id}')"
                      class="py-2.5 px-1.5 sm:px-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-semibold text-[11px] transition flex items-center justify-center gap-0.5 shadow-sm group/btn"
                      title="클릭 시 참여 취소">
                      <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500 group-hover/btn:hidden"></i>
                      <i data-lucide="x" class="w-3.5 h-3.5 text-rose-500 hidden group-hover/btn:inline"></i>
                      <span class="group-hover/btn:hidden">참여중</span>
                      <span class="hidden group-hover/btn:inline">취소</span>
                    </button>
                  `;
                }

                // 4. [핵심 제한] 정원이 마감(초과)된 경우 - 비로그인/로그인 무관하게 참여 신청 버튼 완전 비활성화
                if (isFull) {
                  return `
                    <button disabled
                      class="py-2.5 px-1.5 sm:px-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed font-semibold text-[11px] transition flex items-center justify-center gap-0.5 shadow-none"
                      title="모집 인원(${g.maxMembers}명)이 마감되어 더 이상 참여 신청을 할 수 없습니다">
                      <i data-lucide="user-x" class="w-3.5 h-3.5 text-slate-400"></i>
                      <span>마감</span>
                    </button>
                  `;
                }

                // 5. 비로그인 사용자 (정원 여유 있을 때)
                if (!user) {
                  return `
                    <button onclick="toggleJoinGroup('${g.id}')"
                      class="py-2.5 px-1.5 sm:px-2 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition flex items-center justify-center gap-0.5 shadow-sm"
                      title="로그인 후 참여 가능합니다">
                      <i data-lucide="log-in" class="w-3.5 h-3.5 text-slate-500"></i>
                      <span>신청</span>
                    </button>
                  `;
                }

                // 6. 일반 회원 참여 신청 가능
                return `
                  <button onclick="toggleJoinGroup('${g.id}')"
                    class="py-2.5 px-1.5 sm:px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold text-[11px] transition flex items-center justify-center gap-0.5">
                    <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
                    <span>신청</span>
                  </button>
                `;
              })()}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join(''));

  lucide.createIcons();
}

// 참여 가능한 모임 일정 확인 (비로그인 사용자도 즉시 열람 허용)
function viewGroupSchedule(targetId) {
  const $plannerSel = $('#planner-group-select');
  if ($plannerSel.length) {
    if (typeof switchTab === 'function') {
      switchTab('planner');
    }
    $plannerSel.val(targetId);
    onPlannerGroupChange();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.location.href = 'planner.html?groupId=' + encodeURIComponent(targetId);
  }
}

// 모임 참여/취소 분기 처리 (로그인 구분에 따라 다르게 처리 및 인원 초과 완전 제한)
async function toggleJoinGroup(id) {
  const user = getLoggedInUser();

  const grp = groups.find(g => g.id === id || String(g.groupId) === String(id));
  if (!grp) return;

  const isFull = grp.currentMembers >= grp.maxMembers;

  // 1. 비로그인 사용자
  if (!user) {
    if (isFull) {
      alert(`🚫 '${grp.title}' 모임은 모집 정원(${grp.maxMembers}명)이 마감되어 더 이상 참여 신청을 할 수 없습니다.\n다른 참여 가능한 여행 모임을 확인해보세요!`);
      return;
    }
    showToast('모임 참여는 로그인 후 이용 가능합니다. 🔒');
    if (typeof openLoginModal === 'function') {
      openLoginModal();
    }
    return;
  }

  const isLeader = (grp.createdBy && grp.createdBy === user.memberId);
  const isAdmin = (user.isAdmin === true);

  // 2. 모임 개설자 / 방장: 참여 취소 불가 및 모임 관리 안내
  if (isLeader) {
    alert(`👑 '${grp.title}' 모임의 방장(개설자)입니다.\n\n방장은 모임 참여를 취소할 수 없습니다.\n모임 일정 및 멤버 관리는 [일정 확인] 버튼 또는 관리자 화면을 이용하세요.`);
    return;
  }

  // 3. 관리자 (admin): 관리자 권한으로 참여 상태 자유 전환 (정원 제한 무시)
  if (isAdmin) {
    if (grp.joined) {
      if (confirm(`[관리자 권한] '${grp.title}' 모임 참여를 취소하시겠습니까?`)) {
        grp.joined = false;
        grp.currentMembers = Math.max(1, grp.currentMembers - 1);
        if (isBackendLive && grp.groupId) {
          try { await $.ajax({ url: `/api/groups/${getNumericId(grp.groupId || grp.id)}/leave`, method: 'POST' }); } catch(e){}
        }
        showToast(`[관리자] '${grp.title}' 모임 참여가 취소되었습니다. 🛡️`);
      }
    } else {
      grp.joined = true;
      grp.currentMembers += 1;
      if (isBackendLive && grp.groupId) {
        try { await $.ajax({ url: `/api/groups/${getNumericId(grp.groupId || grp.id)}/join`, method: 'POST' }); } catch(e){}
      }
      showToast(`[관리자] '${grp.title}' 모임에 관리자 권한으로 참여되었습니다! 🛡️`);
    }
    saveGroups();
    renderGroups();
    return;
  }

  // 4. 일반 회원: 참여 취소 또는 신규 참여 신청
  if (grp.joined) {
    // 4-1. 이미 참여 중인 경우: 참여 취소 허용
    if (confirm(`'${grp.title}' 모임 참여를 취소하시겠습니까?`)) {
      grp.joined = false;
      grp.currentMembers = Math.max(1, grp.currentMembers - 1);
      if (isBackendLive && grp.groupId) {
        try { await $.ajax({ url: `/api/groups/${getNumericId(grp.groupId || grp.id)}/leave`, method: 'POST' }); } catch(e){}
      }
      showToast(`'${grp.title}' 모임 참여 신청을 취소했습니다.`);
    }
  } else {
    // 4-2. [핵심 제한] 신규 참여 신청 시: 정원 초과 검증 및 완전 차단
    if (isFull) {
      alert(`🚫 '${grp.title}' 모임은 이미 모집 정원(${grp.maxMembers}명)이 마감되었습니다.\n더 이상 참여할 수 없습니다. 다른 여행 모임을 둘러보세요!`);
      return;
    }

    if (isBackendLive && grp.groupId) {
      try {
        await $.ajax({
          url: `/api/groups/${getNumericId(grp.groupId || grp.id)}/join`,
          method: 'POST',
          dataType: 'json'
        });
      } catch(xhr) {
        if (xhr && xhr.status && xhr.status >= 400) {
          const errData = xhr.responseJSON || {};
          alert(errData.message || '모집 정원이 마감되어 참여할 수 없습니다.');
          return;
        }
      }
    }

    grp.joined = true;
    grp.currentMembers = Math.min(grp.maxMembers, grp.currentMembers + 1);
    showToast(`'${grp.title}' 모임에 참여 신청되었습니다! 🎉`);
  }

  saveGroups();
  renderGroups();
}

// 모임 삭제 확인 모달 열기 (방장 또는 관리자 전용)
function confirmDeleteGroup(e, id) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }

  const user = getLoggedInUser();
  if (!user) {
    showToast('모임 삭제는 로그인 후 이용 가능합니다. 🔒');
    if (typeof openLoginModal === 'function') openLoginModal();
    return;
  }

  const grp = groups.find(g => g.id === id || String(g.groupId) === String(id));
  if (!grp) {
    showToast('삭제할 모임 정보를 찾을 수 없습니다.');
    return;
  }

  const isLeader = (grp.createdBy && grp.createdBy === user.memberId);
  const isAdmin = (user.isAdmin === true);

  if (!isLeader && !isAdmin) {
    alert('해당 모임을 삭제할 권한이 없습니다.\n모임 개설자(방장) 또는 시스템 관리자만 삭제할 수 있습니다.');
    return;
  }

  const $modal = $('#modal-confirm-delete-group');
  $('#delete-group-target-id').val(grp.id);
  $('#delete-group-target-name').text(`[${grp.type}여행] ${grp.title}`);

  if ($modal.length) {
    $modal.removeClass('hidden').addClass('flex');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// 모임 삭제 확인 모달 닫기
function closeDeleteGroupModal() {
  $('#modal-confirm-delete-group').addClass('hidden').removeClass('flex');
}

// 모임 삭제 실행
async function executeDeleteGroup() {
  const id = $('#delete-group-target-id').val();
  if (!id) return;

  const grp = groups.find(g => g.id === id || String(g.groupId) === String(id));
  if (!grp) {
    closeDeleteGroupModal();
    return;
  }

  const user = getLoggedInUser();
  const numericGroupId = grp.groupId || (typeof id === 'number' ? id : parseInt(id, 10));

  // 1. 백엔드 REST API 호출 시도 (DELETE /api/groups/{groupId})
  if (isBackendLive && numericGroupId && !isNaN(numericGroupId)) {
    try {
      const memberParam = user ? `?memberId=${user.memberId}` : '';
      await $.ajax({
        url: `/api/groups/${numericGroupId}${memberParam}`,
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('백엔드 DELETE /api/groups 실패 (로컬 스토리지 데이터 우선 정리):', err);
    }
  }

  // 2. 프론트엔드 상태 & LocalStorage에서 모임 및 연관 스케줄, 지출 정산 데이터 정리
  groups = groups.filter(g => g.id !== id && String(g.groupId) !== String(id));
  saveGroups();

  try {
    localStorage.removeItem(`travelmates_schedules_${id}`);
    localStorage.removeItem(`travelmates_expenses_${id}`);
    if (numericGroupId) {
      localStorage.removeItem(`travelmates_schedules_${numericGroupId}`);
      localStorage.removeItem(`travelmates_expenses_${numericGroupId}`);
    }
  } catch (e) {
    console.error('LocalStorage 정리 중 오류:', e);
  }

  closeDeleteGroupModal();
  showToast(`'${grp.title}' 모임이 안전하게 삭제되었습니다. 🗑️`);

  // 3. UI 컴포넌트 실시간 동기화
  renderGroups();

  // 만약 삭제된 모임이 회비 정산이나 일정 탭에서 선택되어 있었다면 기본 상태로 갱신
  if (typeof settlementGroupId !== 'undefined' && (settlementGroupId === id || String(settlementGroupId) === String(numericGroupId))) {
    if (typeof populateSettlementGroupSelector === 'function') {
      populateSettlementGroupSelector();
    }
  }

  if (typeof currentScheduleGroupId !== 'undefined' && (currentScheduleGroupId === id || String(currentScheduleGroupId) === String(numericGroupId))) {
    if (typeof populateScheduleGroupSelector === 'function') {
      populateScheduleGroupSelector();
    }
  }
}

// 모임 예상 일정 달력 날짜 변경 처리 (시작일/종료일 및 박수/일수 자동 계산)
function handleTripDateChange() {
  const $startEl = $('#new-group-start-date');
  const $endEl = $('#new-group-end-date');
  const $badgeEl = $('#trip-duration-badge');
  const $summaryEl = $('#trip-period-summary');
  const $textEl = $('#trip-period-text');

  if (!$startEl.length || !$endEl.length) return;

  const startVal = $startEl.val();
  const endVal = $endEl.val();

  if (startVal) {
    // 종료일 최소값을 시작일 이후로 설정
    $endEl.attr('min', startVal);
    if (endVal && endVal < startVal) {
      $endEl.val(startVal);
    }
  }

  const finalEndVal = $endEl.val();
  if (startVal && finalEndVal) {
    const sDate = new Date(startVal);
    const eDate = new Date(finalEndVal);
    const diffTime = eDate - sDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let durationText = '';
    if (diffDays < 0) {
      durationText = '날짜 확인 필요';
    } else if (diffDays === 0) {
      durationText = '당일치기 (1일)';
    } else {
      durationText = `${diffDays}박 ${diffDays + 1}일`;
    }

    $badgeEl.text(durationText).removeClass('hidden');

    if ($summaryEl.length && $textEl.length) {
      const formattedPeriod = `${startVal.replace(/-/g, '.')} ~ ${finalEndVal.replace(/-/g, '.')} (${durationText})`;
      $textEl.text(formattedPeriod);
      $summaryEl.removeClass('hidden');
    }
  } else {
    $badgeEl.addClass('hidden');
    $summaryEl.addClass('hidden');
  }
}

function openCreateGroupModal() {
  if (!isLoggedIn()) {
    showToast('새 모임 만들기는 로그인 후 이용 가능합니다. 🔒');
    if (typeof openLoginModal === 'function') {
      openLoginModal();
    }
    return;
  }

  $('#modal-create-group').removeClass('hidden').addClass('flex');

  // 달력 기본값 세팅 (오늘 날짜 및 오늘 + 3일 뒤)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const after3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const afterYyyy = after3Days.getFullYear();
  const afterMm = String(after3Days.getMonth() + 1).padStart(2, '0');
  const afterDd = String(after3Days.getDate()).padStart(2, '0');
  const after3DaysStr = `${afterYyyy}-${afterMm}-${afterDd}`;

  const $startEl = $('#new-group-start-date');
  const $endEl = $('#new-group-end-date');

  if ($startEl.length && !$startEl.val()) {
    $startEl.attr('min', todayStr).val(todayStr);
  }
  if ($endEl.length && !$endEl.val()) {
    $endEl.attr('min', todayStr).val(after3DaysStr);
  }

  handleTripDateChange();

  // 커버 이미지 기본값 리셋 (첫 번째 기본 프리셋)
  const defaultCover = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
  $('#new-group-cover-preview').attr('src', defaultCover);
  $('#new-group-cover-url').val(defaultCover);
  $('#new-group-image-badge').text('기본 이미지 (자연/힐링)');
  $('#new-group-file-input').val('');

  $('.preset-cover-btn').each(function(idx) {
    if (idx === 0) {
      $(this).addClass('border-emerald-500').removeClass('border-transparent');
    } else {
      $(this).removeClass('border-emerald-500').addClass('border-transparent');
    }
  });

  $('#custom-url-container').addClass('hidden');

  // 총 예산 및 1인당 계산 힌트 리셋
  $('#new-group-budget').val('');
  $('#new-group-per-person-budget').addClass('hidden').text('');

  // 모임 만들기 팝업 인기 여행지 추천 칩 초기화
  updateGroupPopularDestinations();
  lastAutoFilledLocation = '';

  lucide.createIcons();
}

function closeCreateGroupModal() {
  $('#modal-create-group').addClass('hidden').removeClass('flex');
}

// ==================== 로그인 및 회원가입 모달 안전 제어 헬퍼 ====================
function openLoginModal() {
  if (typeof window.openLoginModal === 'function' && window.openLoginModal !== openLoginModal) {
    window.openLoginModal();
  } else if ($('#login-modal').length) {
    $('#login-modal').removeClass('hidden');
    $('#login-username').trigger('focus');
  }
}

function closeLoginModal() {
  if (typeof window.closeLoginModal === 'function' && window.closeLoginModal !== closeLoginModal) {
    window.closeLoginModal();
  } else if ($('#login-modal').length) {
    $('#login-modal').addClass('hidden');
  }
}

function openSignupModal() {
  if (typeof window.openRegisterModal === 'function') {
    window.openRegisterModal();
  } else if ($('#register-modal').length) {
    closeLoginModal();
    $('#register-modal').removeClass('hidden');
    $('#register-username').trigger('focus');
  }
}

function closeSignupModal() {
  if (typeof window.closeRegisterModal === 'function') {
    window.closeRegisterModal();
  } else if ($('#register-modal').length) {
    $('#register-modal').addClass('hidden');
  }
}

const openRegisterModal = openSignupModal;
const closeRegisterModal = closeSignupModal;

// ==================== 참여 가능한 여행 모임 상세 정보 모달 제어 ====================
function openGroupDetailModal(groupId) {
  if (!groupId) return;
  const numId = getNumericId(groupId);
  const g = groups.find(item => item.id === groupId || item.groupId === numId || String(item.groupId) === String(groupId) || item.id === 'grp-' + numId);
  if (!g) {
    showToast('모임 정보를 찾을 수 없습니다.');
    return;
  }

  const user = getLoggedInUser();
  const isLeader = user && (g.createdBy && g.createdBy === user.memberId);
  const isAdmin = user && (user.isAdmin === true);
  const isMemberInList = user && Array.isArray(g.members) && g.members.some(m => {
    if (typeof m === 'string') {
      return m.includes(user.name) || (user.username && m.includes(user.username));
    }
    return m.memberId === user.memberId || m.name === user.name;
  });
  const isJoined = !!(user && (g.joined || isMemberInList));
  const isFull = (g.currentMembers >= g.maxMembers);
  const progressPercent = Math.min(100, Math.round(((g.currentMembers || 1) / (g.maxMembers || 4)) * 100));

  // 1. 헤더 이미지 및 뱃지
  const safeImg = sanitizeUrl(g.image || g.imageUrl || 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80');
  $('#group-detail-image').attr('src', safeImg).attr('alt', g.title || g.groupName || '여행 모임');
  
  const tripType = g.type || g.tripType || '국내';
  $('#group-detail-type-badge')
    .text(tripType + '여행')
    .attr('class', `px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md ${tripType === '해외' ? 'bg-cyan-500' : 'bg-emerald-600'}`);

  $('#group-detail-location-text').text(g.location || '위치 미정');

  let statusBadgeText = '모집 중';
  let statusBadgeClass = 'bg-emerald-600';
  if (isLeader) {
    statusBadgeText = '👑 내 모임 (방장)';
    statusBadgeClass = 'bg-amber-500';
  } else if (isJoined) {
    statusBadgeText = '✨ 참여 중';
    statusBadgeClass = 'bg-emerald-600';
  } else if (isFull) {
    statusBadgeText = '🔒 모집 마감';
    statusBadgeClass = 'bg-rose-600';
  }
  $('#group-detail-status-badge').text(statusBadgeText).attr('class', `px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md ${statusBadgeClass}`);

  // 2. 제목 & 개설자 & 기간
  $('#modal-group-detail-title').text(g.title || g.groupName || '여행 모임');
  const safeDateStr = g.date || `${g.startDate || ''} ~ ${g.endDate || ''}`.trim() || '일정 조율 중';
  $('#group-detail-date').text(safeDateStr);
  const rawCreator = g.creatorName || (Array.isArray(g.members) && g.members[0]) || '방장';
  const displayCreator = user
    ? rawCreator
    : ((typeof TravelMatesUtils !== 'undefined' && TravelMatesUtils.maskName)
        ? TravelMatesUtils.maskName(rawCreator) + ' (익명)'
        : (rawCreator.length > 1 ? rawCreator.charAt(0) + '*' : '익명') + ' (익명)');
  $('#group-detail-creator').text(displayCreator);

  // 3. 핵심 요약 카드
  $('#group-detail-date-val').text(safeDateStr);
  $('#group-detail-budget-val').text(g.budget || g.estimatedBudget || '미정');
  $('#group-detail-members-val').text(`${g.currentMembers || 1} / ${g.maxMembers || 4}명`);
  const createdDateStr = g.createdAt ? String(g.createdAt).substring(0, 10) : '최근 개설';
  $('#group-detail-created-val').text(createdDateStr);

  // 4. 상세 소개글
  const descText = g.desc || g.description || '등록된 모임 상세 소개글이 없습니다. 친구들과 함께 멋진 여행 계획을 세워보세요!';
  $('#group-detail-desc').text(descText);

  // 5. 참여 인원 프로그레스 & 명단 칩 (로그인 시 실명, 비로그인 시 익명 마스킹)
  const isLogged = !!user;
  $('#group-detail-members-count').text(`${g.currentMembers || 1} / ${g.maxMembers || 4}명 ${isFull ? '(정원 마감)' : ''}`);
  $('#group-detail-progress')
    .css('width', progressPercent + '%')
    .attr('class', `${isFull ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'} h-2.5 rounded-full transition-all duration-500`);

  // 개인정보 프라이버시 상태 뱃지 표시
  if (isLogged) {
    $('#group-detail-name-privacy-badge').html(`
      <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 shadow-xs">
        <i data-lucide="shield-check" class="w-3 h-3 text-emerald-600"></i>
        <span>전원 실명 공개</span>
      </span>
    `);
  } else {
    $('#group-detail-name-privacy-badge').html(`
      <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300 shadow-xs">
        <i data-lucide="lock" class="w-3 h-3 text-amber-600"></i>
        <span>익명 마스킹 보호</span>
      </span>
    `);
  }

  let membersList = Array.isArray(g.members) && g.members.length > 0 ? g.members : [rawCreator];
  const curCount = g.currentMembers || 1;
  const chipsHtml = [];

  membersList.forEach((m, idx) => {
    const mRaw = typeof m === 'string' ? m : (m.name || m.username || '멤버');
    const isLeaderM = idx === 0 || mRaw.includes('방장') || (user && g.createdBy === user.memberId && mRaw === user.name);
    const baseName = mRaw.replace(/\(방장\)/g, '').trim();

    let displayName = '';
    if (isLogged) {
      // 로그인 시: 전원 실제 이름(실명) 표시
      displayName = isLeaderM ? `${baseName}(방장)` : baseName;
    } else {
      // 비로그인 시: 개인정보 보호를 위한 익명 마스킹 처리 (예: 김*수(방장), 이*연(익명))
      const masked = (typeof TravelMatesUtils !== 'undefined' && TravelMatesUtils.maskName)
        ? TravelMatesUtils.maskName(baseName)
        : (baseName.length > 1 ? baseName.charAt(0) + '*' : '익명');
      displayName = isLeaderM ? `${masked}(방장)` : `${masked}(익명)`;
    }

    chipsHtml.push(`
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${isLeaderM ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}">
        <i data-lucide="${isLeaderM ? 'crown' : 'user'}" class="w-3.5 h-3.5 ${isLeaderM ? 'text-amber-600' : 'text-emerald-600'}"></i>
        <span>${escapeHtml(displayName)}</span>
      </span>
    `);
  });

  if (chipsHtml.length < curCount) {
    for (let i = chipsHtml.length + 1; i <= curCount; i++) {
      const dummyName = isLogged ? `참여자 ${i}` : `익명 멤버 ${i}`;
      chipsHtml.push(`
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400"></i>
          <span>${dummyName}</span>
        </span>
      `);
    }
  }

  // 비로그인 상태인 경우 실명 확인을 위한 로그인 빠른 안내 버튼 추가
  if (!isLogged) {
    chipsHtml.push(`
      <button type="button" onclick="closeGroupDetailModal(); openLoginModal();"
        class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 transition"
        title="로그인 시 모든 참여자의 실제 이름을 확인할 수 있습니다">
        <i data-lucide="log-in" class="w-3 h-3"></i>
        <span>로그인하고 실명 확인하기 →</span>
      </button>
    `);
  }

  $('#group-detail-member-chips').html(chipsHtml.join(''));

  // 6. 연계 메뉴 버튼 이벤트 바인딩
  const targetGid = g.groupId || numId;
  $('#detail-btn-schedule').off('click').on('click', function() {
    closeGroupDetailModal();
    viewGroupSchedule(targetGid);
  });
  $('#detail-btn-settlement').off('click').on('click', function() {
    closeGroupDetailModal();
    viewGroupSettlement(targetGid);
  });
  $('#detail-btn-gallery').off('click').on('click', function() {
    closeGroupDetailModal();
    window.location.href = 'gallery.html?groupId=' + targetGid;
  });

  // 7. 하단 액션 버튼
  let actionBtnHtml = '';
  if (isLeader) {
    actionBtnHtml = `
      <button onclick="closeGroupDetailModal()"
        class="py-2.5 px-5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm">
        <i data-lucide="crown" class="w-4 h-4 text-amber-600"></i>
        <span>내가 개설한 모임 (방장)</span>
      </button>
    `;
  } else if (isAdmin) {
    actionBtnHtml = `
      <button onclick="handleDetailJoinAction('${g.id}')"
        class="py-2.5 px-5 rounded-xl ${isJoined ? 'border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm">
        <i data-lucide="shield" class="w-4 h-4"></i>
        <span>${isJoined ? '관리자 권한 참여 취소' : '관리자 권한 참여 신청'}</span>
      </button>
    `;
  } else if (isJoined) {
    actionBtnHtml = `
      <button onclick="handleDetailJoinAction('${g.id}')"
        class="py-2.5 px-5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm active:scale-95">
        <i data-lucide="user-minus" class="w-4 h-4 text-rose-500"></i>
        <span>모임 참여 취소하기</span>
      </button>
    `;
  } else if (isFull) {
    actionBtnHtml = `
      <button disabled
        class="py-2.5 px-5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-none">
        <i data-lucide="user-x" class="w-4 h-4 text-slate-400"></i>
        <span>모집 마감 (정원 초과)</span>
      </button>
    `;
  } else if (!user) {
    actionBtnHtml = `
      <button onclick="handleDetailJoinAction('${g.id}')"
        class="py-2.5 px-5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm active:scale-95">
        <i data-lucide="log-in" class="w-4 h-4 text-slate-500"></i>
        <span>로그인하고 참여하기</span>
      </button>
    `;
  } else {
    actionBtnHtml = `
      <button onclick="handleDetailJoinAction('${g.id}')"
        class="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-2 shadow-md active:scale-95">
        <i data-lucide="user-plus" class="w-4 h-4"></i>
        <span>이 모임에 참여 신청</span>
      </button>
    `;
  }
  $('#group-detail-action-box').html(actionBtnHtml);

  // 모달 표시
  $('#modal-group-detail').removeClass('hidden').addClass('flex');
  lucide.createIcons();
}

function handleDetailJoinAction(groupId) {
  closeGroupDetailModal();
  toggleJoinGroup(groupId);
}

function closeGroupDetailModal() {
  $('#modal-group-detail').addClass('hidden').removeClass('flex');
}

// 전역 window 바인딩
window.openGroupDetailModal = openGroupDetailModal;
window.closeGroupDetailModal = closeGroupDetailModal;
window.handleDetailJoinAction = handleDetailJoinAction;

// ESC 키 입력 시 상세 모달 닫기
$(document).on('keydown', function(e) {
  if (e.key === 'Escape' || e.keyCode === 27) {
    closeGroupDetailModal();
  }
});

// ==================== 새 여행 모임 만들기 총 예산 입력 제어 ====================
function handleBudgetInput(el) {
  if (!el) el = document.getElementById('new-group-budget');
  if (!el) return;

  // 숫자 이외의 문자 제거
  let raw = String(el.value).replace(/\D/g, '');
  if (!raw) {
    el.value = '';
    $('#new-group-per-person-budget').addClass('hidden').text('');
    return;
  }

  // 3자리 콤마 포맷팅
  const numVal = parseInt(raw, 10);
  if (isNaN(numVal)) {
    el.value = '';
    $('#new-group-per-person-budget').addClass('hidden').text('');
    return;
  }

  el.value = numVal.toLocaleString('ko-KR');

  // 최대 인원수에 따른 1인당 예상 금액 실시간 자동 계산 힌트
  const maxEl = document.getElementById('new-group-max');
  const maxMembers = maxEl ? parseInt(maxEl.value, 10) : 4;
  const $perPersonEl = $('#new-group-per-person-budget');

  if (maxMembers > 0 && numVal > 0) {
    const perPerson = Math.round(numVal / maxMembers);
    $perPersonEl
      .removeClass('hidden')
      .html(`💡 1인당 약 <b class="font-bold text-emerald-700">${perPerson.toLocaleString('ko-KR')}원</b> (${maxMembers}인 기준 분할)`);
  } else {
    $perPersonEl.addClass('hidden').text('');
  }
}

// 최대 인원수 변경 시 1인당 계산 힌트 실시간 동기화
$(document).on('input change', '#new-group-max', function() {
  const budgetInput = document.getElementById('new-group-budget');
  if (budgetInput && budgetInput.value) {
    handleBudgetInput(budgetInput);
  }
});

window.handleBudgetInput = handleBudgetInput;

// ==================== 모임명 내 위치 감지 및 목적지/구분 자동 완성 ====================
const LOCATION_KEYWORD_RULES = [
  // 국내
  { keywords: ['제주', '우도', '서귀포', '한라산', '성산', '협재', '애월', '월정리'], destination: '제주도', type: '국내' },
  { keywords: ['부산', '해운대', '광안리', '자갈치', '태종대', '기장', '영도'], destination: '부산', type: '국내' },
  { keywords: ['양양', '죽도', '인구해변', '하조대'], destination: '강원 (양양)', type: '국내' },
  { keywords: ['강릉', '안목', '경포', '정동진'], destination: '강원 (강릉)', type: '국내' },
  { keywords: ['속초', '설악산', '아바이'], destination: '강원 (속초)', type: '국내' },
  { keywords: ['강원', '평창', '춘천', '정선'], destination: '강원도', type: '국내' },
  { keywords: ['경주', '황리단길', '첨성대', '불국사', '보문단지'], destination: '경주', type: '국내' },
  { keywords: ['여수', '오동도', '향일암', '돌산', '낭만포차'], destination: '여수', type: '국내' },
  { keywords: ['전주', '한옥마을', '경기전'], destination: '전주', type: '국내' },
  { keywords: ['서울', '홍대', '한강', '명동', '강남', '경복궁', '성수동'], destination: '서울', type: '국내' },
  { keywords: ['인천', '월미도', '송도', '차이나타운'], destination: '인천', type: '국내' },
  { keywords: ['대구', '동성로', '수성못'], destination: '대구', type: '국내' },
  { keywords: ['대전', '성심당', '유성'], destination: '대전', type: '국내' },
  { keywords: ['가평', '남이섬', '청평'], destination: '경기 (가평)', type: '국내' },

  // 해외
  { keywords: ['방콕', '치앙마이', '파타야', '푸켓', '태국', '카오산'], destination: '태국 (방콕)', type: '해외' },
  { keywords: ['도쿄', '시부야', '신주쿠', '긴자', '아사쿠사'], destination: '일본 (도쿄)', type: '해외' },
  { keywords: ['오사카', '교토', '고베', '도톤보리'], destination: '일본 (오사카)', type: '해외' },
  { keywords: ['후쿠오카', '유후인', '벳푸'], destination: '일본 (후쿠오카)', type: '해외' },
  { keywords: ['삿포로', '오타루', '비에이', '홋카이도'], destination: '일본 (삿포로)', type: '해외' },
  { keywords: ['일본'], destination: '일본', type: '해외' },
  { keywords: ['다낭', '호이안', '나트랑', '푸꾸옥', '하노이', '베트남'], destination: '베트남 (다낭)', type: '해외' },
  { keywords: ['타이베이', '지우펀', '스펀', '대만', '가오슝'], destination: '대만 (타이베이)', type: '해외' },
  { keywords: ['파리', '에펠탑', '프랑스'], destination: '프랑스 (파리)', type: '해외' },
  { keywords: ['로마', '이탈리아', '베네치아', '피렌체'], destination: '이탈리아 (로마)', type: '해외' },
  { keywords: ['스위스', '인터라켄', '융프라우'], destination: '스위스', type: '해외' },
  { keywords: ['런던', '영국'], destination: '영국 (런던)', type: '해외' },
  { keywords: ['하와이', '호놀룰루', '와이키키'], destination: '미국 (하와이)', type: '해외' },
  { keywords: ['괌', '사이판'], destination: '괌/사이판', type: '해외' },
  { keywords: ['발리', '인도네시아', '우붓'], destination: '인도네시아 (발리)', type: '해외' },
  { keywords: ['싱가포르', '마리나베이'], destination: '싱가포르', type: '해외' },
  { keywords: ['코타키나발루', '말레이시아'], destination: '말레이시아 (코타키나발루)', type: '해외' }
];

let lastAutoFilledLocation = '';

function handleGroupTitleInput() {
  const $titleInput = $('#new-group-title');
  const $locInput = $('#new-group-location');
  const $typeSelect = $('#new-group-type');
  if (!$titleInput.length || !$locInput.length || !$typeSelect.length) return;

  const titleVal = ($titleInput.val() || '').trim().toLowerCase();
  if (!titleVal) return;

  // 매칭되는 위치 규칙 찾기
  let matchedRule = null;
  for (const rule of LOCATION_KEYWORD_RULES) {
    if (rule.keywords.some(k => titleVal.includes(k.toLowerCase()))) {
      matchedRule = rule;
      break;
    }
  }

  if (matchedRule) {
    const currentLoc = ($locInput.val() || '').trim();
    // 목적지가 비어있거나, 이전에 자동으로 채워졌던 값이거나, 새로운 키워드와 다를 때 자동 완성
    if (!currentLoc || currentLoc === lastAutoFilledLocation || !ruleKeywordsMatch(currentLoc, matchedRule.keywords)) {
      $locInput.val(matchedRule.destination);
      lastAutoFilledLocation = matchedRule.destination;

      // 구분(국내/해외)도 자동 매칭
      if ($typeSelect.val() !== matchedRule.type) {
        $typeSelect.val(matchedRule.type);
      }

      // 시각적 강조 애니메이션 피드백
      $locInput.addClass('ring-2 ring-emerald-500 bg-emerald-50/60');
      $typeSelect.addClass('ring-2 ring-emerald-500 bg-emerald-50/60');
      setTimeout(() => {
        $locInput.removeClass('ring-2 ring-emerald-500 bg-emerald-50/60');
        $typeSelect.removeClass('ring-2 ring-emerald-500 bg-emerald-50/60');
      }, 1000);

      // 하단 인기 여행지 추천 박스 실시간 갱신
      updateGroupPopularDestinations();
    }
  }
}

function ruleKeywordsMatch(text, keywords) {
  if (!text) return false;
  const t = text.toLowerCase();
  return keywords.some(k => t.includes(k.toLowerCase()));
}

// 목적지 직접 입력 시 구분(국내/해외) 지능형 자동 연동 함수
function handleGroupLocationInput() {
  const $locInput = $('#new-group-location');
  const $typeSelect = $('#new-group-type');
  if ($locInput.length && $typeSelect.length) {
    const locVal = ($locInput.val() || '').trim().toLowerCase();
    if (locVal) {
      const isOverseas = ['태국', '방콕', '치앙마이', '파타야', '일본', '도쿄', '오사카', '후쿠오카', '삿포로', '베트남', '다낭', '나트랑', '호이안', '대만', '타이베이', '지우펀', '유럽', '파리', '스위스', '이탈리아', '로마', '런던', '영국', '하와이', '괌', '사이판', '발리', '인도네시아', '싱가포르', '코타키나발루'].some(k => locVal.includes(k.toLowerCase()));
      const isDomestic = ['제주', '우도', '부산', '해운대', '광안리', '강원', '양양', '강릉', '속초', '경주', '여수', '전주', '서울', '인천', '대구', '대전', '가평'].some(k => locVal.includes(k.toLowerCase()));

      if (isOverseas && $typeSelect.val() !== '해외') {
        $typeSelect.val('해외').addClass('ring-2 ring-emerald-500 bg-emerald-50/60');
        setTimeout(() => $typeSelect.removeClass('ring-2 ring-emerald-500 bg-emerald-50/60'), 1000);
      } else if (isDomestic && $typeSelect.val() !== '국내') {
        $typeSelect.val('국내').addClass('ring-2 ring-emerald-500 bg-emerald-50/60');
        setTimeout(() => $typeSelect.removeClass('ring-2 ring-emerald-500 bg-emerald-50/60'), 1000);
      }
    }
  }
  updateGroupPopularDestinations();
}

// ==================== 구분 및 목적지 기반 인기 여행지 추천 모듈 ====================
const POPULAR_DESTINATIONS_DATA = {
  "국내": {
    badge: "국내 인기 여행지 🇰🇷",
    defaultChips: [
      { name: "제주도", keyword: "제주", titleSuggest: "청춘 가득 제주도 힐링 드라이브 & 맛집 투어" },
      { name: "부산 (해운대/광안리)", keyword: "부산", titleSuggest: "부산 해운대 오션뷰 & 광안리 드론쇼 탐방" },
      { name: "강원 (양양/강릉/속초)", keyword: "강원", titleSuggest: "강원도 양양 서핑 & 강릉 커피거리 로드트립" },
      { name: "경주 (황리단길)", keyword: "경주", titleSuggest: "경주 천년고도 역사 & 황리단길 감성 카페 투어" },
      { name: "여수 (밤바다/오동도)", keyword: "여수", titleSuggest: "여수 밤바다 낭만포차 & 해상 케이블카 힐링" },
      { name: "전주 (한옥마을)", keyword: "전주", titleSuggest: "전주 한옥마을 한복 체험 & 미식 먹방 여행" },
      { name: "서울 (도심/한강)", keyword: "서울", titleSuggest: "서울 고궁 야간 개장 & 한강 뷰 피크닉" }
    ],
    subRegions: {
      "제주": {
        badge: "제주 세부 인기 명소 🏝️",
        chips: [
          { name: "제주 (협재/애월)", titleSuggest: "제주 서쪽 에메랄드빛 협재 & 애월 노을 투어" },
          { name: "제주 (성산/우도)", titleSuggest: "성산일출봉 하이킹 & 우도 전기차 일주" },
          { name: "제주 (서귀포/중문)", titleSuggest: "서귀포 올레시장 먹방 & 중문 힐링 여행" },
          { name: "제주 (구좌/월정리)", titleSuggest: "월정리 해변 카페거리 & 당근밭 드라이브" }
        ]
      },
      "부산": {
        badge: "부산 세부 핫플레이스 🌊",
        chips: [
          { name: "부산 (해운대/동백섬)", titleSuggest: "해운대 오션뷰 호캉스 & 동백섬 둘레길" },
          { name: "부산 (광안리/민락)", titleSuggest: "광안대교 야경 뷰 & 민락 수변공원 투어" },
          { name: "부산 (영도/흰여울)", titleSuggest: "영도 흰여울문화마을 & 태종대 절경 트립" }
        ]
      },
      "강원": {
        badge: "강원/동해 인기 스팟 🏄",
        chips: [
          { name: "강원 (양양 죽도/인구)", titleSuggest: "양양 서핑 강습 & 불멍 글램핑 바비큐 파티" },
          { name: "강원 (강릉 안목/경포)", titleSuggest: "강릉 안목해변 커피거리 & 경포호수 힐링" },
          { name: "강원 (속초 중앙시장)", titleSuggest: "속초 닭강정 & 오징어순대 미식 먹방 투어" }
        ]
      },
      "경주": {
        badge: "경주 역사 & 핫플 🌸",
        chips: [
          { name: "경주 (황리단길/대릉원)", titleSuggest: "황리단길 한옥 감성 카페 & 대릉원 포토존" },
          { name: "경주 (보문단지/불국사)", titleSuggest: "보문호수 산책로 & 유네스코 불국사 힐링" }
        ]
      },
      "여수": {
        badge: "여수 낭만 명소 🌉",
        chips: [
          { name: "여수 (종포/낭만포차)", titleSuggest: "여수 밤바다 낭만포차 & 해상 케이블카" },
          { name: "여수 (오동도/향일암)", titleSuggest: "오동도 동백숲 산책 & 향일암 일출 투어" }
        ]
      }
    }
  },
  "해외": {
    badge: "해외 인기 여행지 ✈️",
    defaultChips: [
      { name: "태국 (방콕/치앙마이)", keyword: "태국", titleSuggest: "방콕 카오산로드 야시장 & 마사지 힐링 배낭여행" },
      { name: "일본 (도쿄/신주쿠)", keyword: "일본", titleSuggest: "도쿄 시부야 스카이 & 도심 쇼핑 미식 투어" },
      { name: "일본 (오사카/교토)", keyword: "오사카", titleSuggest: "오사카 도톤보리 먹방 & 교토 전통 감성 여행" },
      { name: "베트남 (다낭/호이안)", keyword: "베트남", titleSuggest: "다낭 미케비치 리조트 & 호이안 올드타운 야경" },
      { name: "대만 (타이베이/지우펀)", keyword: "대만", titleSuggest: "타이베이 101 전망대 & 지우펀 홍등 먹방 투어" },
      { name: "유럽 (파리/스위스)", keyword: "유럽", titleSuggest: "로맨틱 파리 에펠탑 & 스위스 알프스 대자연" }
    ],
    subRegions: {
      "태국": {
        badge: "태국 인기 스팟 🇹🇭",
        chips: [
          { name: "태국 (방콕 카오산/야경)", titleSuggest: "방콕 카오산로드 야시장 & 루프탑 바 야경" },
          { name: "태국 (치앙마이 감성)", titleSuggest: "치앙마이 올드시티 감성 카페 & 사원 힐링" },
          { name: "태국 (파타야 산호섬)", titleSuggest: "파타야 해양 액티비티 & 산호섬 스노클링" }
        ]
      },
      "일본": {
        badge: "일본 인기 스팟 🇯🇵",
        chips: [
          { name: "일본 (도쿄 시부야/신주쿠)", titleSuggest: "도쿄 시부야 스카이 & 신주쿠 핫플 도심 투어" },
          { name: "일본 (오사카/교토)", titleSuggest: "오사카 도톤보리 글리코상 & 교토 청수사 여행" },
          { name: "일본 (후쿠오카/유후인)", titleSuggest: "후쿠오카 모츠나베 & 유후인 료칸 온천 힐링" },
          { name: "일본 (삿포로/오타루)", titleSuggest: "삿포로 눈꽃 여행 & 오타루 운하 로맨틱 투어" }
        ]
      },
      "베트남": {
        badge: "베트남 인기 스팟 🇻🇳",
        chips: [
          { name: "베트남 (다낭/바나힐)", titleSuggest: "다낭 미케비치 리조트 & 바나힐 골든브릿지" },
          { name: "베트남 (나트랑 호핑투어)", titleSuggest: "나트랑 빈원더스 & 스노클링 호핑 투어" }
        ]
      },
      "대만": {
        badge: "대만 인기 스팟 🇹🇼",
        chips: [
          { name: "대만 (타이베이 101)", titleSuggest: "타이베이 101 타워 & 융캉제 딤섬 먹방" },
          { name: "대만 (예스진지 투어)", titleSuggest: "지우펀 센과 치히로 홍등 & 스펀 풍등 날리기" }
        ]
      }
    }
  }
};

// 구분(국내/해외) 수동 변경 시 처리 함수
function handleGroupTypeChange() {
  const $typeSelect = $('#new-group-type');
  const $locInput = $('#new-group-location');
  if ($typeSelect.length && $locInput.length) {
    const newType = $typeSelect.val();
    const currentLoc = ($locInput.val() || '').trim().toLowerCase();

    // 국내/해외 교차 시 목적지 불일치 리셋
    const isDomesticKeyword = ['제주', '부산', '강원', '양양', '강릉', '속초', '경주', '여수', '전주', '서울', '인천', '대구', '대전', '가평'].some(k => currentLoc.includes(k));
    const isOverseasKeyword = ['태국', '방콕', '일본', '도쿄', '오사카', '후쿠오카', '삿포로', '베트남', '다낭', '나트랑', '대만', '타이베이', '유럽', '파리', '스위스', '이탈리아', '로마', '런던', '하와이', '괌', '발리', '싱가포르'].some(k => currentLoc.includes(k));

    if ((newType === '국내' && isOverseasKeyword) || (newType === '해외' && isDomesticKeyword)) {
      $locInput.val('');
      lastAutoFilledLocation = '';
    }
  }
  updateGroupPopularDestinations();
}

// 모임 만들기 팝업 구분 및 목적지 기반 인기 여행지 추천 갱신 함수
function updateGroupPopularDestinations() {
  const $typeSelect = $('#new-group-type');
  const $locInput = $('#new-group-location');
  const $badgeEl = $('#group-popular-dest-badge');
  const $descEl = $('#group-popular-dest-desc');
  const $chipsContainer = $('#group-popular-dest-chips');

  if (!$chipsContainer.length) return;

  const typeVal = ($typeSelect.length && $typeSelect.val()) || '국내';
  const locVal = ($locInput.length && ($locInput.val() || '').trim().toLowerCase()) || '';
  const typeData = POPULAR_DESTINATIONS_DATA[typeVal] || POPULAR_DESTINATIONS_DATA['국내'];

  let currentBadge = typeData.badge;
  let currentDesc = '추천 여행지 칩을 클릭하면 목적지와 모임명이 자동으로 제안됩니다.';
  let chipsToRender = typeData.defaultChips;

  // 목적지 입력 텍스트 기반 서브 리전 감지
  if (locVal && typeData.subRegions) {
    for (const [subKey, subInfo] of Object.entries(typeData.subRegions)) {
      if (locVal.includes(subKey.toLowerCase()) || 
          (subKey === '강원' && (locVal.includes('양양') || locVal.includes('강릉') || locVal.includes('속초'))) ||
          (subKey === '태국' && (locVal.includes('방콕') || locVal.includes('치앙마이') || locVal.includes('파타야'))) ||
          (subKey === '일본' && (locVal.includes('도쿄') || locVal.includes('오사카') || locVal.includes('후쿠오카') || locVal.includes('삿포로'))) ||
          (subKey === '베트남' && (locVal.includes('다낭') || locVal.includes('나트랑') || locVal.includes('호이안'))) ||
          (subKey === '대만' && (locVal.includes('타이베이') || locVal.includes('지우펀')))) {
        currentBadge = subInfo.badge;
        currentDesc = `'${subKey}' 지역의 인기 테마 명소 및 추천 일정입니다. 클릭하여 목적지를 구체화해보세요.`;
        chipsToRender = subInfo.chips;
        break;
      }
    }
  }

  $badgeEl.text(currentBadge);
  $descEl.text(currentDesc);

  // 칩 렌더링
  $chipsContainer.html(chipsToRender.map(chip => {
    const isSelected = locVal && chip.name.toLowerCase().includes(locVal);
    const activeStyle = isSelected 
      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
      : 'bg-white text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 border-slate-200';

    return `
      <button type="button" 
        onclick="applyPopularDestination('${chip.name.replace(/'/g, "\\'")}', '${(chip.titleSuggest || '').replace(/'/g, "\\'")}')"
        class="text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 active:scale-95 ${activeStyle}">
        <i data-lucide="map-pin" class="w-3 h-3 ${isSelected ? 'text-white' : 'text-emerald-500'}"></i>
        <span>${chip.name}</span>
      </button>
    `;
  }).join(''));

  if (window.lucide) lucide.createIcons();
}

// 추천 인기 여행지 목적지 및 모임명 적용
function applyPopularDestination(destName, titleSuggest) {
  const $locInput = $('#new-group-location');
  const $titleInput = $('#new-group-title');
  const $typeSelect = $('#new-group-type');

  if ($locInput.length) {
    $locInput.val(destName);
    lastAutoFilledLocation = destName;
    $locInput.addClass('ring-2 ring-emerald-500 bg-emerald-50/50');
    setTimeout(() => {
      $locInput.removeClass('ring-2 ring-emerald-500 bg-emerald-50/50');
    }, 1000);
  }

  // 목적지에 맞추어 구분(국내/해외) 자동 동기화
  if ($typeSelect.length) {
    const isOverseas = ['태국', '방콕', '치앙마이', '파타야', '일본', '도쿄', '오사카', '후쿠오카', '삿포로', '베트남', '다낭', '나트랑', '호이안', '대만', '타이베이', '지우펀', '유럽', '파리', '스위스', '이탈리아', '로마', '런던', '영국', '하와이', '괌', '사이판', '발리', '인도네시아', '싱가포르', '코타키나발루'].some(k => destName.includes(k));
    $typeSelect.val(isOverseas ? '해외' : '국내').addClass('ring-2 ring-emerald-500 bg-emerald-50/50');
    setTimeout(() => {
      $typeSelect.removeClass('ring-2 ring-emerald-500 bg-emerald-50/50');
    }, 1000);
  }

  // 모임명이 비어있거나 기본 제안일 때 자동 완성
  if ($titleInput.length) {
    const currentTitle = ($titleInput.val() || '').trim();
    if (!currentTitle || currentTitle.includes('청춘 가득') || currentTitle.includes('투어') || currentTitle.includes('여행')) {
      if (titleSuggest) {
        $titleInput.val(titleSuggest).addClass('ring-2 ring-emerald-500 bg-emerald-50/50');
        setTimeout(() => {
          $titleInput.removeClass('ring-2 ring-emerald-500 bg-emerald-50/50');
        }, 1000);
      }
    }
  }

  updateGroupPopularDestinations();
  showToast(`목적지가 '${destName}'(으)로 적용되었습니다. ✨`);
}

// 전역 바인딩 (인라인 이벤트 핸들러 및 타 모듈 호출 안전 보장)
window.handleGroupTitleInput = handleGroupTitleInput;
window.handleGroupTypeChange = handleGroupTypeChange;
window.handleGroupLocationInput = handleGroupLocationInput;
window.updateGroupPopularDestinations = updateGroupPopularDestinations;
window.applyPopularDestination = applyPopularDestination;

// 프리셋 테마 커버 이미지 선택
function selectPresetCover(url, label, btnEl) {
  $('#new-group-cover-preview').attr('src', url);
  $('#new-group-cover-url').val(url);
  $('#new-group-image-badge').text(`기본 이미지 (${label})`);
  $('#new-group-file-input').val('');

  $('.preset-cover-btn').removeClass('border-emerald-500').addClass('border-transparent');

  if (btnEl) {
    $(btnEl).addClass('border-emerald-500').removeClass('border-transparent');
  }
}

// 직접 파일 업로드 처리 (FileReader DataURL)
function handleCoverImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('이미지 파일(JPG, PNG, GIF 등)만 선택하실 수 있습니다.');
    return;
  }

  // 파일 크기 제한 (최대 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('이미지 크기는 최대 10MB 이하만 가능합니다.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    $('#new-group-cover-preview').attr('src', dataUrl);
    $('#new-group-cover-url').val(dataUrl);
    $('#new-group-image-badge').text('직접 등록한 사진 📸');

    // 프리셋 버튼 강조 해제
    $('.preset-cover-btn').removeClass('border-emerald-500').addClass('border-transparent');

    showToast('대표 이미지가 성공적으로 반영되었습니다! 📸');
  };
  reader.readAsDataURL(file);
}

// 직접 URL 입력창 토글
function toggleCustomUrlInput() {
  const $container = $('#custom-url-container');
  if (!$container.length) return;
  $container.toggleClass('hidden');
  if (!$container.hasClass('hidden')) {
    $('#new-group-custom-url-input').trigger('focus');
  }
}

// 직접 입력한 이미지 URL 적용
function applyCustomImageUrl() {
  const $input = $('#new-group-custom-url-input');
  if (!$input.length) return;
  const url = ($input.val() || '').trim();
  if (!url) {
    alert('이미지 URL 주소를 입력해주세요.');
    return;
  }

  $('#new-group-cover-preview').attr('src', url);
  $('#new-group-cover-url').val(url);
  $('#new-group-image-badge').text('웹 링크 이미지 🔗');

  $('.preset-cover-btn').removeClass('border-emerald-500').addClass('border-transparent');

  showToast('웹 이미지 주소가 대표 이미지로 설정되었습니다! 🔗');
}

async function handleCreateGroup(e) {
  e.preventDefault();
  const title = ($('#new-group-title').val() || '').trim();
  const type = $('#new-group-type').val();
  const location = ($('#new-group-location').val() || '').trim();
  const startDate = $('#new-group-start-date').val();
  const endDate = $('#new-group-end-date').val();
  const max = parseInt($('#new-group-max').val(), 10);
  const rawBudget = ($('#new-group-budget').val() || '').replace(/\D/g, '');
  const budget = rawBudget ? Number(rawBudget).toLocaleString('ko-KR') + '원' : '0원';
  const desc = ($('#new-group-desc').val() || '').trim();

  if (!startDate || !endDate) {
    alert('여행 시작일과 종료일을 모두 선택해주세요.');
    return;
  }

  // 박수/일수 계산
  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const diffDays = Math.round((eDate - sDate) / (1000 * 60 * 60 * 24));
  const stayText = diffDays === 0 ? '당일치기' : `${diffDays}박 ${diffDays + 1}일`;
  const dateFormatted = `${startDate.replace(/-/g, '.')} ~ ${endDate.replace(/-/g, '.')} (${stayText})`;

  // 사용자가 직접 선택한 대표 이미지 우선 적용
  let selectedCoverImage = ($('#new-group-cover-url').val() || '').trim();

  if (!selectedCoverImage) {
    const sampleImages = [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ];
    selectedCoverImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
  }

  const user = getLoggedInUser();
  const creatorName = user ? (user.name || user.username) : '나';
  const numericId = Date.now() % 100000000;

  const newGroup = {
    id: 'grp-' + numericId,
    groupId: numericId,
    title,
    type,
    location,
    date: dateFormatted,
    startDate: startDate,
    endDate: endDate,
    maxMembers: max,
    currentMembers: 1,
    members: [`${creatorName}(방장)`],
    budget,
    desc,
    image: selectedCoverImage,
    joined: true,
    createdBy: user ? user.memberId : 1
  };

  // 백엔드가 동작 중이면 MySQL에 저장
  if (isBackendLive) {
    try {
      await $.ajax({
        url: '/api/groups',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          groupName: title,
          tripType: type,
          location: location,
          startDate: startDate,
          endDate: endDate,
          maxMembers: max,
          estimatedBudget: budget,
          description: desc,
          imageUrl: selectedCoverImage,
          createdBy: user ? user.memberId : 1
        })
      });
      await syncBackend();
    } catch (e) {}
  } else {
    groups.unshift(newGroup);
    saveGroups();
    renderGroups();
  }

  closeCreateGroupModal();
  $('#create-group-form').trigger('reset');
  $('#new-group-per-person-budget').addClass('hidden').text('');
  showToast(`'${title}' 모임이 생성되었습니다! ✈️ (${stayText})`);
}

function saveGroups() {
  localStorage.setItem('travelmates_groups', JSON.stringify(groups));
}

// --------------------------------------------------------------------------------
// PLANNER MODULE (여행 모임별 일정 플래너)
// --------------------------------------------------------------------------------

// 1. 플래너 모임 드롭다운 초기화
function initPlannerGroupSelect() {
  const $sel = $('#planner-group-select');
  if (!$sel.length) return;

  const prevVal = $sel.val();
  $sel.html('<option value="">-- 모임을 선택하세요 --</option>');
  groups.forEach(g => {
    $sel.append($('<option>', {
      value: g.groupId || g.id,
      text: g.title
    }));
  });

  // URL 파라미터 우선 확인
  let targetGroupId = null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    targetGroupId = urlParams.get('groupId');
  } catch (e) {}

  if (targetGroupId) {
    $sel.val(targetGroupId);
    onPlannerGroupChange();
  } else if (prevVal) {
    $sel.val(prevVal);
    onPlannerGroupChange();
  } else if (groups.length > 0) {
    // 기본으로 첫 번째 모임을 자동 선택하여 플래너 일정을 즉시 정상 출력
    $sel.val(groups[0].groupId || groups[0].id);
    onPlannerGroupChange();
  }

  lucide.createIcons();
}

// 2. 모임 드롭다운 변경 시
async function onPlannerGroupChange() {
  const val = $('#planner-group-select').val();

  if (!val) {
    $('#planner-no-group').removeClass('hidden');
    $('#planner-body').addClass('hidden');
    plannerGroupId = null;
    return;
  }

  // 선택된 모임 찾기
  plannerGroupObj = groups.find(g => String(g.groupId || g.id) === String(val)) || null;
  plannerGroupId = val;

  // 여행 기간으로 최대 Day 계산
  if (plannerGroupObj) {
    plannerMaxDay = calcTripDays(plannerGroupObj);
    $('#planner-group-name').text(plannerGroupObj.title);
    $('#planner-group-meta').text(
      (plannerGroupObj.type || '') + ' | ' + (plannerGroupObj.date || plannerGroupObj.location || '')
    );
  }

  // 패널 표시
  $('#planner-no-group').addClass('hidden');
  $('#planner-body').removeClass('hidden');

  // Day 1로 초기화
  currentDay = 1;
  renderDayTabs();
  await loadPlannerSchedules();
}

// 3. 여행 일수 계산
function calcTripDays(grp) {
  try {
    const startDate = grp.startDate || (grp.date || '').split('~')[0].trim();
    const endDate = grp.endDate || (grp.date || '').split('~')[1]?.trim();
    if (startDate && endDate) {
      const s = new Date(startDate.replace(/\./g, '-'));
      const e = new Date(endDate.replace(/\./g, '-').split(' ')[0]);
      const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, Math.min(days, 14));
    }
  } catch (err) {}
  return 3; // 기본값
}

// 4. Day 탭 동적 생성 ('전체 일정 📋' 탭 포함)
function renderDayTabs() {
  const $container = $('#day-tabs');
  if (!$container.length) return;

  let tabsHtml = `
    <button onclick="selectPlannerDay('all')"
      class="day-tab flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-${currentDay === 'all' ? 'bold' : 'medium'}
             ${currentDay === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition flex items-center gap-1.5"
      data-day="all">
      전체 일정 📋
    </button>
  `;

  for (let day = 1; day <= plannerMaxDay; day++) {
    tabsHtml += `
      <button onclick="selectPlannerDay(${day})"
        class="day-tab flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-${day === currentDay ? 'bold' : 'medium'}
               ${day === currentDay ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition"
        data-day="${day}">
        Day ${day}
      </button>
    `;
  }
  $container.html(tabsHtml);
}

// 5. Day 탭 선택
function selectPlannerDay(day) {
  currentDay = day;
  renderDayTabs();
  renderPlannerSchedules();
  const $titleEl = $('#planner-day-title');
  if ($titleEl.length) {
    if (day === 'all') {
      $titleEl.html(`<i data-lucide="layers" class="w-4 h-4 text-emerald-500"></i>전체 일정 (Day 1 ~ Day ${plannerMaxDay})`);
    } else {
      $titleEl.html(`<i data-lucide="clock" class="w-4 h-4 text-emerald-500"></i>Day ${day} 일정`);
    }
  }
  lucide.createIcons();
}

// 6. 서버/LocalStorage에서 일정 로드 (jQuery $.ajax)
async function loadPlannerSchedules() {
  if (!plannerGroupId) return;

  const numericId = getNumericId(plannerGroupId);
  const lsKey = 'travelmates_schedules_' + numericId;

  try {
    const data = await $.ajax({
      url: '/api/groups/' + numericId + '/schedules',
      method: 'GET',
      dataType: 'json'
    });
    plannerSchedules = data.map(s => ({
      id: s.scheduleId || s.SCHEDULE_ID,
      scheduleId: s.scheduleId || s.SCHEDULE_ID,
      day: s.dayNumber || s.DAY_NUMBER || 1,
      time: s.planTime || s.PLAN_TIME || '',
      place: s.place || s.PLACE || '',
      memo: s.memo || s.MEMO || '',
      latitude: s.latitude != null ? s.latitude : (s.LATITUDE != null ? s.LATITUDE : null),
      longitude: s.longitude != null ? s.longitude : (s.LONGITUDE != null ? s.LONGITUDE : null)
    }));
    localStorage.setItem(lsKey, JSON.stringify(plannerSchedules));
  } catch (e) {
    // LocalStorage fallback
    const stored = localStorage.getItem(lsKey);
    if (stored) {
      plannerSchedules = JSON.parse(stored);
    } else {
      // DEFAULT_PLANS fallback (기존 샘플 데이터)
      const defPlans = DEFAULT_PLANS[numericId] || [];
      plannerSchedules = defPlans.map((p, i) => ({
        id: p.id || ('p-' + i), scheduleId: null,
        day: p.day || 1, time: p.time, place: p.place, memo: p.memo
      }));
    }
  }

  renderPlannerSchedules();
}

// 7. 현재 Day 일정 렌더링 (또는 전체 일정 묶음 + 신규 등록 항목 즉시 하이라이트 & 자동 포커스 스크롤)
function renderPlannerSchedules(highlightId) {
  // 기존 인라인 지도 인스턴스 안전하게 정리 (메모리 누수 및 지도 컨테이너 중복 초기화 방지)
  if (typeof cleanAllInlineScheduleMaps === 'function') {
    cleanAllInlineScheduleMaps();
  }

  const $container = $('#plan-timeline');
  const $countEl = $('#planner-schedule-count');
  if (!$container.length) return;

  let displayItems = [];
  if (currentDay === 'all') {
    displayItems = [...plannerSchedules].sort((a, b) => {
      if ((a.day || 1) !== (b.day || 1)) return (a.day || 1) - (b.day || 1);
      return (a.time || '').localeCompare(b.time || '');
    });
  } else {
    displayItems = plannerSchedules
      .filter(s => String(s.day) === String(currentDay))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }

  $countEl.text(displayItems.length + '개');

  if (displayItems.length === 0) {
    $container.html(`
      <div class="py-10 text-center text-slate-400">
        <i data-lucide="calendar-x" class="w-10 h-10 mx-auto mb-3 text-slate-300"></i>
        <p class="text-sm">${currentDay === 'all' ? '등록된 일정이 없습니다.' : `Day ${currentDay}에 등록된 일정이 없습니다.`}</p>
        <p class="text-xs mt-1">위의 폼에서 일정을 추가해보세요!</p>
      </div>`);
    lucide.createIcons();
    return;
  }

  const timeColors = ['bg-emerald-100 text-emerald-800', 'bg-teal-100 text-teal-800',
    'bg-cyan-100 text-cyan-800', 'bg-blue-100 text-blue-800', 'bg-violet-100 text-violet-700'];

  $container.html(displayItems.map((item, idx) => {
    const isHighlighted = highlightId && (String(item.id) === String(highlightId) || String(item.scheduleId) === String(highlightId));
    const highlightClasses = isHighlighted
      ? 'ring-2 ring-emerald-500 bg-emerald-50 shadow-md scale-[1.01] transition-all duration-300'
      : 'bg-slate-50 hover:bg-emerald-50/60 transition';

    // 위치 지정 여부 판별 (위경도 저장되어 있거나 프리셋 명소 매칭 여부)
    const hasCoordinates = (item.latitude != null && item.longitude != null);
    const matchedPreset = typeof findPresetLocation === 'function' ? findPresetLocation(item.place) : null;
    const isLocationSet = hasCoordinates || matchedPreset != null;

    const safeId = escapeHtml(item.id || item.scheduleId);
    const safePlace = escapeHtml(item.place || '장소 미지정');
    const safeMemo = escapeHtml(item.memo || '');
    const safeTime = escapeHtml(item.time || '');

    return `
      <div id="plan-item-${safeId}"
        onclick="toggleScheduleInlineMap('${safeId}')"
        class="relative timeline-dot group ${highlightClasses} p-4 rounded-2xl border border-slate-200/80 mb-3 cursor-pointer hover:border-emerald-400 hover:shadow-md transition">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              ${currentDay === 'all' ? `<span class="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-white">Day ${item.day || 1}</span>` : ''}
              ${safeTime ? `<span class="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${timeColors[idx % timeColors.length]}">${safeTime}</span>` : ''}
              ${isHighlighted ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500 text-white animate-pulse">✨ 방금 등록됨</span>` : ''}
              ${isLocationSet ? `
                <span id="sched-map-badge-${safeId}" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 group-hover:bg-emerald-100 transition shadow-2xs">
                  <i data-lucide="map-pin" class="w-3 h-3 text-emerald-600"></i>
                  <span id="sched-map-badge-text-${safeId}">지도 보기</span>
                  <i id="sched-chevron-${safeId}" data-lucide="chevron-down" class="w-3 h-3 text-emerald-600 transition-transform duration-200"></i>
                </span>
              ` : `
                <button type="button" onclick="event.stopPropagation(); openLocationPickerForSchedule('${safeId}')"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition shadow-xs active:scale-95 animate-pulse"
                  title="클릭하여 지도에서 위치 지정" aria-label="클릭하여 지도에서 위치 지정">
                  <i data-lucide="map-pin" class="w-3 h-3 text-amber-600"></i>위치 지정하기
                </button>
              `}
            </div>
            <h4 class="text-base font-bold text-slate-900 truncate group-hover:text-emerald-700 transition">${safePlace}</h4>
            ${safeMemo ? `<p class="text-xs text-slate-500 mt-1 flex items-center gap-1"><i data-lucide="info" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i><span>${safeMemo}</span></p>` : ''}
          </div>
          <div class="flex items-center gap-1">
            <button type="button" onclick="event.stopPropagation(); toggleScheduleInlineMap('${safeId}')"
              class="flex-shrink-0 text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition"
              title="지도 펼치기/접기" aria-label="지도 펼치기 또는 접기">
              <i id="sched-action-icon-${safeId}" data-lucide="map" class="w-4 h-4"></i>
            </button>
            <button type="button" onclick="event.stopPropagation(); deletePlannerItem('${safeId}')"
              class="flex-shrink-0 text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition"
              title="삭제" aria-label="일정 삭제">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- 인라인 확장 지도 컨테이너 (아코디언 방식) -->
        <div id="sched-inline-map-wrapper-${safeId}" class="sched-inline-map-wrapper hidden mt-3 pt-3 border-t border-slate-200/80" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div class="flex items-center gap-1.5 text-xs text-slate-600">
              <i data-lucide="navigation" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"></i>
              <span id="sched-inline-coord-${safeId}" class="text-[11px] font-mono text-slate-500">위치 좌표</span>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <a id="sched-inline-kakao-${safeId}" href="#" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-300 hover:bg-amber-400 text-amber-950 transition shadow-2xs">
                <span>카카오맵 길찾기</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
              <a id="sched-inline-naver-${safeId}" href="#" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#03C75A] hover:bg-emerald-600 text-white transition shadow-2xs">
                <span>네이버지도 길찾기</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
              <button type="button" onclick="event.stopPropagation(); toggleScheduleInlineMap('${safeId}', false)"
                class="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
                title="지도 접기" aria-label="지도 접기">
                <span>접기</span>
                <i data-lucide="chevron-up" class="w-3 h-3"></i>
              </button>
            </div>
          </div>
          <div id="sched-inline-map-${safeId}" class="w-full h-64 rounded-xl border border-slate-200 shadow-inner bg-slate-100 z-10 overflow-hidden"></div>
        </div>
      </div>
    `;
  }).join(''));

  lucide.createIcons();

  // 방금 등록된 일정으로 자동 부드러운 스크롤 이동
  if (highlightId) {
    setTimeout(() => {
      const $targetEl = $(`#plan-item-${highlightId}`);
      if ($targetEl.length) {
        $targetEl[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  }
}

// 8. 인라인 폼으로 일정 추가 (위치 좌표 함께 저장 & 즉시 타임라인 렌더링 & 하이라이트 포커스)
async function handleInlineAddPlan(e) {
  e.preventDefault();
  if (!plannerGroupId) { showToast('먼저 여행 모임을 선택해주세요.'); return; }

  const time = ($('#inline-plan-time').val() || '').trim();
  const place = ($('#inline-plan-place').val() || '').trim();
  const memo = ($('#inline-plan-memo').val() || '').trim();

  if (!place) return;

  const latVal = $('#inline-plan-lat').val();
  const lngVal = $('#inline-plan-lng').val();
  let lat = latVal ? parseFloat(latVal) : null;
  let lng = lngVal ? parseFloat(lngVal) : null;

  // 좌표가 미지정된 경우 프리셋 명소 자동 매핑 보정
  if (lat == null || lng == null) {
    const matched = typeof findPresetLocation === 'function' ? findPresetLocation(place) : null;
    if (matched) { lat = matched.lat; lng = matched.lng; }
  }

  const targetDay = currentDay === 'all' ? 1 : Number(currentDay);
  const numericGroupId = getNumericId(plannerGroupId);
  const payload = {
    groupId: numericGroupId,
    dayNumber: targetDay,
    planTime: time || null,
    place,
    memo,
    latitude: lat,
    longitude: lng
  };
  const newItem = {
    id: 'p-' + Date.now(),
    scheduleId: null,
    day: targetDay,
    time,
    place,
    memo,
    latitude: lat,
    longitude: lng
  };

  try {
    const created = await $.ajax({
      url: '/api/groups/' + numericGroupId + '/schedules',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      dataType: 'json'
    });
    await loadPlannerSchedules();
    const targetHighlightId = (created && (created.scheduleId || created.id)) || newItem.id;
    if (currentDay !== 'all' && currentDay !== targetDay) {
      selectPlannerDay(targetDay);
    }
    renderPlannerSchedules(targetHighlightId);
    showToast(`Day ${targetDay}에 일정이 등록되어 즉시 확인되었습니다! ✨`);
  } catch (err) {
    // LocalStorage fallback
    plannerSchedules.push(newItem);
    localStorage.setItem('travelmates_schedules_' + numericGroupId, JSON.stringify(plannerSchedules));
    if (currentDay !== 'all' && currentDay !== targetDay) {
      selectPlannerDay(targetDay);
    }
    renderPlannerSchedules(newItem.id);
    showToast(`Day ${targetDay}에 일정이 등록되어 즉시 확인되었습니다! (로컬 저장) ✨`);
  }

  $('#inline-add-plan-form').trigger('reset');
  $('#inline-plan-lat').val('');
  $('#inline-plan-lng').val('');
}

// 9. 일정 삭제
async function deletePlannerItem(id) {
  if (!confirm('이 일정을 삭제하시겠습니까?')) return;

  const item = plannerSchedules.find(s => String(s.id) === String(id) || String(s.scheduleId) === String(id));
  if (!item) return;

  if (item.scheduleId) {
    try {
      await $.ajax({
        url: '/api/schedules/' + item.scheduleId,
        method: 'DELETE'
      });
    } catch (e) {}
  }

  plannerSchedules = plannerSchedules.filter(s => String(s.id) !== String(id) && String(s.scheduleId) !== String(id));
  localStorage.setItem('travelmates_schedules_' + getNumericId(plannerGroupId), JSON.stringify(plannerSchedules));
  renderPlannerSchedules();
  showToast('일정이 삭제되었습니다.');
}

// 10. 플래너 새로고침
async function refreshPlannerSchedules() {
  if (!plannerGroupId) return;
  await loadPlannerSchedules();
  showToast('일정을 새로고침했습니다.');
}

// --- 일정 모달 관련 기능 지원 ---
function selectPlanDay(day) { selectPlannerDay(day); }

function openAddPlanModal() {
  const $modal = $('#modal-add-plan');
  if ($modal.length) {
    const $daySelect = $('#plan-day-select');
    if ($daySelect.length) {
      let opts = '';
      for (let d = 1; d <= plannerMaxDay; d++) {
        const isSel = (currentDay === d || (currentDay === 'all' && d === 1)) ? 'selected' : '';
        opts += `<option value="${d}" ${isSel}>Day ${d}</option>`;
      }
      $daySelect.html(opts);
    }
    $modal.removeClass('hidden').addClass('flex');
    $('#plan-time').trigger('focus');
    return;
  }
  // 인라인 폼의 장소 필드에 포커스 (fallback)
  const $placeInput = $('#inline-plan-place');
  if ($placeInput.length) {
    $placeInput.trigger('focus');
    $placeInput[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function closeAddPlanModal() {
  $('#modal-add-plan').addClass('hidden').removeClass('flex');
}

async function handleAddPlan(e) {
  e.preventDefault();
  if (!plannerGroupId) {
    showToast('먼저 일정을 추가할 여행 모임을 선택해주세요.');
    return;
  }

  const $daySelect = $('#plan-day-select');
  const targetDay = $daySelect.length ? parseInt($daySelect.val(), 10) : (currentDay === 'all' ? 1 : Number(currentDay));
  const time = ($('#plan-time').val() || '').trim() || '12:00';
  const place = ($('#plan-place').val() || '').trim();
  const memo = ($('#plan-memo').val() || '').trim();

  if (!place) {
    alert('장소 또는 활동명을 입력해주세요.');
    return;
  }

  const latVal = $('#plan-lat').val();
  const lngVal = $('#plan-lng').val();
  let lat = latVal ? parseFloat(latVal) : null;
  let lng = lngVal ? parseFloat(lngVal) : null;

  if (lat == null || lng == null) {
    const matched = typeof findPresetLocation === 'function' ? findPresetLocation(place) : null;
    if (matched) { lat = matched.lat; lng = matched.lng; }
  }

  const numericGroupId = getNumericId(plannerGroupId);
  const newItem = {
    id: 'p-' + Date.now(),
    scheduleId: null,
    day: targetDay,
    time,
    place,
    memo,
    latitude: lat,
    longitude: lng
  };

  const payload = {
    groupId: numericGroupId,
    dayNumber: targetDay,
    planTime: time,
    place,
    memo,
    latitude: lat,
    longitude: lng
  };

  try {
    const created = await $.ajax({
      url: '/api/groups/' + numericGroupId + '/schedules',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      dataType: 'json'
    });
    await loadPlannerSchedules();
    const targetHighlightId = (created && (created.scheduleId || created.id)) || newItem.id;
    if (currentDay !== 'all' && currentDay !== targetDay) {
      selectPlannerDay(targetDay);
    }
    renderPlannerSchedules(targetHighlightId);
    showToast(`Day ${targetDay}에 일정이 등록되어 즉시 확인되었습니다! ✨`);
  } catch (err) {
    plannerSchedules.push(newItem);
    localStorage.setItem('travelmates_schedules_' + numericGroupId, JSON.stringify(plannerSchedules));
    if (currentDay !== 'all' && currentDay !== targetDay) {
      selectPlannerDay(targetDay);
    }
    renderPlannerSchedules(newItem.id);
    showToast(`Day ${targetDay}에 일정이 등록되어 즉시 확인되었습니다! (로컬 저장) ✨`);
  }

  $('#add-plan-form').trigger('reset');
  $('#plan-lat').val('');
  $('#plan-lng').val('');
  closeAddPlanModal();
}

function deletePlanItem(id) { deletePlannerItem(id); }

function savePlans() {
  localStorage.setItem('travelmates_plans', JSON.stringify(plans));
}

// --------------------------------------------------------------------------------
// TIME PICKER POPUP MODULE (시간 선택 팝업 모달)
// --------------------------------------------------------------------------------
let timePickerTargetInputId = 'inline-plan-time';
let tpAmPm = 'AM';
let tpHour = 10;
let tpMinute = '00';

// 1. 타임피커 옵션 초기화 (1~12시, 00~55분)
function initTimePickerOptions() {
  const $hourSel = $('#tp-select-hour');
  const $minSel = $('#tp-select-minute');
  if (!$hourSel.length || !$minSel.length) return;

  if ($hourSel.find('option').length === 0) {
    let hourHtml = '';
    for (let h = 1; h <= 12; h++) {
      const val = h;
      const text = (h < 10 ? '0' + h : h) + '시';
      hourHtml += `<option value="${val}">${text}</option>`;
    }
    $hourSel.html(hourHtml);
  }

  if ($minSel.find('option').length === 0) {
    let minHtml = '';
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
    minutes.forEach(m => {
      minHtml += `<option value="${m}">${m}분</option>`;
    });
    $minSel.html(minHtml);
  }
}

// 2. 타임피커 팝업 열기
function openTimePickerModal(targetInputId) {
  timePickerTargetInputId = targetInputId || 'inline-plan-time';
  initTimePickerOptions();

  // 기존 입력값이 있으면 파싱하여 반영
  const $targetInput = $(`#${timePickerTargetInputId}`);
  const currentVal = ($targetInput.val() || '').trim();

  if (currentVal && /^\d{1,2}:\d{2}$/.test(currentVal)) {
    const parts = currentVal.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];

    if (h >= 12) {
      tpAmPm = 'PM';
      if (h > 12) h -= 12;
    } else {
      tpAmPm = 'AM';
      if (h === 0) h = 12;
    }
    tpHour = h;
    tpMinute = m;
  } else {
    // 기본값 오전 10:00
    tpAmPm = 'AM';
    tpHour = 10;
    tpMinute = '00';
  }

  $('#tp-select-hour').val(tpHour);
  $('#tp-select-minute').val(tpMinute);

  updateTimePickerDisplay();

  $('#modal-time-picker').removeClass('hidden').addClass('flex');
  lucide.createIcons();
}

// 3. 타임피커 팝업 닫기
function closeTimePickerModal() {
  $('#modal-time-picker').addClass('hidden').removeClass('flex');
}

// 4. 오전 / 오후 변경
function setTimeAmPm(ampm) {
  tpAmPm = ampm;
  updateTimePickerDisplay();
}

// 5. 드롭다운 변경 시 호출
function onTimePickerChange() {
  const $hourSel = $('#tp-select-hour');
  const $minSel = $('#tp-select-minute');
  if ($hourSel.length) tpHour = parseInt($hourSel.val(), 10);
  if ($minSel.length) tpMinute = $minSel.val();
  updateTimePickerDisplay();
}

// 6. 간편 프리셋 시간 선택 (원클릭으로 즉시 적용 및 닫기)
function selectTimePreset(timeStr) {
  if (!timeStr) return;
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1];

  if (h >= 12) {
    tpAmPm = 'PM';
    if (h > 12) h -= 12;
  } else {
    tpAmPm = 'AM';
    if (h === 0) h = 12;
  }
  tpHour = h;
  tpMinute = m;

  $('#tp-select-hour').val(tpHour);
  $('#tp-select-minute').val(tpMinute);

  updateTimePickerDisplay();
  applyTimePicker();
}

// 7. 디스플레이 갱신 (미리보기 카드 및 오전/오후 버튼 스타일)
function updateTimePickerDisplay() {
  const $btnAm = $('#tp-btn-am');
  const $btnPm = $('#tp-btn-pm');

  if ($btnAm.length && $btnPm.length) {
    if (tpAmPm === 'AM') {
      $btnAm.attr('class', 'flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-white text-emerald-700 shadow-sm');
      $btnPm.attr('class', 'flex-1 py-1.5 rounded-lg text-xs font-bold transition text-slate-600 hover:text-slate-900');
    } else {
      $btnPm.attr('class', 'flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-white text-emerald-700 shadow-sm');
      $btnAm.attr('class', 'flex-1 py-1.5 rounded-lg text-xs font-bold transition text-slate-600 hover:text-slate-900');
    }
  }

  // 24시간 형식 계산
  let h24 = parseInt(tpHour, 10);
  if (tpAmPm === 'PM' && h24 < 12) h24 += 12;
  if (tpAmPm === 'AM' && h24 === 12) h24 = 0;
  const formatted24 = (h24 < 10 ? '0' + h24 : h24) + ':' + tpMinute;

  $('#tp-preview-time').text(formatted24);
  const ampmText = tpAmPm === 'AM' ? '오전' : '오후';
  $('#tp-preview-desc').text(`${ampmText} ${tpHour}시 ${tpMinute}분`);
}

// 8. 선택한 시간 적용하기
function applyTimePicker() {
  let h24 = parseInt(tpHour, 10);
  if (tpAmPm === 'PM' && h24 < 12) h24 += 12;
  if (tpAmPm === 'AM' && h24 === 12) h24 = 0;
  const formattedTime = (h24 < 10 ? '0' + h24 : h24) + ':' + tpMinute;

  const $targetInput = $(`#${timePickerTargetInputId}`);
  if ($targetInput.length) {
    $targetInput.val(formattedTime);
    // 시각적 피드백 효과
    $targetInput.addClass('ring-2 ring-emerald-500 bg-emerald-50/50');
    setTimeout(() => {
      $targetInput.removeClass('ring-2 ring-emerald-500 bg-emerald-50/50');
    }, 1000);
  }

  closeTimePickerModal();
  showToast(`시간이 '${formattedTime}'(${tpAmPm === 'AM' ? '오전' : '오후'} ${tpHour}시 ${tpMinute}분)로 입력되었습니다. ⏰`);
}

// --------------------------------------------------------------------------------
// LOCATION PICKER POPUP MODULE (지도 위치 및 장소 선택 팝업 모달)
// --------------------------------------------------------------------------------
let locPickerTargetInputId = 'inline-plan-place';
let locPickerTargetScheduleId = null;
let locMap = null;
let locMarker = null;
let currentPickedLoc = { name: '', desc: '', lat: 33.4586, lng: 126.9427 };

// 국내외 대표 여행지 및 명소 데이터베이스 (검색 및 유사도 추천 확장)
const PRESET_LOCATIONS = [
  // 제주
  { region: '제주', name: '성산일출봉', desc: '유네스코 세계자연유산 및 일출 명소', lat: 33.4586, lng: 126.9427 },
  { region: '제주', name: '협재해수욕장', desc: '에메랄드빛 바다와 비양도 뷰', lat: 33.3938, lng: 126.2397 },
  { region: '제주', name: '섭지코지', desc: '해안 절경과 붉은 화산재 송이 언덕', lat: 33.4243, lng: 126.9298 },
  { region: '제주', name: '카멜리아힐', desc: '아름다운 동백꽃 수목원', lat: 33.2895, lng: 126.3688 },
  { region: '제주', name: '한라산 백록담', desc: '대한민국 최고봉 국립공원', lat: 33.3617, lng: 126.5332 },
  { region: '제주', name: '우도봉', desc: '소머리를 닮은 우도의 최고봉', lat: 33.4965, lng: 126.9667 },
  { region: '제주', name: '서귀포 매일올레시장', desc: '모닥치기와 흑돼지 길거리 음식', lat: 33.2504, lng: 126.5645 },
  { region: '제주', name: '동문시장', desc: '야시장 먹거리와 신선한 딱새우회', lat: 33.5126, lng: 126.5284 },
  { region: '제주', name: '함덕해수욕장', desc: '서우봉과 에메랄드빛 바다 산책로', lat: 33.5434, lng: 126.6698 },
  { region: '제주', name: '월정리해변', desc: '풍차와 오션뷰 카페거리, 투명카약', lat: 33.5562, lng: 126.7958 },
  { region: '제주', name: '애월 한담해안산책로', desc: '노을이 아름다운 애월 카페거리', lat: 33.4623, lng: 126.3101 },
  { region: '제주', name: '오설록 티뮤지엄', desc: '넓은 녹차밭과 녹차 디저트', lat: 33.3059, lng: 126.2894 },
  { region: '제주', name: '천지연폭포', desc: '기암절벽과 울창한 난대림 폭포', lat: 33.2448, lng: 126.5595 },
  { region: '제주', name: '중문 대포주상절리대', desc: '육각형 돌기둥과 부서지는 파도', lat: 33.2376, lng: 126.4251 },

  // 부산
  { region: '부산', name: '해운대 해수욕장', desc: '대한민국 대표 해변 및 동백섬', lat: 35.1587, lng: 129.1604 },
  { region: '부산', name: '광안리 해변', desc: '광안대교 오션뷰와 드론쇼 명소', lat: 35.1532, lng: 129.1186 },
  { region: '부산', name: '감천문화마을', desc: '알록달록 계단식 파스텔 마을', lat: 35.0975, lng: 129.0106 },
  { region: '부산', name: '자갈치시장', desc: '싱싱한 해산물과 부산의 활기', lat: 35.0968, lng: 129.0306 },
  { region: '부산', name: '태종대', desc: '영도 해안 기암절벽과 울창한 숲', lat: 35.0531, lng: 129.0863 },
  { region: '부산', name: '흰여울문화마을', desc: '바닷가 절벽 위 예술인 골목', lat: 35.0784, lng: 129.0453 },
  { region: '부산', name: '송도 해상케이블카', desc: '바다 위를 가로지르는 케이블카', lat: 35.0760, lng: 129.0235 },
  { region: '부산', name: '해동용궁사', desc: '바다와 맞닿은 수상 법당 사찰', lat: 35.1884, lng: 129.2233 },

  // 강원 / 양양 / 강릉 / 속초
  { region: '강원', name: '양양 죽도해변', desc: '대한민국 대표 서핑 성지', lat: 37.9715, lng: 128.7612 },
  { region: '강원', name: '양양 인구해변', desc: '서핑 핫플레이스와 청춘 야간 거리', lat: 37.9658, lng: 128.7645 },
  { region: '강원', name: '양양 하조대', desc: '동해 절경 애국가 소나무와 등대', lat: 38.0204, lng: 128.7292 },
  { region: '강원', name: '안목해변 커피거리', desc: '바다 전망 카페와 커피 명소', lat: 37.7718, lng: 128.9485 },
  { region: '강원', name: '경포호수', desc: '벚꽃과 산책로가 아름다운 석호', lat: 37.7997, lng: 128.9056 },
  { region: '강원', name: '정동진역', desc: '세계에서 바다와 가장 가까운 간이역', lat: 37.6914, lng: 129.0336 },
  { region: '강원', name: '속초 중앙시장', desc: '닭강정과 오징어순대 먹거리', lat: 38.2045, lng: 128.5912 },
  { region: '강원', name: '설악산 케이블카', desc: '권금성과 웅장한 설악산 조망', lat: 38.1736, lng: 128.4907 },
  { region: '강원', name: '아바이마을 갯배', desc: '속초 명물 손으로 끄는 무동력 갯배', lat: 38.2036, lng: 128.5925 },

  // 서울
  { region: '서울', name: '경복궁', desc: '조선 왕조 제일의 법궁', lat: 37.5796, lng: 126.9770 },
  { region: '서울', name: '남산서울타워', desc: '서울 시내가 한눈에 내려다보이는 랜드마크', lat: 37.5512, lng: 126.9882 },
  { region: '서울', name: '북촌한옥마을', desc: '전통 한옥이 보존된 고즈넉한 골목', lat: 37.5826, lng: 126.9835 },
  { region: '서울', name: '여의도 한강공원', desc: '한강 뷰 피크닉과 치맥 성지', lat: 37.5284, lng: 126.9341 },
  { region: '서울', name: '홍대 걷고싶은거리', desc: '청춘과 버스킹, 트렌디한 패션', lat: 37.5558, lng: 126.9234 },
  { region: '서울', name: '잠실 롯데월드타워', desc: '국내 최고층 전망대와 석촌호수', lat: 37.5126, lng: 127.1025 },
  { region: '서울', name: '성수동 카페거리', desc: '붉은 벽돌 팩토리와 핫플레이스', lat: 37.5446, lng: 127.0560 },

  // 경주
  { region: '경주', name: '첨성대', desc: '동양에서 가장 오래된 천문대', lat: 35.8347, lng: 129.2190 },
  { region: '경주', name: '불국사', desc: '신라 불교 문화의 정수 석가탑/다보탑', lat: 35.7901, lng: 129.3321 },
  { region: '경주', name: '동궁과 월지', desc: '환상적인 야경을 자랑하는 안압지', lat: 35.8341, lng: 129.2266 },
  { region: '경주', name: '황리단길', desc: '한옥 카페와 감성 맛집 거리', lat: 35.8378, lng: 129.2096 },
  { region: '경주', name: '대릉원', desc: '천마총과 고분군 산책로', lat: 35.8385, lng: 129.2120 },

  // 여수
  { region: '여수', name: '종포해양공원 (여수밤바다)', desc: '하멜등대와 낭만포차 거리', lat: 34.7410, lng: 127.7420 },
  { region: '여수', name: '오동도', desc: '동백꽃 섬과 해안 산책로', lat: 34.7452, lng: 127.7667 },
  { region: '여수', name: '향일암', desc: '기암절벽 위 남해 일출 명소', lat: 34.5919, lng: 127.8048 },
  { region: '여수', name: '여수 해상케이블카', desc: '돌산과 자산공원을 잇는 바다 케이블카', lat: 34.7335, lng: 127.7495 },

  // 전주
  { region: '전주', name: '전주 한옥마을', desc: '한복 체험과 경기전, 풍남문', lat: 35.8149, lng: 127.1526 },
  { region: '전주', name: '전동성당', desc: '아름다운 로마네스크 양식 성당', lat: 35.8133, lng: 127.1493 },

  // 해외 (모임 관련 명소)
  { region: '태국', name: '방콕 카오산로드', desc: '전 세계 배낭여행자의 성지 야시장', lat: 13.7588, lng: 100.4974 },
  { region: '태국', name: '수완나품 국제공항', desc: '태국 방콕의 메인 허브 공항', lat: 13.6900, lng: 100.7501 },
  { region: '태국', name: '왓 아룬 (새벽사원)', desc: '짜오프라야 강변의 눈부신 불교 사원', lat: 13.7437, lng: 100.4888 },
  { region: '일본', name: '시부야 스카이', desc: '도쿄 도심과 스크램블 교차로 파노라마 전망대', lat: 35.6591, lng: 139.7025 },
  { region: '일본', name: '신주쿠 교엔', desc: '도쿄 도심 속 넓은 전통 정원과 벚꽃 명소', lat: 35.6852, lng: 139.7101 },
  { region: '일본', name: '아사쿠사 센소지', desc: '도쿄에서 가장 오래된 상징적 사찰', lat: 35.7148, lng: 139.7967 }
];

// 문자열 유사도(Bi-gram Jaccard) 계산 헬퍼
function calculateTextSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().replace(/[^a-zA-Z0-9가-힣]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-zA-Z0-9가-힣]/g, '');
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const getBigrams = s => {
    const bigrams = new Set();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.substring(i, i + 2));
    }
    return bigrams;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return 0;

  let intersection = 0;
  bg1.forEach(bg => { if (bg2.has(bg)) intersection++; });
  const union = bg1.size + bg2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// 검색어 및 현재 지역 기반 유사 추천 장소 탐색
function findSimilarLocations(query, currentRegion, limit = 5) {
  const cleanQ = (query || '').trim().toLowerCase();
  const scored = PRESET_LOCATIONS.map(item => {
    let score = calculateTextSimilarity(cleanQ, item.name);
    const descScore = calculateTextSimilarity(cleanQ, item.desc);
    score = Math.max(score, descScore * 0.7);

    // 같은 지역이면 가산점 부여
    if (currentRegion && item.region.includes(currentRegion)) {
      score += 0.25;
    }
    // 단어 부분 포함 가산점
    const qTokens = cleanQ.split(/\s+/).filter(Boolean);
    qTokens.forEach(t => {
      if (item.name.toLowerCase().includes(t)) score += 0.35;
      if (item.desc.toLowerCase().includes(t)) score += 0.15;
    });

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.item);
}

// 프리셋 명소 검색 유틸
function findPresetLocation(placeName) {
  if (!placeName) return null;
  const cleanPlace = placeName.toLowerCase().replace(/[^a-zA-Z0-9가-힣]/g, '');
  if (!cleanPlace) return null;
  return PRESET_LOCATIONS.find(p => {
    const cp = p.name.toLowerCase().replace(/[^a-zA-Z0-9가-힣]/g, '');
    return cleanPlace.includes(cp) || cp.includes(cleanPlace);
  }) || null;
}

// 위치 미지정 일정에 위치 지정하기
function openLocationPickerForSchedule(scheduleId) {
  locPickerTargetScheduleId = scheduleId;
  const item = plannerSchedules.find(s => String(s.id) === String(scheduleId) || String(s.scheduleId) === String(scheduleId));
  openLocationPickerModal('schedule-' + scheduleId);

  $('#modal-location-picker-title').text('일정 위치 / 장소 지정하기');

  if (item && item.place) {
    $('#loc-selected-place-name').val(item.place);
  }
}

// 1. 지도 모달 열기
function openLocationPickerModal(targetInputId) {
  locPickerTargetInputId = targetInputId || 'inline-plan-place';

  $('#modal-location-picker').removeClass('hidden').addClass('flex');

  // 현재 모임의 지역 감지
  let regionKey = '제주';
  let initialLat = 33.4586;
  let initialLng = 126.9427;

  if (plannerGroupObj) {
    const locText = (plannerGroupObj.location || '') + ' ' + (plannerGroupObj.title || '');
    if (locText.includes('부산')) { regionKey = '부산'; initialLat = 35.1587; initialLng = 129.1604; }
    else if (locText.includes('강원') || locText.includes('강릉') || locText.includes('속초')) { regionKey = '강원'; initialLat = 37.7718; initialLng = 128.9485; }
    else if (locText.includes('서울')) { regionKey = '서울'; initialLat = 37.5512; initialLng = 126.9882; }
    else if (locText.includes('경주')) { regionKey = '경주'; initialLat = 35.8347; initialLng = 129.2190; }
    else if (locText.includes('여수')) { regionKey = '여수'; initialLat = 34.7410; initialLng = 127.7420; }
    else if (locText.includes('전주')) { regionKey = '전주'; initialLat = 35.8149; initialLng = 127.1526; }
  }

  // 추천 칩 렌더링
  renderLocationPresetChips(regionKey);

  // 기존 입력값이 있으면 가져오기
  const $targetInput = $(`#${locPickerTargetInputId}`);
  const currentVal = ($targetInput.val() || '').trim();
  if (currentVal) {
    const found = PRESET_LOCATIONS.find(p => p.name.includes(currentVal) || currentVal.includes(p.name));
    if (found) {
      initialLat = found.lat;
      initialLng = found.lng;
      currentPickedLoc = { name: found.name, desc: found.desc, lat: found.lat, lng: found.lng };
    } else {
      currentPickedLoc = { name: currentVal, desc: '사용자 직접 입력 장소', lat: initialLat, lng: initialLng };
    }
  } else {
    // 기본 선택
    const def = PRESET_LOCATIONS.find(p => p.region === regionKey) || PRESET_LOCATIONS[0];
    currentPickedLoc = { name: def.name, desc: def.desc, lat: def.lat, lng: def.lng };
    initialLat = def.lat;
    initialLng = def.lng;
  }

  updateLocationDisplay();

  // 지도 초기화 (모달이 렌더링된 후 실행)
  setTimeout(() => {
    initLeafletLocationMap(initialLat, initialLng);
  }, 100);

  lucide.createIcons();
}

// 2. 추천 칩 렌더링
function renderLocationPresetChips(regionKey) {
  const $container = $('#loc-preset-chips');
  if (!$container.length) return;

  $('#loc-region-name').text(`${regionKey} 인기 여행지 추천`);

  const filtered = PRESET_LOCATIONS.filter(p => p.region === regionKey);
  const others = PRESET_LOCATIONS.filter(p => p.region !== regionKey).slice(0, 4);
  const displayList = [...filtered, ...others];

  $container.html(displayList.map(item => `
    <button type="button" onclick="selectLocationPreset('${item.name}')"
      class="loc-chip px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition flex items-center gap-1 active:scale-95">
      <span>${item.name}</span>
      <span class="text-[10px] text-slate-400">#${item.region}</span>
    </button>
  `).join(''));
}

// 3. Leaflet 지도 초기화
function initLeafletLocationMap(lat, lng) {
  const $mapContainer = $('#leaflet-map-container');
  if (!$mapContainer.length) return;

  if (typeof L === 'undefined') {
    $mapContainer.html(`
      <div class="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
        <i data-lucide="map" class="w-10 h-10 mb-2 text-slate-300"></i>
        <p class="text-sm font-semibold text-slate-600">오프라인 모드 지도</p>
        <p class="text-xs mt-1">상단의 추천 관광지 태그 칩 또는 검색을 통해 장소를 간편하게 선택하세요.</p>
      </div>`);
    lucide.createIcons();
    return;
  }

  if (!locMap) {
    try {
      locMap = L.map('leaflet-map-container', {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(locMap);

      locMap.on('click', function(e) {
        onLocationMapClick(e.latlng.lat, e.latlng.lng);
      });
    } catch (e) {
      console.warn('Leaflet map init warning:', e);
    }
  }

  if (locMap) {
    locMap.setView([lat, lng], 14);
    if (!locMarker) {
      locMarker = L.marker([lat, lng], { draggable: true }).addTo(locMap);
      locMarker.on('dragend', function(e) {
        const pos = e.target.getLatLng();
        onLocationMapClick(pos.lat, pos.lng);
      });
    } else {
      locMarker.setLatLng([lat, lng]);
    }
    setTimeout(() => {
      if (locMap) locMap.invalidateSize();
    }, 200);
  }
}

// 4. 지도 클릭 시 좌표 및 근접 장소 탐색
function onLocationMapClick(lat, lng) {
  if (locMarker) locMarker.setLatLng([lat, lng]);

  let nearest = null;
  let minDist = 9999;
  PRESET_LOCATIONS.forEach(p => {
    const d = Math.hypot(p.lat - lat, p.lng - lng);
    if (d < minDist) {
      minDist = d;
      nearest = p;
    }
  });

  if (nearest && minDist < 0.02) {
    currentPickedLoc = {
      name: nearest.name,
      desc: `${nearest.desc} (좌표: ${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      lat, lng
    };
  } else {
    currentPickedLoc = {
      name: `선택한 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      desc: '사용자가 지도상에서 직접 지정한 포인트',
      lat, lng
    };
  }

  updateLocationDisplay();
}

// 5. 추천 칩 또는 검색을 통한 장소 선택
let currentLocationSuggestions = [];
let selectedSuggestionIndex = -1;

function selectLocationDirect(name, desc, lat, lng) {
  currentPickedLoc = {
    name: name,
    desc: desc || '선택된 장소 위치',
    lat: Number(lat),
    lng: Number(lng)
  };

  // 상단 검색창에도 선택된 장소명 동기화
  const $searchInput = $('#loc-search-input');
  if ($searchInput.length && name && !name.includes('선택한 위치')) {
    $searchInput.val(name);
  }

  if (locMap) {
    locMap.invalidateSize();
    locMap.setView([lat, lng], 15, { animate: true });
    if (locMarker) {
      locMarker.setLatLng([lat, lng]);
      locMarker.bindPopup(`
        <div class="p-1 text-center font-sans">
          <p class="font-bold text-xs text-slate-900">${name}</p>
          ${desc ? `<p class="text-[10px] text-slate-500 mt-0.5">${desc}</p>` : ''}
        </div>
      `).openPopup();
    }
  }

  updateLocationDisplay();

  // 선택된 장소명 입력창에 시각적 하이라이트 부여
  const $nameInput = $('#loc-selected-place-name');
  if ($nameInput.length) {
    $nameInput.addClass('ring-2 ring-emerald-500 bg-emerald-50/70');
    setTimeout(() => {
      $nameInput.removeClass('ring-2 ring-emerald-500 bg-emerald-50/70');
    }, 1200);
  }
}

function selectLocationPreset(name) {
  const item = PRESET_LOCATIONS.find(p => p.name === name);
  if (!item) return;
  selectLocationDirect(item.name, item.desc, item.lat, item.lng);
}

// 5-1. 제안 목록 인덱스 기반 원클릭 선택 (장소명 적용 & 지도 위치 이동 & 마커 팝업 오픈)
function selectLocationSuggestionByIndex(idx) {
  if (!currentLocationSuggestions || !currentLocationSuggestions[idx]) return;
  const item = currentLocationSuggestions[idx];
  selectedSuggestionIndex = idx;

  const lat = Number(item.lat);
  const lng = Number(item.lng);
  const name = item.name;
  const desc = item.desc || '';

  // 1. 현재 선택 장소 데이터 갱신
  currentPickedLoc = { name, desc, lat, lng };

  // 2. 검색창(loc-search-input)에 선택된 장소명 반영
  $('#loc-search-input').val(name);

  // 3. 장소명 및 설명 디스플레이 갱신
  updateLocationDisplay();

  // 4. 지도 중심 이동 & 마커 핀 이동 & 팝업 툴팁 오픈
  if (locMap) {
    locMap.invalidateSize();
    locMap.setView([lat, lng], 16, { animate: true, duration: 0.5 });
    if (locMarker) {
      locMarker.setLatLng([lat, lng]);
      locMarker.bindPopup(`
        <div class="p-1 text-center font-sans">
          <p class="font-bold text-xs text-slate-900">${name}</p>
          ${desc ? `<p class="text-[10px] text-slate-500 mt-0.5">${desc}</p>` : ''}
        </div>
      `).openPopup();
    }
  }

  // 5. 장소명 인풋 강조 피드백
  const $nameInput = $('#loc-selected-place-name');
  if ($nameInput.length) {
    $nameInput.addClass('ring-2 ring-emerald-500 bg-emerald-50/70');
    setTimeout(() => {
      $nameInput.removeClass('ring-2 ring-emerald-500 bg-emerald-50/70');
    }, 1200);
  }

  // 6. 목록 내 선택된 버튼 액티브 상태(✓ 선택됨) 재렌더링
  renderSuggestionButtons();

  showToast(`'${name}' 장소명이 적용되고 지도 핀이 이동되었습니다. 📍`);
}

// 5-2. 유사 / 비슷한 장소 제안 박스 노출 및 제어
function showLocationSuggestions(title, list, isGeocode = false) {
  const $box = $('#loc-suggestions-box');
  const $titleEl = $('#loc-suggestions-title');
  if (!$box.length || !$titleEl.length) return;

  $titleEl.text(title || '비슷한 장소 제안');
  if (!list || list.length === 0) {
    $box.addClass('hidden');
    currentLocationSuggestions = [];
    return;
  }

  // 정규화하여 전역 배열에 저장 (인라인 특수문자 에러 원천 차단)
  currentLocationSuggestions = list.map(item => {
    return {
      name: isGeocode ? (item.display_name.split(',')[0] || item.display_name).trim() : item.name,
      desc: isGeocode ? item.display_name : (item.desc || ''),
      lat: isGeocode ? parseFloat(item.lat) : item.lat,
      lng: isGeocode ? parseFloat(item.lon) : item.lng,
      region: (!isGeocode && item.region) ? item.region : ''
    };
  });
  selectedSuggestionIndex = -1;

  renderSuggestionButtons();
  $box.removeClass('hidden');
  lucide.createIcons();
}

function renderSuggestionButtons() {
  const $listEl = $('#loc-suggestions-list');
  if (!$listEl.length) return;

  $listEl.html(currentLocationSuggestions.map((item, idx) => {
    const isSelected = selectedSuggestionIndex === idx;
    const regionBadge = item.region ? `<span class="bg-amber-200/90 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-bold mr-1">${item.region}</span>` : '';
    const activeClass = isSelected
      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm ring-2 ring-emerald-400'
      : 'border-amber-300 bg-white hover:bg-amber-100/80 text-slate-800';

    return `
      <button type="button" onclick="selectLocationSuggestionByIndex(${idx})"
        aria-label="${item.name} 장소 선택 및 지도 이동"
        class="text-left ${activeClass} rounded-xl px-2.5 py-1.5 text-xs transition shadow-xs flex items-center justify-between gap-1.5 active:scale-95 group">
        <div class="flex items-center gap-1 min-w-0">
          <i data-lucide="map-pin" class="w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-amber-600'} group-hover:scale-110 transition flex-shrink-0"></i>
          <div class="truncate max-w-[190px] sm:max-w-[240px]">
            ${regionBadge}<span class="${isSelected ? 'text-emerald-950 font-bold' : 'text-slate-900'}">${item.name}</span>
            ${item.desc ? `<span class="text-[10px] text-slate-500 ml-1">(${item.desc})</span>` : ''}
          </div>
        </div>
        ${isSelected ? `<span class="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">✓ 선택됨</span>` : ''}
      </button>
    `;
  }).join(''));
  lucide.createIcons();
}

function closeLocationSuggestions() {
  $('#loc-suggestions-box').addClass('hidden');
  currentLocationSuggestions = [];
  selectedSuggestionIndex = -1;
}

// 6. 장소 스마트 검색 및 위치 핀 이동 / 유사 장소 제안 (jQuery $.ajax)
async function searchLocationPlace() {
  const $input = $('#loc-search-input');
  if (!$input.length) return;
  const rawQ = ($input.val() || '').trim();
  const q = rawQ.toLowerCase();
  if (!q) {
    showToast('검색할 장소명을 입력해주세요.');
    return;
  }

  // 현재 모임 지역 확인
  let currentRegionKey = '제주';
  if (plannerGroupObj) {
    const locText = (plannerGroupObj.location || '') + ' ' + (plannerGroupObj.title || '');
    if (locText.includes('부산')) currentRegionKey = '부산';
    else if (locText.includes('강원') || locText.includes('양양') || locText.includes('강릉') || locText.includes('속초')) currentRegionKey = '강원';
    else if (locText.includes('서울')) currentRegionKey = '서울';
    else if (locText.includes('경주')) currentRegionKey = '경주';
    else if (locText.includes('여수')) currentRegionKey = '여수';
    else if (locText.includes('전주')) currentRegionKey = '전주';
    else if (locText.includes('태국') || locText.includes('방콕')) currentRegionKey = '태국';
    else if (locText.includes('일본') || locText.includes('도쿄')) currentRegionKey = '일본';
  }

  // Step 1: 프리셋 명소 데이터베이스 검색 (완전 일치 또는 포함)
  const matchedPresets = PRESET_LOCATIONS.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  if (matchedPresets.length > 0) {
    const top = matchedPresets[0];
    selectLocationDirect(top.name, top.desc, top.lat, top.lng);

    if (matchedPresets.length > 1) {
      showLocationSuggestions(`'${rawQ}' 관련 장소 (${matchedPresets.length}건)`, matchedPresets);
    } else {
      closeLocationSuggestions();
    }
    showToast(`'${top.name}'(으)로 지도 핀이 이동되었습니다. 📍`);
    return;
  }

  // Step 2: 실시간 온라인 OpenStreetMap Nominatim 지오코딩 시도 (jQuery $.ajax + timeout: 2500)
  let geocodeResults = [];
  try {
    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(rawQ)}&addressdetails=1&limit=5`;
    geocodeResults = await $.ajax({
      url: apiUrl,
      method: 'GET',
      dataType: 'json',
      timeout: 2500
    });
  } catch (err) {
    // 네트워크 불가 또는 타임아웃
  }

  if (geocodeResults && geocodeResults.length > 0) {
    const first = geocodeResults[0];
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);
    const cleanName = first.display_name.split(',')[0].trim() || rawQ;
    selectLocationDirect(cleanName, first.display_name, lat, lng);

    if (geocodeResults.length > 1) {
      showLocationSuggestions(`'${rawQ}' 검색 위치 및 주변 장소 (${geocodeResults.length}건)`, geocodeResults, true);
    } else {
      closeLocationSuggestions();
    }
    showToast(`'${cleanName}' 위치로 지도 핀이 이동되었습니다. 📍`);
    return;
  }

  // Step 3: 해당 위치가 없을 때 - 검색어와 가장 유사하거나 가까운 장소 지능형 제안
  const similarLocations = findSimilarLocations(q, currentRegionKey, 5);
  if (similarLocations.length > 0) {
    const bestMatch = similarLocations[0];

    // 지도 핀을 가장 가까운/유사한 추천 위치로 먼저 근처 이동
    selectLocationDirect(rawQ, `추천 근처 위치: ${bestMatch.name} (${bestMatch.desc})`, bestMatch.lat, bestMatch.lng);

    // 제안 박스 띄우기
    showLocationSuggestions(`💡 '${rawQ}' 위치가 없어 가장 비슷한 명소를 제안합니다:`, similarLocations);
    showToast(`'${rawQ}' 위치가 없어 가장 가까운 '${bestMatch.name}'(으)로 핀을 이동했습니다. 💡`);
  } else {
    // 완전 미지의 장소일 때
    currentPickedLoc.name = rawQ;
    currentPickedLoc.desc = '직접 지정한 신규 위치';
    updateLocationDisplay();
    closeLocationSuggestions();
    showToast(`'${rawQ}' 장소명이 설정되었습니다. 지도에서 원하는 위치를 클릭해주세요. 📍`);
  }
}

// 7. 디스플레이 갱신
function updateLocationDisplay() {
  $('#loc-selected-place-name').val(currentPickedLoc.name);
  $('#loc-selected-place-desc').text(currentPickedLoc.desc);
  if (currentPickedLoc.lat) {
    $('#loc-latlng-indicator').text(`${Number(currentPickedLoc.lat).toFixed(4)}, ${Number(currentPickedLoc.lng).toFixed(4)}`);
  }
}

// 8. 모달 닫기
function closeLocationPickerModal() {
  $('#modal-location-picker').addClass('hidden').removeClass('flex');
}

// 9. 선택한 장소 정보 적용 (신규 등록 폼 또는 기존 일정 사후 위치 지정)
async function applyLocationPicker() {
  const $nameInput = $('#loc-selected-place-name');
  const finalName = $nameInput.length ? ($nameInput.val() || '').trim() : currentPickedLoc.name;

  if (!finalName) {
    alert('장소명을 입력하거나 지도에서 선택해주세요.');
    return;
  }

  // A. 기존 일정에 사후 위치를 지정하는 경우
  if (locPickerTargetScheduleId) {
    await updateScheduleLocation(locPickerTargetScheduleId, finalName, currentPickedLoc.lat, currentPickedLoc.lng);
    locPickerTargetScheduleId = null;
    closeLocationPickerModal();
    return;
  }

  // B. 신규 일정 추가 인라인/모달 폼인 경우
  const $targetInput = $(`#${locPickerTargetInputId}`);
  if ($targetInput.length) {
    $targetInput.val(finalName).addClass('ring-2 ring-emerald-500 bg-emerald-50/50');
    setTimeout(() => {
      $targetInput.removeClass('ring-2 ring-emerald-500 bg-emerald-50/50');
    }, 1000);
  }

  // 숨겨진 위경도 좌표 인풋에 좌표값 동기화
  if (locPickerTargetInputId === 'inline-plan-place') {
    $('#inline-plan-lat').val(currentPickedLoc.lat || '');
    $('#inline-plan-lng').val(currentPickedLoc.lng || '');
  } else if (locPickerTargetInputId === 'plan-place') {
    $('#plan-lat').val(currentPickedLoc.lat || '');
    $('#plan-lng').val(currentPickedLoc.lng || '');
  }

  // 메모 필드가 비어있고 설명이 있으면 보조 입력 지원
  const memoInputId = locPickerTargetInputId === 'inline-plan-place' ? 'inline-plan-memo' : 'plan-memo';
  const $memoInput = $(`#${memoInputId}`);
  if ($memoInput.length && !($memoInput.val() || '').trim() && currentPickedLoc.desc && !currentPickedLoc.desc.includes('선택한 위치')) {
    $memoInput.val(currentPickedLoc.desc);
  }

  closeLocationPickerModal();
  showToast(`장소가 '${finalName}'(으)로 입력되었습니다. (좌표 함께 저장) 📍`);
}

// 10. 기존 일정 위치 좌표 및 장소 사후 업데이트 (jQuery $.ajax)
async function updateScheduleLocation(scheduleId, newPlace, lat, lng) {
  const item = plannerSchedules.find(s => String(s.id) === String(scheduleId) || String(s.scheduleId) === String(scheduleId));
  if (!item) return;

  item.place = newPlace;
  item.latitude = lat;
  item.longitude = lng;

  // 서버 API 동기화 (PUT)
  if (item.scheduleId) {
    try {
      await $.ajax({
        url: '/api/schedules/' + item.scheduleId,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
          dayNumber: item.day,
          planTime: item.time,
          place: newPlace,
          memo: item.memo,
          latitude: lat,
          longitude: lng
        })
      });
    } catch (e) {
      console.warn('Schedule update API fallback to local:', e);
    }
  }

  // LocalStorage 동기화
  if (plannerGroupId) {
    localStorage.setItem('travelmates_schedules_' + getNumericId(plannerGroupId), JSON.stringify(plannerSchedules));
  }

  renderPlannerSchedules(item.id || item.scheduleId);
  showToast(`'${newPlace}' 위치가 지정되어 좌표와 함께 저장되었습니다! 📍`);
}

// --------------------------------------------------------------------------------
// SCHEDULE LOCATION INLINE EXPAND ACCORDION MODULE (일정 클릭 시 카드 내 지도 확장 표시)
// --------------------------------------------------------------------------------
let currentExpandedSchedId = null;
let inlineScheduleMaps = {}; // { [schedId]: { map, marker } }

// 기존 인라인 지도 인스턴스 전면 정리
function cleanAllInlineScheduleMaps() {
  Object.keys(inlineScheduleMaps).forEach(id => {
    try {
      if (inlineScheduleMaps[id] && inlineScheduleMaps[id].map) {
        inlineScheduleMaps[id].map.remove();
      }
    } catch (e) {
      console.warn('Error removing inline map:', e);
    }
  });
  inlineScheduleMaps = {};
  currentExpandedSchedId = null;
}

// 1. 등록된 일정 클릭 시 카드 내 지도 펼치기/접기 (아코디언 토글)
function toggleScheduleInlineMap(scheduleId, forceState) {
  const item = plannerSchedules.find(s => String(s.id) === String(scheduleId) || String(s.scheduleId) === String(scheduleId));
  if (!item || !item.place || item.place === '장소 미지정') {
    if (typeof openLocationPickerForSchedule === 'function') {
      openLocationPickerForSchedule(scheduleId);
    } else {
      showToast('일정에 등록된 장소 정보가 없습니다.');
    }
    return;
  }

  const safeId = escapeHtml(item.id || item.scheduleId);
  const $wrapper = $(`#sched-inline-map-wrapper-${safeId}`);
  const $badgeText = $(`#sched-map-badge-text-${safeId}`);
  const $chevron = $(`#sched-chevron-${safeId}`);
  const $card = $(`#plan-item-${safeId}`);

  if (!$wrapper.length) return;

  const isCurrentlyOpen = !$wrapper.hasClass('hidden') && $wrapper.is(':visible');
  const shouldOpen = (typeof forceState === 'boolean') ? forceState : !isCurrentlyOpen;

  if (!shouldOpen) {
    // 아코디언 접기 (Collapse)
    $wrapper.slideUp(200, function() {
      $wrapper.addClass('hidden');
    });
    $badgeText.text('지도 보기');
    $chevron.removeClass('rotate-180');
    $card.removeClass('ring-2 ring-emerald-500 bg-emerald-50/70 shadow-md');
    if (currentExpandedSchedId === safeId) {
      currentExpandedSchedId = null;
    }
    return;
  }

  // 이전에 열려있던 다른 카드가 있다면 자연스럽게 닫기 (단일 아코디언 UX)
  if (currentExpandedSchedId && currentExpandedSchedId !== safeId) {
    const prevId = currentExpandedSchedId;
    const $prevWrapper = $(`#sched-inline-map-wrapper-${prevId}`);
    $prevWrapper.slideUp(180, function() {
      $prevWrapper.addClass('hidden');
    });
    $(`#sched-map-badge-text-${prevId}`).text('지도 보기');
    $(`#sched-chevron-${prevId}`).removeClass('rotate-180');
    $(`#plan-item-${prevId}`).removeClass('ring-2 ring-emerald-500 bg-emerald-50/70 shadow-md');
  }

  currentExpandedSchedId = safeId;

  // 좌표 매핑 알고리즘
  let targetLat = 33.4586;
  let targetLng = 126.9427;

  // 0. 저장된 위경도 좌표 우선 사용
  if (item.latitude != null && item.longitude != null) {
    targetLat = Number(item.latitude);
    targetLng = Number(item.longitude);
  } else {
    // 1. 프리셋 명소 목록과 매칭 (공백/특수문자 제외)
    const cleanPlace = item.place.toLowerCase().replace(/[^a-zA-Z0-9가-힣]/g, '');
    const matched = (typeof PRESET_LOCATIONS !== 'undefined') ? PRESET_LOCATIONS.find(p => {
      const cp = p.name.toLowerCase().replace(/[^a-zA-Z0-9가-힣]/g, '');
      return cleanPlace.includes(cp) || cp.includes(cleanPlace);
    }) : null;

    if (matched) {
      targetLat = matched.lat;
      targetLng = matched.lng;
    } else {
      // 2. 현재 여행 모임 목적지 기준 기본 좌표
      if (plannerGroupObj) {
        const locText = (plannerGroupObj.location || '') + ' ' + (plannerGroupObj.title || '');
        if (locText.includes('부산')) { targetLat = 35.1587; targetLng = 129.1604; }
        else if (locText.includes('강원') || locText.includes('강릉') || locText.includes('속초')) { targetLat = 37.7718; targetLng = 128.9485; }
        else if (locText.includes('서울')) { targetLat = 37.5512; targetLng = 126.9882; }
        else if (locText.includes('경주')) { targetLat = 35.8347; targetLng = 129.2190; }
        else if (locText.includes('여수')) { targetLat = 34.7410; targetLng = 127.7420; }
        else if (locText.includes('전주')) { targetLat = 35.8149; targetLng = 127.1526; }
      }
    }

    // 3. 텍스트 내 위경도 좌표(xx.xxxx, yy.yyyy) 패턴 확인
    const coordRegex = /([0-9]{2}\.[0-9]+)\s*,\s*([0-9]{2,3}\.[0-9]+)/;
    const matchCoord = (item.memo || '').match(coordRegex) || (item.place || '').match(coordRegex);
    if (matchCoord) {
      targetLat = parseFloat(matchCoord[1]);
      targetLng = parseFloat(matchCoord[2]);
    }
  }

  // 메타 정보 표시 및 길찾기 외부 링크 연결
  $(`#sched-inline-coord-${safeId}`).text(`좌표: ${targetLat.toFixed(4)}, ${targetLng.toFixed(4)}`);
  const encPlace = encodeURIComponent(item.place);
  $(`#sched-inline-kakao-${safeId}`).attr('href', `https://map.kakao.com/link/search/${encPlace}`);
  $(`#sched-inline-naver-${safeId}`).attr('href', `https://map.naver.com/v5/search/${encPlace}`);

  // UI 상태 활성화
  $badgeText.text('지도 접기');
  $chevron.addClass('rotate-180');
  $card.addClass('ring-2 ring-emerald-500 bg-emerald-50/70 shadow-md');

  // 아코디언 애니메이션 펼침 및 Leaflet 지도 렌더링
  $wrapper.removeClass('hidden').hide().slideDown(250, function() {
    renderInlineLeafletMap(safeId, targetLat, targetLng, item.place, item.memo);
  });

  lucide.createIcons();
}

// 2. 카드 내 Leaflet 지도 인스턴스 초기화 및 마커 렌더링
function renderInlineLeafletMap(safeId, lat, lng, placeName, memo) {
  const containerId = `sched-inline-map-${safeId}`;
  const $mapDiv = $(`#${containerId}`);
  if (!$mapDiv.length) return;

  if (typeof L === 'undefined') {
    $mapDiv.html(`
      <div class="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
        <i data-lucide="map-pin" class="w-8 h-8 mb-1 text-emerald-500"></i>
        <p class="text-sm font-bold text-slate-800">${escapeHtml(placeName)}</p>
        <p class="text-xs text-slate-500 mt-1">${escapeHtml(memo || '지정된 장소')}</p>
        <p class="text-[11px] text-slate-400 mt-1 font-mono">좌표: ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
      </div>`);
    lucide.createIcons();
    return;
  }

  // 기존 지도 인스턴스가 생성되어 있는 경우 리사이즈 및 뷰 갱신
  if (inlineScheduleMaps[safeId] && inlineScheduleMaps[safeId].map) {
    const mapObj = inlineScheduleMaps[safeId];
    mapObj.map.invalidateSize();
    mapObj.map.setView([lat, lng], 15);
    if (mapObj.marker) {
      mapObj.marker.setLatLng([lat, lng]);
      mapObj.marker.openPopup();
    }
    return;
  }

  try {
    const map = L.map(containerId, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`
      <div class="p-1">
        <h4 class="font-bold text-sm text-slate-900 mb-0.5">${escapeHtml(placeName)}</h4>
        ${memo ? `<p class="text-xs text-slate-500">${escapeHtml(memo)}</p>` : ''}
      </div>
    `).openPopup();

    inlineScheduleMaps[safeId] = { map, marker };

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);
  } catch (e) {
    console.warn('renderInlineLeafletMap error:', e);
  }
}

// 3. 기존 팝업 호출 호환성 유지 함수 (클릭 시 아코디언 확장으로 안전 전환)
function viewScheduleLocation(scheduleId) {
  toggleScheduleInlineMap(scheduleId);
}

function closeScheduleMapModal() {
  $('#modal-schedule-map-viewer').addClass('hidden').removeClass('flex');
}

let schedViewerMap = null;
let schedViewerMarker = null;
function initScheduleViewerMap(lat, lng, placeName, memo) {
  // 호환성용 빈 구현
}

// --------------------------------------------------------------------------------
// SETTLEMENT MODULE (모임별 독립 회비 정산기)
// --------------------------------------------------------------------------------

// 0. 여행 모임 총 예산 숫자 추출 헬퍼 (예: '1,500,000원' -> 1500000)
function getGroupTotalBudgetNumber(grp) {
  if (!grp) return 0;
  const budgetStr = String(grp.budget || grp.estimatedBudget || grp.BUDGET || '');
  const digits = budgetStr.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

// 1. 정산 모임 드롭다운 초기화
function initSettlementGroupSelect() {
  const $sel = $('#settlement-group-select');
  if (!$sel.length) return;

  const prevVal = $sel.val();
  $sel.html('<option value="">-- 모임을 선택하세요 --</option>');
  groups.forEach(g => {
    $sel.append($('<option>', {
      value: g.groupId || g.id,
      text: g.title
    }));
  });

  if (prevVal) {
    $sel.val(prevVal);
  } else if (!settlementGroupId && groups.length > 0) {
    // 기본으로 첫 번째 모임 선택 편의 제공
    $sel.val(groups[0].groupId || groups[0].id);
    onSettlementGroupChange();
  }
  lucide.createIcons();
}

// 2. 모임 선택 변경 시 처리
async function onSettlementGroupChange() {
  const val = $('#settlement-group-select').val();

  if (!val) {
    $('#settlement-no-group').removeClass('hidden');
    $('#settlement-body').addClass('hidden');
    settlementGroupId = null;
    settlementGroupObj = null;
    settlementExpenses = [];
    $('#settlement-expense-count, #total-receipt-count, #expense-table-count').text('0건');
    $('#settlement-group-budget, #total-budget-display').text('₩0');
    return;
  }

  settlementGroupObj = groups.find(g => String(g.groupId || g.id) === String(val)) || null;
  settlementGroupId = val;

  if (settlementGroupObj) {
    $('#settlement-group-name').text(settlementGroupObj.title);
    $('#settlement-group-meta').text(
      (settlementGroupObj.type || '') + ' | ' + (settlementGroupObj.date || settlementGroupObj.location || '')
    );

    // 총 예산 상단 배너 표시
    const rawBudgetNum = getGroupTotalBudgetNumber(settlementGroupObj);
    if (rawBudgetNum > 0) {
      $('#settlement-group-budget').text(`₩${rawBudgetNum.toLocaleString('ko-KR')}`);
    } else {
      $('#settlement-group-budget').text('미설정');
    }

    // 결제자 및 참여자 체크박스 생성
    setupExpenseMembersUI(settlementGroupObj);
  }

  $('#settlement-no-group').addClass('hidden');
  $('#settlement-body').removeClass('hidden');

  await loadSettlementExpenses();
}

// 2-1. 영수증 가격 및 분할 참여자 대비 1인당 지출 금액 실시간 산정 미리보기
function updateReceiptPerPersonPreview() {
  const $amtInput = $('#expense-amount');
  const $previewEl = $('#receipt-per-person-amount');
  if (!$amtInput.length || !$previewEl.length) return;

  const amount = parseInt($amtInput.val(), 10) || 0;
  const count = $('input[name="expense-participant-cb"]:checked').length;

  if (amount > 0 && count > 0) {
    const perPerson = Math.round(amount / count);
    $previewEl.text(`₩${perPerson.toLocaleString('ko-KR')} /인 (${count}명 분할)`);
  } else if (amount > 0 && count === 0) {
    $previewEl.text('참여자를 1명 이상 선택하세요');
  } else {
    $previewEl.text('₩0');
  }
}

// 3. 결제자 셀렉트박스 및 참여자 체크박스 UI 구성
function setupExpenseMembersUI(grp) {
  const $payerSel = $('#expense-payer-select');
  const $cbContainer = $('#expense-participants-checkboxes');
  if (!$payerSel.length || !$cbContainer.length) return;

  // 멤버 이름 목록 정제
  let memberList = (grp.members && grp.members.length > 0)
    ? grp.members.map(m => m.replace(/\(방장\)|\(나\)/g, '').trim())
    : ['김민수', '이지훈', '박서연', '최현우'];

  // 중복 제거
  memberList = [...new Set(memberList)];

  const user = getLoggedInUser();
  const myName = user ? (user.name || user.username) : '';

  // 결제자 옵션
  $payerSel.html(memberList.map(name => `
    <option value="${name}" ${name === myName ? 'selected' : ''}>${name}</option>
  `).join(''));

  // 함께한 친구들 체크박스 (기본 전체 선택, 변경 시 1인당 분할액 실시간 재산정)
  $cbContainer.html(memberList.map(name => `
    <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-100/80 p-1.5 rounded-lg transition">
      <input type="checkbox" name="expense-participant-cb" value="${name}" checked onchange="updateReceiptPerPersonPreview()"
        class="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-slate-300">
      <span>${name}</span>
    </label>
  `).join(''));

  updateReceiptPerPersonPreview();
}

// 4. 참여자 전체 선택/해제 토글
function selectAllExpenseParticipants() {
  const $cbs = $('input[name="expense-participant-cb"]');
  const allChecked = $cbs.length === $cbs.filter(':checked').length;
  $cbs.prop('checked', !allChecked);
  updateReceiptPerPersonPreview();
}

// 5. 모임별 지출 내역 로드 (jQuery $.ajax & LocalStorage)
async function loadSettlementExpenses() {
  if (!settlementGroupId) return;

  const numericId = getNumericId(settlementGroupId);
  const lsKey = 'travelmates_expenses_' + numericId;

  try {
    const data = await $.ajax({
      url: '/api/groups/' + numericId + '/expenses',
      method: 'GET',
      dataType: 'json'
    });
    settlementExpenses = data.map(e => ({
      id: 'exp-' + (e.settlementId || Date.now()),
      settlementId: e.settlementId || null,
      title: e.title,
      amount: e.expenseAmount || e.amount || 0,
      payer: e.payerName || e.payer || '회원',
      participants: e.participantNames ? e.participantNames.split(',').map(s => s.trim()) : (e.participants || [])
    }));
    localStorage.setItem(lsKey, JSON.stringify(settlementExpenses));
  } catch (err) {
    // LocalStorage fallback
    const stored = localStorage.getItem(lsKey);
    if (stored) {
      settlementExpenses = JSON.parse(stored);
    } else {
      // DEFAULT_EXPENSES에서 해당 모임 샘플 데이터 로드
      const def = DEFAULT_EXPENSES[numericId] || [];
      settlementExpenses = [...def];
    }
  }

  renderExpenses();
}

// 6. 회비 정산 결과 렌더링 (영수증 가격 및 분할 참여자 대비 1인당 지출 금액 산정)
function renderExpenses() {
  const $tableBody = $('#expense-table-body');
  const $totalDisplay = $('#total-expense-display');
  const $avgDisplay = $('#average-expense-display');
  const $transferList = $('#transfer-summary-list');
  const $memberListEl = $('#member-breakdown-list');

  if (!$tableBody.length || !$totalDisplay.length) return;

  // [버그 해결] 등록된 영수증 건수 전체 동기화 (상단 배너, 요약 카드, 상세 목록 헤더)
  const expenseCount = settlementExpenses.length;
  const countText = `${expenseCount}건`;
  $('#settlement-expense-count, #total-receipt-count, #expense-table-count').text(countText);

  const total = settlementExpenses.reduce((sum, item) => sum + item.amount, 0);
  $totalDisplay.text(`₩${total.toLocaleString('ko-KR')}`);

  // -------------------------------------------------------------------------
  // [총 예산 연동] 총 예산 대비 지출, 잔여 예산 및 소진율 집계
  // -------------------------------------------------------------------------
  const totalBudget = getGroupTotalBudgetNumber(settlementGroupObj);
  const remainingBudget = totalBudget - total;

  // 카드 1 & 상단 배너: 모임 총 예산
  if (totalBudget > 0) {
    $('#total-budget-display').text(`₩${totalBudget.toLocaleString('ko-KR')}`);
    $('#total-budget-subtext').text('모임 개설 설정 기준');
    $('#settlement-group-budget').text(`₩${totalBudget.toLocaleString('ko-KR')}`);
  } else {
    $('#total-budget-display').text('미설정');
    $('#total-budget-subtext').text('모임 총 예산 미입력');
    $('#settlement-group-budget').text('미설정');
  }

  // 카드 3: 잔여 예산 (남은 금액) 및 초과 여부
  const $remainCard = $('#remaining-budget-card');
  const $remainDisplay = $('#remaining-budget-display');
  const $remainSubtext = $('#remaining-budget-subtext');

  if (totalBudget > 0) {
    if (remainingBudget >= 0) {
      // 예산 범위 내 (정상 잔여)
      $remainDisplay.text(`₩${remainingBudget.toLocaleString('ko-KR')}`)
                    .removeClass('text-rose-600')
                    .addClass('text-sky-950');
      $remainSubtext.text(`예산 대비 ₩${remainingBudget.toLocaleString('ko-KR')} 남음`)
                    .removeClass('text-rose-600 font-bold')
                    .addClass('text-sky-700/80 font-normal');
      $remainCard.removeClass('border-rose-300 from-rose-50 to-red-50/70 ring-2 ring-rose-200')
                 .addClass('border-sky-200 from-sky-50 to-blue-50');
    } else {
      // 예산 초과 (Over budget)
      const overAmount = Math.abs(remainingBudget);
      $remainDisplay.text(`-₩${overAmount.toLocaleString('ko-KR')}`)
                    .removeClass('text-sky-950')
                    .addClass('text-rose-600');
      $remainSubtext.text(`⚠️ 예산 대비 ₩${overAmount.toLocaleString('ko-KR')} 초과 지출`)
                    .removeClass('text-sky-700/80 font-normal')
                    .addClass('text-rose-600 font-bold');
      $remainCard.removeClass('border-sky-200 from-sky-50 to-blue-50')
                 .addClass('border-rose-300 from-rose-50 to-red-50/70 ring-2 ring-rose-200');
    }
  } else {
    $remainDisplay.text('계산 불가')
                  .removeClass('text-rose-600')
                  .addClass('text-slate-400');
    $remainSubtext.text('총 예산을 먼저 설정해주세요')
                  .removeClass('text-rose-600 font-bold')
                  .addClass('text-slate-400 font-normal');
    $remainCard.removeClass('border-rose-300 from-rose-50 to-red-50/70 ring-2 ring-rose-200')
               .addClass('border-sky-200 from-sky-50 to-blue-50');
  }

  // 총 예산 집행 현황 프로그레스 바 & 소진율 뱃지 동기화
  const $burnBadge = $('#budget-burn-rate-badge');
  const $burnBar = $('#budget-burn-progress-bar');
  const $spentText = $('#budget-progress-spent-text');
  const $remainText = $('#budget-progress-remain-text');
  const $totalText = $('#budget-progress-total-text');

  $spentText.text(`총 지출: ₩${total.toLocaleString('ko-KR')}`);

  if (totalBudget > 0) {
    const burnRate = (total / totalBudget) * 100;
    const clampedWidth = Math.min(100, Math.max(0, burnRate));
    $burnBar.css('width', `${clampedWidth}%`);
    $totalText.text(`총 예산: ₩${totalBudget.toLocaleString('ko-KR')}`);

    if (burnRate > 100) {
      $burnBar.removeClass('from-emerald-500 to-teal-500 from-amber-500 to-orange-500')
              .addClass('from-rose-500 to-red-600');
      $burnBadge.removeClass('bg-emerald-100 text-emerald-800 bg-amber-100 text-amber-800')
                .addClass('bg-rose-100 text-rose-800 font-black animate-pulse')
                .text(`⚠️ 예산 초과 (${burnRate.toFixed(1)}%)`);
      $remainText.removeClass('text-emerald-700 text-amber-700 text-slate-500')
                 .addClass('text-rose-600 font-bold')
                 .text(`초과 지출: ₩${Math.abs(remainingBudget).toLocaleString('ko-KR')}`);
    } else if (burnRate >= 80) {
      $burnBar.removeClass('from-emerald-500 to-teal-500 from-rose-500 to-red-600')
              .addClass('from-amber-500 to-orange-500');
      $burnBadge.removeClass('bg-emerald-100 text-emerald-800 bg-rose-100 text-rose-800 animate-pulse')
                .addClass('bg-amber-100 text-amber-800 font-bold')
                .text(`소진율 ${burnRate.toFixed(1)}% (주의)`);
      $remainText.removeClass('text-rose-600 text-slate-500')
                 .addClass('text-amber-700 font-bold')
                 .text(`남은 예산: ₩${remainingBudget.toLocaleString('ko-KR')}`);
    } else {
      $burnBar.removeClass('from-amber-500 to-orange-500 from-rose-500 to-red-600')
              .addClass('from-emerald-500 to-teal-500');
      $burnBadge.removeClass('bg-amber-100 text-amber-800 bg-rose-100 text-rose-800 animate-pulse')
                .addClass('bg-emerald-100 text-emerald-800 font-bold')
                .text(`소진율 ${burnRate.toFixed(1)}%`);
      $remainText.removeClass('text-rose-600 text-amber-700')
                 .addClass('text-emerald-700 font-bold')
                 .text(`남은 예산: ₩${remainingBudget.toLocaleString('ko-KR')}`);
    }
  } else {
    $burnBar.css('width', '0%');
    $burnBadge.removeClass('bg-emerald-100 text-emerald-800 bg-rose-100 text-rose-800 bg-amber-100 text-amber-800')
              .addClass('bg-slate-100 text-slate-600 font-semibold')
              .text('총 예산 미설정');
    $remainText.removeClass('text-emerald-700 text-rose-600 text-amber-700')
               .addClass('text-slate-400 font-normal')
               .text('남은 예산: -');
    $totalText.text('총 예산: 미설정');
  }

  const allPeople = new Set();
  settlementExpenses.forEach(e => {
    if (e.payer) allPeople.add(e.payer);
    if (Array.isArray(e.participants)) {
      e.participants.forEach(p => allPeople.add(p));
    }
  });

  // 모임 참여 인원이 있을 경우 그 인원을 분모로 고려
  if (settlementGroupObj && Array.isArray(settlementGroupObj.members)) {
    settlementGroupObj.members.forEach(m => allPeople.add(m.replace(/\(방장\)|\(나\)/g, '').trim()));
  }

  const memberCount = allPeople.size || 1;
  const avg = Math.round(total / memberCount);
  $avgDisplay.text(`₩${avg.toLocaleString('ko-KR')}`);

  // 참여자별 개별 분할 지출 금액 합산 집계 (영수증별 금액 ÷ 분할 참여자 수)
  const memberOwed = {};       // 각 멤버가 실제 분할 부담해야 하는 총액
  const memberPaid = {};       // 각 멤버가 직접 결제한 총액
  const memberItemsCount = {}; // 각 멤버가 참여한 영수증 건수

  allPeople.forEach(person => {
    memberOwed[person] = 0;
    memberPaid[person] = 0;
    memberItemsCount[person] = 0;
  });

  settlementExpenses.forEach(e => {
    const payer = e.payer;
    const participants = (e.participants && e.participants.length > 0) ? e.participants : [payer];
    const splitAmount = e.amount / participants.length;

    memberPaid[payer] = (memberPaid[payer] || 0) + e.amount;

    participants.forEach(p => {
      memberOwed[p] = (memberOwed[p] || 0) + splitAmount;
      memberItemsCount[p] = (memberItemsCount[p] || 0) + 1;
    });
  });

  // 멤버별 실제 분할 부담액 카드 리스트 렌더링 (최종적으로 내야 할 돈 / 받을 돈 시각적 강조)
  if ($memberListEl.length) {
    $memberListEl.html(Array.from(allPeople).map(person => {
      const owed = Math.round(memberOwed[person] || 0);
      const paid = Math.round(memberPaid[person] || 0);
      const count = memberItemsCount[person] || 0;
      const net = paid - owed; // 양수: 돌려받을 돈, 음수: 최종적으로 내야 할 돈(송금 필요)

      let cardBg = 'bg-slate-50 border-slate-200 hover:border-slate-300';
      let statusBadge = '<span class="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">정산완료</span>';
      let mainLabel = '<span class="text-[11px] font-semibold text-slate-500">정산 상태</span>';
      let mainAmount = `<span class="text-base font-bold text-slate-400">₩0</span>`;

      if (net < -10) {
        // 최종적으로 내야 할 돈이 있는 경우 (강조)
        cardBg = 'bg-gradient-to-b from-rose-50/70 to-rose-50/30 border-rose-300 ring-2 ring-rose-200/60 shadow-xs hover:border-rose-400';
        statusBadge = '<span class="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-black shadow-xs tracking-tight">송금 필요</span>';
        mainLabel = '<span class="text-[11px] font-bold text-rose-700 flex items-center gap-1">최종 내야 할 돈</span>';
        mainAmount = `<span class="text-xl font-black text-rose-600 tracking-tight">₩${Math.abs(net).toLocaleString('ko-KR')}</span>`;
      } else if (net > 10) {
        // 선결제하여 돌려받을 돈이 있는 경우
        cardBg = 'bg-gradient-to-b from-emerald-50/70 to-emerald-50/30 border-emerald-300 ring-1 ring-emerald-200/50 hover:border-emerald-400';
        statusBadge = '<span class="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold shadow-xs">환급 예정</span>';
        mainLabel = '<span class="text-[11px] font-bold text-emerald-700 flex items-center gap-1">받을 금액</span>';
        mainAmount = `<span class="text-xl font-black text-emerald-700 tracking-tight">+₩${net.toLocaleString('ko-KR')}</span>`;
      }

      const safePerson = escapeHtml(person);

      return `
        <div class="p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${cardBg}">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="font-extrabold text-slate-900 text-xs truncate max-w-[90px]" title="${safePerson}">${safePerson}</span>
              ${statusBadge}
            </div>

            <div class="mt-1">
              <div class="flex items-center justify-between text-slate-500">
                ${mainLabel}
                <span class="text-[10px] text-slate-400 font-medium">${count}건 참여</span>
              </div>
              <div class="mt-0.5">
                ${mainAmount}
              </div>
            </div>
          </div>

          <div class="text-[10px] mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-slate-500 font-medium">
            <span>부담: ₩${owed.toLocaleString('ko-KR')}</span>
            <span>결제: ₩${paid.toLocaleString('ko-KR')}</span>
          </div>
        </div>
      `;
    }).join(''));
  }

  // 상세 영수증 목록 렌더링 (데스크톱 테이블 뷰 & 모바일 전용 반응형 카드 뷰)
  const $cardList = $('#expense-card-list');

  if (settlementExpenses.length === 0) {
    $tableBody.html(`
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-400">
          <i data-lucide="receipt" class="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60"></i>
          <p class="text-sm">해당 모임에 등록된 지출 영수증이 없습니다.</p>
          <p class="text-xs text-slate-400 mt-1">좌측 폼에서 첫 영수증을 등록해보세요!</p>
        </td>
      </tr>
    `);
    if ($cardList.length) {
      $cardList.html(`
        <div class="py-10 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-6">
          <i data-lucide="receipt" class="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60"></i>
          <p class="text-sm font-medium">등록된 지출 영수증이 없습니다.</p>
          <p class="text-xs text-slate-400 mt-1">위 영수증 등록 폼에서 첫 영수증을 등록해보세요!</p>
        </div>
      `);
    }
    lucide.createIcons();
  } else {
    // 1. 데스크톱 테이블 뷰 렌더링
    $tableBody.html(settlementExpenses.map(e => {
      const partCount = Math.max(1, (e.participants || []).length);
      const splitAmount = Math.round(e.amount / partCount);
      const safeTitle = escapeHtml(e.title);
      const safePayer = escapeHtml(e.payer);
      const safeParticipants = (e.participants || []).map(p => escapeHtml(p)).join(', ');
      const safeId = escapeHtml(e.id);

      return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 font-semibold text-slate-800">${safeTitle}</td>
        <td class="py-3"><span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">${safePayer}</span></td>
        <td class="py-3 font-bold text-slate-900">₩${e.amount.toLocaleString('ko-KR')}</td>
        <td class="py-3 text-xs text-slate-500">${safeParticipants} (${partCount}명)</td>
        <td class="py-3">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
            ₩${splitAmount.toLocaleString('ko-KR')}
            <span class="text-[10px] font-normal text-emerald-600">/인</span>
          </span>
        </td>
        <td class="py-3 text-right">
          <button onclick="deleteExpense('${safeId}')" class="text-slate-300 hover:text-rose-500 transition p-1" title="영수증 삭제" aria-label="${safeTitle} 영수증 삭제">
            <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
          </button>
        </td>
      </tr>
    `}).join(''));

    // 2. 모바일 반응형 카드 뷰 렌더링 (360px~768px 화면 텍스트 몰림 현상 해결)
    if ($cardList.length) {
      $cardList.html(settlementExpenses.map(e => {
        const partCount = Math.max(1, (e.participants || []).length);
        const splitAmount = Math.round(e.amount / partCount);
        const safeTitle = escapeHtml(e.title);
        const safePayer = escapeHtml(e.payer);
        const safeParticipants = (e.participants || []).map(p => escapeHtml(p)).join(', ');
        const safeId = escapeHtml(e.id);

        return `
        <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition shadow-xs flex flex-col gap-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-slate-900 text-sm break-words">${safeTitle}</span>
                <span class="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[11px] font-semibold whitespace-nowrap">결제자: ${safePayer}</span>
              </div>
            </div>
            <button onclick="deleteExpense('${safeId}')" class="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition shrink-0" title="영수증 삭제" aria-label="${safeTitle} 영수증 삭제">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
            <span class="text-xs text-slate-500 font-medium">영수증 총액</span>
            <span class="text-base font-extrabold text-slate-900">₩${e.amount.toLocaleString('ko-KR')}</span>
          </div>

          <div class="bg-white/90 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            <div class="min-w-0 flex-1">
              <span class="text-[11px] text-slate-400 font-medium block">분할 참여자 (${partCount}명)</span>
              <p class="text-xs text-slate-600 font-medium truncate mt-0.5" title="${safeParticipants}">${safeParticipants}</p>
            </div>
            <div class="shrink-0 text-right">
              <span class="text-[10px] text-emerald-600 font-semibold block mb-0.5">1인 부담</span>
              <span class="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-black text-xs border border-emerald-200 shadow-2xs">
                ₩${splitAmount.toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
      `}).join(''));
    }

    lucide.createIcons();
  }

  // 최소 거래 정산 알고리즘
  const balances = {};
  allPeople.forEach(person => { balances[person] = 0; });

  settlementExpenses.forEach(e => {
    const payer = e.payer;
    const participants = (e.participants && e.participants.length > 0) ? e.participants : [payer];
    balances[payer] = (balances[payer] || 0) + e.amount;
    const splitAmount = e.amount / participants.length;
    participants.forEach(p => {
      balances[p] = (balances[p] || 0) - splitAmount;
    });
  });

  const debtors = [];
  const creditors = [];

  Object.keys(balances).forEach(person => {
    const val = Math.round(balances[person]);
    if (val < -10) debtors.push({ name: person, amount: -val });
    else if (val > 10) creditors.push({ name: person, amount: val });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const settle = Math.min(debtors[i].amount, creditors[j].amount);
    if (settle > 0) {
      transfers.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Math.round(settle)
      });
    }
    debtors[i].amount -= settle;
    creditors[j].amount -= settle;

    if (debtors[i].amount <= 10) i++;
    if (creditors[j].amount <= 10) j++;
  }

  if (transfers.length === 0) {
    $transferList.html(`<div class="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">모든 금액이 정산되었거나 정산할 송금 내역이 없습니다. 👍</div>`);
  } else {
    $transferList.html(transfers.map(t => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-cyan-50/70 border border-cyan-100 hover:bg-cyan-100/70 transition">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-900">${t.from}</span>
          <i data-lucide="arrow-right" class="w-4 h-4 text-cyan-600"></i>
          <span class="font-bold text-emerald-700">${t.to}</span>
        </div>
        <div class="font-extrabold text-cyan-900">
          ₩${t.amount.toLocaleString('ko-KR')} 송금
        </div>
      </div>
    `).join(''));
  }

  lucide.createIcons();
}

// 7. 지출 영수증 등록 (jQuery $.ajax)
async function addExpense(e) {
  e.preventDefault();
  if (!settlementGroupId) {
    showToast('먼저 정산할 여행 모임을 선택해주세요.');
    return;
  }

  const title = ($('#expense-title').val() || '').trim();
  const amount = parseInt($('#expense-amount').val(), 10);
  const payer = ($('#expense-payer-select').val() || '').trim();

  // 체크된 참여자 수집
  const participants = [];
  $('input[name="expense-participant-cb"]:checked').each(function() {
    const v = ($(this).val() || '').trim();
    if (v) participants.push(v);
  });

  if (participants.length === 0) {
    alert('회비 분할에 참여할 친구를 최소 1명 이상 선택해주세요.');
    return;
  }

  const newExpense = {
    id: 'exp-' + Date.now(),
    settlementId: null,
    title,
    amount,
    payer,
    participants
  };

  const numericId = getNumericId(settlementGroupId);
  const lsKey = 'travelmates_expenses_' + numericId;

  // 백엔드 REST API 연동
  if (isBackendLive) {
    try {
      await $.ajax({
        url: '/api/groups/' + numericId + '/expenses',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          groupId: numericId,
          payerId: 1, // 기본 회원 ID
          title: title,
          expenseAmount: amount,
          paymentMethod: 'CARD'
        })
      });
      await loadSettlementExpenses();
    } catch (err) {
      // LocalStorage fallback
      settlementExpenses.unshift(newExpense);
      localStorage.setItem(lsKey, JSON.stringify(settlementExpenses));
      renderExpenses();
    }
  } else {
    settlementExpenses.unshift(newExpense);
    localStorage.setItem(lsKey, JSON.stringify(settlementExpenses));
    renderExpenses();
  }

  $('#expense-form').trigger('reset');
  // 체크박스 기본 전체선택으로 재설정 및 분할 미리보기 갱신
  $('input[name="expense-participant-cb"]').prop('checked', true);
  updateReceiptPerPersonPreview();

  const perPerson = Math.round(amount / participants.length);
  showToast(`'${title}' 영수증 등록 완료! 1인당 ₩${perPerson.toLocaleString('ko-KR')} (${participants.length}명 분할)`);
}

// 8. 지출 영수증 삭제
async function deleteExpense(id) {
  if (!confirm('이 지출 영수증을 삭제하시겠습니까?')) return;

  const item = settlementExpenses.find(e => String(e.id) === String(id));
  const numericId = getNumericId(settlementGroupId);
  const lsKey = 'travelmates_expenses_' + numericId;

  if (item && item.settlementId && isBackendLive) {
    try {
      await $.ajax({
        url: '/api/expenses/' + item.settlementId,
        method: 'DELETE'
      });
    } catch (e) {}
  }

  settlementExpenses = settlementExpenses.filter(e => String(e.id) !== String(id));
  localStorage.setItem(lsKey, JSON.stringify(settlementExpenses));
  renderExpenses();
  showToast('지출 내역이 삭제되었습니다.');
}

// 9. 회비 정산 새로고침
async function refreshSettlementExpenses() {
  if (!settlementGroupId) return;
  await loadSettlementExpenses();
  showToast('모임 회비 내역을 새로고침했습니다.');
}

// 모임 카드에서 해당 모임의 회비 정산으로 바로 이동하는 헬퍼
function viewGroupSettlement(groupId) {
  const $sel = $('#settlement-group-select');
  if ($sel.length) {
    $sel.val(groupId);
    onSettlementGroupChange();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.location.href = 'settlement.html?groupId=' + encodeURIComponent(groupId);
  }
}

// 모임 카드에서 해당 모임의 갤러리로 바로 이동하는 헬퍼
function viewGroupGallery(groupId) {
  const $sel = $('#gallery-group-select');
  if ($sel.length) {
    $sel.val(groupId);
    onGalleryGroupChange();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.location.href = 'gallery.html?groupId=' + encodeURIComponent(groupId);
  }
}

// --------------------------------------------------------------------------------
// GALLERY MODULE (모임별 독립 여행 사진 갤러리)
// --------------------------------------------------------------------------------

// 1. 갤러리 모임 드롭다운 초기화
function initGalleryGroupSelect() {
  const $sel = $('#gallery-group-select');
  if (!$sel.length) return;

  const prevVal = $sel.val();
  $sel.html(`
    <option value="">-- 모임을 선택하세요 --</option>
    <option value="ALL">🌟 전체 모임 사진 둘러보기</option>
  `);

  groups.forEach(g => {
    const gid = g.groupId || g.id;
    $sel.append($('<option>', {
      value: gid,
      text: `[${g.type || '여행'}] ${g.title}`
    }));
  });

  // URL 파라미터 확인 (?groupId=...)
  let targetGid = null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    targetGid = urlParams.get('groupId');
  } catch (e) {}

  if (targetGid) {
    $sel.val(targetGid);
    onGalleryGroupChange();
  } else if (prevVal) {
    $sel.val(prevVal);
    onGalleryGroupChange();
  } else if (!galleryGroupId && groups.length > 0) {
    // 기본으로 첫 번째 모임 자동 선택 편의 제공
    $sel.val(groups[0].groupId || groups[0].id);
    onGalleryGroupChange();
  }
}

// 2. 모임 드롭다운 변경 시
async function onGalleryGroupChange() {
  const val = $('#gallery-group-select').val();
  galleryGroupId = val || null;

  if (!galleryGroupId) {
    $('#gallery-no-group').removeClass('hidden');
    $('#gallery-selected-panel').addClass('hidden');
    return;
  }

  $('#gallery-no-group').addClass('hidden');
  $('#gallery-selected-panel').removeClass('hidden');

  if (galleryGroupId === 'ALL') {
    $('#gallery-selected-group-badge').text('전체').removeClass('bg-orange-500/80 bg-emerald-500/80').addClass('bg-white/20');
    $('#gallery-selected-group-name').text('🌟 모든 여행 모임 사진 앨범');
    $('#gallery-selected-group-meta').text(`등록된 총 ${groups.length}개 모임의 모든 추억 사진들을 모아봅니다.`);
  } else {
    const grp = groups.find(g => String(g.groupId || g.id) === String(galleryGroupId));
    if (grp) {
      $('#gallery-selected-group-badge').text(grp.type || '국내');
      $('#gallery-selected-group-name').text(grp.title);
      $('#gallery-selected-group-meta').text(`${grp.location || ''} · ${grp.date || ''} · 참여 멤버 ${grp.currentMembers || (grp.members ? grp.members.length : 1)}명`);
    } else {
      $('#gallery-selected-group-badge').text('모임');
      $('#gallery-selected-group-name').text('선택된 여행 모임');
      $('#gallery-selected-group-meta').text('');
    }
  }

  // 백엔드가 살아있는 경우 해당 모임의 사진 목록을 실시간 동기화
  if (isBackendLive) {
    try {
      const endpoint = galleryGroupId === 'ALL' ? '/api/photos' : `/api/groups/${encodeURIComponent(galleryGroupId)}/photos`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const serverPhotos = await res.json();
        if (Array.isArray(serverPhotos) && serverPhotos.length > 0) {
          serverPhotos.forEach(sp => {
            const exists = photos.some(p => String(p.photoId || p.id) === String(sp.photoId));
            if (!exists) {
              photos.unshift({
                id: 'ph-' + (sp.photoId || Date.now()),
                photoId: sp.photoId,
                groupId: sp.groupId || galleryGroupId,
                url: sp.imageUrl || sp.url,
                imageUrl: sp.imageUrl || sp.url,
                caption: sp.caption,
                uploaderName: sp.uploaderName || '멤버',
                likes: sp.likes || 0,
                createdAt: sp.createdAt || ''
              });
            }
          });
          savePhotos();
        }
      }
    } catch (e) {
      console.warn('백엔드 사진 목록 조회 중 오류:', e);
    }
  }

  renderPhotos();
}

// 3. 전체 모임 사진 보기 바로가기
function selectGalleryAllGroups() {
  $('#gallery-group-select').val('ALL');
  onGalleryGroupChange();
}

// 4. 새로고침
async function refreshGalleryPhotos() {
  initGalleryGroupSelect();
  await onGalleryGroupChange();
  showToast('갤러리 사진 목록이 새로고침 되었습니다.');
}

// 5. 정렬 순서 토글 (최신순 / 인기순)
function setGallerySort(order) {
  gallerySortOrder = order;
  if (order === 'latest') {
    $('#btn-sort-latest').removeClass('text-slate-500 border-slate-200 hover:bg-slate-50').addClass('bg-emerald-50 text-emerald-700 border-emerald-200');
    $('#btn-sort-likes').removeClass('bg-emerald-50 text-emerald-700 border-emerald-200').addClass('text-slate-500 border-slate-200 hover:bg-slate-50');
  } else {
    $('#btn-sort-likes').removeClass('text-slate-500 border-slate-200 hover:bg-slate-50').addClass('bg-emerald-50 text-emerald-700 border-emerald-200');
    $('#btn-sort-latest').removeClass('bg-emerald-50 text-emerald-700 border-emerald-200').addClass('text-slate-500 border-slate-200 hover:bg-slate-50');
  }
  renderPhotos();
}

// 6. 사진 갤러리 그리드 렌더링
function renderPhotos() {
  const $container = $('#gallery-grid');
  if (!$container.length) return;

  // 1) 현재 선택된 모임에 맞게 필터링
  let filtered = [];
  if (galleryGroupId === 'ALL') {
    filtered = [...photos];
  } else if (galleryGroupId) {
    filtered = photos.filter(p => {
      const pGid = p.groupId !== undefined && p.groupId !== null ? String(p.groupId) : '2';
      return pGid === String(galleryGroupId);
    });
  } else {
    return;
  }

  // 2) 정렬 (최신순 / 인기순)
  if (gallerySortOrder === 'likes') {
    filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    filtered.sort((a, b) => {
      const aVal = a.photoId || (a.id ? parseInt(String(a.id).replace(/\D/g, '') || 0, 10) : 0);
      const bVal = b.photoId || (b.id ? parseInt(String(b.id).replace(/\D/g, '') || 0, 10) : 0);
      return bVal - aVal;
    });
  }

  // 3) 상단 개수 카운트 갱신
  const countText = `${filtered.length}장`;
  $('#gallery-photo-count').text(countText);
  $('#gallery-sub-count').text(filtered.length);

  // 4) 사진이 없는 경우 (Empty State)
  if (filtered.length === 0) {
    const grpName = galleryGroupId === 'ALL' ? '여행 모임' : ($('#gallery-selected-group-name').text() || '이 모임');
    $container.html(`
      <div class="col-span-full py-16 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8">
        <div class="w-16 h-16 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-300">
          <i data-lucide="image" class="w-8 h-8"></i>
        </div>
        <p class="font-bold text-slate-600 text-base mb-1">아직 등록된 추억 사진이 없습니다.</p>
        <p class="text-xs text-slate-400 mb-4">${escapeHtml(grpName)}의 첫 번째 사진을 등록해보세요!</p>
        <button type="button" onclick="openPhotoUploadModal()"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95">
          <i data-lucide="upload" class="w-4 h-4"></i>
          <span>지금 사진 올리기</span>
        </button>
      </div>
    `);
    lucide.createIcons();
    return;
  }

  // 5) 사진 카드 목록 렌더링
  $container.html(filtered.map(p => {
    const safeUrl = sanitizeUrl(p.url || p.imageUrl);
    const safeCaption = escapeHtml(p.caption || '여행의 추억');
    const safeId = escapeHtml(String(p.id || p.photoId));
    const safeUploader = escapeHtml(p.uploaderName || '참여 멤버');

    // 모임 정보 확인
    const pGid = p.groupId !== undefined && p.groupId !== null ? p.groupId : 2;
    const grp = groups.find(g => String(g.groupId || g.id) === String(pGid));
    const grpTitle = grp ? grp.title : '여행 모임';

    return `
    <div class="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between">
      <div class="relative overflow-hidden bg-slate-100 aspect-4/3 cursor-pointer group/img" onclick="openPhotoLightbox('${safeId}')" title="사진 크게 보기 (클릭)">
        <img src="${safeUrl}" alt="${safeCaption}" loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        
        <!-- 확대 아이콘 호버 오버레이 -->
        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-xs shadow-lg transform translate-y-1 group-hover/img:translate-y-0 transition-transform">
            <i data-lucide="zoom-in" class="w-4 h-4 text-emerald-400"></i>
            <span>확대 보기</span>
          </span>
        </div>

        <!-- 상단 뱃지 오버레이 -->
        <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black/60 text-white backdrop-blur-md shadow-xs max-w-[70%] truncate">
            <i data-lucide="map-pin" class="w-3 h-3 text-emerald-400 shrink-0"></i>
            <span class="truncate">${escapeHtml(grpTitle)}</span>
          </span>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/90 text-slate-700 backdrop-blur-xs shadow-2xs">
            <i data-lucide="user" class="w-2.5 h-2.5 text-slate-400"></i>
            <span>${safeUploader}</span>
          </span>
        </div>
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between bg-white">
        <p class="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 mb-3 cursor-pointer hover:text-emerald-600 transition"
          onclick="openPhotoLightbox('${safeId}')" title="${safeCaption} (클릭 시 확대)">
          ${safeCaption}
        </p>
        <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <button type="button" onclick="event.stopPropagation(); likePhoto('${safeId}')"
            class="flex items-center gap-1.5 text-rose-500 font-bold hover:scale-105 active:scale-95 transition bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg"
            title="좋아요">
            <i data-lucide="heart" class="w-4 h-4 fill-rose-500"></i>
            <span>${p.likes || 0}</span>
          </button>
          <button type="button" onclick="event.stopPropagation(); deletePhoto('${safeId}')"
            class="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
            title="사진 삭제">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
    `;
  }).join(''));

  lucide.createIcons();
}

// 7. 사진 업로드 모달 열기
function openPhotoUploadModal() {
  const $modal = $('#modal-photo-upload');
  if (!$modal.length) return;

  // 모임 드롭다운 목록 채우기
  const $groupSel = $('#upload-photo-group');
  $groupSel.html('');
  groups.forEach(g => {
    const gid = g.groupId || g.id;
    $groupSel.append($('<option>', {
      value: gid,
      text: `[${g.type || '여행'}] ${g.title}`
    }));
  });

  // 현재 선택된 모임이 있으면 기본 선택
  if (galleryGroupId && galleryGroupId !== 'ALL') {
    $groupSel.val(galleryGroupId);
  } else if (groups.length > 0) {
    $groupSel.val(groups[0].groupId || groups[0].id);
  }

  // 작성자 기본값 (로그인 유저 이름)
  const user = getLoggedInUser();
  if (user && user.name) {
    $('#upload-photo-uploader').val(user.name);
  } else {
    $('#upload-photo-uploader').val('');
  }

  // 입력 폼 초기화
  resetPhotoSelection();
  $('#upload-photo-caption').val('');

  $modal.removeClass('hidden');
  lucide.createIcons();
}

// 8. 사진 업로드 모달 닫기
function closePhotoUploadModal() {
  $('#modal-photo-upload').addClass('hidden');
  resetPhotoSelection();
}

// 9. 사진 선택 초기화
function resetPhotoSelection() {
  pendingPhotoDataUrl = null;
  $('#photo-file-input').val('');
  $('#photo-preview-img').attr('src', '');
  $('#photo-preview-filename').text('');
  $('#photo-empty-preview').removeClass('hidden');
  $('#photo-active-preview').addClass('hidden');
}

// 10. 사진 파일 선택 시 DataURL 변환 및 미리보기
function onPhotoFileSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  // 유형 검증
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일(JPG, PNG, GIF, WebP 등)만 업로드할 수 있습니다.');
    resetPhotoSelection();
    return;
  }

  // 크기 제한 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('사진 파일 용량이 너무 큽니다. 최대 10MB 이하의 이미지만 업로드 가능합니다.');
    resetPhotoSelection();
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    pendingPhotoDataUrl = evt.target.result;
    $('#photo-preview-img').attr('src', pendingPhotoDataUrl);
    $('#photo-preview-filename').text(file.name);
    $('#photo-empty-preview').addClass('hidden');
    $('#photo-active-preview').removeClass('hidden');
    lucide.createIcons();
  };
  reader.readAsDataURL(file);
}

// 11. 사진 업로드 폼 제출 처리
async function handlePhotoUploadSubmit(e) {
  e.preventDefault();
  if (!pendingPhotoDataUrl) {
    alert('업로드할 사진 파일을 선택해주세요.');
    return;
  }

  const targetGid = $('#upload-photo-group').val();
  if (!targetGid) {
    alert('사진을 업로드할 여행 모임을 선택해주세요.');
    return;
  }

  const rawCaption = $('#upload-photo-caption').val() || '친구들과 함께한 최고의 순간 ✨';
  const caption = escapeHtml(rawCaption);
  const uploaderName = $('#upload-photo-uploader').val().trim() || '참여 멤버';

  const newPhotoId = Date.now();
  const newPhoto = {
    id: 'ph-' + newPhotoId,
    photoId: newPhotoId,
    groupId: targetGid,
    url: pendingPhotoDataUrl,
    imageUrl: pendingPhotoDataUrl,
    caption: caption,
    uploaderName: uploaderName,
    likes: 0,
    createdAt: new Date().toISOString()
  };

  // 백엔드 연동
  if (isBackendLive) {
    try {
      await fetch(`/api/groups/${encodeURIComponent(targetGid)}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: pendingPhotoDataUrl,
          caption: caption,
          uploaderName: uploaderName
        })
      });
    } catch (err) {
      console.warn('백엔드 사진 저장 실패:', err);
    }
  }

  photos.unshift(newPhoto);
  savePhotos();

  closePhotoUploadModal();

  // 업로드한 모임으로 갤러리 드롭다운 자동 동기화
  $('#gallery-group-select').val(targetGid);
  await onGalleryGroupChange();

  showToast('사진이 모임 갤러리에 성공적으로 등록되었습니다! 📸');
}

// 12. 사진 좋아요 인터랙션
async function likePhoto(id) {
  const photo = photos.find(p => String(p.id) === String(id) || String(p.photoId) === String(id));
  if (!photo) return;

  photo.likes = (photo.likes || 0) + 1;
  savePhotos();
  renderPhotos();

  if (isBackendLive) {
    try {
      const pid = photo.photoId || id;
      await fetch(`/api/photos/${encodeURIComponent(pid)}/like`, { method: 'POST' });
    } catch (e) {
      console.warn('좋아요 백엔드 전송 실패:', e);
    }
  }
}

// 13. 사진 삭제 처리
async function deletePhoto(id) {
  if (!confirm('이 사진을 갤러리에서 삭제하시겠습니까?')) return;

  const target = photos.find(p => String(p.id) === String(id) || String(p.photoId) === String(id));
  if (target && isBackendLive) {
    try {
      const pid = target.photoId || id;
      await fetch(`/api/photos/${encodeURIComponent(pid)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('백엔드 사진 삭제 실패:', e);
    }
  }

  photos = photos.filter(p => String(p.id) !== String(id) && String(p.photoId) !== String(id));
  savePhotos();
  renderPhotos();
  showToast('사진이 삭제되었습니다.');
}

// 14. 로컬 스토리지 저장
function savePhotos() {
  localStorage.setItem('travelmates_photos', JSON.stringify(photos));
}

// 15. 사진 확대 라이트박스 열기
function openPhotoLightbox(photoId) {
  const $modal = $('#modal-photo-lightbox');
  if (!$modal.length) return;

  // 현재 필터링 및 정렬된 목록 산출
  let list = [];
  if (galleryGroupId === 'ALL') {
    list = [...photos];
  } else if (galleryGroupId) {
    list = photos.filter(p => {
      const pGid = p.groupId !== undefined && p.groupId !== null ? String(p.groupId) : '2';
      return pGid === String(galleryGroupId);
    });
  } else {
    list = [...photos];
  }

  if (gallerySortOrder === 'likes') {
    list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    list.sort((a, b) => {
      const aVal = a.photoId || (a.id ? parseInt(String(a.id).replace(/\D/g, '') || 0, 10) : 0);
      const bVal = b.photoId || (b.id ? parseInt(String(b.id).replace(/\D/g, '') || 0, 10) : 0);
      return bVal - aVal;
    });
  }

  currentLightboxList = list;
  if (!currentLightboxList.length) return;

  const idx = currentLightboxList.findIndex(p => String(p.id) === String(photoId) || String(p.photoId) === String(photoId));
  currentLightboxIndex = idx >= 0 ? idx : 0;

  showLightboxPhoto(currentLightboxIndex);
  $modal.removeClass('hidden');
  $('body').addClass('overflow-hidden');
  lucide.createIcons();
}

// 16. 라이트박스 특정 인덱스 사진 렌더링
function showLightboxPhoto(index) {
  if (!currentLightboxList || !currentLightboxList.length) return;

  if (index < 0) index = currentLightboxList.length - 1;
  if (index >= currentLightboxList.length) index = 0;
  currentLightboxIndex = index;

  const photo = currentLightboxList[index];
  currentLightboxPhotoId = photo.id || photo.photoId;

  const safeUrl = sanitizeUrl(photo.url || photo.imageUrl);
  const safeCaption = photo.caption || '여행의 추억 📸';
  const safeUploader = photo.uploaderName || '참여 멤버';
  const likesCount = photo.likes || 0;

  // 모임 정보 확인
  const pGid = photo.groupId !== undefined && photo.groupId !== null ? photo.groupId : 2;
  const grp = groups.find(g => String(g.groupId || g.id) === String(pGid));
  const grpTitle = grp ? grp.title : '여행 모임';

  // DOM 갱신
  $('#lightbox-img').attr('src', safeUrl).attr('alt', safeCaption);
  $('#lightbox-caption').text(safeCaption);
  $('#lightbox-uploader').text(safeUploader);
  $('#lightbox-group-name').text(grpTitle);
  $('#lightbox-like-count').text(likesCount);
  $('#lightbox-counter').text(`${index + 1} / ${currentLightboxList.length}`);
  $('#lightbox-link-orig').attr('href', safeUrl);

  lucide.createIcons();
}

// 17. 라이트박스 닫기
function closePhotoLightbox() {
  $('#modal-photo-lightbox').addClass('hidden');
  $('body').removeClass('overflow-hidden');
}

// 18. 이전 사진 보기
function prevLightboxPhoto(e) {
  if (e) e.stopPropagation();
  if (currentLightboxList.length <= 1) return;
  showLightboxPhoto(currentLightboxIndex - 1);
}

// 19. 다음 사진 보기
function nextLightboxPhoto(e) {
  if (e) e.stopPropagation();
  if (currentLightboxList.length <= 1) return;
  showLightboxPhoto(currentLightboxIndex + 1);
}

// 20. 라이트박스 내 좋아요 토글
async function toggleLightboxLike() {
  if (!currentLightboxPhotoId) return;
  await likePhoto(currentLightboxPhotoId);
  const photo = photos.find(p => String(p.id) === String(currentLightboxPhotoId) || String(p.photoId) === String(currentLightboxPhotoId));
  if (photo) {
    $('#lightbox-like-count').text(photo.likes || 0);
  }
}

// 21. 배경 클릭 시 라이트박스 닫기
function onLightboxBackdropClick(e) {
  if (e.target && (e.target.id === 'modal-photo-lightbox' || $(e.target).closest('#lightbox-img, button, a').length === 0)) {
    closePhotoLightbox();
  }
}

// 라이트박스 키보드 네비게이션 등록 (ESC, 좌우 화살표)
$(document).on('keydown', function(e) {
  const $modal = $('#modal-photo-lightbox');
  if (!$modal.length || $modal.hasClass('hidden')) return;

  if (e.key === 'Escape') {
    closePhotoLightbox();
  } else if (e.key === 'ArrowLeft') {
    prevLightboxPhoto();
  } else if (e.key === 'ArrowRight') {
    nextLightboxPhoto();
  }
});

// Global scope bindings for HTML onclick attributes
window.openCreateGroupModal = openCreateGroupModal;
window.closeCreateGroupModal = closeCreateGroupModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openSignupModal = openSignupModal;
window.closeSignupModal = closeSignupModal;
window.openRegisterModal = openSignupModal;
window.closeRegisterModal = closeSignupModal;
window.toggleJoinGroup = toggleJoinGroup;
window.confirmDeleteGroup = confirmDeleteGroup;
window.closeDeleteGroupModal = closeDeleteGroupModal;
window.executeDeleteGroup = executeDeleteGroup;
window.selectPresetCover = selectPresetCover;
window.handleCoverImageUpload = handleCoverImageUpload;
window.toggleCustomUrlInput = toggleCustomUrlInput;
window.applyCustomImageUrl = applyCustomImageUrl;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleScheduleInlineMap = toggleScheduleInlineMap;
window.viewScheduleLocation = viewScheduleLocation;
window.closeScheduleMapModal = closeScheduleMapModal;
window.viewGroupSettlement = viewGroupSettlement;
window.viewGroupGallery = viewGroupGallery;

// Gallery Global scope bindings
window.initGalleryGroupSelect = initGalleryGroupSelect;
window.onGalleryGroupChange = onGalleryGroupChange;
window.refreshGalleryPhotos = refreshGalleryPhotos;
window.selectGalleryAllGroups = selectGalleryAllGroups;
window.openPhotoUploadModal = openPhotoUploadModal;
window.closePhotoUploadModal = closePhotoUploadModal;
window.resetPhotoSelection = resetPhotoSelection;
window.onPhotoFileSelected = onPhotoFileSelected;
window.handlePhotoUploadSubmit = handlePhotoUploadSubmit;
window.setGallerySort = setGallerySort;
window.likePhoto = likePhoto;
window.deletePhoto = deletePhoto;
window.openPhotoLightbox = openPhotoLightbox;
window.closePhotoLightbox = closePhotoLightbox;
window.prevLightboxPhoto = prevLightboxPhoto;
window.nextLightboxPhoto = nextLightboxPhoto;
window.toggleLightboxLike = toggleLightboxLike;
window.onLightboxBackdropClick = onLightboxBackdropClick;
