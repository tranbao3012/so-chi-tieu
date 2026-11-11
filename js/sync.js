/* js/sync.js — V4.2 (Chống lag, chống cache, khóa click) */

import { toast } from './core.js';
import { encryptData, decryptData } from './crypto.js';

const GIST_FILENAME = 'so-chi-tieu-data.enc';
const GIST_DESC = 'So Chi Tieu Encrypted Backup';

let _getState = null;
let _setState = null;
let isSyncing = false; // [FIX] Khóa chống bấm nhiều lần

export function bindState(getStateFn, setStateFn) {
  _getState = getStateFn;
  _setState = setStateFn;
}

export function initSync() {
  console.log('[Sync] Custom Sync Engine V4.2 đã sẵn sàng.');
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

export function markLocalChange() {
  if (!_getState) return;
  const state = _getState();
  state._lastUpdated = Date.now();
  localStorage.setItem('expense_tracker_v1', JSON.stringify(state));
}

async function githubApi(endpoint, method = 'GET', body = null) {
  const { pat } = getConfig();
  if (!pat) throw new Error('Chưa cấu hình GitHub Token');

  const headers = {
    'Authorization': `Bearer ${pat}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  // [FIX] Thêm timestamp vào URL để đánh bại bộ nhớ đệm của GitHub API
  const url = `https://api.github.com${endpoint}${method === 'GET' ? (endpoint.includes('?') ? '&' : '?') + 't=' + Date.now() : ''}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    cache: 'no-store' // [FIX] Trình duyệt không lưu cache request này
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Lỗi API: ${res.status}`);
  }
  return res.json();
}

function apply(bundle) {
  if (!bundle) return;
  // [FIX] Truyền cả _lastUpdated sang cho main.js
  _setState({
    expenses: bundle.expenses || [],
    categories: bundle.categories || [],
    settings: bundle.settings || {},
    _lastUpdated: bundle._lastUpdated || 0 
  });
}

export async function syncNow() {
  if (isSyncing) return toast('Đang đồng bộ, vui lòng đợi...', 'info'); // [FIX] Khóa

  let { pat, gistId, pin } = getConfig();

  if (!pat) return toast('Vui lòng nhập GitHub Token trong Cài đặt', 'error');
  if (!pin) return toast('Vui lòng nhập Mã PIN trong Cài đặt', 'error');
  if (!_getState || !_setState) return;

  isSyncing = true; // Bật khóa
  const state = _getState();
  const localTimestamp = state._lastUpdated || 0;

  try {
    toast('Đang kiểm tra dữ liệu...', 'info');

    if (!gistId) {
      toast('Đang tìm Gist cũ trên tài khoản...', 'info');
      const gists = await githubApi('/gists?per_page=100');
      const existingGist = gists.find(g => g.description === GIST_DESC);
      
      if (existingGist) {
        gistId = existingGist.id;
        localStorage.setItem('sync_gh_gist_id', gistId);
        toast('Đã tìm thấy Gist cũ!', 'success');
      } else {
        toast('Không tìm thấy Gist cũ. Đang tạo Gist mới...', 'info');
        state._lastUpdated = Date.now();
        localStorage.setItem('expense_tracker_v1', JSON.stringify(state)); // Lưu lại
        const encrypted = await encryptData(state, pin);

        const newGist = await githubApi('/gists', 'POST', {
          description: GIST_DESC,
          public: false,
          files: { [GIST_FILENAME]: { content: encrypted } }
        });

        localStorage.setItem('sync_gh_gist_id', newGist.id);
        document.dispatchEvent(new CustomEvent('sync:user', { detail: { user: 'GitHub User' } }));
        toast('Đã tạo Gist và đồng bộ thành công!', 'success');
        isSyncing = false; // Mở khóa
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
      isSyncing = false; // Mở khóa
      return toast('Sai Mã PIN hoặc dữ liệu Gist bị hỏng!', 'error');
    }

    const remoteTimestamp = remoteState._lastUpdated || 0;

    if (localTimestamp > remoteTimestamp) {
      toast('Máy bạn có dữ liệu mới hơn. Đang đẩy lên Gist...', 'info');
      state._lastUpdated = Date.now();
      localStorage.setItem('expense_tracker_v1', JSON.stringify(state)); // [FIX] Lưu lại mốc thời gian mới
      
      const encrypted = await encryptData(state, pin);
      await githubApi(`/gists/${gistId}`, 'PATCH', {
        files: { [GIST_FILENAME]: { content: encrypted } }
      });
      toast('Đã đẩy dữ liệu mới lên Gist thành công!', 'success');

    } else if (remoteTimestamp > localTimestamp) {
      toast('Gist có dữ liệu mới hơn. Đang tải về máy...', 'info');
      _setState(remoteState);
      toast('Đã tải dữ liệu mới từ Gist thành công!', 'success');
    } else {
      toast('Dữ liệu 2 bên đã đồng bộ (Không có gì mới)', 'info');
    }

    document.dispatchEvent(new CustomEvent('sync:user', { detail: { user: 'GitHub User' } }));

  } catch (err) {
    console.error('[Sync Error]', err);
    toast(err.message || 'Lỗi đồng bộ', 'error');
  } finally {
    isSyncing = false; // [FIX] Luôn mở khóa dù thành công hay thất bại
  }
}

export function login() { toast('Chức năng này đã thay đổi', 'info'); }
export function getSync() { return true; }
