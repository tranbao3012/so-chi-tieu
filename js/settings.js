/* js/settings.js — V2.4 (Dark Theme Compatible)
   Render tab Cài đặt. */

import {
  state,
  DEFAULT_CATEGORIES,
  fmtDate, todayIso,
  getCategory, getPayment,
  toast,
  hapticTap,
  saveState
} from './core.js';

import { logout, markLocalChange, saveConfig } from './sync.js';

/* ==================================================================
   RENDER — sync UI với state hiện tại
   ================================================================== */
export function renderSettings() {
  const setBudget = document.getElementById('setBudget');
  const setIncome = document.getElementById('setIncome');
  const setCurrency = document.getElementById('setCurrency');
  
  if (!setBudget || !setIncome) return;

  setBudget.value = state.settings.monthlyBudget || 0;
  setIncome.value = state.settings.monthlyIncome || 0;
  
  if (setCurrency) {
    setCurrency.value = state.settings.currency || 'đ';
  }

  // Cập nhật trạng thái form Sync
  updateSyncUI();
}

function updateSyncUI() {
  const tokenInput = document.getElementById('syncToken');
  const pinInput = document.getElementById('syncPin');
  const statusText = document.getElementById('syncStatus');
  
  if (!tokenInput || !pinInput || !statusText) return;

  const savedPat = localStorage.getItem('sync_gh_pat');
  const savedGistId = localStorage.getItem('sync_gh_gist_id');
  const savedPin = localStorage.getItem('sync_pin');

  // Điền sẵn token và pin nếu đã lưu
  if (savedPat) tokenInput.value = savedPat;
  if (savedPin) pinInput.value = savedPin;

  if (savedPat && savedPin) {
    statusText.textContent = savedGistId ? '✅ Đã kết nối (Đã tạo Gist)' : '✅ Đã có Token (Chưa tạo Gist)';
    statusText.style.color = 'var(--primary)';
  } else {
    statusText.textContent = 'Chưa kết nối. Vui lòng nhập Token và Mã PIN.';
    statusText.style.color = 'var(--text-soft)';
  }
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

      if (window.confirm(`File có ${data.expenses.length} giao dịch. Ghi đè dữ liệu hiện tại?`)) {
        state.expenses = data.expenses;
        state.categories = Array.isArray(data.categories) && data.categories.length
          ? data.categories
          : JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        state.settings = Object.assign({}, state.settings, data.settings || {});
        saveState();
        markLocalChange(); 
        
        document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'import-full' } }));
        toast('Đã nhập dữ liệu');
      }
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
  /* -------- Budget / Income / Currency -------- */
  document.getElementById('setBudget').addEventListener('change', (e) => {
    state.settings.monthlyBudget = Math.max(0, Number(e.target.value) || 0);
    saveState();
    markLocalChange();
    document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'budget' } }));
  });

  document.getElementById('setIncome').addEventListener('change', (e) => {
    state.settings.monthlyIncome = Math.max(0, Number(e.target.value) || 0);
    saveState();
    markLocalChange();
    document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'income' } }));
  });

  const setCurrency = document.getElementById('setCurrency');
  if (setCurrency) {
    setCurrency.addEventListener('change', (e) => {
      state.settings.currency = e.target.value.trim() || 'đ';
      saveState();
      markLocalChange();
      document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'currency' } }));
    });
  }

  /* -------- Export / Import -------- */
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

  /* -------- Sync E2EE -------- */
  const saveSyncBtn = document.getElementById('saveSyncConfigBtn');
  if (saveSyncBtn) {
    saveSyncBtn.addEventListener('click', () => {
      hapticTap();
      const token = document.getElementById('syncToken').value.trim();
      const pin = document.getElementById('syncPin').value.trim();
      
      if (!token || !pin) {
        return toast('Vui lòng nhập đủ Token và Mã PIN', 'error');
      }
      if (pin.length < 4) {
        return toast('Mã PIN phải có ít nhất 4 ký tự', 'error');
      }

      saveConfig(token, pin);
      updateSyncUI();
      toast('Đã lưu cấu hình đồng bộ');
    });
  }

  const logoutBtn = document.getElementById('syncLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      hapticTap();
      if (window.confirm('Dữ liệu trên máy vẫn giữ nguyên, nhưng sẽ không đồng bộ nữa. Tiếp tục?')) {
        logout();
        document.getElementById('syncToken').value = '';
        document.getElementById('syncPin').value = '';
        updateSyncUI();
      }
    });
  }

  document.addEventListener('sync:user', updateSyncUI);
  document.addEventListener('sync:logout', updateSyncUI);
}
