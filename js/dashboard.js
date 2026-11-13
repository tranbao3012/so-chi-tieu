import {
  state, AI,
  ic, escapeHtml,
  fmtMoney, fmtDate, dayIso,
  getDayExpenses,
  calcSummary, calcTrend,
  getCategory, getCategoryIcon, getPayment,
  showConfirm, toast, hapticTap, hapticSuccess,
  saveState
} from './core.js';

import { markLocalChange } from './sync.js';
import { openExpenseModal } from './expenses.js';

function renderTodayOverview() {
  const el = document.getElementById('todayOverview');
  if (!el) return;

  const today = new Date();
  const todayExp = getDayExpenses(today);
  const yestExp = getDayExpenses(new Date(today.getTime() - 86400000));
  const total = calcSummary(todayExp).total;
  const trend = calcTrend(total, calcSummary(yestExp).total, 'hôm qua');

  el.innerHTML = `
    <div class="overview-header">
      <div class="overview-title"><span class="overview-icon today">${ic('sun')}</span>HÔM NAY ĐÃ CHI</div>
      <span class="overview-date">${fmtDate(dayIso(today))}</span>
    </div>
    <div class="overview-main-row">
      <div class="overview-big">${fmtMoney(total)}</div>
    </div>
    <div class="overview-trend ${trend.type}">${ic(trend.icon)}<span>${trend.text}</span></div>
  `;
}

function bindRecentSwipeActions() {
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

function handleDelete(id) {
  showConfirm('Xoá giao dịch', 'Bạn có chắc muốn xoá giao dịch này?', () => {
    state.expenses = state.expenses.filter(e => e.id !== id);
    saveState();
    markLocalChange();
    document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'expense-deleted' } }));
    toast('Đã xoá giao dịch');
    hapticSuccess();
  });
}

function renderRecentList() {
  const el = document.getElementById('recentList');
  if (!el) return;

  const recent = [...state.expenses]
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id.localeCompare(a.id))
    .slice(0, 6);

  if (recent.length === 0) {
    el.innerHTML = `<div class="empty"><svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg><div class="empty-title">Chưa có giao dịch</div><div class="empty-sub">Nhấn nút + để bắt đầu</div></div>`;
    return;
  }

  el.innerHTML = recent.map(e => {
    const cat = getCategory(e.categoryId);
    const iconName = getCategoryIcon(cat);
    const pay = getPayment(e.paymentMethod);
    const isAno = AI.isAnomalous(e.id);

    return `<div class="expense-swipe">
      <div class="expense-swipe-actions">
        <button class="swipe-action-btn edit" data-edit-expense="${e.id}">${ic('edit', 18)}<span>Sửa</span></button>
        <button class="swipe-action-btn delete" data-del-expense="${e.id}">${ic('trash', 18)}<span>Xoá</span></button>
      </div>
      <div class="recent-item" data-swipe-row="${e.id}">
        <div class="recent-icon">${ic(iconName, 20)}</div>
        <div class="recent-meta">
          <div class="recent-title">${escapeHtml(cat.name)}${e.note ? ' · ' + escapeHtml(e.note) : ''}${isAno ? ` <span class="anomaly-badge">${ic('alertTriangle', 12)}</span>` : ''}</div>
          <div class="recent-sub">${fmtDate(e.date)} · ${ic(pay.icon, 10)} ${escapeHtml(pay.name)}</div>
        </div>
        <div class="recent-amount">${fmtMoney(e.amount)}</div>
      </div>
    </div>`;
  }).join('');

  bindRecentSwipeActions();

  if (!el.dataset.bound) {
    el.dataset.bound = "true";
    el.addEventListener('click', (evt) => {
      const editBtn = evt.target.closest('[data-edit-expense]');
      if (editBtn) { openExpenseModal(editBtn.dataset.editExpense); return; }
      const delBtn = evt.target.closest('[data-del-expense]');
      if (delBtn) { handleDelete(delBtn.dataset.delExpense); return; }
    });
  }
}

export function renderDashboard() {
  renderTodayOverview();
  renderRecentList();
}
