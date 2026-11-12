/* js/expenses.js — V1.9
   V1.9: Ép cứng Inline Style cho danh sách giao dịch để chống vỡ layout trên mobile.
   Fix triệt để lỗi nhấn giữ, format tiền tệ, tạo danh mục nhanh. */

import {
  state, formState, PAYMENT_METHODS, COLOR_PALETTE,
  ic, escapeHtml,
  fmtMoney, fmtMoneyShort, fmtDate, todayIso, dayIso, monthKey,
  getCategory, getPayment,
  AI, toast, openSheet, closeSheet, showConfirm,
  hapticTap, hapticSuccess, hapticWarning,
  uid, saveState
} from './core.js';

import { markLocalChange } from './sync.js';

/* ==================================================================
   STATE (module-private)
   ================================================================== */
let activeSmartFilter = 'all';
let actionTargetCatId = null;
let editingCatId = null;
let isLongPress = false;
let pressTimer = null;

/* ==================================================================
   SMART FILTERS
   ================================================================== */
function renderSmartFilters() {
  const el = document.getElementById('smartFilters');
  if (!el) return;

  const filters = [
    { id: 'all', label: 'Tất cả', icon: 'pieChart' },
    { id: 'today', label: 'Hôm nay', icon: 'sun' },
    { id: 'week', label: 'Tuần', icon: 'calendar' },
    { id: 'month', label: 'Tháng', icon: 'calendar' },
    { id: 'top10', label: 'Top 10%', icon: 'trendUp' },
    { id: 'anomaly', label: 'Bất thường', icon: 'alertTriangle' }
  ];
  el.innerHTML = filters.map(f => 
    `<button class="filter-chip ${activeSmartFilter === f.id ? 'active' : ''}" data-smart-filter="${f.id}">${ic(f.icon)}<span>${f.label}</span></button>`
  ).join('');
}

function applySmartFilter(list) {
  if (activeSmartFilter === 'all') return list;
  const now = new Date();

  if (activeSmartFilter === 'today') {
    const iso = dayIso(now);
    return list.filter(e => e.date === iso);
  }
  if (activeSmartFilter === 'week') {
    const dow = now.getDay() || 7;
    const sow = new Date(now); sow.setDate(now.getDate() - (dow - 1));
    return list.filter(e => e.date >= dayIso(sow) && e.date <= dayIso(now));
  }
  if (activeSmartFilter === 'month') {
    const k = monthKey(now);
    return list.filter(e => e.date && e.date.startsWith(k));
  }
  if (activeSmartFilter === 'top10') {
    if (!list.length) return [];
    return [...list].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, Math.max(1, Math.ceil(list.length * 0.1)));
  }
  if (activeSmartFilter === 'anomaly') {
    const ids = new Set(AI.detectAnomalies().map(a => a.id));
    return list.filter(e => ids.has(e.id));
  }
  return list;
}

export function populateCategoryFilter() {
  const sel = document.getElementById('filterCategory');
  if (!sel) return;
  const v = sel.value;
  sel.innerHTML = '<option value="">Tất cả</option>' + state.categories.map(c => 
    `<option value="${c.id}">${escapeHtml(c.name)}</option>`
  ).join('');
  if (v) sel.value = v;
}

/* ==================================================================
   EXPENSE LIST (Ép cứng Inline Style)
   ================================================================== */
