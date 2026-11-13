import {
  toast,
  hapticTap
} from './core.js';

import { logout, saveConfig } from './sync.js';

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

export function bindSettingsTabEvents() {
  const syncToggle = document.getElementById('syncToggle');
  const syncBody = document.getElementById('syncBody');
  if (syncToggle && syncBody) {
    syncToggle.addEventListener('click', () => {
      hapticTap();
      const isOpen = syncBody.classList.toggle('open');
      syncToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

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

  document.addEventListener('sync:user', updateSyncUI);
  document.addEventListener('sync:logout', updateSyncUI);
}
