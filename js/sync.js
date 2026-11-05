/* js/sync.js — V1.4
   V1.4: Tự động xoá ?code= khỏi URL SAU KHI handleOAuthCallback chạy xong. */

import { createGistSync } from 'https://esm.sh/@repus/gist-sync@0.2.2';
import { toast } from './core.js';

// ==== CẤU HÌNH ====
const CONFIG = {
  // Điền Client ID OAuth App của bạn vào đây
  clientId: 'Ov23li9f3mWdOuDSxiL0', 
  
  brokerPath: 'https://gist-sync-broker.baobao-tran.workers.dev/token',
  
  filename: 'so-chi-tieu-data.json'
};

// ==== SCHEMA ĐỒNG BỘ ====
const schema = {
  collections: {
    expenses: { kind: 'idKeyed', key: 'id' },
    categories: { kind: 'idKeyed', key: 'id' },
    settings: { kind: 'scalarMap' }
  }
};

// ==== STATE BINDING ====
let _getState = null;
let _setState = null;
let sync = null;

export function bindState(getStateFn, setStateFn) {
  _getState = getStateFn;
  _setState = setStateFn;
}

function serialize() {
  const state = _getState();
  return {
    expenses: state.expenses,
    categories: state.categories,
    settings: state.settings
  };
}

function apply(bundle) {
  if (!bundle) return;
  _setState({
    expenses: bundle.expenses || [],
    categories: bundle.categories || [],
    settings: bundle.settings || {}
  });
}

// ==== KHỞI TẠO ====
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
        onToast: (msg) => {
          toast(msg, 'success');
          if (ports.onToast) ports.onToast(msg);
        },
        onUser: (user) => {
          if (ports.onUser) ports.onUser(user);
        },
        onConflict: (conflict) => {
          toast('Đã giải quyết xung đột dữ liệu', 'warning');
          if (ports.onConflict) ports.onConflict(conflict);
        }
      }
    });

    // 1. Để thư viện đọc ?code= trên URL và lấy Token
    sync.handleOAuthCallback();

    // 2. SAU KHI thư viện xử lý xong, mới xoá ?code= khỏi URL để F5 không bị lỗi
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
      try {
        const cleanUrl = window.location.pathname + window.location.hash;
        history.replaceState({}, '', cleanUrl);
      } catch (e) {
        console.warn('[Sync] Không thể xoá ?code khỏi URL', e);
      }
    }
    
    return sync;
  } catch (err) {
    console.error('[Sync] Lỗi khởi tạo thư viện:', err);
    toast('Không thể khởi tạo đồng bộ', 'error');
    return null;
  }
}

// ==== HÀM PUBLIC ====
export function login() {
  if (!sync) {
    alert('Tính năng đồng bộ chưa sẵn sàng. Vui lòng tải lại trang.');
    return;
  }
  if (CONFIG.clientId === 'YOUR_OAUTH_APP_CLIENT_ID' || CONFIG.clientId === '') {
    alert('Lỗi: Bạn chưa điền Client ID vào file sync.js!');
    return;
  }
  return sync.login();
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