function renderExpenses() {
  const from = document.getElementById('filterFrom').value;
  const to = document.getElementById('filterTo').value;
  const catFilter = document.getElementById('filterCategory').value;
  const search = document.getElementById('filterSearch').value.trim().toLowerCase();

  let list = state.expenses.slice();
  list = applySmartFilter(list);
  if (from) list = list.filter(e => e.date >= from);
  if (to) list = list.filter(e => e.date <= to);
  if (catFilter) list = list.filter(e => e.categoryId === catFilter);
  if (search) list = list.filter(e => (e.note || '').toLowerCase().includes(search));
  list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id.localeCompare(a.id));

  const total = list.reduce((s, e) => s + Number(e.amount || 0), 0);
  const avg = list.length > 0 ? total / list.length : 0;
  const days = new Set(list.map(e => e.date)).size;

  document.getElementById('summaryBar').innerHTML = `
    <div class="summary-stat"><div class="summary-stat-label">Tổng</div><div class="summary-stat-value">${fmtMoneyShort(total)}</div></div>
    <div class="summary-stat"><div class="summary-stat-label">Số GD</div><div class="summary-stat-value">${list.length}</div></div>
    <div class="summary-stat"><div class="summary-stat-label">TB/GD</div><div class="summary-stat-value">${fmtMoneyShort(Math.round(avg))}</div></div>
    <div class="summary-stat"><div class="summary-stat-label">Số ngày</div><div class="summary-stat-value">${days}</div></div>`;

  const c = document.getElementById('expenseList');
  if (list.length === 0) {
    c.innerHTML = `<div class="card"><div class="empty"><svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div class="empty-title">Không tìm thấy</div><div class="empty-sub">${state.expenses.length === 0 ? 'Nhấn + để thêm chi tiêu' : 'Thử xoá bộ lọc'}</div></div></div>`;
    return;
  }

  const groups = new Map();
  list.forEach(e => { if (!groups.has(e.date)) groups.set(e.date, []); groups.get(e.date).push(e); });
  const anomalies = new Set(AI.detectAnomalies().map(a => a.id));

  c.innerHTML = Array.from(groups.entries()).map(([date, items]) => {
    const dayTotal = items.reduce((s, e) => s + Number(e.amount || 0), 0);
    
    return `<div class="expense-group" style="margin-bottom: 12px; background: var(--surface); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-soft);">
      <div class="group-header" style="padding: 8px 12px; background: var(--surface-2); border-bottom: 1px solid var(--border-soft); display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--text-muted);">
        <div class="group-header-left" style="display: flex; align-items: center; gap: 6px;">${ic('calendar')}<span>${fmtDate(date)}</span></div>
        <span class="group-total" style="color: var(--primary);">${fmtMoney(dayTotal)}</span>
      </div>
      ${items.map(e => {
        const cat = getCategory(e.categoryId);
        const isAno = anomalies.has(e.id);
        
        const wrapStyle = "position: relative; overflow: hidden; width: 100%; border-bottom: 1px solid var(--border-soft); background: var(--surface);";
        const actionStyle = "position: absolute; top: 0; right: 0; bottom: 0; display: flex; z-index: 1;";
        const rowStyle = "position: relative; z-index: 2; background: var(--surface); display: flex; align-items: center; gap: 12px; padding: 12px 8px; width: 100%; touch-action: pan-y; user-select: none; transition: transform 0.2s ease;";

        return `<div class="expense-swipe" data-expense-id="${e.id}" style="${wrapStyle}">
          <div class="expense-swipe-actions" style="${actionStyle}">
            <button class="swipe-action-btn edit" data-edit-expense="${e.id}" style="width: 76px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--primary); color: #fff; font-size: 10px; font-weight: 700; border: none; cursor: pointer;">${ic('edit', 18)}<span style="margin-top: 2px;">Sửa</span></button>
            <button class="swipe-action-btn delete" data-del-expense="${e.id}" style="width: 76px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--danger); color: #fff; font-size: 10px; font-weight: 700; border: none; cursor: pointer;">${ic('trash', 18)}<span style="margin-top: 2px;">Xoá</span></button>
          </div>
          <div class="expense-row${isAno ? ' anomaly' : ''}" data-swipe-row="${e.id}" style="${rowStyle}">
            <div class="expense-icon" style="background:${cat.color}; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 14px; flex-shrink: 0;">${escapeHtml(cat.name.charAt(0).toUpperCase())}</div>
            <div class="expense-body" style="flex: 1; min-width: 0;">
              <div class="expense-top" style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px; flex-wrap: wrap;">
                <span class="expense-category" style="font-size: 13px; font-weight: 700; color: var(--text);">${escapeHtml(cat.name)}</span>
                <span class="expense-payment" style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: var(--surface-2); color: var(--text-soft);">${getPayment(e.paymentMethod).name}</span>
                ${isAno ? `<span style="color:var(--warning); font-size:12px;">⚠</span>` : ''}
              </div>
              <div class="expense-note" style="font-size: 11px; color: var(--text-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(e.note || 'Không có ghi chú')}</div>
            </div>
            <div class="expense-amount" style="font-size: 14px; font-weight: 800; color: var(--text); white-space: nowrap; flex-shrink: 0;">${fmtMoney(e.amount)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');

  bindSwipeActions();
}

/* ==================================================================
   SWIPE — GPU transform only
   ================================================================== */
function bindSwipeActions() {
  const rows = document.querySelectorAll('[data-swipe-row]');
  const SWIPE_THRESHOLD = 140;
  let openRow = null;

  rows.forEach(row => {
    let startX = 0, currentX = 0, isDragging = false;

    row.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      currentX = 0;
      isDragging = false;
      if (openRow && openRow !== row) {
        openRow.style.transform = 'translate3d(0,0,0)';
        openRow = null;
      }
    }, { passive: true });

    row.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - startX;
      if (dx > 5) return;
      if (Math.abs(dx) > 10) {
        if (!isDragging) isDragging = true;
        currentX = Math.max(-152, Math.min(0, dx));
        row.style.transform = `translate3d(${currentX}px,0,0)`;
      }
    }, { passive: true });

    row.addEventListener('touchend', () => {
      if (!isDragging) return;
      if (currentX < -SWIPE_THRESHOLD / 2) {
        row.style.transform = 'translate3d(-152px,0,0)';
        openRow = row;
        hapticTap();
      } else {
        row.style.transform = 'translate3d(0,0,0)';
        if (openRow === row) openRow = null;
      }
    });
  });
}

