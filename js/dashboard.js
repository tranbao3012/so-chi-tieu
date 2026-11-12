/* js/dashboard.js — V1.6
   V1.6: Ép cứng Inline Style cho phần Swipe (Sửa/Xóa) để chống vỡ layout nếu mất CSS.
   Render tab Tổng quan: overview Hôm nay, Streak, Insight, danh sách giao dịch gần đây. */

import {
  state, AI,
  ic, escapeHtml,
  fmtMoney, fmtDate, dayIso,
  getDayExpenses,
  calcSummary, calcByCategory, calcTrend,
  getCategory, getPayment,
  showConfirm, toast, hapticTap, hapticSuccess,
  saveState
} from './core.js';

import { markLocalChange } from './sync.js';
import { openExpenseModal } from './expenses.js';

/* ==================================================================
   OVERVIEW — Hôm nay
   ================================================================== */
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

/* ==================================================================
   STREAK — Đếm chuỗi ngày ghi chép liên tiếp
   ================================================================== */
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
    <div class="quick-stat-icon" style="background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; font-size: 18px;">🔥</div>
    <div class="quick-stat-info">
      <div class="quick-stat-value">${streak} ngày</div>
      <div class="quick-stat-label">Chuỗi ghi chép</div>
    </div>
  `;
}

/* ==================================================================
   INSIGHT — Nhận xét hôm nay chi gì nhiều nhất
   ================================================================== */
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
    text = `Nhiều nhất: ${escapeHtml(top.category.name)}`;
    icon = '🛍️';
    color = 'var(--text)';
  }

  el.innerHTML = `
    <div class="quick-stat-icon" style="background: var(--surface-2); font-size: 18px;">${icon}</div>
    <div class="quick-stat-info">
      <div class="quick-stat-value" style="color: ${color}; font-size: 12px; line-height: 1.2; margin-bottom: 2px;">${text}</div>
      <div class="quick-stat-label">Chi nhiều nhất hôm nay</div>
    </div>
  `;
}

/* ==================================================================
   RECENT LIST & SWIPE (Ép cứng Inline Style)
   ================================================================== */
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
        if (!isDragging) {
          isDragging = true;
        }
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
    const isAno = AI.isAnomalous(e.id);
    
    // [FIX] Ép cứng inline style để không bao giờ bị vỡ layout
    const wrapStyle = "position: relative; overflow: hidden; width: 100%; border-bottom: 1px solid var(--border-soft); background: var(--surface); border-radius: 0;";
    const actionStyle = "position: absolute; top: 0; right: 0; bottom: 0; display: flex; z-index: 1;";
    const itemStyle = "position: relative; z-index: 2; background: var(--surface); display: flex; align-items: center; gap: 12px; padding: 12px 8px; width: 100%; touch-action: pan-y; user-select: none; transition: transform 0.2s ease;";

    return `<div class="expense-swipe" style="${wrapStyle}">
      <div class="expense-swipe-actions" style="${actionStyle}">
        <button class="swipe-action-btn edit" data-edit-expense="${e.id}" style="width: 76px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--primary); color: #fff; font-size: 10px; font-weight: 700; border: none; cursor: pointer;">${ic('edit', 18)}<span style="margin-top: 2px;">Sửa</span></button>
        <button class="swipe-action-btn delete" data-del-expense="${e.id}" style="width: 76px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--danger); color: #fff; font-size: 10px; font-weight: 700; border: none; cursor: pointer;">${ic('trash', 18)}<span style="margin-top: 2px;">Xoá</span></button>
      </div>
      <div class="recent-item" data-swipe-row="${e.id}" style="${itemStyle}">
        <div class="recent-icon" style="background:${cat.color}; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 14px; flex-shrink: 0;">${escapeHtml(cat.name.charAt(0).toUpperCase())}</div>
        <div class="recent-meta" style="flex: 1; min-width: 0;">
          <div class="recent-title" style="font-size: 13px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(cat.name)}${e.note ? ' · ' + escapeHtml(e.note) : ''}${isAno ? ` <span style="color:var(--warning);">⚠</span>` : ''}</div>
          <div class="recent-sub" style="font-size: 11px; color: var(--text-soft); margin-top: 2px;">${fmtDate(e.date)} · ${getPayment(e.paymentMethod).name}</div>
        </div>
        <div class="recent-amount" style="font-size: 14px; font-weight: 800; color: var(--text); white-space: nowrap;">${fmtMoney(e.amount)}</div>
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

/* ==================================================================
   ENTRY — gọi từ main.js
   ================================================================== */
export function renderDashboard() {
  renderTodayOverview();
  renderStreakCard();
  renderInsightCard();
  renderRecentList();
}
