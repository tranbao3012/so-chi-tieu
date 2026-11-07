/* js/dashboard.js — V1.1
   Render tab Tổng quan: overview Hôm nay, health, AI insights,
   phân tích kế toán 50/30/20, danh sách giao dịch gần đây.
   V1.1: Xoá renderMonthOverview() và các import không còn dùng. */

import {
  state, AI, ACCT,
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
   HEALTH CARD
   ================================================================== */
function renderHealthCard() {
  const el = document.getElementById('healthCard');
  if (!el) return;

  const score = AI.healthScore();
  const info = AI.healthInfo();

  el.innerHTML = `
    <div class="health-header">
      <div class="health-icon">${ic('shield')}</div>
      <div class="health-label">Sức khoẻ tài chính</div>
    </div>
    <div class="health-score-wrap">
      <div class="health-score">${score}<span class="health-score-max">/100</span></div>
      <div class="health-status-wrap">
        <div class="health-status">${ic(info.icon)}<span>${info.label}</span></div>
        <div class="health-desc">${info.desc}</div>
      </div>
    </div>`;
}

/* ==================================================================
   AI ASSISTANT
   ================================================================== */
function renderAIAssistant() {
  const el = document.getElementById('aiAssistant');
  if (!el) return;

  if (!state.settings.aiEnabled) {
    el.innerHTML = `
      <div class="ai-assistant-header">
        <div class="ai-assistant-icon">${ic('brain')}</div>
        <div><div class="ai-assistant-title">AI Assistant</div><div class="ai-assistant-sub">Đã tắt</div></div>
      </div>
      <div style="text-align:center;padding:20px 16px;color:var(--text-soft);font-size:12px;">Bật trong Cài đặt để xem phân tích.</div>`;
    return;
  }

  const insights = AI.getLiveInsights();
  el.innerHTML = `
    <div class="ai-assistant-header">
      <div class="ai-assistant-icon">${ic('sparkles')}</div>
      <div style="flex:1;"><div class="ai-assistant-title">AI Assistant</div><div class="ai-assistant-sub">${insights.length} nhận xét</div></div>
    </div>
    <div class="insight-list">
      ${insights.length === 0
        ? `<div style="text-align:center;padding:20px 12px;color:var(--text-soft);font-size:12px;">Chưa có đủ dữ liệu. Thêm giao dịch để AI nhận xét.</div>`
        : insights.map(i => `<div class="insight-item ${i.type}"><div class="insight-icon">${ic(i.icon)}</div><div style="flex:1;min-width:0;">${i.text}</div></div>`).join('')}
    </div>`;
}

/* ==================================================================
   ACCOUNTING (50/30/20 + ratios)
   ================================================================== */
function renderAccounting() {
  const el = document.getElementById('accountingCard');
  if (!el) return;

  if (!state.settings.accountingEnabled) {
    el.innerHTML = `
      <div class="section-title"><div class="section-title-left"><span class="section-title-icon">${ic('barChart')}</span><span class="section-title-text">Phân tích kế toán</span></div></div>
      <div style="text-align:center;padding:16px;color:var(--text-soft);font-size:12px;">Bật trong Cài đặt để xem.</div>`;
    return;
  }

  const rule = ACCT.analyze503020();
  const sr = ACCT.savingsRate();
  const burn = ACCT.burnRate();
  const conc = ACCT.categoryConcentration();
  const risk = ACCT.riskLevel();

  const row = (label, icon, current, targetPct, pct, cls) => `
    <div class="rule-row ${cls}">
      <div class="rule-header">
        <div class="rule-label"><div class="rule-icon">${ic(icon)}</div>${label}</div>
        <div class="rule-amount">${fmtMoney(current)}</div>
      </div>
      <div class="rule-track">
        <div class="rule-target" style="left:${Math.min(100, targetPct)}%"></div>
        <div class="rule-fill" style="width:${Math.min(100, pct)}%"></div>
      </div>
      <div class="rule-meta"><span>${pct.toFixed(1)}%</span><span>Mục tiêu ${targetPct}%</span></div>
    </div>`;

  el.innerHTML = `
    <div class="section-title">
      <div class="section-title-left"><span class="section-title-icon">${ic('barChart')}</span><span class="section-title-text">Phân tích kế toán</span></div>
      <small>${rule.income > 0 ? fmtMoneyShort(rule.income) : 'Chưa có thu nhập'}</small>
    </div>
    <div class="acct-grid">
      <div>
        ${rule.income > 0 ? `
          ${row('Thiết yếu', 'shield', rule.needs, 50, rule.needsPct, 'needs')}
          ${row('Mong muốn', 'sparkles', rule.wants, 30, rule.wantsPct, 'wants')}
          ${row('Tiết kiệm', 'piggyBank', rule.savings, 20, rule.savingsPct, 'savings')}
        ` : `<div style="padding:16px;text-align:center;color:var(--text-soft);font-size:12px;line-height:1.55;">Nhập <strong style="color:var(--text);">Thu nhập</strong> trong Cài đặt để xem phân tích 50/30/20.</div>`}
      </div>
      <div class="acct-ratios">
        ${sr ? `<div class="ratio-item"><div class="ratio-icon ${sr.rate >= 20 ? 'good' : sr.rate >= 10 ? 'warn' : 'bad'}">${ic('piggyBank')}</div><div class="ratio-meta"><div class="ratio-label">Tiết kiệm</div><div class="ratio-value">${sr.rate.toFixed(1)}%</div><div class="ratio-sub">${fmtMoney(sr.savings)}</div></div></div>` : ''}
        ${burn ? `<div class="ratio-item"><div class="ratio-icon ${burn.status === 'danger' ? 'bad' : burn.status === 'warning' ? 'warn' : 'good'}">${ic('activity')}</div><div class="ratio-meta"><div class="ratio-label">Tốc độ chi</div><div class="ratio-value">${burn.burnPct.toFixed(0)}%</div><div class="ratio-sub">${burn.burnPct > 100 ? 'Vượt dự kiến' : 'Trong tầm KS'}</div></div></div>` : ''}
        ${conc ? `<div class="ratio-item"><div class="ratio-icon ${conc.top1Pct > 60 ? 'warn' : 'good'}">${ic('pieChart')}</div><div class="ratio-meta"><div class="ratio-label">Đa dạng</div><div class="ratio-value">${conc.diversity.toFixed(0)}/100</div><div class="ratio-sub">Top 1: ${conc.top1Pct.toFixed(0)}%</div></div></div>` : ''}
        <div class="ratio-item" style="background:var(--${risk === 'high' ? 'danger' : risk === 'medium' ? 'warning' : 'success'}-soft);">
          <div class="ratio-icon ${risk === 'high' ? 'bad' : risk === 'medium' ? 'warn' : 'good'}">${ic('alertTriangle')}</div>
          <div class="ratio-meta"><div class="ratio-label">Rủi ro</div><div class="ratio-value">${risk === 'high' ? 'Cao' : risk === 'medium' ? 'TB' : 'Thấp'}</div><div class="ratio-sub">${risk === 'high' ? 'Cần điều chỉnh' : risk === 'medium' ? 'Chú ý' : 'Ổn định'}</div></div>
        </div>
      </div>
    </div>`;
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
  renderHealthCard();
  renderAIAssistant();
  renderAccounting();
  renderRecentList();
}
