import {
  state,
  DEFAULT_CATEGORIES,
  fmtDate,
  todayIso,
  getCategory,
  getPayment,
  toast,
  hapticTap,
  saveState
} from './core.js';

import { logout, markLocalChange, saveConfig } from './sync.js';

export function renderSettings() {
  updateSyncUI();
}

function updateSyncUI() {
  const tokenInput = document.getElementById('syncToken');
  const pinInput = document.getElementById('syncPin');
  const progressFill = document.getElementById('syncProgressFill');

  if (!tokenInput || !pinInput || !progressFill) return;

  const savedPat = localStorage.getItem('sync_gh_pat');
  const savedPin = localStorage.getItem('sync_pin');
  const savedGistId = localStorage.getItem('sync_gh_gist_id');

  if (savedPat) tokenInput.value = savedPat;
  if (savedPin) pinInput.value = savedPin;

  const connected = !!(savedPat && savedPin && savedGistId);
  progressFill.classList.toggle('connected', connected);
}

function setupCollapse(toggleId, bodyId) {
  const toggle = document.getElementById(toggleId);
  const body = document.getElementById(bodyId);
  if (!toggle || !body) return;
  toggle.addEventListener('click', () => {
    hapticTap();
    const isOpen = body.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

function exportJson() {
  try {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-backup-${todayIso()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Đã xuất JSON');
  } catch (err) {
    console.error('[Export JSON]', err);
    toast('Không xuất được JSON', 'error');
  }
}

function exportCsv() {
  if (!state.expenses.length) {
    toast('Chưa có dữ liệu', 'error');
    return;
  }

  try {
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
      const s = String(v == null ? '' : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };

    const csv = '\ufeff' + [headers, ...rows].map(r => r.map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${todayIso()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Đã xuất CSV');
  } catch (err) {
    console.error('[Export CSV]', err);
    toast('Không xuất được CSV', 'error');
  }
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || !Array.isArray(data.expenses)) throw new Error('Invalid structure');

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
      console.error('[Import JSON]', err);
      toast('File không hợp lệ', 'error');
    }
  };
  reader.readAsText(file);
}

export function bindSettingsTabEvents() {
  setupCollapse('syncToggle', 'syncBody');
  setupCollapse('backupToggle', 'backupBody');

  const saveSyncBtn = document.getElementById('saveSyncConfigBtn');
  if (saveSyncBtn) {
    saveSyncBtn.addEventListener('click', () => {
      hapticTap();
      const token = document.getElementById('syncToken').value.trim();
      const pin = document.getElementById('syncPin').value.trim();

      if (!token || !pin) {
        toast('Vui lòng nhập đủ Token và Mã PIN', 'error');
        return;
      }
      if (pin.length < 4) {
        toast('Mã PIN phải có ít nhất 4 ký tự', 'error');
        return;
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
        const tokenInput = document.getElementById('syncToken');
        const pinInput = document.getElementById('syncPin');
        if (tokenInput) tokenInput.value = '';
        if (pinInput) pinInput.value = '';
        updateSyncUI();
      }
    });
  }

  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      hapticTap();
      exportJson();
    });
  }

  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      hapticTap();
      exportCsv();
    });
  }

  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => {
      hapticTap();
      importFile.click();
    });
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) importJson(file);
      e.target.value = '';
    });
  }

  document.addEventListener('sync:user', updateSyncUI);
  document.addEventListener('sync:logout', updateSyncUI);
}
