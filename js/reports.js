/* js/reports.js — V1.0
   Render tab Báo cáo: month nav, hero KPI, insights, donut, bar chart (tooltip),
   payment bars, weekly, top 10, và nút xuất PDF */

import {
  state, reportState,
  ic, escapeHtml,
  fmtMoney, fmtMoneyShort, fmtDate, monthLabel,
  daysInMonth,
  getMonthExpenses, getCategory,
  calcSummary, calcByCategory, calcByPayment, calcWeekly,
  generateInsights, renderDonut, exportPDF,
  hapticTap
} from './core.js';

/* ==================================================================
   MODULE STATE
   ================================================================== */
let barTooltipTimeout = null;
let currentBarActive = null;
let barInteractionSetup = false;

/* ==================================================================
   MAIN RENDER
   ================================================================== */
export function renderReports() {
  const reportMonth = reportState.month;

  document.getElementById('reportMonthLabel').textContent = monthLabel(reportMonth);

  const monthExp = getMonthExpenses(reportMonth);
  const prevExp = getMonthExpenses(new Date(reportMonth.getFullYear(), reportMonth.getMonth() - 1, 1));
  const { total, count } = calcSummary(monthExp);
  const prevTotal = calcSummary(prevExp).total;
  const days = daysInMonth(reportMonth.getFullYear(), reportMonth.getMonth());
  const avg = total / days;
  const largest = monthExp.reduce((m, e) => Math.max(m, Number(e.amount || 0)), 0);
  const diffPct = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : 0;

  let trendLine = 'Chưa có dữ liệu', trendIcon = 'minus';
  if (prevTotal > 0) {
    if (diffPct > 0) { trendLine = `Tăng ${Math.abs(diffPct).toFixed(0)}% vs tháng trước`; trendIcon = 'arrowUp'; }
    else if (diffPct < 0) { trendLine = `Giảm ${Math.abs(diffPct).toFixed(0)}% vs tháng trước`; trendIcon = 'arrowDown'; }
    else trendLine = 'Không đổi';
  }

  /* ---------- Hero ---------- */
  document.getElementById('reportHero').innerHTML = `
    <div class="report-hero-content">
      <div class="report-hero-label">${ic('dollarSign')}<span>Tổng chi tháng ${reportMonth.getMonth() + 1}</span></div>
      <div class="report-hero-value">${fmtMoney(total)}</div>
      <div class="report-hero-sub">${ic(trendIcon)}<span>${trendLine}</span></div>
    </div>
    <div class="report-hero-stats">
      <div class="report-hero-stat"><div class="report-hero-stat-label">Số GD</div><div class="report-hero-stat-value">${count}</div></div>
      <div class="report-hero-stat"><div class="report-hero-stat-label">TB/Ngày</div><div class="report-hero-stat-value">${fmtMoneyShort(Math.round(avg))}</div></div>
    </div>`;

  /* ---------- KPI grid ---------- */
  const budget = state.settings.monthlyBudget || 0;
  const budgetPct = budget > 0 ? (total / budget * 100) : 0;
  document.getElementById('reportKpis').innerHTML = `
    <div class="kpi"><div class="kpi-label">${ic('trendUp')} Lớn nhất</div><div class="kpi-value">${fmtMoneyShort(largest)}</div><div class="kpi-sub">Giao dịch đắt nhất</div></div>
    <div class="kpi kpi-${diffPct > 0 ? 'danger' : 'success'}"><div class="kpi-label">${diffPct > 0 ? ic('arrowUp') : ic('arrowDown')} So tháng trước</div><div class="kpi-value">${prevTotal > 0 ? (diffPct >= 0 ? '+' : '') + diffPct.toFixed(0) + '%' : '—'}</div><div class="kpi-sub">${prevTotal > 0 ? fmtMoneyShort(prevTotal) : 'Chưa có'}</div></div>
    <div class="kpi kpi-warning"><div class="kpi-label">${ic('calendar')} Ngày có chi</div><div class="kpi-value">${new Set(monthExp.map(e => e.date)).size}/${days}</div><div class="kpi-sub">Ngày phát sinh</div></div>
    <div class="kpi ${budget > 0 && budgetPct > 100 ? 'kpi-danger' : 'kpi-success'}"><div class="kpi-label">${ic('target')} Ngân sách</div><div class="kpi-value">${budget > 0 ? budgetPct.toFixed(0) + '%' : '—'}</div><div class="kpi-sub">${budget > 0 ? (budgetPct > 100 ? 'Vượt ' + fmtMoneyShort(total - budget) : 'Còn ' + fmtMoneyShort(budget - total)) : 'Chưa đặt'}</div></div>`;

  /* ---------- Insights ---------- */
  const insights = generateInsights(monthExp, total, prevTotal, days);
  document.getElementById('reportInsights').innerHTML = insights.length === 0
    ? `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:12px;">Chưa có dữ liệu để phân tích</div>`
    : `<div class="section-title"><div class="section-title-left"><span class="section-title-icon">${ic('infoCircle')}</span><span class="section-title-text">Nhận xét</span></div></div><div class="insight-list">${insights.map(i => `<div class="insight-item"><div class="insight-icon">${ic(i.icon)}</div><span>${i.html}</span></div>`).join('')}</div>`;

  /* ---------- Donut (by category) ---------- */
  const byCat = calcByCategory(monthExp);
  renderDonut(document.getElementById('reportDonut'), byCat.map(b => ({ value: b.value, color: b.category.color })), total);
  document.getElementById('reportLegend').innerHTML = byCat.length === 0
    ? `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:11.5px;">Chưa có dữ liệu</div>`
    : byCat.map(b => {
        const pct = total > 0 ? (b.value / total * 100) : 0;
        return `<div class="legend-item"><span class="legend-dot" style="background:${b.category.color};"></span><span class="legend-name">${escapeHtml(b.category.name)}</span><span class="legend-value">${fmtMoney(b.value)}</span><span class="legend-pct">${pct.toFixed(0)}%</span></div>`;
      }).join('');

  /* ---------- Bar chart (daily) ---------- */
  const dailyMap = new Map(), dailyCount = new Map();
  monthExp.forEach(e => {
    const d = parseInt(e.date.split('-')[2], 10);
    dailyMap.set(d, (dailyMap.get(d) || 0) + Number(e.amount));
    dailyCount.set(d, (dailyCount.get(d) || 0) + 1);
  });
  const maxDay = Math.max(...Array.from(dailyMap.values()), 0);
  document.getElementById('reportBarsMax').textContent = maxDay > 0 ? 'Max: ' + fmtMoneyShort(maxDay) : '—';
  document.getElementById('reportBarsLabel').textContent = `${new Set(monthExp.map(e => e.date)).size}/${days} ngày`;

  let barsHtml = '';
  for (let d = 1; d <= days; d++) {
    const val = dailyMap.get(d) || 0;
    const cnt = dailyCount.get(d) || 0;
    const pct = maxDay > 0 ? val / maxDay * 100 : 0;
    const show = days <= 15 || d % 2 === 0 || d === 1 || d === days;
    barsHtml += `<div class="bar-col" data-day="${d}" data-amount="${val}" data-count="${cnt}"><div class="bar" style="height:${pct}%;"></div>${show ? `<div class="bar-label">${d}</div>` : '<div class="bar-label"></div>'}</div>`;
  }
  document.getElementById('reportBars').innerHTML = barsHtml;

  /* ---------- Payment bars ---------- */
  const byPayment = calcByPayment(monthExp);
  const maxPay = Math.max(...byPayment.map(p => p.value), 1);
  document.getElementById('reportPayments').innerHTML = byPayment.length === 0
    ? `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:11.5px;">Chưa có dữ liệu</div>`
    : byPayment.map(p => {
        const pct = total > 0 ? (p.value / total * 100) : 0;
        const widthPct = (p.value / maxPay) * 100;
        return `<div class="payment-row"><div class="payment-head"><span class="payment-label"><span class="payment-dot" style="background:${p.payment.color};"></span>${escapeHtml(p.payment.name)}</span><span class="payment-value">${fmtMoney(p.value)} (${pct.toFixed(0)}%)</span></div><div class="payment-track"><div class="payment-fill" style="width:${widthPct}%;background:${p.payment.color};"></div></div></div>`;
      }).join('');

  /* ---------- Weekly ---------- */
  const weekly = calcWeekly(monthExp, reportMonth.getFullYear(), reportMonth.getMonth());
  document.getElementById('reportWeekly').innerHTML = weekly.map(w => 
    `<div class="weekly-item"><div class="weekly-label">${w.label}</div><div class="weekly-days">${w.days}</div><div class="weekly-value">${fmtMoneyShort(w.total)}</div><div class="weekly-count">${w.count} GD</div></div>`
  ).join('');

  /* ---------- Top 10 ---------- */
  const top = [...monthExp].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 10);
  document.getElementById('reportTopLabel').textContent = `${top.length}/${monthExp.length}`;
  document.getElementById('reportTop').innerHTML = top.length === 0
    ? `<div style="text-align:center;padding:24px;color:var(--text-soft);font-size:12px;">Chưa có chi tiêu</div>`
    : `<div class="top-table-wrap"><table class="top-table"><thead><tr><th>#</th><th>Danh mục</th><th>Ghi chú</th><th class="right">Số tiền</th></tr></thead><tbody>${top.map((e, i) => { const cat = getCategory(e.categoryId); return `<tr><td><span class="rank-badge">${i + 1}</span></td><td><div class="top-cat-cell"><span class="top-cat-dot" style="background:${cat.color};"></span>${escapeHtml(cat.name)}</div></td><td class="top-note-cell">${escapeHtml(e.note || '—')}</td><td class="amount-cell">${fmtMoney(e.amount)}</td></tr>`; }).join('')}</tbody></table></div>`;
}

