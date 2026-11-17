/**
 * ==============================================================================
 * TravelMates 프론트엔드 공통 모듈 (Common Module & Constants)
 * - 공통 상수 (TravelMatesConstants)
 * - 공통 유틸리티 함수 (TravelMatesUtils)
 * ==============================================================================
 */

(function (window, $) {
    'use strict';

    // ==================== 1. 공통 코드 및 상수 (Constants) ====================
    var TravelMatesConstants = {
        // 여행 구분 코드
        TRIP_TYPE: {
            DOMESTIC: '국내',
            OVERSEAS: '해외'
        },

        // 회원 역할 코드
        MEMBER_ROLE: {
            LEADER: 'LEADER',
            MEMBER: 'MEMBER'
        },

        // 결제 수단 코드
        PAYMENT_METHOD: {
            CARD: 'CARD',
            CASH: 'CASH',
            TRANSFER: 'TRANSFER'
        },

        // 결제 수단 라벨 매핑
        PAYMENT_METHOD_LABELS: {
            CARD: '신용/체크카드',
            CASH: '현금',
            TRANSFER: '계좌이체'
        },

        // 국내/해외 인기 여행지 추천 칩 목록
        POPULAR_DESTINATIONS: {
            DOMESTIC: [
                { name: '제주도', label: '제주' },
                { name: '부산', label: '부산' },
                { name: '강릉/속초', label: '강릉/속초' },
                { name: '경주', label: '경주' },
                { name: '여수', label: '여수' },
                { name: '전주', label: '전주' }
            ],
            OVERSEAS: [
                { name: '오사카/교토', label: '오사카' },
                { name: '도쿄', label: '도쿄' },
                { name: '후쿠오카', label: '후쿠오카' },
                { name: '방콕/치앙마이', label: '방콕' },
                { name: '다낭/호이안', label: '다낭' },
                { name: '타이베이', label: '타이베이' }
            ]
        },

        // 모임명 위치 키워드 감지 매핑 목록
        LOCATION_KEYWORDS: [
            { keyword: '제주', location: '제주도', type: '국내' },
            { keyword: '부산', location: '부산', type: '국내' },
            { keyword: '강릉', location: '강릉/속초', type: '국내' },
            { keyword: '속초', location: '강릉/속초', type: '국내' },
            { keyword: '경주', location: '경주', type: '국내' },
            { keyword: '여수', location: '여수', type: '국내' },
            { keyword: '전주', location: '전주', type: '국내' },
            { keyword: '서울', location: '서울', type: '국내' },
            { keyword: '가평', location: '가평/양평', type: '국내' },
            { keyword: '오사카', location: '오사카/교토', type: '해외' },
            { keyword: '교토', location: '오사카/교토', type: '해외' },
            { keyword: '도쿄', location: '도쿄', type: '해외' },
            { keyword: '후쿠오카', location: '후쿠오카', type: '해외' },
            { keyword: '방콕', location: '방콕/치앙마이', type: '해외' },
            { keyword: '치앙마이', location: '방콕/치앙마이', type: '해외' },
            { keyword: '다낭', location: '다낭/호이안', type: '해외' },
            { keyword: '호이안', location: '다낭/호이안', type: '해외' },
            { keyword: '타이베이', location: '타이베이', type: '해외' },
            { keyword: '대만', location: '타이베이', type: '해외' }
        ]
    };

    // ==================== 2. 공통 유틸리티 (Utils) ====================
    var TravelMatesUtils = {
        /**
         * 개인정보 보호용 성명 익명 마스킹 함수 (예: 김민수 -> 김*수, 이지연 -> 이*연, 태호 -> 태*, 홍 -> 홍*)
         */
        maskName: function (name) {
            if (!name) return '익명';
            var clean = String(name).trim();
            if (clean.length <= 1) {
                return clean + '*';
            } else if (clean.length === 2) {
                return clean.charAt(0) + '*';
            } else if (clean.length === 3) {
                return clean.charAt(0) + '*' + clean.charAt(2);
            } else {
                return clean.charAt(0) + '*'.repeat(clean.length - 2) + clean.charAt(clean.length - 1);
            }
        },

        /**
         * 세자리 콤마 금액 포맷터 (예: 1200000 -> "1,200,000원")
         */
        formatMoney: function (num) {
            if (num === null || num === undefined || isNaN(num)) return '0원';
            return Number(num).toLocaleString('ko-KR') + '원';
        },

        /**
         * 날짜 포맷터 (yyyy-MM-dd)
         */
        formatDate: function (dateStr) {
            if (!dateStr) return '';
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            var year = d.getFullYear();
            var month = ('0' + (d.getMonth() + 1)).slice(-2);
            var day = ('0' + d.getDate()).slice(-2);
            return year + '-' + month + '-' + day;
        },

        /**
         * XSS 방어 HTML 특수문자 엔티티 이스케이프
         */
        escapeHtml: function (str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },

        /**
         * 안전한 URL 정제 (javascript:, data: 등 악성 의사 프로토콜 차단)
         */
        sanitizeUrl: function (url) {
            if (!url) return '';
            var trimmed = String(url).trim().toLowerCase();
            if (trimmed.indexOf('javascript:') === 0 || trimmed.indexOf('vbscript:') === 0 || trimmed.indexOf('data:') === 0) {
                return '#';
            }
            return url;
        },

        /**
         * 전화번호 하이픈 자동 포맷팅
         */
        formatPhoneNumber: function (val) {
            if (!val) return '';
            var raw = String(val).replace(/\D/g, '');
            if (raw.indexOf('02') === 0) {
                if (raw.length <= 2) return raw;
                if (raw.length <= 5) return raw.slice(0, 2) + '-' + raw.slice(2);
                if (raw.length <= 9) return raw.slice(0, 2) + '-' + raw.slice(2, raw.length - 4) + '-' + raw.slice(raw.length - 4);
                return raw.slice(0, 2) + '-' + raw.slice(2, 6) + '-' + raw.slice(6, 10);
            }
            if (raw.length <= 3) return raw;
            if (raw.length <= 7) return raw.slice(0, 3) + '-' + raw.slice(3);
            if (raw.length <= 10) return raw.slice(0, 3) + '-' + raw.slice(3, 6) + '-' + raw.slice(6);
            return raw.slice(0, 3) + '-' + raw.slice(3, 7) + '-' + raw.slice(7, 11);
        },

        /**
         * 공통 토스트 알림
         */
        toast: function (message, type) {
            type = type || 'info';
            var $toast = $('#common-toast');
            if (!$toast.length) {
                $toast = $('<div id="common-toast" role="status" aria-live="polite" class="fixed bottom-6 right-6 z-50 transform transition-all duration-300 translate-y-20 opacity-0 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border border-slate-700"></div>');
                $('body').append($toast);
            }
            var icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
            $toast.html('<span>' + icon + '</span><span>' + TravelMatesUtils.escapeHtml(message) + '</span>');
            $toast.removeClass('translate-y-20 opacity-0').addClass('translate-y-0 opacity-100');
            setTimeout(function () {
                $toast.removeClass('translate-y-0 opacity-100').addClass('translate-y-20 opacity-0');
            }, 3000);
        }
    };

    // 전역 노출
    window.TravelMatesConstants = TravelMatesConstants;
    window.TravelMatesUtils = TravelMatesUtils;
    window.escapeHtml = TravelMatesUtils.escapeHtml;

    // 전역 안전 모달 함수 선언 (초기 로딩 시 ReferenceError 원천 차단)
    window.openSignupModal = window.openSignupModal || function () {
        if (typeof window.openRegisterModal === 'function' && window.openRegisterModal !== window.openSignupModal) {
            window.openRegisterModal();
        } else {
            $('#login-modal').addClass('hidden');
            $('#register-modal').removeClass('hidden');
        }
    };
    window.closeSignupModal = window.closeSignupModal || function () {
        if (typeof window.closeRegisterModal === 'function' && window.closeRegisterModal !== window.closeSignupModal) {
            window.closeRegisterModal();
        } else {
            $('#register-modal').addClass('hidden');
        }
    };
    window.openRegisterModal = window.openRegisterModal || window.openSignupModal;
    window.closeRegisterModal = window.closeRegisterModal || window.closeSignupModal;

    // 다크 모드 토글 안전 선언
    window.toggleDarkMode = window.toggleDarkMode || function () {
        var isDark = $('html').hasClass('dark') || document.documentElement.classList.contains('dark');
        if (isDark) {
            $('html').removeClass('dark');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('travelmates_theme', 'light');
        } else {
            $('html').addClass('dark');
            document.documentElement.classList.add('dark');
            localStorage.setItem('travelmates_theme', 'dark');
        }
    };

})(window, jQuery);

