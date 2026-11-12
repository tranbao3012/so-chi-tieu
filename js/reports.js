/* js/reports.js — V2.3 (Hero dùng section-title + amount có nền surface-2)
   - renderHero(): bỏ meta, dùng .section-title + .report-hero-amount
   - Bỏ tham số count/avg không dùng */

import {
  state, reportState,
  ic, escapeHtml,
  fmtMoney, fmtMoneyShort, monthLabel,
  daysInMonth,
  getMonthExpenses, calcByCategory,
  calcSummary,
  generateInsights, exportPDF,
  hapticTap
} from './core.js';

let barInteractionSetup = false;
let currentBarActive = null;

function safe(id) {
  const el = document.getElementById(id);
  if (!el) console.warn('[Reports] Missing element #' + id);
  return el;
}

/* ==================================================================
   ENTRY
   ================================================================== */
export function renderReports() {
  try {
    const reportMonth = reportState.month;
    const monthExp = getMonthExpenses(reportMonth);
    const prevExp = getMonthExpenses(new Date(reportMonth.getFullYear(), reportMonth.getMonth() - 1, 1));
    const { total } = calcSummary(monthExp);
    const prevTotal = calcSummary(prevExp).total;
    const days = daysInMonth(reportMonth.getFullYear(), reportMonth.getMonth());
    const uniqueDays = new Set(monthExp.map(e => e.date)).size;
    const diffPct = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : 0;

    try { renderHero(reportMonth, total, diffPct, prevTotal); }
    catch (e) { console.error('[Reports] Hero:', e); }

    try { renderInsights(monthExp, total, prevTotal, days); }
    catch (e) { console.error('[Reports] Insights:', e); }

    try { renderBarChart(monthExp, days, uniqueDays); }
    catch (e) { console.error('[Reports] BarChart:', e); }

    try { renderTop(monthExp); }
    catch (e) { console.error('[Reports] Top:', e); }

    setupBarInteraction();
  } catch (err) {
    console.error('[Reports] Fatal:', err);
  }
}

/* ==================================================================
   HERO — dùng .section-title + .report-hero-amount
   ================================================================== */
function renderHero(month, total, diffPct, prevTotal) {
  const monthLabelEl = safe('reportMonthLabel');
  if (monthLabelEl) monthLabelEl.textContent = monthLabel(month);

  const heroEl = safe('reportHero');
  if (!heroEl) return;

  let trendText = '';
  let trendClass = '';
  if (prevTotal > 0) {
    if (diffPct > 0) { trendText = '↑ +' + diffPct.toFixed(0) + '%'; trendClass = 'up'; }
    else if (diffPct < 0) { trendText = '↓ ' + diffPct.toFixed(0) + '%'; trendClass = 'down'; }
    else { trendText = '0%'; trendClass = ''; }
  }

  heroEl.innerHTML = `
    <div class="section-title">
      <div class="section-title-left">
        <span class="section-title-text">Tổng chi tháng ${month.getMonth() + 1}</span>
      </div>
      ${trendText ? `<div class="report-hero-trend ${trendClass}">${trendText}</div>` : ''}
    </div>
    <div class="report-hero-amount">${fmtMoney(total)}</div>
  `;
}

/* ==================================================================
   INSIGHTS
   ================================================================== */
function renderInsights(monthExp, total, prevTotal, days) {
  const el = safe('reportInsights');
  if (!el) return;

  const insights = generateInsights(monthExp, total, prevTotal, days);
  if (!insights || insights.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-soft);font-size:12px;">Chưa có dữ liệu để phân tích</div>`;
    return;
  }

  el.innerHTML = `
    <div class="section-title">
      <div class="section-title-left"><span class="section-title-text">Nhận xét</span></div>
    </div>
    <div class="insight-list">
      ${insights.map(i => `
        <div class="insight-row">
          <div class="insight-icon-wrap">${ic(i.icon, 14)}</div>
          <div class="insight-text">${i.html}</div>
        </div>
      `).join('')}
    </div>`;
}

/* ==================================================================
   BAR CHART
   ================================================================== */
