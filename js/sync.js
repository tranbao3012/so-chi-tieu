/* js/sync.js — V4.3 (Tự động đồng bộ - Auto Sync)
   Tự động kích hoạt đồng bộ sau 2 giây kể từ khi có thay đổi dữ liệu. */

import { toast } from './core.js';
import { encryptData, decryptData } from './crypto.js';

const GIST_FILENAME = 'so-chi-tieu-data.enc';
const GIST_DESC = 'So Chi Tieu Encrypted Backup';

let _getState = null;
let _setState = null;
let isSyncing = false; 
let autoSyncTimer = null; // [MỚI] Bộ đếm thời gian cho Auto Sync

export function bindState(getStateFn, setStateFn) {
  _getState = getStateFn;
  _setState = setStateFn;
}

export function initSync() {
  console.log('[Sync] Custom Sync Engine V4.3 (Auto Sync) đã sẵn sàng.');
}

function getConfig() {
  return {
    pat: localStorage.getItem('sync_gh_pat') || '',
    gistId: localStorage.getItem('sync_gh_gist_id') || '',
    pin: localStorage.getItem('sync_pin') || ''
  };
}

export function saveConfig(pat, pin) {
  localStorage.setItem('sync_gh_pat', pat.trim());
  localStorage.setItem('sync_pin', pin.trim());
}

export function logout() {
  localStorage.removeItem('sync_gh_pat');
  localStorage.removeItem('sync_gh_gist_id');
  localStorage.removeItem('sync_pin');
  document.dispatchEvent(new CustomEvent('sync:logout'));
  toast('Đã ngắt kết nối đồng bộ', 'info');
}

/* ==================================================================
   HÀM ĐÁNH DẤU THAY ĐỔI VÀ KÍCH HOẠT AUTO SYNC
   ================================================================== */
export function markLocalChange() {
  if (!_getState) return;
  const state = _getState();
  state._lastUpdated = Date.now();
  localStorage.setItem('expense_tracker_v1', JSON.stringify(state));

  // Kích hoạt Auto Sync nếu đã cấu hình Token và PIN
  const { pat, pin } = getConfig();
  if (pat && pin) {
    if (autoSyncTimer) clearTimeout(autoSyncTimer);
    autoSyncTimer = setTimeout(() => {
      console.log('[Sync] Tự động đồng bộ sau khi có thay đổi...');
      syncNow(true); // Gọi sync với cờ isAuto = true
    }, 2000); // Đợi 2 giây sau thao tác cuối cùng
  }
}

async function githubApi(endpoint, method = 'GET', body = null) {
  const { pat } = getConfig();
  if (!pat) throw new Error('Chưa cấu hình GitHub Token');

  const headers = {
    'Authorization': `Bearer ${pat}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  const url = `https://api.github.com${endpoint}${method === 'GET' ? (endpoint.includes('?') ? '&' : '?') + 't=' + Date.now() : ''}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    cache: 'no-store'
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Lỗi API: ${res.status}`);
  }
  return res.json();
}

function apply(bundle) {
  if (!bundle) return;
  _setState({
    expenses: bundle.expenses || [],
    categories: bundle.categories || [],
    settings: bundle.settings || {},
    _lastUpdated: bundle._lastUpdated || 0 
  });
}

export async function syncNow(isAuto = false) {
  if (isSyncing) return; // Nếu đang đồng bộ (do bấm tay hoặc auto trước đó) thì bỏ qua

  let { pat, gistId, pin } = getConfig();

  if (!pat) {
    if (!isAuto) toast('Vui lòng nhập GitHub Token trong Cài đặt', 'error');
    return;
  }
  if (!pin) {
    if (!isAuto) toast('Vui lòng nhập Mã PIN trong Cài đặt', 'error');
    return;
  }
  if (!_getState || !_setState) return;

  isSyncing = true; 
  const state = _getState();
  const localTimestamp = state._lastUpdated || 0;

  try {
    // Chỉ hiển thị thông báo "Đang kiểm tra" nếu là bấm thủ công
    if (!isAuto) toast('Đang kiểm tra dữ liệu...', 'info');

    if (!gistId) {
      if (!isAuto) toast('Đang tìm Gist cũ trên tài khoản...', 'info');
      const gists = await githubApi('/gists?per_page=100');
      const existingGist = gists.find(g => g.description === GIST_DESC);
      
      if (existingGist) {
        gistId = existingGist.id;
        localStorage.setItem('sync_gh_gist_id', gistId);
        if (!isAuto) toast('Đã tìm thấy Gist cũ!', 'success');
      } else {
        if (!isAuto) toast('Không tìm thấy Gist cũ. Đang tạo Gist mới...', 'info');
        state._lastUpdated = Date.now();
        localStorage.setItem('expense_tracker_v1', JSON.stringify(state)); 
        const encrypted = await encryptData(state, pin);

        const newGist = await githubApi('/gists', 'POST', {
          description: GIST_DESC,
          public: false,
          files: { [GIST_FILENAME]: { content: encrypted } }
        });

        localStorage.setItem('sync_gh_gist_id', newGist.id);
        document.dispatchEvent(new CustomEvent('sync:user', { detail: { user: 'GitHub User' } }));
        toast('Đã tạo Gist và đồng bộ thành công!', 'success');
        isSyncing = false;
        return;
      }
    }

    const gist = await githubApi(`/gists/${gistId}`);
    const file = gist.files[GIST_FILENAME];
    
    if (!file) throw new Error('Không tìm thấy file dữ liệu trong Gist');

    const remoteEncryptedStr = file.content;
    let remoteState = null;

    try {
      remoteState = await decryptData(remoteEncryptedStr, pin);
    } catch (e) {
      isSyncing = false; 
      if (!isAuto) toast('Sai Mã PIN hoặc dữ liệu Gist bị hỏng!', 'error');
      return;
    }

    const remoteTimestamp = remoteState._lastUpdated || 0;

    if (localTimestamp > remoteTimestamp) {
      // Đẩy lên
      if (!isAuto) toast('Máy bạn có dữ liệu mới hơn. Đang đẩy lên Gist...', 'info');
      state._lastUpdated = Date.now();
      localStorage.setItem('expense_tracker_v1', JSON.stringify(state)); 
      
      const encrypted = await encryptData(state, pin);
      await githubApi(`/gists/${gistId}`, 'PATCH', {
        files: { [GIST_FILENAME]: { content: encrypted } }
      });
      toast('Đã đẩy dữ liệu mới lên Gist thành công!', 'success');

    } else if (remoteTimestamp > localTimestamp) {
      // Kéo về
      if (!isAuto) toast('Gist có dữ liệu mới hơn. Đang tải về máy...', 'info');
      _setState(remoteState);
      toast('Đã tải dữ liệu mới từ Gist thành công!', 'success');
    } else {
      // Nếu tự động mà không có gì mới, im lặng không báo gì cả
      if (!isAuto) toast('Dữ liệu 2 bên đã đồng bộ (Không có gì mới)', 'info');
    }

    document.dispatchEvent(new CustomEvent('sync:user', { detail: { user: 'GitHub User' } }));

  } catch (err) {
    console.error('[Sync Error]', err);
    
    // Nếu là Auto sync mà bị lỗi mạng, không hiện Toast để tránh làm phiền
    const isNetworkError = err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
    if (!isAuto || !isNetworkError) {
      toast(err.message || 'Lỗi đồng bộ', 'error');
    }
  } finally {
    isSyncing = false; 
  }
}

export function login() { toast('Chức năng này đã thay đổi', 'info'); }
export function getSync() { return true; }
