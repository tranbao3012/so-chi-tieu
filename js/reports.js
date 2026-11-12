/* js/reports.js — V1.9 (Bar Chart Color Fix + Tooltip Click-based)
   Sửa 2 lỗi:
   1. Cột không có màu → dùng class .has-value / .is-empty, gradient primary.
   2. Tooltip flash → dùng click + timer 3s, bấm ngoài để ẩn.
   Bỏ touch-action: none → cho phép scroll ngang chart. */

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

let barInteractionSetup = false;
let currentBarActive = null;

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

  let trendHtml = '';
  if (prevTotal > 0) {
    if (diffPct > 0) { trendHtml = `<div class="report-hero-sub up">${ic('arrowUp', 12)}<span>Tăng ${Math.abs(diffPct).toFixed(0)}% so với tháng trước</span></div>`; }
    else if (diffPct < 0) { trendHtml = `<div class="report-hero-sub down">${ic('arrowDown', 12)}<span>Giảm ${Math.abs(diffPct).toFixed(0)}% so với tháng trước</span></div>`; }
    else { trendHtml = `<div class="report-hero-sub">${ic('minus', 12)}<span>Không đổi</span></div>`; }
  } else if (total > 0) {
    trendHtml = `<div class="report-hero-sub" style="color:var(--text-soft);">${ic('minus', 12)}<span>Chưa có dữ liệu tháng trước</span></div>`;
  } else {
    trendHtml = `<div class="report-hero-sub" style="color:var(--text-soft);">${ic('minus', 12)}<span>Chưa có dữ liệu</span></div>`;
  }

  /* ---------- Hero ---------- */
  document.getElementById('reportHero').innerHTML = `
    <div class="report-hero-label">${ic('dollarSign', 12)}<span>Tổng chi tháng ${reportMonth.getMonth() + 1}</span></div>
    <div class="report-hero-value">${fmtMoney(total)}</div>
    ${trendHtml}
    <div class="report-hero-stats">
      <div>
        <div class="report-hero-stat-label">Số GD</div>
        <div class="report-hero-stat-value">${count}</div>
      </div>
      <div>
        <div class="report-hero-stat-label">TB/Ngày</div>
        <div class="report-hero-stat-value">${fmtMoneyShort(Math.round(avg))}</div>
      </div>
    </div>`;

  /* ---------- KPI grid ---------- */
  const budget = state.settings.monthlyBudget || 0;
  const budgetPct = budget > 0 ? (total / budget * 100) : 0;
  document.getElementById('reportKpis').innerHTML = `
    <div class="kpi">
      <div class="kpi-label">${ic('trendUp', 10)} Lớn nhất</div>
      <div class="kpi-value">${fmtMoneyShort(largest)}</div>
      <div class="kpi-sub">GD đắt nhất</div>
    </div>
    <div class="kpi" style="border-left-color: ${diffPct > 0 ? 'var(--danger)' : 'var(--primary)'};">
      <div class="kpi-label">${ic(diffPct > 0 ? 'arrowUp' : 'arrowDown', 10)} So tháng trước</div>
      <div class="kpi-value">${prevTotal > 0 ? (diffPct >= 0 ? '+' : '') + diffPct.toFixed(0) + '%' : '—'}</div>
      <div class="kpi-sub">${prevTotal > 0 ? fmtMoneyShort(prevTotal) : 'Chưa có'}</div>
    </div>
    <div class="kpi" style="border-left-color: var(--warning);">
      <div class="kpi-label">${ic('calendar', 10)} Ngày có chi</div>
      <div class="kpi-value">${uniqueDays}/${days}</div>
      <div class="kpi-sub">Ngày phát sinh</div>
    </div>
    <div class="kpi" style="border-left-color: ${budget > 0 && budgetPct > 100 ? 'var(--danger)' : 'var(--primary)'};">
      <div class="kpi-label">${ic('target', 10)} Ngân sách</div>
      <div class="kpi-value">${budget > 0 ? budgetPct.toFixed(0) + '%' : '—'}</div>
      <div class="kpi-sub">${budget > 0 ? (budgetPct > 100 ? 'Vượt ' + fmtMoneyShort(total - budget) : 'Còn ' + fmtMoneyShort(budget - total)) : 'Chưa đặt'}</div>
    </div>`;

  /* ---------- Insights ---------- */
  const insights = generateInsights(monthExp, total, prevTotal, days);
  document.getElementById('reportInsights').innerHTML = insights.length === 0
    ? `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:12px;">Chưa có dữ liệu để phân tích</div>`
    : `<div class="section-title"><div class="section-title-left"><span class="section-title-text">Nhận xét</span></div></div>
       <div class="insight-list">
         ${insights.map(i => `
           <div class="insight-row">
             <div class="insight-icon-wrap">${ic(i.icon, 14)}</div>
             <div class="insight-text">${i.html}</div>
           </div>
         `).join('')}
       </div>`;

  /* ---------- Donut ---------- */
  const byCat = calcByCategory(monthExp);
  renderDonut(document.getElementById('reportDonut'), byCat.map(b => ({ value: b.value, color: b.category.color })), total);
  
  document.getElementById('reportLegend').innerHTML = byCat.length === 0
    ? `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:11px;">Chưa có dữ liệu</div>`
    : byCat.map(b => {
        const pct = total > 0 ? (b.value / total * 100) : 0;
        return `<div class="legend-item">
          <span class="legend-dot" style="background:${b.category.color};"></span>
          <span class="legend-name">${escapeHtml(b.category.name)}</span>
          <span class="legend-value">${fmtMoneyShort(b.value)}</span>
          <span class="legend-pct">${pct.toFixed(0)}%</span>
        </div>`;
      }).join('');

  /* ---------- Bar chart (FIXED) ---------- */
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
    const pct = maxDay > 0 ? (val / maxDay) * 100 : 0;
    const hasVal = val > 0;
    const show = days <= 15 || d % 2 === 0 || d === 1 || d === days;
    const barCls = hasVal ? 'bar has-value' : 'bar is-empty';
    const barH = hasVal ? Math.max(pct, 1) : 0;
    barsHtml += `<div class="bar-col" data-day="${d}" data-amount="${val}" data-count="${cnt}">
      <div class="${barCls}" style="height:${barH}%;"></div>
      <div class="bar-label">${show ? d : ''}</div>
    </div>`;
  }
  document.getElementById('reportBars').innerHTML = barsHtml;

  /* ---------- Payment bars ---------- */
  const byPayment = calcByPayment(monthExp);
  const maxPay = Math.max(...byPayment.map(p => p.value), 1);
  document.getElementById('reportPayments').innerHTML = byPayment.length === 0
    ? `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:11px;">Chưa có dữ liệu</div>`
    : byPayment.map(p => {
        const pct = total > 0 ? (p.value / total * 100) : 0;
        const widthPct = (p.value / maxPay) * 100;
        return `<div class="payment-row">
          <div class="payment-head">
            <span class="payment-label"><span class="payment-dot" style="background:${p.payment.color};"></span>${escapeHtml(p.payment.name)}</span>
            <span class="payment-value">${fmtMoneyShort(p.value)} (${pct.toFixed(0)}%)</span>
          </div>
          <div class="payment-track">
            <div class="payment-fill" style="width:${widthPct}%; background:${p.payment.color};"></div>
          </div>
        </div>`;
      }).join('');

  /* ---------- Top Danh Mục ---------- */
  const allCats = calcByCategory(monthExp);
  document.getElementById('reportTopLabel').textContent = `${allCats.length} danh mục`;
  document.getElementById('reportTop').innerHTML = allCats.length === 0
    ? `<div style="text-align:center;padding:24px;color:var(--text-soft);font-size:12px;">Chưa có chi tiêu</div>`
    : `<table class="top-table">
        <thead>
          <tr><th>Danh mục</th><th>Số tiền</th></tr>
        </thead>
        <tbody>
          ${allCats.map(b => {
            return `<tr>
              <td>
                <div class="top-cat-cell">
                  <span class="top-cat-dot" style="background:${b.category.color};"></span>
                  ${escapeHtml(b.category.name)}
                </div>
              </td>
              <td>${fmtMoney(b.value)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
}