/* ==================================================================
   EXPENSE FORM
   ================================================================== */
export function openExpenseModal(id = null) {
  formState.editingExpenseId = id;
  document.getElementById('expenseModalTitle').textContent = id ? 'Sửa chi tiêu' : 'Thêm chi tiêu';
  document.getElementById('formAmount').value = '';
  document.getElementById('formDate').value = todayIso();
  document.getElementById('formNote').value = '';
  
  document.getElementById('amountCurrencyPrefix').textContent = state.settings.currency || 'đ';
  
  formState.formCategory = null;
  formState.formPayment = 'cash';
  document.getElementById('errAmount').classList.remove('show');
  document.getElementById('errCategory').classList.remove('show');

  if (id) {
    const e = state.expenses.find(x => x.id === id);
    if (e) {
      document.getElementById('formAmount').value = Number(e.amount).toLocaleString('vi-VN');
      document.getElementById('formDate').value = e.date;
      document.getElementById('formNote').value = e.note || '';
      formState.formCategory = e.categoryId;
      formState.formPayment = e.paymentMethod || 'cash';
    }
  }

  renderFormChips();
  updateSummaryPreview();
  updateAISuggestions();
  openSheet('expenseModal');
  setTimeout(() => document.getElementById('formAmount').focus(), 300);
}

export function closeExpenseModal() {
  closeSheet('expenseModal');
  formState.editingExpenseId = null;
  formState.formCategory = null;
  formState.formPayment = 'cash';
}

function renderFormChips(suggestedCat = null) {
  let html = state.categories.map(c => 
    `<button class="cat-option ${formState.formCategory === c.id ? 'active' : ''} ${suggestedCat === c.id ? 'suggested' : ''}" data-cat-id="${c.id}">
      <div class="cat-option-icon" style="background:${c.color};">${escapeHtml(c.name.charAt(0).toUpperCase())}</div>
      <div class="cat-option-name">${escapeHtml(c.name)}</div>
    </button>`
  ).join('');

  html += `
    <button class="cat-option" id="btnAddQuickCat" style="border-style: dashed; justify-content: center; background: var(--surface-2);">
      <div class="cat-option-icon" style="background: transparent; color: var(--text-muted); font-size: 24px; font-weight: 400; line-height: 1;">+</div>
      <div class="cat-option-name" style="color: var(--text-muted);">Mới</div>
    </button>
  `;

  document.getElementById('formCategories').innerHTML = html;

  document.getElementById('formPayments').innerHTML = PAYMENT_METHODS.map(p => 
    `<button class="payment-option ${formState.formPayment === p.id ? 'active' : ''}" data-pay-id="${p.id}">
      <div class="payment-dot-icon" style="background:${p.color};">${ic(p.icon)}</div>
      <span>${escapeHtml(p.name)}</span>
    </button>`
  ).join('');
}

