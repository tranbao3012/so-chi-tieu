/* js/categories.js — V1.0
   Render tab Danh mục: grid category + mini bar, so sánh tháng trước,
   CRUD category (thêm/sửa/xoá), form sheet với color picker */

import {
  state, formState, COLOR_PALETTE,
  ic, escapeHtml,
  fmtMoney, fmtDate, dayIso,
  getCategory, getMonthExpenses, getLastMonth,
  toast, openSheet, closeSheet, showConfirm,
  hapticTap, hapticSuccess, hapticWarning,
  uid, saveState
} from './core.js';

/* ==================================================================
   CATEGORY GRID
   ================================================================== */
function renderCategories() {
  const grid = document.getElementById('catGrid');
  if (!grid) return;

  const now = new Date();
  const cur = getMonthExpenses(now);
  const prev = getMonthExpenses(getLastMonth());
  const byCat = new Map(), byCatLast = new Map();

  cur.forEach(e => byCat.set(e.categoryId, (byCat.get(e.categoryId) || 0) + Number(e.amount)));
  prev.forEach(e => byCatLast.set(e.categoryId, (byCatLast.get(e.categoryId) || 0) + Number(e.amount)));

  grid.innerHTML = state.categories.map(cat => {
    const amount = byCat.get(cat.id) || 0;
    const last = byCatLast.get(cat.id) || 0;
    const count = state.expenses.filter(e => e.categoryId === cat.id).length;

    // Trend vs tháng trước
    let trend = '';
    if (last > 0 || amount > 0) {
      if (last === 0) {
        trend = `<span class="cat-trend up">${ic('arrowUp')}Mới</span>`;
      } else {
        const diff = amount - last;
        const pct = (diff / last * 100).toFixed(0);
        if (diff > 0) trend = `<span class="cat-trend up">${ic('arrowUp')}+${pct}%</span>`;
        else if (diff < 0) trend = `<span class="cat-trend down">${ic('arrowDown')}${pct}%</span>`;
        else trend = `<span class="cat-trend">${ic('minus')}0%</span>`;
      }
    }

    // Mini bars 7 ngày gần nhất
    const bars = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = dayIso(d);
      bars.push(state.expenses
        .filter(e => e.categoryId === cat.id && e.date === iso)
        .reduce((s, e) => s + Number(e.amount), 0)
      );
    }
    const maxB = Math.max(...bars, 1);
    const barsHtml = bars.map(v => 
      `<div class="cat-mini-bar" style="height:${v > 0 ? Math.max(10, (v / maxB) * 100) : 5}%;background:${cat.color};opacity:${v > 0 ? 0.85 : 0.25};"></div>`
    ).join('');

    return `<div class="cat-card">
      <div class="cat-actions">
        <button class="bar-icon-btn" data-edit-cat="${cat.id}" style="width:28px;height:28px;">${ic('edit')}</button>
        <button class="bar-icon-btn" data-del-cat="${cat.id}" style="width:28px;height:28px;color:var(--danger);">${ic('trash')}</button>
      </div>
      <div class="cat-top">
        <div class="cat-icon" style="background:${cat.color};">${escapeHtml(cat.name.charAt(0).toUpperCase())}</div>
        <div class="cat-name">${escapeHtml(cat.name)}</div>
      </div>
      <div class="cat-amount">${fmtMoney(amount)}</div>
      <div class="cat-sub"><span>${count} GD</span>${trend}</div>
      <div class="cat-mini-bars">${barsHtml}</div>
    </div>`;
  }).join('');
}

/* ==================================================================
   FORM OPEN / SAVE
   ================================================================== */
export function openCategoryModal(id = null) {
  formState.editingCategoryId = id;
  document.getElementById('categoryModalTitle').textContent = id ? 'Sửa danh mục' : 'Thêm danh mục';

  if (id) {
    const c = state.categories.find(x => x.id === id);
    if (c) {
      document.getElementById('catName').value = c.name;
      formState.editingCatColor = c.color;
    }
  } else {
    document.getElementById('catName').value = '';
    formState.editingCatColor = COLOR_PALETTE[state.categories.length % COLOR_PALETTE.length];
  }

  document.getElementById('errCatName').classList.remove('show');
  renderColorPicker();
  openSheet('categoryModal');
  setTimeout(() => document.getElementById('catName').focus(), 300);
}

