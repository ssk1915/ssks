/**
 * TravelMates - Web Publisher UI System (Vue.js 3)
 */

const { createApp, ref, computed, onMounted, nextTick } = Vue;

const app = createApp({
  setup() {
    const activeCategory = ref('overview');
    const viewportMode = ref('desktop');
    const copyBtnText = ref('코드 복사');
    const toast = ref({ show: false, message: '' });

    const categories = ref([
      { id: 'overview', name: '퍼블리싱 개요 & 토큰', icon: 'compass', count: 3 },
      { id: 'components', name: 'UI 컴포넌트 킷', icon: 'layers', count: 6 },
      { id: 'a11y', name: '웹 접근성(KWCAG) 점검', icon: 'shield-check', count: 5 },
      { id: 'generator', name: 'Vue SFC 코드 생성기', icon: 'code', count: 1 },
    ]);

    const colorTokens = ref([
      { name: 'Emerald 500', hex: '#22c55e', bgClass: 'bg-emerald-500' },
      { name: 'Emerald 600', hex: '#16a34a', bgClass: 'bg-emerald-600' },
      { name: 'Teal 600', hex: '#0d9488', bgClass: 'bg-teal-600' },
      { name: 'Cyan 600', hex: '#0891b2', bgClass: 'bg-cyan-600' },
      { name: 'Slate 800', hex: '#1e293b', bgClass: 'bg-slate-800' },
      { name: 'Slate 100', hex: '#f1f5f9', bgClass: 'bg-slate-100' },
    ]);

    const formDemo = ref({
      location: '제주도 서귀포 3박 4일',
      category: 'lodging',
    });

    const a11yItems = ref([
      { id: 1, title: '적절한 대체 텍스트(alt) 제공', desc: '모든 img 태그 및 아이콘 버튼에 시각장애인을 위한 의미 있는 설명(aria-label, alt) 부착', checked: true },
      { id: 2, title: '키보드 초점(Focus) 이동 및 가시성', desc: 'Tab 키 조작 시 논리적인 순서로 이동하며 시각적인 포커스 링(outline/ring) 보장', checked: true },
      { id: 3, title: '텍스트와 배경 간 명도 대비 4.5:1 준수', desc: '본문 텍스트 최소 4.5:1, 대형 텍스트 및 UI 컴포넌트 경계 3.0:1 이상 충족', checked: true },
      { id: 4, title: '시맨틱 마크업 및 제목 계층 구조', desc: 'h1~h6 레벨 건너뜀 없이 올바른 계층 구조 형성 및 header/nav/main/section 태그 적용', checked: true },
      { id: 5, title: '반응형 뷰포트 및 줌 200% 지원', desc: '모바일 가로/세로 회전 및 브라우저 확대 200% 시 가로 스크롤 잘림 현상 방지', checked: true },
    ]);

    const viewportContainerClass = computed(() => {
      switch (viewportMode.value) {
        case 'mobile':
          return 'max-w-sm border-x border-slate-300 shadow-2xl bg-white p-4 rounded-3xl min-h-[600px]';
        case 'tablet':
          return 'max-w-2xl border-x border-slate-300 shadow-xl bg-white p-6 rounded-2xl min-h-[600px]';
        default:
          return 'w-full';
      }
    });

    const generatedVueCode = computed(() => {
      return `<template>
  <article class="tm-trip-card border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 transition">
    <div class="flex items-center justify-between mb-3">
      <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
        {{ badgeText }}
      </span>
      <span class="text-xs text-slate-400 flex items-center gap-1">
        <i data-lucide="users" class="w-3.5 h-3.5"></i> {{ membersCount }}명 참가
      </span>
    </div>
    <h4 class="font-bold text-slate-900 text-base mb-1">{{ title }}</h4>
    <p class="text-xs text-slate-500 mb-4">{{ location }}</p>
    <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
      <span class="text-slate-500">1인 예상 정산금</span>
      <span class="font-bold text-emerald-600 text-sm">₩{{ estimatedAmount.toLocaleString() }}</span>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  location: { type: String, required: true },
  badgeText: { type: String, default: 'D-Day' },
  membersCount: { type: Number, default: 1 },
  estimatedAmount: { type: Number, default: 0 }
});
<\/script>`;
    });

    const showToast = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => {
        toast.value.show = false;
      }, 2500);
    };

    const copyText = (text) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        showToast(`클립보드에 복사되었습니다: ${text}`);
      }
    };

    const copyGeneratedCode = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(generatedVueCode.value);
        copyBtnText.value = '복사 완료!';
        showToast('Vue 컴포넌트 코드가 복사되었습니다.');
        setTimeout(() => {
          copyBtnText.value = '코드 복사';
        }, 2000);
      }
    };

    const refreshIcons = () => {
      nextTick(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      });
    };

    onMounted(() => {
      refreshIcons();
    });

    return {
      activeCategory,
      viewportMode,
      copyBtnText,
      toast,
      categories,
      colorTokens,
      formDemo,
      a11yItems,
      viewportContainerClass,
      generatedVueCode,
      copyText,
      copyGeneratedCode,
      refreshIcons,
    };
  }
});

app.mount('#app');
