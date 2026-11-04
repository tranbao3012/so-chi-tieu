/* js/sync.js — V1.0
   Kết nối với Cloudflare Worker Broker và GitHub Gist.
   Sử dụng thư viện @repus/gist-sync để merge dữ liệu. */

import { createGistSync } from 'https://esm.sh/@repus/gist-sync@0.2.2';

// ==== CẤU HÌNH ====
const CONFIG = {
  // BẮT BUỘC: Thay mã bên dưới bằng Client ID thật của bạn
  clientId: 'YOUR_GITHUB_CLIENT_ID', 
  
  // URL Worker Cloudflare của bạn (nhớ giữ nguyên /token ở cuối)
  brokerUrl: 'https://gist-sync-broker.baobao-tran.workers.dev/token',
  
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

// Hàm kết nối state của app với sync engine
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
  sync = createGistSync({
    config: CONFIG,
    schema,
    ports: {
      serialize,
      apply,
      onStatus: ports.onStatus || (() => {}), // Trạng thái: syncing | idle | error
      onToast: ports.onToast || (() => {}),   // Hiển thị thông báo Toast
      onUser: ports.onUser || (() => {}),     // Thông tin user GitHub
      onConflict: ports.onConflict || (() => {}) // Xử lý xung đột (nếu có)
    }
  });

  // Tự động xử lý callback nếu URL có ?code=... sau khi GitHub redirect về
  sync.handleOAuthCallback();
  
  return sync;
}

// ==== HÀM PUBLIC ====
export function login() {
  if (!sync) throw new Error('Sync chưa được khởi tạo');
  return sync.login();
}

export function syncNow() {
  if (!sync) throw new Error('Sync chưa được khởi tạo');
  return sync.syncNow();
}

export function markLocalChange() {
  if (sync) sync.markLocalChange();
}

export function getSync() {
  return sync;
}