export function closeCategoryModal() {
  closeSheet('categoryModal');
  formState.editingCategoryId = null;
}

function renderColorPicker() {
  document.getElementById('catColors').innerHTML = COLOR_PALETTE.map(c => {
    const isSelected = c === formState.editingCatColor;
    return `<button
      style="width:100%;aspect-ratio:1;border-radius:8px;background:${c};border:2px solid ${isSelected ? 'var(--text)' : 'transparent'};box-shadow:${isSelected ? '0 0 0 3px var(--surface), 0 0 0 5px var(--primary)' : 'none'};"
      data-color="${c}"></button>`;
  }).join('');
}

function saveCategory() {
  const name = document.getElementById('catName').value.trim();
  if (!name) {
    document.getElementById('errCatName').classList.add('show');
    hapticWarning();
    return;
  }

  if (formState.editingCategoryId) {
    const idx = state.categories.findIndex(x => x.id === formState.editingCategoryId);
    if (idx !== -1) {
      state.categories[idx].name = name;
      state.categories[idx].color = formState.editingCatColor;
    }
    toast('Đã cập nhật');
  } else {
    state.categories.push({
      id: uid(),
      name,
      color: formState.editingCatColor,
      type: 'discretionary'
    });
    toast('Đã thêm danh mục');
  }

  hapticSuccess();
  saveState();
  closeCategoryModal();
  document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'category' } }));
}

/* ==================================================================
   DELETE
   ================================================================== */
function deleteCategory(id) {
  const count = state.expenses.filter(e => e.categoryId === id).length;

  if (count > 0) {
    showConfirm(
      'Xoá danh mục',
      `Có ${count} giao dịch thuộc danh mục này. Xoá sẽ chuyển sang "Khác". Tiếp tục?`,
      () => {
        const fb = state.categories.find(c => c.id === 'other') || state.categories[0];
        state.expenses.forEach(e => {
          if (e.categoryId === id) e.categoryId = fb ? fb.id : 'other';
        });
        state.categories = state.categories.filter(c => c.id !== id);
        saveState();
        toast('Đã xoá danh mục');
        hapticSuccess();
        document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'category-deleted' } }));
      }
    );
  } else {
    showConfirm('Xoá danh mục', 'Bạn có chắc muốn xoá danh mục này?', () => {
      state.categories = state.categories.filter(c => c.id !== id);
      saveState();
      toast('Đã xoá danh mục');
      hapticSuccess();
      document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'category-deleted' } }));
    });
  }
}

/* ==================================================================
   ENTRY — render tab
   ================================================================== */
export function renderCategoriesTab() {
  renderCategories();
}

/* ==================================================================
   BIND EVENTS (called once by main.js)
   ================================================================== */
export function bindCategoryTabEvents() {
  // Add button
  document.getElementById('addCatBtn').addEventListener('click', () => {
    hapticTap();
    openCategoryModal();
  });

  // Edit / Delete trong grid
  document.getElementById('catGrid').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-cat]');
    if (editBtn) { openCategoryModal(editBtn.dataset.editCat); return; }
    const delBtn = e.target.closest('[data-del-cat]');
    if (delBtn) { deleteCategory(delBtn.dataset.delCat); return; }
  });
}

export function bindCategoryFormEvents() {
  // Color picker
  document.getElementById('catColors').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-color]');
    if (!btn) return;
    hapticTap();
    formState.editingCatColor = btn.dataset.color;
    document.querySelectorAll('#catColors [data-color]').forEach(b => {
      const isSelected = b.dataset.color === formState.editingCatColor;
      b.style.borderColor = isSelected ? 'var(--text)' : 'transparent';
      b.style.boxShadow = isSelected ? '0 0 0 3px var(--surface), 0 0 0 5px var(--primary)' : 'none';
    });
  });

  // Save button
  document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);

  // Enter trong tên
  document.getElementById('catName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveCategory();
  });
}