/* ==================================================================
   BAR CHART TOOLTIP
   ================================================================== */
function showBarTooltip(el, cx, cy) {
  const day = el.dataset.day;
  const amount = Number(el.dataset.amount || 0);
  const count = Number(el.dataset.count || 0);
  const tt = document.getElementById('barTooltip');

  if (currentBarActive) currentBarActive.classList.remove('active');
  el.classList.add('active');
  currentBarActive = el;

  tt.innerHTML = `<div class="bar-tooltip-label">Ngày ${day}/${reportState.month.getMonth() + 1}</div><div class="bar-tooltip-value">${fmtMoney(amount)}</div><div class="bar-tooltip-sub">${count} giao dịch</div>`;
  const rect = el.getBoundingClientRect();
  tt.classList.add('show');
  const ttR = tt.getBoundingClientRect();

  let left = cx - ttR.width / 2;
  let top = rect.top - ttR.height - 10;
  if (left < 10) left = 10;
  if (left + ttR.width > window.innerWidth - 10) left = window.innerWidth - ttR.width - 10;
  if (top < 10) top = rect.bottom + 10;
  tt.style.left = left + 'px';
  tt.style.top = top + 'px';

  if (barTooltipTimeout) clearTimeout(barTooltipTimeout);
  barTooltipTimeout = setTimeout(() => {
    tt.classList.remove('show');
    if (currentBarActive) { currentBarActive.classList.remove('active'); currentBarActive = null; }
  }, 2500);
  hapticTap();
}