function updateSummaryPreview() {
  const rawAmount = document.getElementById('formAmount').value.replace(/\./g, '');
  const amount = Number(rawAmount) || 0;
  const date = document.getElementById('formDate').value;
  const cat = formState.formCategory ? getCategory(formState.formCategory) : null;

  document.getElementById('sumCategory').innerHTML = cat
    ? `<span style="display:inline-flex;align-items:center;gap:5px;"><span style="width:9px;height:9px;border-radius:2px;background:${cat.color};"></span>${escapeHtml(cat.name)}</span>`
    : '—';
  document.getElementById('sumDate').textContent = date ? fmtDate(date) : '—';
  document.getElementById('sumPayment').textContent = getPayment(formState.formPayment).name;
  document.getElementById('sumAmount').textContent = fmtMoney(amount);
}

function updateAISuggestions() {
  const note = document.getElementById('formNote').value;
  const rawAmount = document.getElementById('formAmount').value.replace(/\./g, '');
  const amount = Number(rawAmount);
  const banner = document.getElementById('aiHintBanner');
  const chips = document.getElementById('aiAmountChips');
  const warn = document.getElementById('anomalyWarn');

  const sug = AI.suggestCategory(note);
  if (sug && !formState.formCategory) {
    const cat = getCategory(sug.categoryId);
    banner.innerHTML = `<div class="ai-hint-banner">${ic('sparkles')}<div>Gợi ý: <strong>${escapeHtml(cat.name)}</strong> <button id="applyAiCat" data-suggested="${sug.categoryId}">Áp dụng</button></div></div>`;
  } else {
    banner.innerHTML = '';
  }

  if (formState.formCategory) {
    const amts = AI.suggestAmount(formState.formCategory);
    if (amts.length > 0) {
      chips.innerHTML = amts.map(s => `<button class="quick-amount-btn ai-suggest" data-amt="${s.amount}">${fmtMoneyShort(s.amount)}</button>`).join('');
    } else {
      chips.innerHTML = [50000, 100000, 200000, 500000].map(a => `<button class="quick-amount-btn" data-amt="${a}">${fmtMoneyShort(a)}</button>`).join('');
    }
    chips.querySelectorAll('[data-amt]').forEach(b => {
      b.onclick = () => {
        document.getElementById('formAmount').value = Number(b.dataset.amt).toLocaleString('vi-VN');
        updateSummaryPreview();
        updateAISuggestions();
      };
    });
  } else {
    chips.innerHTML = '';
  }

  if (formState.formCategory && amount > 0) {
    const ano = AI.checkAnomalyForInput(formState.formCategory, amount);
    if (ano) warn.innerHTML = `<div class="anomaly-warn">${ic('alertTriangle')}<div>Số tiền cao gấp <strong>${ano.ratio.toFixed(1)}x</strong> mức thường (trung vị ${fmtMoney(Math.round(ano.median))}).</div></div>`;
    else warn.innerHTML = '';
  } else {
    warn.innerHTML = '';
  }
}

function saveExpense() {
  const amountRaw = document.getElementById('formAmount').value.replace(/\./g, '');
  const amount = Number(amountRaw);
  const date = document.getElementById('formDate').value;
  const note = document.getElementById('formNote').value.trim();
  let err = false;

  if (!amountRaw || isNaN(amount) || amount <= 0) {
    document.getElementById('errAmount').classList.add('show');
    err = true;
  } else {
    document.getElementById('errAmount').classList.remove('show');
  }
  if (!formState.formCategory) {
    document.getElementById('errCategory').classList.add('show');
    err = true;
  } else {
    document.getElementById('errCategory').classList.remove('show');
  }
  if (err) { hapticWarning(); return; }
  if (!date) { toast('Chọn ngày', 'error'); return; }

  if (formState.editingExpenseId) {
    const idx = state.expenses.findIndex(x => x.id === formState.editingExpenseId);
    if (idx !== -1) {
      state.expenses[idx] = {
        ...state.expenses[idx],
        amount, categoryId: formState.formCategory, paymentMethod: formState.formPayment, date, note,
        updatedAt: Date.now()
      };
    }
    toast('Đã cập nhật');
  } else {
    state.expenses.push({
      id: uid(), amount,
      categoryId: formState.formCategory,
      paymentMethod: formState.formPayment,
      date, note, createdAt: Date.now(),
      updatedAt: Date.now()
    });
    toast('Đã thêm giao dịch');
  }

  hapticSuccess();
  saveState();
  markLocalChange();
  closeExpenseModal();

  document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'expense' } }));
}

function deleteExpense(id) {
  showConfirm('Xoá giao dịch', 'Bạn có chắc muốn xoá giao dịch này?', () => {
    state.expenses = state.expenses.filter(e => e.id !== id);
    saveState();
    markLocalChange();
    document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'expense-deleted' } }));
    toast('Đã xoá giao dịch');
    hapticSuccess();
  });
}

