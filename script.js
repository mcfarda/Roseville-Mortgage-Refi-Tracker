const market = {
  zip: "95661",
  name: "Roseville",
  medianPrice: 699000,
  rate: 6.69,
  weeklyDelta: -0.02
};

const trendData = buildTrendData();
const targetPayment = 900;

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const currentRate = document.getElementById("currentRate");
const updatedDate = document.getElementById("updatedDate");
const quickStats = document.getElementById("quickStats");
const neighborhoodCards = document.getElementById("neighborhoodCards");
const targetAlert = document.getElementById("targetAlert");
const loanAmountInput = document.getElementById("loanAmount");
const loanTermSelect = document.getElementById("loanTerm");

function buildTrendData() {
  const baseRates = [6.88, 6.84, 6.8, 6.76, 6.72, 6.69];
  return baseRates.map((rate, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (baseRates.length - 1 - index) * 7);
    return {
      rate,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };
  });
}

function getNextPullTime(now = new Date()) {
  const next7am = new Date(now);
  next7am.setHours(7, 0, 0, 0);

  const next5pm = new Date(now);
  next5pm.setHours(17, 0, 0, 0);

  if (now < next7am) return next7am;
  if (now < next5pm) return next5pm;

  next7am.setDate(next7am.getDate() + 1);
  return next7am;
}

function pullLatestData() {
  // Simulated pull for static demo: tiny movement at each refresh window.
  const now = new Date();
  const cycleModifier = now.getHours() < 12 ? -0.01 : 0.01;
  const newRate = Number((market.rate + cycleModifier).toFixed(2));
  market.weeklyDelta = Number((newRate - market.rate).toFixed(2));
  market.rate = newRate;

  trendData.push({
    rate: market.rate,
    label: now.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  });
  if (trendData.length > 6) trendData.shift();

  renderAll();
  scheduleNextPull();
}

function scheduleNextPull() {
  const now = new Date();
  const nextPull = getNextPullTime(now);
  const waitMs = nextPull.getTime() - now.getTime();
  setTimeout(pullLatestData, waitMs);
}

function renderOverview() {
  const trendRates = trendData.map((item) => item.rate);
  const lowTrend = Math.min(...trendRates);
  const highTrend = Math.max(...trendRates);

  quickStats.innerHTML = `
    <span class="stat-pill">Roseville 95661 Refi: ${market.rate.toFixed(2)}%</span>
    <span class="stat-pill">6-Week Low: ${lowTrend.toFixed(2)}%</span>
    <span class="stat-pill">6-Week High: ${highTrend.toFixed(2)}%</span>
    <span class="stat-pill">Auto updates: 7:00 AM & 5:00 PM</span>
  `;

  currentRate.textContent = market.rate.toFixed(2);
  updatedDate.textContent = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function renderNeighborhoodCards() {
  const deltaClass = market.weeklyDelta > 0 ? "positive" : "negative";
  const deltaArrow = market.weeklyDelta > 0 ? "▲" : "▼";

  neighborhoodCards.innerHTML = `
    <article class="neighborhood-card">
      <h3>${market.name}</h3>
      <p class="muted">ZIP ${market.zip}</p>
      <p><strong>Median Home:</strong> ${formatMoney(market.medianPrice)}</p>
      <p><strong>30Y Refi:</strong> ${market.rate.toFixed(2)}%</p>
      <p class="delta ${deltaClass}">${deltaArrow} ${Math.abs(market.weeklyDelta).toFixed(2)}% vs. previous update</p>
    </article>
  `;
}

function renderTrendChart() {
  const svg = document.getElementById("trendChart");
  const width = 640;
  const height = 280;
  const padding = 36;
  const rates = trendData.map((item) => item.rate);
  const minVal = Math.min(...rates) - 0.04;
  const maxVal = Math.max(...rates) + 0.04;

  const xFor = (index) => padding + (index * (width - padding * 2)) / (trendData.length - 1);
  const yFor = (value) => {
    const normalized = (value - minVal) / (maxVal - minVal);
    return height - padding - normalized * (height - padding * 2);
  };

  const points = trendData.map((item, index) => `${xFor(index)},${yFor(item.rate)}`).join(" ");

  svg.innerHTML = `
    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#b9c6e4" />
    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#b9c6e4" />
    <polyline fill="none" stroke="#2f6feb" stroke-width="4" points="${points}" />
    ${trendData
      .map(
        (item, index) => `
          <circle cx="${xFor(index)}" cy="${yFor(item.rate)}" r="4.2" fill="#2f6feb"></circle>
          <text x="${xFor(index)}" y="${height - 10}" text-anchor="middle" fill="#51617e" font-size="12">${item.label}</text>
        `
      )
      .join("")}
    <text x="${padding + 6}" y="${padding + 4}" text-anchor="start" fill="#51617e" font-size="12">High ${maxVal.toFixed(2)}%</text>
    <text x="${padding + 6}" y="${height - padding - 8}" text-anchor="start" fill="#51617e" font-size="12">Low ${minVal.toFixed(2)}%</text>
  `;
}

function renderTargetAlert(monthlyPI) {
  const paymentText = formatMoney(monthlyPI);
  const rateText = `${market.rate.toFixed(2)}%`;

  if (monthlyPI < targetPayment) {
    targetAlert.className = "target-alert success";
    targetAlert.textContent = `Great news — estimated payment is ${paymentText} at ${rateText}, which is under ${formatMoney(targetPayment)}.`;
    return;
  }

  targetAlert.className = "target-alert info";
  targetAlert.textContent = `Current estimate is ${paymentText} at ${rateText}, which is above ${formatMoney(targetPayment)}.`;
}

function calculateRefi() {
  const loanAmount = Number(loanAmountInput.value);
  const termYears = Number(loanTermSelect.value);
  const selectedRate = Number(currentRate.textContent) / 100;

  const monthlyRate = selectedRate / 12;
  const n = termYears * 12;
  const monthlyPI = loanAmount * ((monthlyRate * (1 + monthlyRate) ** n) / ((1 + monthlyRate) ** n - 1));

  document.getElementById("piValue").textContent = formatMoney(monthlyPI);
  document.getElementById("totalValue").textContent = formatMoney(monthlyPI);
  renderTargetAlert(monthlyPI);
}

function renderAll() {
  renderOverview();
  renderTrendChart();
  renderNeighborhoodCards();
  calculateRefi();
}

loanAmountInput.addEventListener("input", calculateRefi);
loanTermSelect.addEventListener("change", calculateRefi);

renderAll();
scheduleNextPull();
