// TravelMates - Main Application Logic (with Tomcat REST API & Offline LocalStorage Sync)

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

const DEFAULT_EXPENSES = [
  { id: 'exp-1', title: '렌터카 대여 및 보험료', amount: 160000, payer: '민수', participants: ['민수', '지훈', '서연', '현우'] },
  { id: 'exp-2', title: '첫날 흑돼지 & 음료 저녁 식사', amount: 120000, payer: '지훈', participants: ['민수', '지훈', '서연', '현우'] },
  { id: 'exp-3', title: '동문시장 야시장 간식 및 딱새우회', amount: 64000, payer: '서연', participants: ['민수', '지훈', '서연', '현우'] }
];

const DEFAULT_PHOTOS = [
  { id: 'ph-1', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80', caption: '렌터카 타고 해안도로 드라이브 중 🚗', likes: 12 },
  { id: 'ph-2', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', caption: '바다 색깔 실화인가요?! 제주도 최고 🌊', likes: 18 },
  { id: 'ph-3', url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', caption: '저녁 캠프파이어와 바비큐 파티 🔥', likes: 25 }
];

// App State
let groups = JSON.parse(localStorage.getItem('travelmates_groups')) || DEFAULT_GROUPS;
let plans = JSON.parse(localStorage.getItem('travelmates_plans')) || DEFAULT_PLANS;
let expenses = JSON.parse(localStorage.getItem('travelmates_expenses')) || DEFAULT_EXPENSES;
let photos = JSON.parse(localStorage.getItem('travelmates_photos')) || DEFAULT_PHOTOS;
let currentDay = 1;
let currentFilter = 'all';
let isBackendLive = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  renderGroups();
  renderPlans();
  renderExpenses();
  renderPhotos();
  lucide.createIcons();

  // 톰캣 백엔드 REST API와 실시간 동기화 시도
  await syncBackend();
});

// 백엔드 REST API 연동
async function syncBackend() {
  try {
    const res = await fetch('/api/groups');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        isBackendLive = true;
        groups = data.map(g => ({
          id: 'grp-' + g.groupId,
          groupId: g.groupId,
          title: g.groupName,
          type: g.tripType,
          location: g.location,
          date: `${g.startDate || ''} ~ ${g.endDate || ''}`,
          maxMembers: g.maxMembers,
          currentMembers: g.currentMembers || 1,
          members: [g.creatorName || '방장'],
          budget: g.estimatedBudget || '미정',
          desc: g.description || '',
          image: g.imageUrl || 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
          joined: false
        }));
        renderGroups();
        console.log('[Tomcat] 전자정부프레임워크 백엔드(MySQL)와 정상 연동되었습니다.');
      }
    }
  } catch (e) {
    // 백엔드 미기동 시 LocalStorage 모드로 자연스럽게 동작
    console.log('[Client Mode] 로컬스토리지 모드로 동작합니다.');
  }
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  toastMsg.innerText = message;
  toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
  }, 2500);
}

// Navigation Tab Switch
function switchTab(tabName) {
  const tabs = ['groups', 'planner', 'settlement', 'gallery'];
  const hero = document.getElementById('hero-banner');

  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    if (t === tabName) {
      el.classList.remove('hidden');
      if (navBtn) {
        navBtn.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100');
        navBtn.classList.add('text-emerald-600', 'bg-emerald-50');
      }
    } else {
      el.classList.add('hidden');
      if (navBtn) {
        navBtn.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100');
        navBtn.classList.remove('text-emerald-600', 'bg-emerald-50');
      }
    }
  });

  if (tabName === 'groups') {
    hero.classList.remove('hidden');
  } else {
    hero.classList.add('hidden');
  }

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------------
// GROUPS MODULE
// --------------------------------------------------------------------------------

function filterGroups(filterType) {
  currentFilter = filterType;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.filter === filterType) {
      btn.className = 'filter-btn px-3 py-1.5 rounded-lg transition bg-white text-slate-800 shadow-sm';
    } else {
      btn.className = 'filter-btn px-3 py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900';
    }
  });
  renderGroups();
}

