/* js/sync.js — V1.2
   Đồng bộ dữ liệu qua GitHub Gist sử dụng @repus/gist-sync.
   Yêu cầu: Cloudflare Worker broker đã deploy. */

import { createGistSync } from 'https://esm.sh/@repus/gist-sync@0.2.2';

// ==== CẤU HÌNH ====
const CONFIG = {
  // Đã điền sẵn Client ID từ ảnh chụp của bạn
  clientId: 'Ov23li9f3mWdOuDSxiL0', 
  
  // Đã đổi thành brokerPath (thay vì brokerUrl) để đúng chuẩn thư viện
  brokerPath: 'https://gist-sync-broker.baobao-tran.workers.dev/token',
  
  // Tên file lưu trữ trên Gist
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
        onStatus: ports.onStatus || (() => {}), 
        onToast: ports.onToast || (() => {}),   
        onUser: ports.onUser || (() => {}),     
        onConflict: ports.onConflict || (() => {}) 
      }
    });

    // Tự động xử lý callback nếu URL có ?code=... sau khi GitHub redirect về
    sync.handleOAuthCallback();
    
    return sync;
  } catch (err) {
    console.error('[Sync] Lỗi khởi tạo:', err);
    // Không throw lỗi ra ngoài để tránh sập app
    return null;
  }
}

// ==== HÀM PUBLIC ====
export function login() {
  if (!sync) {
    alert('Tính năng đồng bộ chưa sẵn sàng. Vui lòng tải lại trang.');
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