/* ==================================================================
   QUICK CATEGORY
   ================================================================== */
function openQuickCatModal() {
  editingCatId = null;
  document.getElementById('quickCatTitle').textContent = 'Tạo danh mục mới';
  document.getElementById('quickCatName').value = '';
  openSheet('quickCatModal');
  setTimeout(() => document.getElementById('quickCatName').focus(), 300);
}

function saveQuickCat() {
  const name = document.getElementById('quickCatName').value.trim();
  if (!name) {
    hapticWarning();
    return;
  }

  if (editingCatId) {
    const idx = state.categories.findIndex(c => c.id === editingCatId);
    if (idx !== -1) {
      state.categories[idx].name = name;
      state.categories[idx].updatedAt = Date.now();
    }
    toast('Đã cập nhật danh mục');
  } else {
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const newId = uid();
    state.categories.push({
      id: newId,
      name: name,
      color: randomColor,
      type: 'discretionary',
      updatedAt: Date.now()
    });
    formState.formCategory = newId;
    toast('Đã tạo danh mục mới');
  }

  saveState();
  markLocalChange();
  hapticSuccess();
  closeSheet('quickCatModal');

  editingCatId = null;
  document.getElementById('quickCatTitle').textContent = 'Tạo danh mục mới';

  renderFormChips();
  updateSummaryPreview();
  updateAISuggestions();
}

/* ==================================================================
   ENTRY — render tab
   ================================================================== */
export function renderExpensesTab() {
  renderSmartFilters();
  populateCategoryFilter();
  renderExpenses();
}

/* ==================================================================
   BIND EVENTS (called once by main.js)
   ================================================================== */
export function bindExpenseTabEvents() {
  document.getElementById('smartFilters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-smart-filter]');
    if (!btn) return;
    hapticTap();
    activeSmartFilter = btn.dataset.smartFilter;
    document.querySelectorAll('[data-smart-filter]').forEach(b => 
      b.classList.toggle('active', b.dataset.smartFilter === activeSmartFilter)
    );
    renderExpenses();
  });

  ['filterFrom', 'filterTo', 'filterCategory', 'filterSearch'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderExpenses);
    document.getElementById(id).addEventListener('change', renderExpenses);
  });

  document.getElementById('filterReset').addEventListener('click', () => {
    hapticTap();
    ['filterFrom', 'filterTo', 'filterCategory', 'filterSearch'].forEach(id => {
      document.getElementById(id).value = '';
    });
    activeSmartFilter = 'all';
    renderSmartFilters();
    renderExpenses();
  });

  document.getElementById('expenseList').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-expense]');
    if (editBtn) { openExpenseModal(editBtn.dataset.editExpense); return; }
    const delBtn = e.target.closest('[data-del-expense]');
    if (delBtn) { deleteExpense(delBtn.dataset.delExpense); return; }
  });
}

