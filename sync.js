/* js/sync.js — V3.0 (Ép buộc đẩy dữ liệu) */

import { createGistSync } from 'https://esm.sh/@repus/gist-sync@0.2.2';
import { toast } from './core.js';

const CONFIG = {
  clientId: 'Ov23ligb7N6U10aeb3AN', // Mã OAuth App mới của bạn
  brokerPath: 'https://gist-sync-broker.baobao-tran.workers.dev/token',
  gistFilename: 'so-chi-tieu-data.json', 
  appMarker: 'quan-ly-chi-tieu'
};

const schema = {
  collections: {
    expenses: { kind: 'idKeyed', key: 'id' },
    categories: { kind: 'idKeyed', key: 'id' },
    settings: { kind: 'scalarMap' }
  }
};

let _getState = null;
let _setState = null;
let sync = null;

export function bindState(getStateFn, setStateFn) {
  _getState = getStateFn;
  _setState = setStateFn;
}

// HÀM SERIALIZE ĐÃ ĐƯỢC FIX: Thêm timestamp để ép buộc tạo sự khác biệt
function serialize() {
  const state = _getState();
  const data = { 
    expenses: state.expenses || [], 
    categories: state.categories || [], 
    settings: { 
      ...state.settings, 
      // Dấu thời gian này đảm bảo dữ liệu luôn thay đổi, phá vỡ trạng thái "Already up to date"
      _lastSync: Date.now() 
    } 
  };
  // Deep clone để đảm bảo thư viện nhận diện là object mới
  return JSON.parse(JSON.stringify(data));
}

function apply(bundle) {
  if (!bundle) return;
  _setState({
    expenses: bundle.expenses || [],
    categories: bundle.categories || [],
    settings: bundle.settings || {}
  });
}

export function initSync(ports = {}) {
  try {
    sync = createGistSync({
      config: CONFIG,
      schema,
      ports: {
        serialize,
        apply,
        onStatus: (status) => {
          if (status === 'syncing') toast('Đang đồng bộ...', 'info');
          if (status === 'error') toast('Lỗi đồng bộ dữ liệu', 'error');
          if (ports.onStatus) ports.onStatus(status);
        },
        onToast: (msg) => { toast(msg, 'success'); if (ports.onToast) ports.onToast(msg); },
        onUser: (user) => { 
          localStorage.setItem('app_sync_logged_in', 'true');
          if (ports.onUser) ports.onUser(user); 
        },
        onConflict: (conflict) => { toast('Đã giải quyết xung đột', 'warning'); if (ports.onConflict) ports.onConflict(conflict); }
      }
    });

    sync.handleOAuthCallback();
    return sync;
  } catch (err) {
    console.error('[Sync] Lỗi khởi tạo thư viện:', err);
    return null;
  }
}

export function login() {
  if (!sync) return alert('Tính năng đồng bộ chưa sẵn sàng.');

  // Dọn dẹp URL chuẩn xác cho mọi thiết bị
  let path = window.location.pathname.replace('index.html', '');
  if (!path.endsWith('/')) path += '/';
  const cleanUrl = window.location.origin + path;

  window.history.replaceState({}, document.title, cleanUrl);

  return sync.login();
}

export function logout() {
  if (sync && sync.logout) sync.logout();
  localStorage.removeItem('app_sync_logged_in');
  document.dispatchEvent(new CustomEvent('sync:logout'));
  toast('Đã ngắt kết nối GitHub', 'info');
}

export function syncNow() {
  if (!sync) return;
  
  console.log("[Sync] Đang ép buộc đồng bộ...");
  
  // Ép thư viện đánh dấu có thay đổi cục bộ trước khi gọi syncNow
  sync.markLocalChange(); 
  
  return sync.syncNow();
}

export function markLocalChange() {
  if (sync) sync.markLocalChange();
}

export function getSync() {
  return sync;
}
