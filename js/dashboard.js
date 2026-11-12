/* js/dashboard.js — V1.4
   V1.4: Thêm Thẻ Gamification (Chuỗi ngày) và Thẻ Insight (So sánh tháng).
   Render tab Tổng quan: overview Hôm nay, Streak, Insight, danh sách giao dịch gần đây. */

import {
  state, AI,
  ic, escapeHtml,
  fmtMoney, fmtMoneyShort, fmtDate, dayIso,
  getDayExpenses,
  getMonthExpenses, getLastMonth,
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
   STREAK — Đếm chuỗi ngày ghi chép liên tiếp
   ================================================================== */
function calculateStreak() {
  if (!state.expenses || state.expenses.length === 0) return 0;
  
  const dates = new Set(state.expenses.map(e => e.date));
  let streak = 0;
  let checkDate = new Date();
  
  // Nếu hôm nay chưa nhập, kiểm tra xem hôm qua có nhập không để duy trì chuỗi
  if (!dates.has(dayIso(checkDate))) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (!dates.has(dayIso(checkDate))) return 0; // Đứt chuỗi
  }
  
  // Đếm ngược thời gian
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

/* ==================================================================
   INSIGHT — So sánh tháng này vs tháng trước
   ================================================================== */
function renderInsightCard() {
  const el = document.getElementById('insightCard');
  if (!el) return;
  
  const now = new Date();
  const curTotal = calcSummary(getMonthExpenses(now)).total;
  const prevTotal = calcSummary(getMonthExpenses(getLastMonth())).total;
  
  let icon = '💡';
  let text = 'Chưa đủ dữ liệu';
  let color = 'var(--text-muted)';
  
  if (prevTotal > 0) {
    const diff = curTotal - prevTotal;
    const pct = Math.abs((diff / prevTotal) * 100).toFixed(0);
    
    if (diff > 0) {
      text = `Tăng ${pct}% so với tháng trước`;
      icon = '📈';
      color = 'var(--danger)';
    } else if (diff < 0) {
      text = `Giảm ${pct}% so với tháng trước`;
      icon = '📉';
      color = 'var(--success)';
    } else {
      text = 'Chi tiêu bằng tháng trước';
      icon = '➖';
      color = 'var(--text-soft)';
    }
  } else if (curTotal > 0) {
    text = 'Khởi đầu tháng mới';
    icon = '✨';
    color = 'var(--primary)';
  }

  el.innerHTML = `
    <div class="quick-stat-icon" style="background: var(--surface-2); font-size: 20px;">${icon}</div>
    <div class="quick-stat-info">
      <div class="quick-stat-value" style="color: ${color}; font-size: 12px; line-height: 1.2; margin-bottom: 2px;">${text}</div>
      <div class="quick-stat-label">Nhận xét tháng</div>
    </div>
  `;
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
  renderStreakCard();   // MỚI
  renderInsightCard();  // MỚI
  renderRecentList();
}
