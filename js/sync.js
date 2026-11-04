/* js/sync.js — V1.3
   Đồng bộ dữ liệu qua GitHub Gist sử dụng @repus/gist-sync.
   V1.3: Sửa cấu hình brokerPath, bọc try/catch chống sập app, thêm UI Toast. */

import { createGistSync } from 'https://esm.sh/@repus/gist-sync@0.2.2';
import { toast } from './core.js';

// ==== CẤU HÌNH ====
const CONFIG = {
  // BẮT BUỘC: Dán Client ID của OAuth App (không phải GitHub App) vào đây
  clientId: 'Ov23li9f3mWd0uDSxiL0', 
  
  // URL Worker Cloudflare (giữ nguyên /token ở cuối)
  brokerPath: 'https://gist-sync-broker.baobao-tran.workers.dev/',
  
  // Tên file lưu trữ trên Gist
  filename: 'so-chi-tieu-data.json'
};

// ==== SCHEMA ĐỒNG BỘ ====
// expenses & categories: merge dựa trên trường 'id' (thêm/sửa không đè lên nhau)
// settings: merge từng key (ví dụ thiết bị A đổi theme, B đổi ngân sách -> giữ cả 2)
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

// Đóng gói dữ liệu để đẩy lên Gist
function serialize() {
  const state = _getState();
  return {
    expenses: state.expenses,
    categories: state.categories,
    settings: state.settings
  };
}

// Nhận dữ liệu đã merge từ Gist và cập nhật lại app
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

    // Tự động xử lý callback nếu URL có ?code=... sau khi GitHub redirect về
    sync.handleOAuthCallback();
    
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
  // Kiểm tra xem đã điền Client ID chưa
  if (CONFIG.clientId === 'YOUR_OAUTH_APP_CLIENT_ID') {
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
