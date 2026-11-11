/* js/main.js — V1.6
   Entry point: bootstrap app, bind global events, điều phối render,
   đăng ký service worker, khởi tạo Sync Engine (E2EE). */

import {
  state, saveState, toast,
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
   Platform attribute
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
let syncModule = null;

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

function bindAppBar() {
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('fab').addEventListener('click', () => openExpenseModal());
}

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

function bindStateChanged() {
  document.addEventListener('state:changed', () => {
    renderTab(currentTab);
  });
}

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

  // Xoá URL rác nếu có tab/action
  if (handled) {
    try {
      const cleanUrl = window.location.pathname + window.location.hash;
      history.replaceState({}, '', cleanUrl);
    } catch (e) {}
  }

  if (pendingOpenAdd) setTimeout(() => openExpenseModal(), 80);
}

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
   SYNC ENGINE (Dynamic Import)
   ================================================================== */
async function setupSync() {
  try {
    syncModule = await import('./sync.js');
    
    // Gắn State vào Sync Engine để lấy dữ liệu và cập nhật ngược lại
    syncModule.bindState(
      () => state, 
      (newState) => { 
        state.expenses = newState.expenses || [];
        state.categories = newState.categories || [];
        state.settings = newState.settings || {};
        saveState(); 
        document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'sync' } }));
      }
    );

    // Khởi tạo Sync Engine
    syncModule.initSync();
    
  } catch (err) {
    console.warn('[Sync] Lỗi tải module sync (App vẫn chạy bình thường):', err);
  }
}

/* ==================================================================
   Init
   ================================================================== */
function init() {
  loadState();
  applyTheme();

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

  renderTab('dashboard');
  
  setupSync().then(() => {
    handleQueryParams();
  });

  registerSW();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}