/* js/main.js — V1.1
   Entry point: bootstrap app, bind global events, điều phối render,
   đăng ký service worker.
   V1.1: Thêm handleQueryParams() — hỗ trợ ?tab=xxx và ?action=add
   từ manifest.shortcuts. */

import {
  PLATFORM,
  loadState,
  applyTheme, toggleTheme,
  fillIcons,
  closeSheet, bindConfirmOK
} from './core.js';

import { renderDashboard } from './dashboard.js';

import {
  renderExpensesTab, openExpenseModal, closeExpenseModal,
  bindExpenseTabEvents, bindExpenseFormEvents
} from './expenses.js';

import {
  renderCategoriesTab, openCategoryModal, closeCategoryModal,
  bindCategoryTabEvents, bindCategoryFormEvents
} from './categories.js';

import { renderReportsTab, bindReportTabEvents } from './reports.js';

import { renderSettings, bindSettingsTabEvents } from './settings.js';

/* ==================================================================
   Platform attribute (theme.css đọc biến này)
   ================================================================== */
document.documentElement.setAttribute('data-platform', PLATFORM);

/* ==================================================================
   Tab metadata
   ================================================================== */
const TAB_TITLES = {
  dashboard: 'Tổng quan',
  expenses: 'Giao dịch',
  categories: 'Danh mục',
  reports: 'Báo cáo',
  settings: 'Cài đặt'
};

const TAB_SUBTITLES = {
  dashboard: 'Quản lý chi tiêu',
  expenses: 'Danh sách giao dịch',
  categories: 'Phân loại chi tiêu',
  reports: 'Phân tích chi tiết',
  settings: 'Tuỳ chỉnh'
};

let currentTab = 'dashboard';

/* ==================================================================
   Render dispatcher
   ================================================================== */
function renderTab(tabId) {
  if (tabId === 'dashboard') renderDashboard();
  else if (tabId === 'expenses') renderExpensesTab();
  else if (tabId === 'categories') renderCategoriesTab();
  else if (tabId === 'reports') renderReportsTab();
  else if (tabId === 'settings') renderSettings();
  fillIcons();
}

/* ==================================================================
   Tab switching
   ================================================================== */
function switchTab(tabId) {
  if (currentTab === tabId) return;
  currentTab = tabId;

  document.querySelectorAll('.tab-btn').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tabId)
  );
  document.querySelectorAll('.panel').forEach(p =>
    p.classList.toggle('active', p.id === 'panel-' + tabId)
  );

  document.getElementById('appBarTitle').textContent = TAB_TITLES[tabId] || '';
  document.getElementById('appBarSubtitle').textContent = TAB_SUBTITLES[tabId] || '';

  document.getElementById('appContent').scrollTop = 0;
  document.getElementById('appBar').classList.remove('scrolled');

  // FAB ẩn trên tab Cài đặt
  document.getElementById('fab').style.display =
    (tabId === 'settings') ? 'none' : 'flex';

  renderTab(tabId);
}

function bindTabs() {
  document.querySelectorAll('.tab-btn').forEach(t => {
    t.addEventListener('click', () => switchTab(t.dataset.tab));
  });
  document.querySelectorAll('[data-goto]').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.goto));
  });
}

/* ==================================================================
   Sheet close handlers (dùng chung cho mọi sheet)
   ================================================================== */
function closeSheetById(id) {
  if (id === 'expenseModal') closeExpenseModal();
  else if (id === 'categoryModal') closeCategoryModal();
  else closeSheet(id);
}

function bindSheets() {
  // Nút data-close
  document.querySelectorAll('[data-close]').forEach(b => {
    b.addEventListener('click', () => closeSheetById(b.dataset.close));
  });

  // Click overlay (ngoài sheet)
  document.querySelectorAll('.sheet-overlay').forEach(o => {
    o.addEventListener('click', (e) => {
      if (e.target === o) closeSheetById(o.id);
    });
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.sheet-overlay.active').forEach(o => {
      closeSheetById(o.id);
    });
  });
}

/* ==================================================================
   App bar + FAB
   ================================================================== */
function bindAppBar() {
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('fab').addEventListener('click', () => openExpenseModal());
}

/* ==================================================================
   Scroll — rAF debounced (iOS subtitle fade)
   ================================================================== */
function setupScrollBehavior() {
  const content = document.getElementById('appContent');
  const bar = document.getElementById('appBar');
  let ticking = false;
  content.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const st = content.scrollTop;
      if (PLATFORM === 'ios') bar.classList.toggle('scrolled', st > 20);
      ticking = false;
    });
  }, { passive: true });
}

/* ==================================================================
   Cross-module: mọi module bắn sự kiện này khi state thay đổi
   ================================================================== */
function bindStateChanged() {
  document.addEventListener('state:changed', () => {
    renderTab(currentTab);
  });
}

/* ==================================================================
   Query param từ PWA shortcuts (manifest.json)
   Hỗ trợ:
     ?tab=dashboard|expenses|categories|reports|settings
     ?action=add   → mở form thêm chi tiêu
   ================================================================== */
function handleQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  const actionParam = params.get('action');

  let handled = false;
  let pendingOpenAdd = false;

  // Ưu tiên 1: chuyển tab nếu hợp lệ và khác tab hiện tại
  if (tabParam && TAB_TITLES[tabParam] && tabParam !== currentTab) {
    switchTab(tabParam);
    handled = true;
  }

  // Ưu tiên 2: mở form thêm chi tiêu
  if (actionParam === 'add') {
    pendingOpenAdd = true;
    handled = true;
  }

  // Xoá query string để F5 / reload không kích hoạt lại shortcut
  if (handled) {
    try {
      const cleanUrl = window.location.pathname + window.location.hash;
      history.replaceState({}, '', cleanUrl);
    } catch (e) {
      // ignore — Safari private mode có thể throw, không ảnh hưởng UX
    }
  }

  // Mở sheet sau khi tab đã render xong (delay nhẹ cho transition mượt)
  if (pendingOpenAdd) {
    setTimeout(() => openExpenseModal(), 80);
  }
}

/* ==================================================================
   Service Worker
   ================================================================== */
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }
}

/* ==================================================================
   Init
   ================================================================== */
function init() {
  // Nạp state + theme trước khi render
  loadState();
  applyTheme();

  // Bind toàn bộ sự kiện (chỉ chạy 1 lần)
  bindTabs();
  bindSheets();
  bindAppBar();
  bindExpenseTabEvents();
  bindExpenseFormEvents();
  bindCategoryTabEvents();
  bindCategoryFormEvents();
  bindReportTabEvents();
  bindSettingsTabEvents();
  bindConfirmOK();
  bindStateChanged();
  setupScrollBehavior();

  // Render tab đầu tiên (mặc định dashboard)
  renderTab('dashboard');

  // Xử lý query param — có thể override tab hoặc mở sheet
  handleQueryParams();

  console.log(
    `%cQuản Lý Chi Tiêu v6.1 — ${PLATFORM.toUpperCase()} Module`,
    'color:#4f46e5;font-weight:bold;font-size:14px;'
  );

  registerSW();
}

// type="module" luôn defer → DOM đã sẵn sàng. Check vẫn an toàn nếu sau này
// ai đó chuyển script lên <head>.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