function renderBarChart(monthExp, days, uniqueDays) {
  const barsEl = safe('reportBars');
  const maxEl = safe('reportBarsMax');
  const labelEl = safe('reportBarsLabel');
  if (!barsEl) return;

  const dailyMap = new Map();
  const dailyCount = new Map();
  let skipped = 0;

  monthExp.forEach(e => {
    if (!e || !e.date || typeof e.date !== 'string') { skipped++; return; }
    const parts = e.date.split('-');
    if (parts.length < 3) { skipped++; return; }
    const d = parseInt(parts[2], 10);
    if (!Number.isFinite(d)) { skipped++; return; }
    dailyMap.set(d, (dailyMap.get(d) || 0) + Number(e.amount || 0));
    dailyCount.set(d, (dailyCount.get(d) || 0) + 1);
  });

  const values = Array.from(dailyMap.values());
  const maxDay = values.length ? Math.max(...values, 0) : 0;

  if (maxEl) maxEl.textContent = maxDay > 0 ? 'Max: ' + fmtMoneyShort(maxDay) : '—';
  if (labelEl) labelEl.textContent = `${uniqueDays}/${days} ngày`;

  let barsHtml = '';
  for (let d = 1; d <= days; d++) {
    const val = dailyMap.get(d) || 0;
    const cnt = dailyCount.get(d) || 0;
    const pct = maxDay > 0 ? (val / maxDay) * 100 : 0;
    const hasVal = val > 0;
    const show = days <= 15 || d % 2 === 0 || d === 1 || d === days;
    const h = hasVal ? Math.max(pct, 2) : 0;

    const barStyle = hasVal
      ? `height:${h}%; background:linear-gradient(180deg, var(--primary, #34d399) 0%, var(--primary-hover, #10b981) 100%); min-height:3px; width:100%; max-width:18px; border-radius:4px 4px 0 0;`
      : `height:0; background:transparent; width:100%; max-width:18px;`;

    barsHtml += `<div class="bar-col" data-day="${d}" data-amount="${val}" data-count="${cnt}" style="cursor:pointer;">
      <div class="bar ${hasVal ? 'has-value' : 'is-empty'}" style="${barStyle}"></div>
      <div class="bar-label">${show ? d : ''}</div>
    </div>`;
  }

  barsEl.innerHTML = barsHtml;

  console.log('[Reports] Bar chart rendered:', days, 'days · maxDay =', maxDay, '· skipped =', skipped);
}

/* ==================================================================
   TOP CATEGORIES
   ================================================================== */
function renderTop(monthExp) {
  const labelEl = safe('reportTopLabel');
  const el = safe('reportTop');
  if (!el) return;

  const allCats = calcByCategory(monthExp);
  if (labelEl) labelEl.textContent = `${allCats.length} danh mục`;

  if (!allCats || allCats.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-soft);font-size:12px;">Chưa có chi tiêu</div>`;
    return;
  }

  const rows = allCats.map(b => {
    const name = b.category && b.category.name ? b.category.name : 'Khác';
    const color = b.category && b.category.color ? b.category.color : '#64748b';
    return `<tr>
      <td>
        <div class="top-cat-cell">
          <span class="top-cat-dot" style="background:${color};"></span>
          ${escapeHtml(name)}
        </div>
      </td>
      <td>${fmtMoney(b.value)}</td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    <table class="top-table">
      <thead><tr><th>Danh mục</th><th>Số tiền</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  console.log('[Reports] Top categories rendered:', allCats.length);
}

/* ==================================================================
   TOOLTIP
   ================================================================== */
function showBarTooltip(el) {
  const tt = safe('barTooltip');
  if (!tt) return;

  const day = el.dataset.day;
  const amount = Number(el.dataset.amount || 0);
  const count = Number(el.dataset.count || 0);

  if (currentBarActive) currentBarActive.classList.remove('active');
  el.classList.add('active');
  currentBarActive = el;

  tt.innerHTML = `
    <div class="bar-tooltip-label">Ngày ${day}/${reportState.month.getMonth() + 1}</div>
    <div class="bar-tooltip-value">${fmtMoney(amount)}</div>
    <div class="bar-tooltip-sub">${count} giao dịch</div>`;

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
  const tt = safe('barTooltip');
  if (tt) tt.classList.remove('show');
  if (currentBarActive) {
    currentBarActive.classList.remove('active');
    currentBarActive = null;
  }
}

function setupBarInteraction() {
  if (barInteractionSetup) return;
  const chart = safe('reportBars');
  if (!chart) return;
  barInteractionSetup = true;

  let hideTimer = null;

  chart.addEventListener('click', (e) => {
    const bar = e.target.closest('.bar-col');
    if (!bar) return;
    showBarTooltip(bar);
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hideBarTooltip, 3000);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#reportBars') && !e.target.closest('#barTooltip')) {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      hideBarTooltip();
    }
  });
}

/* ==================================================================
   PUBLIC API
   ================================================================== */
export function renderReportsTab() {
  renderReports();
}

export function bindReportTabEvents() {
  const prevBtn = safe('prevMonth');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      hapticTap();
      reportState.month = new Date(reportState.month.getFullYear(), reportState.month.getMonth() - 1, 1);
      renderReports();
    });
  }

  const nextBtn = safe('nextMonth');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      hapticTap();
      reportState.month = new Date(reportState.month.getFullYear(), reportState.month.getMonth() + 1, 1);
      renderReports();
    });
  }

  const pdfBtn = safe('exportPdfBtn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      hapticTap();
      exportPDF();
    });
  }
}
