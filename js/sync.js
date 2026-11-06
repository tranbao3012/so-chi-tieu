/* js/sync.js — V2.0 (Bản chuẩn hoàn chỉnh) */

import { createGistSync } from 'https://esm.sh/@repus/gist-sync@0.2.2';
import { toast } from './core.js';

const CONFIG = {
  clientId: 'Ov23li1iJnTOm48YtHg4U', // Mã OAuth App của bạn
  brokerPath: 'https://gist-sync-broker.baobao-tran.workers.dev/token',
  gistFilename: 'so-chi-tieu-data.json', // Tên file chuẩn trên Gist
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

function serialize() {
  const state = _getState();
  return { expenses: state.expenses, categories: state.categories, settings: state.settings };
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
      config: CONFIG, // Toàn bộ cấu hình nằm trong đây
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

  // Đảm bảo URL gửi lên GitHub chính xác 100%
  let path = window.location.pathname.replace('index.html', '');
  if (!path.endsWith('/')) path += '/';
  const cleanUrl = window.location.origin + path;

  // Ghi đè URL sạch lên thanh địa chỉ trước khi gọi OAuth
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
  return sync.syncNow();
}

export function markLocalChange() {
  if (sync) sync.markLocalChange();
}

export function getSync() {
  return sync;
}