export function bindExpenseFormEvents() {
  const catGrid = document.getElementById('formCategories');

  catGrid.addEventListener('contextmenu', (e) => {
    if (e.target.closest('[data-cat-id]')) {
      e.preventDefault();
    }
  });

  let startX = 0, startY = 0;
  let isDragging = false;

  const startPress = (e) => {
    const btn = e.target.closest('[data-cat-id]');
    if (!btn) return;
    
    if (e.type === 'touchstart') {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else {
      startX = e.clientX;
      startY = e.clientY;
    }
    
    isDragging = false;
    isLongPress = false;

    pressTimer = setTimeout(() => {
      if (!isDragging) {
        isLongPress = true;
        hapticTap();
        actionTargetCatId = btn.dataset.catId;
        const cat = state.categories.find(c => c.id === actionTargetCatId);
        document.getElementById('catActionTitle').textContent = cat ? cat.name : 'Danh mục';
        openSheet('catActionModal');
      }
    }, 600); 
  };

  const cancelPress = (e) => {
    if (e.type === 'touchmove' || e.type === 'mousemove') {
      let curX, curY;
      if (e.type === 'touchmove') {
        curX = e.touches[0].clientX;
        curY = e.touches[0].clientY;
      } else {
        curX = e.clientX;
        curY = e.clientY;
      }
      if (Math.abs(curX - startX) > 10 || Math.abs(curY - startY) > 10) {
        isDragging = true;
        clearTimeout(pressTimer);
      }
    } else {
      clearTimeout(pressTimer);
    }
  };

  catGrid.addEventListener('touchstart', startPress, { passive: true });
  catGrid.addEventListener('touchmove', cancelPress, { passive: true });
  catGrid.addEventListener('touchend', cancelPress);

  catGrid.addEventListener('mousedown', startPress);
  catGrid.addEventListener('mousemove', cancelPress);
  catGrid.addEventListener('mouseup', cancelPress);
  catGrid.addEventListener('mouseleave', cancelPress);

  catGrid.addEventListener('click', (e) => {
    if (isLongPress) {
      isLongPress = false;
      return;
    }

    if (e.target.closest('#btnAddQuickCat')) {
      hapticTap();
      openQuickCatModal();
      return;
    }
    
    const btn = e.target.closest('[data-cat-id]');
    if (!btn) return;
    hapticTap();
    formState.formCategory = btn.dataset.catId;
    document.getElementById('errCategory').classList.remove('show');
    renderFormChips();
    updateSummaryPreview();
    updateAISuggestions();
  });

  document.getElementById('catActionEdit').addEventListener('click', () => {
    closeSheet('catActionModal');
    if (!actionTargetCatId) return;
    const cat = state.categories.find(c => c.id === actionTargetCatId);
    if (!cat) return;

    editingCatId = cat.id;
    document.getElementById('quickCatTitle').textContent = 'Sửa danh mục';
    document.getElementById('quickCatName').value = cat.name;
    openSheet('quickCatModal');
    setTimeout(() => document.getElementById('quickCatName').focus(), 300);
  });

  document.getElementById('catActionDelete').addEventListener('click', () => {
    closeSheet('catActionModal');
    if (!actionTargetCatId) return;
    const cat = state.categories.find(c => c.id === actionTargetCatId);
    if (!cat) return;

    const expCount = state.expenses.filter(e => e.categoryId === cat.id).length;
    const msg = expCount > 0 
      ? `Có ${expCount} giao dịch thuộc danh mục này. Xoá sẽ chuyển sang "Khác". Tiếp tục?`
      : 'Bạn có chắc muốn xoá danh mục này?';

    showConfirm('Xoá danh mục', msg, () => {
      if (expCount > 0) {
        const fb = state.categories.find(c => c.id === 'other') || state.categories[0];
        state.expenses.forEach(e => {
          if (e.categoryId === cat.id) {
            e.categoryId = fb ? fb.id : 'other';
            e.updatedAt = Date.now();
          }
        });
      }
      state.categories = state.categories.filter(c => c.id !== cat.id);
      
      if (formState.formCategory === cat.id) {
        formState.formCategory = null;
      }

      saveState();
      markLocalChange();
      hapticSuccess();
      toast('Đã xoá danh mục');
      
      renderFormChips();
      updateSummaryPreview();
      updateAISuggestions();
    });
  });

  document.getElementById('formPayments').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pay-id]');
    if (!btn) return;
    hapticTap();
    formState.formPayment = btn.dataset.payId;
    renderFormChips();
    updateSummaryPreview();
  });

  document.getElementById('formAmount').addEventListener('input', (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw) {
      e.target.value = Number(raw).toLocaleString('vi-VN');
    } else {
      e.target.value = '';
    }
    updateSummaryPreview();
    updateAISuggestions();
  });

  document.getElementById('formAmount').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveExpense();
  });

  document.getElementById('formDate').addEventListener('change', updateSummaryPreview);
  document.getElementById('formNote').addEventListener('input', updateAISuggestions);

  document.getElementById('saveExpenseBtn').addEventListener('click', saveExpense);

  document.getElementById('aiHintBanner').addEventListener('click', (e) => {
    const btn = e.target.closest('#applyAiCat');
    if (!btn) return;
    hapticTap();
    const suggestedId = btn.dataset.suggested;
    if (suggestedId) {
      formState.formCategory = suggestedId;
      document.getElementById('errCategory').classList.remove('show');
      renderFormChips(suggestedId);
      updateSummaryPreview();
      updateAISuggestions();
    }
  });

  document.getElementById('quickSaveCatBtn').addEventListener('click', saveQuickCat);
  document.getElementById('quickCatName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveQuickCat();
  });
}
