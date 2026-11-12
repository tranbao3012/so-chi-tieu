/* js/reports.js — V1.3
   V1.3: Ép cứng inline style cho Legend, Insights, Payments, và Top Table để chống vỡ giao diện trên mobile. */

import {
  state, reportState,
  ic, escapeHtml,
  fmtMoney, fmtMoneyShort, fmtDate, monthLabel,
  daysInMonth,
  getMonthExpenses, getCategory, calcByCategory,
  calcSummary, calcByPayment,
  generateInsights, renderDonut, exportPDF,
  hapticTap
} from './core.js';

/* ==================================================================
   MODULE STATE
   ================================================================== */
let barInteractionSetup = false;
let currentBarActive = null;

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
  const uniqueDays = new Set(monthExp.map(e => e.date)).size;
  
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
    <div class="kpi kpi-warning"><div class="kpi-label">${ic('calendar')} Ngày có chi</div><div class="kpi-value">${uniqueDays}/${days}</div><div class="kpi-sub">Ngày phát sinh</div></div>
    <div class="kpi ${budget > 0 && budgetPct > 100 ? 'kpi-danger' : 'kpi-success'}"><div class="kpi-label">${ic('target')} Ngân sách</div><div class="kpi-value">${budget > 0 ? budgetPct.toFixed(0) + '%' : '—'}</div><div class="kpi-sub">${budget > 0 ? (budgetPct > 100 ? 'Vượt ' + fmtMoneyShort(total - budget) : 'Còn ' + fmtMoneyShort(budget - total)) : 'Chưa đặt'}</div></div>`;

  /* ---------- Insights (FIXED INLINE) ---------- */
  const insights = generateInsights(monthExp, total, prevTotal, days);
  document.getElementById('reportInsights').innerHTML = insights.length === 0
    ? `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:12px;">Chưa có dữ liệu để phân tích</div>`
    : `<div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
         <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:7px; background:var(--primary-soft); color:var(--primary);">${ic('infoCircle', 14)}</span>
         <span style="font-size:14px; font-weight:800; color:var(--text);">Nhận xét</span>
       </div>
       <div style="display:flex; flex-direction:column; gap:8px;">
         ${insights.map(i => `<div style="display:flex; align-items:flex-start; gap:8px; padding:10px 12px; background:var(--surface-2); border-radius:8px; border-left:3px solid var(--primary); font-size:12.5px; line-height:1.5; color:var(--text);">
           <div style="flex-shrink:0; margin-top:2px;">${ic(i.icon, 16)}</div>
           <div>${i.html}</div>
         </div>`).join('')}
       </div>`;

  /* ---------- Donut (by category) ---------- */
  const byCat = calcByCategory(monthExp);
  renderDonut(document.getElementById('reportDonut'), byCat.map(b => ({ value: b.value, color: b.category.color })), total);
  
  // Legend (FIXED INLINE)
  document.getElementById('reportLegend').innerHTML = byCat.length === 0
    ? `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:11.5px;">Chưa có dữ liệu</div>`
    : byCat.map(b => {
        const pct = total > 0 ? (b.value / total * 100) : 0;
        return `<div style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-bottom:1px solid var(--border-soft);">
          <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
            <span style="background:${b.category.color}; width:10px; height:10px; border-radius:2px; flex-shrink:0;"></span>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:600; font-size:12px; color:var(--text);">${escapeHtml(b.category.name)}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
            <span style="font-weight:700; font-size:11.5px; color:var(--text-muted);">${fmtMoney(b.value)}</span>
            <span style="font-size:10.5px; color:var(--text-soft); width:32px; text-align:right;">${pct.toFixed(0)}%</span>
          </div>
        </div>`;
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
  document.getElementById('reportBarsLabel').textContent = `${uniqueDays}/${days} ngày`;

  let barsHtml = '';
  for (let d = 1; d <= days; d++) {
    const val = dailyMap.get(d) || 0;
    const cnt = dailyCount.get(d) || 0;
    const pct = maxDay > 0 ? val / maxDay * 100 : 0;
    const show = days <= 15 || d % 2 === 0 || d === 1 || d === days;
    // FIXED INLINE STYLE CHO CỘT
    barsHtml += `<div class="bar-col" data-day="${d}" data-amount="${val}" data-count="${cnt}" style="flex:1; min-width:8px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; position:relative; touch-action:none; user-select:none;">
      <div class="bar" style="width:100%; max-width:24px; height:${pct}%; background:var(--primary); border-radius:3px 3px 0 0; min-height:2px;"></div>
      ${show ? `<div style="font-size:8.5px; color:var(--text-soft); margin-top:4px; pointer-events:none;">${d}</div>` : '<div style="font-size:8.5px; margin-top:4px; pointer-events:none;">&nbsp;</div>'}
    </div>`;
  }
  document.getElementById('reportBars').innerHTML = barsHtml;

  /* ---------- Payment bars (FIXED INLINE) ---------- */
  const byPayment = calcByPayment(monthExp);
  const maxPay = Math.max(...byPayment.map(p => p.value), 1);
  document.getElementById('reportPayments').innerHTML = byPayment.length === 0
    ? `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:11.5px;">Chưa có dữ liệu</div>`
    : byPayment.map(p => {
        const pct = total > 0 ? (p.value / total * 100) : 0;
        const widthPct = (p.value / maxPay) * 100;
        return `<div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="display:flex; align-items:center; gap:6px; font-weight:700; font-size:12.5px; color:var(--text);">
              <span style="width:8px; height:8px; border-radius:2px; background:${p.payment.color}; display:inline-block;"></span>
              ${escapeHtml(p.payment.name)}
            </span>
            <span style="font-weight:700; font-size:11.5px; color:var(--text-muted);">${fmtMoney(p.value)} (${pct.toFixed(0)}%)</span>
          </div>
          <div style="height:8px; background:var(--surface-2); border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${widthPct}%; background:${p.payment.color}; border-radius:4px;"></div>
          </div>
        </div>`;
      }).join('');

  /* ---------- Top Danh Mục (FIXED INLINE TABLE) ---------- */
  const allCats = calcByCategory(monthExp);
  document.getElementById('reportTopLabel').textContent = `${allCats.length} danh mục`;
  document.getElementById('reportTop').innerHTML = allCats.length === 0
    ? `<div style="text-align:center;padding:24px;color:var(--text-soft);font-size:12px;">Chưa có chi tiêu</div>`
    : `<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
        <thead><tr style="border-bottom:1px solid var(--border-soft);">
          <th style="padding:10px 8px; color:var(--text-soft); font-weight:700; font-size:11px;">Danh mục</th>
          <th style="padding:10px 8px; color:var(--text-soft); font-weight:700; font-size:11px; text-align:right;">Số tiền</th>
          <th style="padding:10px 8px; color:var(--text-soft); font-weight:700; font-size:11px; text-align:right;">Tỷ trọng</th>
        </tr></thead>
        <tbody>${allCats.map(b => {
          const pct = total > 0 ? (b.value / total * 100) : 0;
          return `<tr style="border-bottom:1px solid var(--border-soft);">
            <td style="padding:12px 8px; font-weight:600; color:var(--text); display:flex; align-items:center; gap:8px;">
              <span style="width:10px; height:10px; border-radius:2px; background:${b.category.color}; display:inline-block; flex-shrink:0;"></span>
              ${escapeHtml(b.category.name)}
            </td>
            <td style="padding:12px 8px; text-align:right; font-weight:700; color:var(--text);">${fmtMoney(b.value)}</td>
            <td style="padding:12px 8px; text-align:right; font-weight:600; color:var(--text-soft);">${pct.toFixed(1)}%</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>`;
}

/* ==================================================================
   BAR CHART TOOLTIP
   ================================================================== */
function showBarTooltip(el) {
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

  let left = rect.left + rect.width / 2 - ttR.width / 2;
  let top = rect.top - ttR.height - 10;
  if (left < 10) left = 10;
  if (left + ttR.width > window.innerWidth - 10) left = window.innerWidth - ttR.width - 10;
  if (top < 10) top = rect.bottom + 10;
  
  tt.style.left = left + 'px';
  tt.style.top = top + 'px';
  hapticTap();
}

function hideBarTooltip() {
  const tt = document.getElementById('barTooltip');
  if (tt) tt.classList.remove('show');
  if (currentBarActive) {
    currentBarActive.classList.remove('active');
    currentBarActive = null;
  }
}

function setupBarInteraction() {
  if (barInteractionSetup) return;
  const chart = document.getElementById('reportBars');
  if (!chart) return;
  barInteractionSetup = true;

  chart.addEventListener('pointerdown', (e) => {
    const bar = e.target.closest('.bar-col');
    if (bar) {
      e.preventDefault(); 
      showBarTooltip(bar);
    }
  });

  chart.addEventListener('pointerup', hideBarTooltip);
  chart.addEventListener('pointercancel', hideBarTooltip);
  chart.addEventListener('pointerleave', hideBarTooltip);
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