function renderGroups() {
  const container = document.getElementById('groups-grid');
  const countBadge = document.getElementById('group-count-badge');

  const filtered = groups.filter(g => currentFilter === 'all' || g.type === currentFilter);
  countBadge.innerText = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400">
        <i data-lucide="compass" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
        <p>해당 카테고리의 여행 모임이 없습니다. 새 모임을 만들어보세요!</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(g => {
    const isFull = g.currentMembers >= g.maxMembers;
    const progressPercent = Math.min(100, Math.round((g.currentMembers / g.maxMembers) * 100));

    return `
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group-card-hover">
        <div class="relative h-48 w-full overflow-hidden">
          <img src="${g.image}" alt="${g.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <div class="absolute top-3 left-3 flex gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${g.type === '해외' ? 'bg-cyan-500 text-white' : 'bg-emerald-600 text-white'} shadow-sm">
              ${g.type}여행
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm">
              <i data-lucide="map-pin" class="w-3 h-3 inline mr-0.5 text-rose-500"></i> ${g.location}
            </span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <h3 class="text-lg font-bold text-slate-900 leading-snug line-clamp-1 mb-2">${g.title}</h3>
          <p class="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">${g.desc}</p>

          <div class="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> 일정</span>
              <span class="font-medium text-slate-700">${g.date}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 flex items-center gap-1"><i data-lucide="wallet" class="w-3.5 h-3.5"></i> 예상 예산</span>
              <span class="font-semibold text-emerald-600">${g.budget}</span>
            </div>
          </div>

          <!-- Progress -->
          <div class="mt-auto pt-2">
            <div class="flex justify-between items-center text-xs mb-1.5">
              <span class="font-medium text-slate-600">모집 인원 현황</span>
              <span class="font-bold ${isFull ? 'text-rose-500' : 'text-emerald-600'}">
                ${g.currentMembers} / ${g.maxMembers}명 ${isFull ? '(마감)' : ''}
              </span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
            </div>

            <!-- Join / Leave Button -->
            ${g.joined ? `
              <button onclick="toggleJoinGroup('${g.id}')" class="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition flex items-center justify-center gap-1.5">
                <i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> 참여 중 (신청 취소)
              </button>
            ` : `
              <button onclick="toggleJoinGroup('${g.id}')" ${isFull ? 'disabled' : ''} class="w-full py-2.5 rounded-xl ${isFull ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'} font-semibold text-xs transition flex items-center justify-center gap-1.5">
                <i data-lucide="user-plus" class="w-4 h-4"></i> ${isFull ? '모집 마감' : '참여 신청하기'}
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

async function toggleJoinGroup(id) {
  const grp = groups.find(g => g.id === id);
  if (!grp) return;

  if (grp.joined) {
    grp.joined = false;
    grp.currentMembers = Math.max(1, grp.currentMembers - 1);
    if (isBackendLive && grp.groupId) {
      try { await fetch(`/api/groups/${grp.groupId}/leave`, { method: 'POST' }); } catch(e){}
    }
    showToast(`'${grp.title}' 모임 참여 신청을 취소했습니다.`);
  } else {
    if (grp.currentMembers >= grp.maxMembers) {
      alert('이미 인원이 마감된 모임입니다.');
      return;
    }
    grp.joined = true;
    grp.currentMembers += 1;
    if (isBackendLive && grp.groupId) {
      try { await fetch(`/api/groups/${grp.groupId}/join`, { method: 'POST' }); } catch(e){}
    }
    showToast(`'${grp.title}' 모임에 참여 신청되었습니다! 🎉`);
  }

  saveGroups();
  renderGroups();
}

function openCreateGroupModal() {
  document.getElementById('modal-create-group').classList.remove('hidden');
  document.getElementById('modal-create-group').classList.add('flex');
}

function closeCreateGroupModal() {
  document.getElementById('modal-create-group').classList.add('hidden');
  document.getElementById('modal-create-group').classList.remove('flex');
}

async function handleCreateGroup(e) {
  e.preventDefault();
  const title = document.getElementById('new-group-title').value.trim();
  const type = document.getElementById('new-group-type').value;
  const location = document.getElementById('new-group-location').value.trim();
  const date = document.getElementById('new-group-date').value.trim();
  const max = parseInt(document.getElementById('new-group-max').value, 10);
  const budget = document.getElementById('new-group-budget').value.trim();
  const desc = document.getElementById('new-group-desc').value.trim();

  const sampleImages = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  ];
  const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];

  const newGroup = {
    id: 'grp-' + Date.now(),
    title,
    type,
    location,
    date,
    maxMembers: max,
    currentMembers: 1,
    members: ['나(방장)'],
    budget,
    desc,
    image: randomImg,
    joined: true
  };

  // 백엔드가 동작 중이면 MySQL에 저장
  if (isBackendLive) {
    try {
      const resp = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: title,
          tripType: type,
          location: location,
          startDate: '2026-12-01',
          endDate: '2026-12-05',
          maxMembers: max,
          estimatedBudget: budget,
          description: desc,
          imageUrl: randomImg,
          createdBy: 1
        })
      });
      if (resp.ok) {
        await syncBackend();
      }
    } catch (e) {}
  } else {
    groups.unshift(newGroup);
    saveGroups();
    renderGroups();
  }

  closeCreateGroupModal();
  document.getElementById('create-group-form').reset();
  showToast('새 여행 모임이 생성되었습니다! 🎉');
}

