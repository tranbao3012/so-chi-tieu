/* js/main.js — V1.2
   Entry point: bootstrap app, bind global events, điều phối render,
   đăng ký service worker.
   V1.2: Tích hợp module sync.js (GitHub Gist). */

import {
  state, saveState, toast,
  PLATFORM,
  loadState,
  applyTheme, toggleTheme,
  fillIcons,
  closeSheet, bindConfirmOK
} from './core.js';

import { bindState, initSync } from './sync.js';

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
  document.querySelectorAll('[data-close]').forEach(b => {
    b.addEventListener('click', () => closeSheetById(b.dataset.close));
  });

  document.querySelectorAll('.sheet-overlay').forEach(o => {
    o.addEventListener('click', (e) => {
      if (e.target === o) closeSheetById(o.id);
    });
  });

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
  document.addEventListener('state:changed', (e) => {
    // Nếu thay đổi đến từ sync, có thể bỏ qua việc render lại nếu đang ở form
    // (nhưng hiện tại cứ render bình thường)
    renderTab(currentTab);
  });
}

/* ==================================================================
   Query param từ PWA shortcuts (manifest.json)
   ================================================================== */
function handleQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  const actionParam = params.get('action');

  let handled = false;
  let pendingOpenAdd = false;

  if (tabParam && TAB_TITLES[tabParam] && tabParam !== currentTab) {
    switchTab(tabParam);
    handled = true;
  }

  if (actionParam === 'add') {
    pendingOpenAdd = true;
    handled = true;
  }

  if (handled) {
    try {
      const cleanUrl = window.location.pathname + window.location.hash;
      history.replaceState({}, '', cleanUrl);
    } catch (e) {}
  }

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
   SYNC ENGINE
   ================================================================== */
function setupSync() {
  // Kết nối state của app với sync engine
  bindState(
    () => state, // Hàm getState
    (newState) => { // Hàm setState
      state.expenses = newState.expenses;
      state.categories = newState.categories;
      state.settings = newState.settings;
      saveState(); // Lưu vào localStorage
      
      // Phát sự kiện để vẽ lại UI
      document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'sync' } }));
    }
  );

  // Khởi tạo sync
  initSync({
    onStatus: (status) => {
      console.log('[Sync Status]:', status);
      if (status === 'syncing') toast('Đang đồng bộ...', 'info');
      if (status === 'error') toast('Lỗi đồng bộ dữ liệu', 'error');
    },
    onToast: (msg) => toast(msg, 'success'),
    onUser: (user) => {
      console.log('[Sync User]:', user);
      // Bạn có thể cập nhật UI Settings tại đây nếu muốn
    },
    onConflict: (conflict) => {
      console.warn('[Sync Conflict]:', conflict);
      toast('Đã giải quyết xung đột dữ liệu', 'warning');
    }
  });
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

  // Khởi tạo Sync Engine
  setupSync();

  // Render tab đầu tiên (mặc định dashboard)
  renderTab('dashboard');

  // Xử lý query param — có thể override tab hoặc mở sheet
  handleQueryParams();

  console.log(
    `%cQuản Lý Chi Tiêu v6.2 — ${PLATFORM.toUpperCase()} Module`,
    'color:#4f46e5;font-weight:bold;font-size:14px;'
  );

  registerSW();
}

// type="module" luôn defer → DOM đã sẵn sàng.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
