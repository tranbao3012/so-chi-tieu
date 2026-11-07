/* js/main.js — Trích đoạn hàm setupSync */

async function setupSync() {
  try {
    syncModule = await import('./sync.js');
    
    syncModule.bindState(
      () => state, 
      (newState) => { 
        state.expenses = newState.expenses;
        state.categories = newState.categories;
        state.settings = newState.settings;
        saveState(); 
        document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'sync' } }));
      }
    );

    // [FIX] Thêm await ở đây để chờ thư viện từ CDN tải xong
    await syncModule.initSync({
      onStatus: (status) => {
        if (status === 'syncing') toast('Đang đồng bộ...', 'info');
        if (status === 'error') toast('Lỗi đồng bộ dữ liệu', 'error');
      },
      onToast: (msg) => toast(msg, 'success'),
      onUser: (user) => {
        document.dispatchEvent(new CustomEvent('sync:user', { detail: { user } }));
      },
      onConflict: (conflict) => {
        toast('Đã giải quyết xung đột dữ liệu', 'warning');
      }
    });
  } catch (err) {
    console.warn('[Sync] Lỗi tải module sync (App vẫn chạy bình thường):', err);
  }
}
