import {
  state, AI,
  ic, escapeHtml,
  fmtMoney, fmtDate, dayIso,
  getDayExpenses,
  calcSummary, calcByCategory, calcTrend,
  getCategory, getCategoryEmoji, getPayment,
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

function calculateStreak() {
  if (!state.expenses || state.expenses.length === 0) return 0;

  const dates = new Set(state.expenses.map(e => e.date));
  let streak = 0;
  let checkDate = new Date();

  if (!dates.has(dayIso(checkDate))) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (!dates.has(dayIso(checkDate))) return 0;
  }

  while (dates.has(dayIso(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

function renderStreakCard() {
  const el = document.getElementById('streakCard');
  if (!el) return;

  const streak = calculateStreak();

  el.innerHTML = `
    <div class="quick-stat-icon" style="background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; font-size: 20px;">🔥</div>
    <div class="quick-stat-info">
      <div class="quick-stat-value">${streak} ngày</div>
      <div class="quick-stat-label">Chuỗi ghi chép</div>
    </div>
  `;
}

function renderInsightCard() {
  const el = document.getElementById('insightCard');
  if (!el) return;

  const todayExp = getDayExpenses(new Date());
  const byCat = calcByCategory(todayExp);

  let icon = '💤';
  let text = 'Chưa chi tiêu';
  let color = 'var(--text-muted)';

  if (byCat.length > 0) {
    const top = byCat[0];
    const emoji = getCategoryEmoji(top.category);
    text = `Nhiều nhất: ${emoji} ${escapeHtml(top.category.name)}`;
    icon = '🛍️';
    color = 'var(--text)';
  }

  el.innerHTML = `
    <div class="quick-stat-icon" style="background: var(--surface-2); font-size: 20px;">${icon}</div>
    <div class="quick-stat-info">
      <div class="quick-stat-value" style="color: ${color}; font-size: 12px; line-height: 1.2; margin-bottom: 2px;">${text}</div>
      <div class="quick-stat-label">Chi nhiều nhất hôm nay</div>
    </div>
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
    const emoji = getCategoryEmoji(cat);
    const pay = getPayment(e.paymentMethod);
    const isAno = AI.isAnomalous(e.id);

    return `<div class="expense-swipe">
      <div class="expense-swipe-actions">
        <button class="swipe-action-btn edit" data-edit-expense="${e.id}">${ic('edit', 18)}<span>Sửa</span></button>
        <button class="swipe-action-btn delete" data-del-expense="${e.id}">${ic('trash', 18)}<span>Xoá</span></button>
      </div>
      <div class="recent-item" data-swipe-row="${e.id}">
        <div class="recent-icon" style="background:${cat.color};">${emoji}</div>
        <div class="recent-meta">
          <div class="recent-title">${escapeHtml(cat.name)}${e.note ? ' · ' + escapeHtml(e.note) : ''}${isAno ? ' <span class="anomaly-badge">⚠</span>' : ''}</div>
          <div class="recent-sub">${fmtDate(e.date)} · ${pay.emoji} ${pay.name}</div>
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
  renderStreakCard();
  renderInsightCard();
  renderRecentList();
}