function setupBarInteraction() {
  if (barInteractionSetup) return;
  const chart = document.getElementById('reportBars');
  if (!chart) return;
  barInteractionSetup = true;

  chart.addEventListener('click', (e) => {
    const bar = e.target.closest('.bar-col');
    if (bar) showBarTooltip(bar, e.clientX || bar.getBoundingClientRect().left + bar.getBoundingClientRect().width / 2, e.clientY);
  });

  let pressTimer = null;
  chart.addEventListener('touchstart', (e) => {
    const bar = e.target.closest('.bar-col');
    if (!bar) return;
    pressTimer = setTimeout(() => {
      const t = e.touches[0];
      showBarTooltip(bar, t.clientX, t.clientY);
    }, 300);
  }, { passive: true });
  chart.addEventListener('touchend', () => { if (pressTimer) clearTimeout(pressTimer); });
  chart.addEventListener('touchmove', () => { if (pressTimer) clearTimeout(pressTimer); }, { passive: true });
}

/* ==================================================================
   ENTRY — render tab
   ================================================================== */
export function renderReportsTab() {
  renderReports();
  setupBarInteraction();
}

/* ==================================================================
   BIND EVENTS (called once by main.js)
   ================================================================== */
export function bindReportTabEvents() {
  document.getElementById('prevMonth').addEventListener('click', () => {
    hapticTap();
    reportState.month = new Date(reportState.month.getFullYear(), reportState.month.getMonth() - 1, 1);
    renderReports();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    hapticTap();
    reportState.month = new Date(reportState.month.getFullYear(), reportState.month.getMonth() + 1, 1);
    renderReports();
  });

  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    hapticTap();
    exportPDF();
  });
}