function saveGroups() {
  localStorage.setItem('travelmates_groups', JSON.stringify(groups));
}

// --------------------------------------------------------------------------------
// PLANNER MODULE
// --------------------------------------------------------------------------------

function selectPlanDay(day) {
  currentDay = day;
  document.querySelectorAll('.day-tab').forEach(tab => {
    if (parseInt(tab.dataset.day, 10) === day) {
      tab.className = 'day-tab px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white shadow-sm';
    } else {
      tab.className = 'day-tab px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200';
    }
  });
  renderPlans();
}

function renderPlans() {
  const container = document.getElementById('plan-timeline');
  const dayPlans = plans[currentDay] || [];

  if (dayPlans.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-slate-400 text-sm">
        등록된 일정이 없습니다. 우측 상단의 '+ 일정 항목 추가'를 눌러 일정을 등록해보세요!
      </div>
    `;
    return;
  }

  container.innerHTML = dayPlans.map(item => `
    <div class="relative timeline-dot group bg-slate-50 hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 transition">
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 mb-1.5">
            ${item.time}
          </span>
          <h4 class="text-base font-bold text-slate-900">${item.place}</h4>
          ${item.memo ? `<p class="text-xs text-slate-500 mt-1 flex items-center gap-1"><i data-lucide="info" class="w-3.5 h-3.5 text-slate-400"></i> ${item.memo}</p>` : ''}
        </div>
        <button onclick="deletePlanItem('${item.id}')" class="text-slate-300 hover:text-rose-500 p-1 transition" title="삭제">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function openAddPlanModal() {
  document.getElementById('modal-add-plan').classList.remove('hidden');
  document.getElementById('modal-add-plan').classList.add('flex');
}

function closeAddPlanModal() {
  document.getElementById('modal-add-plan').classList.add('hidden');
  document.getElementById('modal-add-plan').classList.remove('flex');
}

function handleAddPlan(e) {
  e.preventDefault();
  const time = document.getElementById('plan-time').value.trim();
  const place = document.getElementById('plan-place').value.trim();
  const memo = document.getElementById('plan-memo').value.trim();

  if (!plans[currentDay]) {
    plans[currentDay] = [];
  }

  plans[currentDay].push({
    id: 'p-' + Date.now(),
    time,
    place,
    memo
  });

  savePlans();
  renderPlans();
  closeAddPlanModal();
  document.getElementById('add-plan-form').reset();
  showToast(`Day ${currentDay}에 새 일정이 추가되었습니다.`);
}

function deletePlanItem(id) {
  if (!confirm('이 일정을 삭제하시겠습니까?')) return;
  plans[currentDay] = plans[currentDay].filter(item => item.id !== id);
  savePlans();
  renderPlans();
  showToast('일정이 삭제되었습니다.');
}

function savePlans() {
  localStorage.setItem('travelmates_plans', JSON.stringify(plans));
}

// --------------------------------------------------------------------------------
// SETTLEMENT / DUTCH PAY MODULE
// --------------------------------------------------------------------------------

function addExpense(e) {
  e.preventDefault();
  const title = document.getElementById('expense-title').value.trim();
  const amount = parseInt(document.getElementById('expense-amount').value, 10);
  const payer = document.getElementById('expense-payer').value.trim();
  const participantsRaw = document.getElementById('expense-participants').value.trim();

  const participants = participantsRaw.split(',').map(s => s.trim()).filter(Boolean);

  if (participants.length === 0) {
    alert('참여 인원을 1명 이상 입력해주세요.');
    return;
  }

  expenses.unshift({
    id: 'exp-' + Date.now(),
    title,
    amount,
    payer,
    participants
  });

  saveExpenses();
  renderExpenses();
  document.getElementById('expense-form').reset();
  showToast('지출 내역이 성공적으로 등록되었습니다.');
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses();
  renderExpenses();
  showToast('지출 내역이 삭제되었습니다.');
}

function saveExpenses() {
  localStorage.setItem('travelmates_expenses', JSON.stringify(expenses));
}

function renderExpenses() {
  const tableBody = document.getElementById('expense-table-body');
  const totalDisplay = document.getElementById('total-expense-display');
  const avgDisplay = document.getElementById('average-expense-display');
  const transferList = document.getElementById('transfer-summary-list');

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  totalDisplay.innerText = `₩${total.toLocaleString('ko-KR')}`;

  const allPeople = new Set();
  expenses.forEach(e => {
    allPeople.add(e.payer);
    e.participants.forEach(p => allPeople.add(p));
  });

  const memberCount = allPeople.size || 1;
  const avg = Math.round(total / memberCount);
  avgDisplay.innerText = `₩${avg.toLocaleString('ko-KR')}`;

  if (expenses.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-slate-400">등록된 지출 내역이 없습니다.</td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = expenses.map(e => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 font-semibold text-slate-800">${e.title}</td>
        <td class="py-3"><span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">${e.payer}</span></td>
        <td class="py-3 font-bold text-slate-900">₩${e.amount.toLocaleString('ko-KR')}</td>
        <td class="py-3 text-xs text-slate-500">${e.participants.join(', ')} (${e.participants.length}명)</td>
        <td class="py-3 text-right">
          <button onclick="deleteExpense('${e.id}')" class="text-slate-300 hover:text-rose-500 transition">
            <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Calculate Debts
  const balances = {};
  allPeople.forEach(person => { balances[person] = 0; });

  expenses.forEach(e => {
    balances[e.payer] = (balances[e.payer] || 0) + e.amount;
    const splitAmount = e.amount / e.participants.length;
    e.participants.forEach(p => {
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
    transferList.innerHTML = `<div class="text-xs text-slate-400 py-2">모든 금액이 정산되었거나 정산할 내역이 없습니다. 👍</div>`;
  } else {
    transferList.innerHTML = transfers.map(t => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-cyan-50/70 border border-cyan-100">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-900">${t.from}</span>
          <i data-lucide="arrow-right" class="w-4 h-4 text-cyan-600"></i>
          <span class="font-bold text-emerald-700">${t.to}</span>
        </div>
        <div class="font-extrabold text-cyan-900">
          ₩${t.amount.toLocaleString('ko-KR')} 송금
        </div>
      </div>
    `).join('');
  }

  lucide.createIcons();
}

// --------------------------------------------------------------------------------
// GALLERY MODULE
// --------------------------------------------------------------------------------

function renderPhotos() {
  const container = document.getElementById('gallery-grid');
  if (photos.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400">
        <i data-lucide="image" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
        <p>공유된 여행 사진이 없습니다. 첫 사진을 등록해보세요!</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = photos.map(p => `
    <div class="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group-card-hover flex flex-col">
      <div class="h-56 w-full overflow-hidden relative">
        <img src="${p.url}" alt="${p.caption}" class="w-full h-full object-cover">
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between">
        <p class="text-sm font-semibold text-slate-800 leading-snug mb-3">${p.caption}</p>
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button onclick="likePhoto('${p.id}')" class="flex items-center gap-1.5 text-rose-500 font-bold hover:scale-105 transition">
            <i data-lucide="heart" class="w-4 h-4 fill-rose-500"></i>
            <span>${p.likes}</span>
          </button>
          <button onclick="deletePhoto('${p.id}')" class="text-slate-300 hover:text-rose-500 transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function likePhoto(id) {
  const photo = photos.find(p => p.id === id);
  if (!photo) return;
  photo.likes += 1;
  savePhotos();
  renderPhotos();
}

function deletePhoto(id) {
  photos = photos.filter(p => p.id !== id);
  savePhotos();
  renderPhotos();
  showToast('사진이 삭제되었습니다.');
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const caption = prompt('사진에 대한 한 줄 설명이나 추억을 적어주세요:', '친구들과 함께한 최고의 순간 ✨') || '여행의 추억 📸';
    photos.unshift({
      id: 'ph-' + Date.now(),
      url: evt.target.result,
      caption,
      likes: 1
    });
    savePhotos();
    renderPhotos();
    showToast('사진이 갤러리에 추가되었습니다!');
  };
  reader.readAsDataURL(file);
}

function savePhotos() {
  localStorage.setItem('travelmates_photos', JSON.stringify(photos));
}
