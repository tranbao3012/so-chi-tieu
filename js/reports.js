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

let currentBarActive = null;

function safe(id) {
  const el = document.getElementById(id);
  if (!el) console.warn('[Reports] Missing element #' + id);
  return el;
}

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

    setupChartInteraction();
  } catch (err) {
    console.error('[Reports] Fatal:', err);
  }
}

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

function renderBarChart(monthExp, days, uniqueDays) {
  const chartWrap = safe('reportBars');
  const maxEl = safe('reportBarsMax');
  const labelEl = safe('reportBarsLabel');
  if (!chartWrap) return;

  const dailyMap = new Map();
  const dailyCount = new Map();

  monthExp.forEach(e => {
    if (!e || !e.date || typeof e.date !== 'string') return;
    const parts = e.date.split('-');
    if (parts.length < 3) return;
    const d = parseInt(parts[2], 10);
    if (!Number.isFinite(d)) return;
    dailyMap.set(d, (dailyMap.get(d) || 0) + Number(e.amount || 0));
    dailyCount.set(d, (dailyCount.get(d) || 0) + 1);
  });

  const values = [];
  for (let d = 1; d <= days; d++) {
    values.push({ day: d, amount: dailyMap.get(d) || 0, count: dailyCount.get(d) || 0 });
  }

  const maxDayAmount = Math.max(...values.map(v => v.amount), 0);
  
  if (maxEl) maxEl.textContent = maxDayAmount > 0 ? 'Max: ' + fmtMoneyShort(maxDayAmount) : '—';
  if (labelEl) labelEl.textContent = `${uniqueDays}/${days} ngày`;

  if (maxDayAmount === 0) {
    chartWrap.innerHTML = `<div style="height:180px;display:flex;align-items:center;justify-content:center;color:var(--text-soft);font-size:12px;">Chưa có dữ liệu chi tiêu</div>`;
    return;
  }

  const W = 340;
  const H = 180;
  const padL = 40;
  const padR = 10;
  const padT = 10;
  const padB = 20;
  const cw = W - padL - padR;
  const ch = H - padT - padB;

  const colWidth = cw / days;
  const barWidth = Math.max(4, Math.min(16, colWidth * 0.7));

  let gridLines = '';
  for (let i = 0; i <= 4; i++) {
    const y = padT + (ch / 4) * i;
    const val = maxDayAmount * (1 - i / 4);
    gridLines += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" class="chart-grid-line" />`;
    gridLines += `<text x="${padL - 6}" y="${y + 3}" class="chart-y-label">${fmtMoneyShort(val)}</text>`;
  }

  let barsHtml = '';
  values.forEach((p) => {
    const x = padL + (p.day - 1) * colWidth + (colWidth - barWidth) / 2;
    const barH = (p.amount / maxDayAmount) * ch;
    const y = padT + ch - barH;

    if (p.amount > 0) {
      barsHtml += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3" class="chart-bar" data-day="${p.day}" data-amount="${p.amount}" data-count="${p.count}"></rect>`;
    } else {
      barsHtml += `<rect x="${x}" y="${padT + ch - 2}" width="${barWidth}" height="2" rx="1" class="chart-bar-empty"></rect>`;
    }

    const showLabel = days <= 10 || p.day % 5 === 0 || p.day === 1 || p.day === days;
    if (showLabel) {
      barsHtml += `<text x="${x + barWidth/2}" y="${H - 4}" class="chart-label">${p.day}</text>`;
    }
  });

  chartWrap.innerHTML = `
    <div class="chart-svg-wrap">
      <svg viewBox="0 0 ${W} ${H}">
        <defs>
          <linearGradient id="chartBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--primary)" />
            <stop offset="100%" stop-color="var(--primary-hover)" />
          </linearGradient>
        </defs>
        ${gridLines}
        ${barsHtml}
      </svg>
    </div>
  `;
}

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
}

function showChartTooltip(barEl) {
  const tt = safe('barTooltip');
  if (!tt) return;

  const day = barEl.dataset.day;
  const amount = Number(barEl.dataset.amount || 0);
  const count = Number(barEl.dataset.count || 0);

  if (currentBarActive) currentBarActive.classList.remove('active');
  barEl.classList.add('active');
  currentBarActive = barEl;

  tt.innerHTML = `
    <div class="bar-tooltip-label">Ngày ${day}/${reportState.month.getMonth() + 1}</div>
    <div class="bar-tooltip-value">${fmtMoney(amount)}</div>
    <div class="bar-tooltip-sub">${count} giao dịch</div>`;

  tt.classList.add('show');

  const rect = barEl.getBoundingClientRect();
  const ttR = tt.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - ttR.width / 2;
  let top = rect.top - ttR.height - 12;
  
  if (left < 10) left = 10;
  if (left + ttR.width > window.innerWidth - 10) left = window.innerWidth - ttR.width - 10;
  if (top < 10) top = rect.bottom + 12;

  tt.style.left = left + 'px';
  tt.style.top = top + 'px';
  hapticTap();
}

function hideChartTooltip() {
  const tt = safe('barTooltip');
  if (tt) tt.classList.remove('show');
  if (currentBarActive) {
    currentBarActive.classList.remove('active');
    currentBarActive = null;
  }
}

function setupChartInteraction() {
  const chart = safe('reportBars');
  if (!chart) return;

  if (!chart.dataset.bound) {
    chart.dataset.bound = "true";
    
    let hideTimer = null;

    chart.addEventListener('click', (e) => {
      const bar = e.target.closest('.chart-bar');
      if (!bar) return;
      showChartTooltip(bar);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(hideChartTooltip, 3000);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#reportBars') && !e.target.closest('#barTooltip')) {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        hideChartTooltip();
      }
    });
  }
}

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