/* ==================================================================
   TOOLTIP — hiển thị khi bấm vào cột, tự ẩn sau 3s
   ================================================================== */
function showBarTooltip(el) {
  const day = el.dataset.day;
  const amount = Number(el.dataset.amount || 0);
  const count = Number(el.dataset.count || 0);
  const tt = document.getElementById('barTooltip');
  if (!tt) return;

  if (currentBarActive) currentBarActive.classList.remove('active');
  el.classList.add('active');
  currentBarActive = el;

  tt.innerHTML = `
    <div class="bar-tooltip-label">Ngày ${day}/${reportState.month.getMonth() + 1}</div>
    <div class="bar-tooltip-value">${fmtMoney(amount)}</div>
    <div class="bar-tooltip-sub">${count} giao dịch</div>`;
  
  // Đo tooltip trước khi show để tính vị trí
  tt.classList.add('show');
  const rect = el.getBoundingClientRect();
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

  let hideTimer = null;

  // Click để hiện (hoạt động đồng nhất desktop + mobile)
  chart.addEventListener('click', (e) => {
    const bar = e.target.closest('.bar-col');
    if (!bar) return;
    e.preventDefault();
    e.stopPropagation();
    showBarTooltip(bar);
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hideBarTooltip, 3000);
  });

  // Bấm ra ngoài để ẩn ngay
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#reportBars') && !e.target.closest('#barTooltip')) {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      hideBarTooltip();
    }
  });
}

export function renderReportsTab() {
  renderReports();
  setupBarInteraction();
}

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
