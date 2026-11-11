/* js/dashboard.js — V1.3
   Render tab Tổng quan: overview Hôm nay và danh sách giao dịch gần đây.
   V1.3: Xóa Ô 2 (Sức khỏe & AI) và Ô 3 (Phân tích kế toán) theo yêu cầu. */

import {
  state, AI,
  ic, escapeHtml,
  fmtMoney, fmtMoneyShort, fmtDate, dayIso,
  getDayExpenses,
  calcSummary, calcByCategory, calcTrend,
  getCategory, getPayment,
  renderSparkline
} from './core.js';

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
  const avg = todayExp.length > 0 ? total / todayExp.length : 0;
  const topCat = calcByCategory(todayExp)[0];

  el.innerHTML = `
    <div class="overview-header">
      <div class="overview-title"><span class="overview-icon today">${ic('sun')}</span>Hôm nay</div>
      <span class="overview-date">${fmtDate(dayIso(today))}</span>
    </div>
    <div class="overview-main-row">
      <div class="overview-big">${fmtMoney(total)}</div>
      <div class="spark-wrap" id="todaySpark"></div>
    </div>
    <div class="overview-trend ${trend.type}">${ic(trend.icon)}<span>${trend.text}</span></div>
    <div class="overview-mini-kpis">
      <div class="mini-kpi"><div class="mini-kpi-label">Số GD</div><div class="mini-kpi-value">${todayExp.length}</div></div>
      <div class="mini-kpi"><div class="mini-kpi-label">TB/GD</div><div class="mini-kpi-value">${fmtMoneyShort(Math.round(avg))}</div></div>
      <div class="mini-kpi"><div class="mini-kpi-label">Top</div><div class="mini-kpi-value">${topCat ? escapeHtml(topCat.category.name) : '—'}</div></div>
    </div>`;

  renderSparkline(document.getElementById('todaySpark'), AI.sparklineData(7), '#f97316');
}

/* ==================================================================
   RECENT LIST
   ================================================================== */
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
    return `<div class="recent-item">
      <div class="recent-icon" style="background:${cat.color};">${escapeHtml(cat.name.charAt(0).toUpperCase())}</div>
      <div class="recent-meta">
        <div class="recent-title">${escapeHtml(cat.name)}${e.note ? ' · ' + escapeHtml(e.note) : ''}${isAno ? ` <span class="anomaly-badge">⚠</span>` : ''}</div>
        <div class="recent-sub">${fmtDate(e.date)} · ${getPayment(e.paymentMethod).name}</div>
      </div>
      <div class="recent-amount">${fmtMoney(e.amount)}</div>
    </div>`;
  }).join('');
}

/* ==================================================================
   ENTRY — gọi từ main.js
   ================================================================== */
export function renderDashboard() {
  renderTodayOverview();
  renderRecentList();
}
