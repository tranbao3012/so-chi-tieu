/* js/settings.js — V1.1
   Render tab Cài đặt: toggle AI, form tài chính, export/import JSON/CSV, reset.
   V1.1: Tích hợp đồng bộ Gist (GitHub) và markLocalChange. */

import {
  state,
  DEFAULT_CATEGORIES,
  fmtDate, todayIso,
  getCategory, getPayment,
  toast, showConfirm,
  hapticTap,
  saveState, applyTheme
} from './core.js';

import { login, syncNow, markLocalChange } from './sync.js';

/* ==================================================================
   RENDER — sync UI với state hiện tại
   ================================================================== */
export function renderSettings() {
  const setBudget = document.getElementById('setBudget');
  const setIncome = document.getElementById('setIncome');
  const setCurrency = document.getElementById('setCurrency');
  if (!setBudget || !setIncome || !setCurrency) return;

  setBudget.value = state.settings.monthlyBudget || 0;
  setIncome.value = state.settings.monthlyIncome || 0;
  setCurrency.value = state.settings.currency || 'đ';

  document.getElementById('toggleAI').classList.toggle('on', state.settings.aiEnabled);
  document.getElementById('toggleAnomaly').classList.toggle('on', state.settings.anomalyEnabled);
  document.getElementById('toggleSuggest').classList.toggle('on', state.settings.suggestEnabled);
  document.getElementById('toggleAccounting').classList.toggle('on', state.settings.accountingEnabled);
}

/* ==================================================================
   EXPORT JSON / CSV
   ================================================================== */
function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expense-backup-${todayIso()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Đã xuất JSON');
}

function exportCsv() {
  if (!state.expenses.length) { toast('Chưa có dữ liệu', 'error'); return; }

  const headers = ['Ngày', 'Danh mục', 'Số tiền', 'Phương thức', 'Ghi chú'];
  const rows = state.expenses
    .slice()
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .map(e => [
      fmtDate(e.date),
      getCategory(e.categoryId).name,
      e.amount,
      getPayment(e.paymentMethod).name,
      e.note || ''
    ]);

  const esc = v => {
    const s = String(v || '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  const csv = '\ufeff' + [headers, ...rows].map(r => r.map(esc).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${todayIso()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Đã xuất CSV');
}

/* ==================================================================
   IMPORT JSON
   ================================================================== */
function importJson(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || !Array.isArray(data.expenses)) throw new Error('Invalid');

      showConfirm(
        'Nhập dữ liệu',
        `File có ${data.expenses.length} giao dịch. Ghi đè dữ liệu hiện tại?`,
        () => {
          state.expenses = data.expenses;
          state.categories = Array.isArray(data.categories) && data.categories.length
            ? data.categories
            : JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
          state.settings = Object.assign({}, state.settings, data.settings || {});
          saveState();
          markLocalChange(); // Báo cho sync engine biết có dữ liệu mới
          applyTheme();
          
          document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'import-full' } }));
          toast('Đã nhập dữ liệu');
        }
      );
    } catch (err) {
      toast('File không hợp lệ', 'error');
    }
  };
  reader.readAsText(file);
}

/* ==================================================================
   BIND EVENTS (called once by main.js)
   ================================================================== */
export function bindSettingsTabEvents() {
  /* -------- Toggles -------- */
  document.querySelectorAll('.toggle[data-setting]').forEach(t => {
    t.addEventListener('click', () => {
      hapticTap();
      const key = t.dataset.setting;
      state.settings[key] = !state.settings[key];
      t.classList.toggle('on', state.settings[key]);
      saveState();
      markLocalChange(); // Trigger sync
      
      document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'toggle', key } }));
    });
  });

  /* -------- Budget -------- */
  document.getElementById('setBudget').addEventListener('change', (e) => {
    state.settings.monthlyBudget = Math.max(0, Number(e.target.value) || 0);
    saveState();
    markLocalChange(); // Trigger sync
    document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'budget' } }));
  });

  /* -------- Income -------- */
  document.getElementById('setIncome').addEventListener('change', (e) => {
    state.settings.monthlyIncome = Math.max(0, Number(e.target.value) || 0);
    saveState();
    markLocalChange(); // Trigger sync
    document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'income' } }));
  });

  /* -------- Currency -------- */
  document.getElementById('setCurrency').addEventListener('change', (e) => {
    state.settings.currency = e.target.value.trim() || 'đ';
    saveState();
    markLocalChange(); // Trigger sync
    document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'currency' } }));
  });

  /* -------- Export / Import / Reset -------- */
  document.getElementById('exportBtn').addEventListener('click', exportJson);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);

  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importJson(file);
    e.target.value = '';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    showConfirm(
      'Xoá toàn bộ dữ liệu',
      'Tất cả giao dịch và danh mục sẽ bị xoá vĩnh viễn. Không thể hoàn tác.',
      () => {
        state.expenses = [];
        state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        state.settings.monthlyBudget = 0;
        state.settings.monthlyIncome = 0;
        saveState();
        markLocalChange(); // Trigger sync
        document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'reset-full' } }));
        toast('Đã xoá toàn bộ dữ liệu');
      }
    );
  });

  /* -------- Sync Gist UI -------- */
  document.getElementById('syncLoginBtn').addEventListener('click', () => {
    hapticTap();
    try {
      login(); // Chuyển hướng sang trang đăng nhập GitHub
    } catch (err) {
      toast('Lỗi khởi tạo Sync', 'error');
    }
  });

  document.getElementById('syncNowBtn').addEventListener('click', () => {
    hapticTap();
    syncNow();
  });

  // Lắng nghe sự kiện đăng nhập thành công từ main.js
  document.addEventListener('sync:user', (e) => {
    const loginRow = document.getElementById('syncLoginRow');
    const actionRow = document.getElementById('syncActionRow');
    const statusText = document.getElementById('syncStatus');

    if (e.detail && e.detail.user) {
      if (loginRow) loginRow.style.display = 'none';
      if (actionRow) actionRow.style.display = 'flex';
      if (statusText) statusText.textContent = `Đã kết nối: ${e.detail.user.login || 'GitHub'}`;
    }
  });
}
