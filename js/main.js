import {
  state, saveState, toast,
  PLATFORM,
  loadState,
  applyTheme, toggleTheme,
  fillIcons,
  closeSheet, bindConfirmOK
} from './core.js';

import { renderDashboard, bindBalanceEvents } from './dashboard.js';

import {
  renderExpensesTab, openExpenseModal, closeExpenseModal,
  bindExpenseTabEvents, bindExpenseFormEvents
} from './expenses.js';

import { renderReportsTab, bindReportTabEvents } from './reports.js';

import { renderSettings, bindSettingsTabEvents } from './settings.js';

document.documentElement.setAttribute('data-platform', PLATFORM);

const TAB_TITLES = {
  dashboard: 'Tổng quan',
  expenses: 'Giao dịch',
  reports: 'Báo cáo',
  settings: 'Cài đặt'
};

const TAB_SUBTITLES = {
  dashboard: 'Quản lý chi tiêu',
  expenses: 'Danh sách giao dịch',
  reports: 'Phân tích chi tiết',
  settings: 'Tuỳ chỉnh'
};

let currentTab = 'dashboard';
let syncModule = null;

function renderTab(tabId) {
  try {
    if (tabId === 'dashboard') renderDashboard();
    else if (tabId === 'expenses') renderExpensesTab();
    else if (tabId === 'reports') renderReportsTab();
    else if (tabId === 'settings') renderSettings();
    fillIcons();
  } catch (err) {
    console.error('Lỗi render tab:', err);
  }
}

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
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const fab = document.getElementById('fab');
  if (fab) fab.addEventListener('click', () => openExpenseModal());

  const quickSyncBtn = document.getElementById('quickSyncBtn');
  if (quickSyncBtn) {
    quickSyncBtn.addEventListener('click', async () => {
      try {
        const mod = await import('./sync.js');
        if (mod && typeof mod.syncNow === 'function') {
          mod.syncNow();
        } else {
          toast('Module đồng bộ chưa sẵn sàng', 'error');
        }
      } catch (err) {
        console.error('Lỗi đồng bộ nhanh:', err);
        toast('Không thể kết nối module đồng bộ', 'error');
      }
    });
  }
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

  if (handled) {
    try {
      const cleanUrl = window.location.pathname + window.location.hash;
      history.replaceState({}, '', cleanUrl);
    } catch (e) {}
  }

  if (pendingOpenAdd) setTimeout(() => openExpenseModal(), 80);
}

function setupKeyboardHandling() {
  const vv = window.visualViewport;
  if (vv) {
    let lastHeight = vv.height;
    vv.addEventListener('resize', () => {
      const diff = lastHeight - vv.height;
      lastHeight = vv.height;
      if (diff > 100) {
        const active = document.activeElement;
        if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) {
          setTimeout(() => {
            try { active.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (err) {}
          }, 100);
        }
      }
    });
  }

  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) {
      setTimeout(() => {
        try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (err) {}
      }, 350);
    }
  });
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Đã có bản cập nhật. Đang tải lại...', 'info');
          }
        });
      });

      setInterval(() => {
        reg.update().catch(() => {});
      }, 60 * 60 * 1000);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          reg.update().catch(() => {});
        }
      });
    }).catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

async function setupSync() {
  try {
    syncModule = await import('./sync.js');

    syncModule.bindState(
      () => state,
      (newState) => {
        state.expenses = newState.expenses || [];
        state.categories = newState.categories || [];
        state.settings = newState.settings || {};

        if (newState._lastUpdated) {
          state._lastUpdated = newState._lastUpdated;
        }

        saveState();
        document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'sync' } }));
      }
    );

    syncModule.initSync();
  } catch (err) {
    console.warn('[Sync] Lỗi tải module sync:', err);
  }
}

function init() {
  loadState();
  applyTheme();

  try { bindTabs(); } catch (e) { console.error('bindTabs', e); }
  try { bindSheets(); } catch (e) { console.error('bindSheets', e); }
  try { bindAppBar(); } catch (e) { console.error('bindAppBar', e); }
  try { bindExpenseTabEvents(); } catch (e) { console.error('bindExpenseTabEvents', e); }
  try { bindExpenseFormEvents(); } catch (e) { console.error('bindExpenseFormEvents', e); }
  try { bindReportTabEvents(); } catch (e) { console.error('bindReportTabEvents', e); }
  try { bindSettingsTabEvents(); } catch (e) { console.error('bindSettingsTabEvents', e); }
  try { bindBalanceEvents(); } catch (e) { console.error('bindBalanceEvents', e); }
  try { bindConfirmOK(); } catch (e) { console.error('bindConfirmOK', e); }
  try { bindStateChanged(); } catch (e) { console.error('bindStateChanged', e); }
  try { setupScrollBehavior(); } catch (e) { console.error('setupScrollBehavior', e); }
  try { setupKeyboardHandling(); } catch (e) { console.error('setupKeyboardHandling', e); }

  renderTab('dashboard');

  setupSync().then(() => {
    try { handleQueryParams(); } catch (e) {}
  });

  registerSW();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
