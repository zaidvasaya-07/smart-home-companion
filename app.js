/* =========================================================================
   Smart Home Companion — Application logic
   Pure HTML/CSS/JS SPA with localStorage persistence & Chart.js visuals.
   ========================================================================= */

const STORAGE_KEY = "smart_home_companion_db";
const DAYS_IN_MONTH = 30;

/* ------------------------------------------------------------------ */
/*  DEFAULT / DEMO DATA                                                */
/* ------------------------------------------------------------------ */

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};
const daysAhead = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};
const uid = () => Math.random().toString(36).slice(2, 10);

const demoData = () => ({
  settings: { tariffRate: 7.5, theme: "light" },
  appliances: [
    {
      id: uid(),
      name: "Central AC",
      watts: 3500,
      hoursPerDay: 6,
      category: "HVAC",
    },
    {
      id: uid(),
      name: "Refrigerator",
      watts: 150,
      hoursPerDay: 24,
      category: "Kitchen",
    },
    {
      id: uid(),
      name: 'LED TV (55")',
      watts: 110,
      hoursPerDay: 5,
      category: "Entertainment",
    },
    {
      id: uid(),
      name: "Washing Machine",
      watts: 500,
      hoursPerDay: 1,
      category: "Laundry",
    },
    {
      id: uid(),
      name: "Living Room Lights",
      watts: 60,
      hoursPerDay: 6,
      category: "Lighting",
    },
    {
      id: uid(),
      name: "Home Office Setup",
      watts: 220,
      hoursPerDay: 8,
      category: "Office",
    },
  ],
  maintenance: [
    {
      id: uid(),
      applianceName: "Central AC",
      lastServiced: daysAgo(150),
      intervalMonths: 6,
      contact: "+1 555-0110 · CoolCare",
    },
    {
      id: uid(),
      applianceName: "Refrigerator",
      lastServiced: daysAgo(320),
      intervalMonths: 12,
      contact: "+1 555-0200 · ApplianceFix",
    },
    {
      id: uid(),
      applianceName: "Washing Machine",
      lastServiced: daysAgo(200),
      intervalMonths: 12,
      contact: "+1 555-0330 · HomeCare",
    },
    {
      id: uid(),
      applianceName: "Water Purifier",
      lastServiced: daysAgo(80),
      intervalMonths: 3,
      contact: "+1 555-0410 · AquaTech",
    },
  ],
  bills: [
    {
      id: uid(),
      title: "February Electricity",
      category: "Electricity",
      amount: 138.4,
      dueDate: daysAhead(5),
      status: "Unpaid",
    },
    {
      id: uid(),
      title: "Municipal Water",
      category: "Water",
      amount: 42.5,
      dueDate: daysAhead(-3),
      status: "Unpaid",
    },
    {
      id: uid(),
      title: "Fiber Internet",
      category: "Internet",
      amount: 59.99,
      dueDate: daysAhead(12),
      status: "Paid",
    },
    {
      id: uid(),
      title: "Gas Cylinder",
      category: "Gas",
      amount: 28.0,
      dueDate: daysAhead(20),
      status: "Paid",
    },
    {
      id: uid(),
      title: "Apartment Rent",
      category: "Rent",
      amount: 1450,
      dueDate: daysAhead(2),
      status: "Unpaid",
    },
    {
      id: uid(),
      title: "Society Maintenance",
      category: "Maintenance",
      amount: 90,
      dueDate: daysAhead(15),
      status: "Paid",
    },
  ],
  inventory: [
    {
      id: uid(),
      itemName: 'Sony 55" 4K TV',
      category: "Electronics",
      purchaseDate: daysAgo(180),
      price: 899,
      serialNo: "XR55A80K-2024",
      warrantyExpiry: daysAhead(560),
      notes: "Living room, wall-mounted",
    },
    {
      id: uid(),
      itemName: "LG Washing Machine",
      category: "Appliance",
      purchaseDate: daysAgo(720),
      price: 620,
      serialNo: "WM-LGX9000",
      warrantyExpiry: daysAhead(20),
      notes: "Extended warranty until Jul",
    },
    {
      id: uid(),
      itemName: "IKEA Sofa Set",
      category: "Furniture",
      purchaseDate: daysAgo(400),
      price: 780,
      serialNo: "IK-KIVIK-3",
      warrantyExpiry: daysAhead(-10),
      notes: "Living room",
    },
    {
      id: uid(),
      itemName: "Instant Pot Duo",
      category: "Kitchenware",
      purchaseDate: daysAgo(90),
      price: 129,
      serialNo: "IP-DUO-6QT",
      warrantyExpiry: daysAhead(275),
      notes: "",
    },
    {
      id: uid(),
      itemName: "Bosch Drill Kit",
      category: "Tools",
      purchaseDate: daysAgo(30),
      price: 179,
      serialNo: "BSH-DRL-18V",
      warrantyExpiry: daysAhead(700),
      notes: "Garage shelf",
    },
    {
      id: uid(),
      itemName: "MacBook Air M3",
      category: "Electronics",
      purchaseDate: daysAgo(45),
      price: 1299,
      serialNo: "MBA-M3-2025",
      warrantyExpiry: daysAhead(320),
      notes: "",
    },
    {
      id: uid(),
      itemName: "Dyson V15 Vacuum",
      category: "Appliance",
      purchaseDate: daysAgo(210),
      price: 649,
      serialNo: "DYS-V15",
      warrantyExpiry: daysAhead(155),
      notes: "",
    },
    {
      id: uid(),
      itemName: "Herman Miller Chair",
      category: "Furniture",
      purchaseDate: daysAgo(150),
      price: 950,
      serialNo: "HM-AERON-B",
      warrantyExpiry: daysAhead(2900),
      notes: "Home office",
    },
  ],
});

/* ------------------------------------------------------------------ */
/*  STATE                                                              */
/* ------------------------------------------------------------------ */

let state = null;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state = demoData();
    saveState();
    return;
  }
  try {
    state = JSON.parse(raw);
    // ensure keys exist
    const d = demoData();
    for (const k of Object.keys(d)) if (!state[k]) state[k] = d[k];
  } catch {
    state = demoData();
    saveState();
  }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ------------------------------------------------------------------ */
/*  UTILITIES                                                          */
/* ------------------------------------------------------------------ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const fmt$ = (n) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtNum = (n, d = 2) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};
const diffDays = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
};
const addMonths = (iso, months) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + Number(months || 0));
  return d.toISOString().split("T")[0];
};

/* Category color palettes */
const CATEGORY_COLORS = {
  HVAC: "#3B82F6",
  Kitchen: "#F59E0B",
  Entertainment: "#8B5CF6",
  Lighting: "#EAB308",
  Laundry: "#EC4899",
  Office: "#10B981",
  Other: "#64748B",
};
const BILL_COLORS = {
  Electricity: "#F59E0B",
  Water: "#3B82F6",
  Internet: "#8B5CF6",
  Gas: "#EF4444",
  Rent: "#10B981",
  Maintenance: "#64748B",
};
const chartPalette = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#EAB308",
];

/* Chart.js theme sync */
function chartTextColor() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--text")
      .trim() || "#0F172A"
  );
}
function chartGridColor() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--border")
      .trim() || "#E2E8F0"
  );
}

/* ------------------------------------------------------------------ */
/*  ENERGY CALCULATIONS                                                */
/* ------------------------------------------------------------------ */

function applianceKwh(a) {
  const daily = (Number(a.watts) * Number(a.hoursPerDay)) / 1000;
  const monthly = daily * DAYS_IN_MONTH;
  const cost = monthly * Number(state.settings.tariffRate || 0);
  return { daily, monthly, cost };
}
function totalMonthlyElectricity() {
  return state.appliances.reduce(
    (acc, a) => {
      const { monthly, cost } = applianceKwh(a);
      acc.kwh += monthly;
      acc.cost += cost;
      return acc;
    },
    { kwh: 0, cost: 0 },
  );
}

/* ------------------------------------------------------------------ */
/*  NAVIGATION & THEME                                                 */
/* ------------------------------------------------------------------ */

function switchTab(tab) {
  $$(".nav-item").forEach((n) =>
    n.classList.toggle("active", n.dataset.tab === tab),
  );
  $$(".tab-panel").forEach((p) =>
    p.classList.toggle("active", p.id === `tab-${tab}`),
  );
  closeSidebar();
  renderAll();
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  state.settings.theme = theme;
  saveState();
  $$(".theme-pill").forEach((p) =>
    p.classList.toggle("active", p.dataset.theme === theme),
  );
  const icon = $("#theme-toggle-mobile i");
  if (icon)
    icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  const ttLabel = $("#theme-toggle-desktop .tt-label");
  if (ttLabel)
    ttLabel.innerHTML =
      theme === "dark"
        ? '<i class="fa-solid fa-sun"></i> Light mode'
        : '<i class="fa-solid fa-moon"></i> Dark mode';
  // Redraw charts to sync colors
  Object.values(charts).forEach((c) => c && c.update && c.update());
}
function toggleTheme() {
  applyTheme(state.settings.theme === "dark" ? "light" : "dark");
  renderAll();
}

function openSidebar() {
  $("#sidebar").classList.add("open");
  $("#sidebar-backdrop").classList.add("open");
}
function closeSidebar() {
  $("#sidebar").classList.remove("open");
  $("#sidebar-backdrop").classList.remove("open");
}

/* ------------------------------------------------------------------ */
/*  TOAST + MODAL                                                      */
/* ------------------------------------------------------------------ */

function toast(msg, type = "success") {
  const host = $("#toast-host");
  const el = document.createElement("div");
  el.className = "toast " + type;
  const icon =
    type === "error"
      ? "circle-xmark"
      : type === "info"
        ? "circle-info"
        : "circle-check";
  el.innerHTML = `<i class="fa-solid fa-${icon}"></i><span>${msg}</span>`;
  el.setAttribute("data-testid", "toast");
  host.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    el.style.transition = "opacity .25s ease, transform .25s ease";
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

let confirmCallback = null;
function askConfirm(title, body, onOk) {
  $("#confirm-title").textContent = title;
  $("#confirm-body").textContent = body;
  confirmCallback = onOk;
  $("#confirm-modal").classList.add("open");
}
function closeConfirm() {
  $("#confirm-modal").classList.remove("open");
  confirmCallback = null;
}

/* ------------------------------------------------------------------ */
/*  CHART REGISTRY                                                     */
/* ------------------------------------------------------------------ */

const charts = {};

function ensureChart(id, config) {
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  if (charts[id]) {
    charts[id].data = config.data;
    charts[id].options = config.options;
    charts[id].update();
    return charts[id];
  }
  charts[id] = new Chart(ctx, config);
  return charts[id];
}

/* ------------------------------------------------------------------ */
/*  DASHBOARD                                                          */
/* ------------------------------------------------------------------ */

function renderDashboard() {
  // Metrics
  const { kwh, cost } = totalMonthlyElectricity();
  $("#metric-electricity-value").textContent = fmt$(cost);
  $("#metric-electricity-foot").textContent = `${fmtNum(kwh, 1)} kWh estimated`;

  const unpaid = state.bills.filter((b) => b.status === "Unpaid");
  const unpaidSum = unpaid.reduce((s, b) => s + Number(b.amount), 0);
  $("#metric-bills-value").textContent = unpaid.length;
  $("#metric-bills-foot").textContent = `${fmt$(unpaidSum)} unpaid`;

  const maintStatus = state.maintenance.map((m) => maintStatusFor(m));
  const overdue = maintStatus.filter((s) => s.kind === "danger").length;
  const dueSoon = maintStatus.filter((s) => s.kind === "warn").length;
  $("#metric-maintenance-value").textContent = overdue + dueSoon;
  $("#metric-maintenance-foot").textContent = `${overdue} overdue`;

  const warr = warrantyBreakdown();
  $("#metric-inventory-value").textContent = state.inventory.length;
  $("#metric-inventory-foot").textContent = `${warr.covered} under warranty`;

  // Consumption preview (last 7 days simulated pattern based on total daily kWh)
  const dailyKwh = state.appliances.reduce(
    (s, a) => s + applianceKwh(a).daily,
    0,
  );
  const days = 7;
  const labels = [],
    data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString(undefined, { weekday: "short" }));
    // simulate variance around ±15%
    const variance = 0.85 + ((i * 37 + 13) % 30) / 100;
    data.push(+(dailyKwh * variance).toFixed(2));
  }
  ensureChart("dashboard-consumption-chart", {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "kWh",
          data,
          borderColor: "#10B981",
          backgroundColor: "rgba(16,185,129,0.15)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#10B981",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: chartTextColor() } },
        y: {
          grid: { color: chartGridColor() },
          ticks: { color: chartTextColor() },
        },
      },
    },
  });

  // Alerts
  const host = $("#dashboard-alerts");
  const alerts = [];
  state.bills
    .filter((b) => b.status === "Unpaid")
    .forEach((b) => {
      const d = diffDays(b.dueDate);
      if (d < 0)
        alerts.push({
          dot: "red",
          title: `${b.title} overdue`,
          body: `${fmt$(b.amount)} · ${Math.abs(d)} days late`,
        });
      else if (d <= 5)
        alerts.push({
          dot: "amber",
          title: `${b.title} due soon`,
          body: `${fmt$(b.amount)} · ${d === 0 ? "today" : `in ${d} days`}`,
        });
    });
  state.maintenance.forEach((m) => {
    const s = maintStatusFor(m);
    if (s.kind === "danger")
      alerts.push({
        dot: "red",
        title: `${m.applianceName} service overdue`,
        body: `${Math.abs(s.daysUntil)} days late`,
      });
    else if (s.kind === "warn")
      alerts.push({
        dot: "amber",
        title: `${m.applianceName} service due`,
        body: `In ${s.daysUntil} days`,
      });
  });
  state.inventory.forEach((i) => {
    const d = diffDays(i.warrantyExpiry);
    if (d !== null && d >= 0 && d <= 30)
      alerts.push({
        dot: "amber",
        title: `${i.itemName} warranty expiring`,
        body: `In ${d} days`,
      });
  });

  if (alerts.length === 0) {
    host.innerHTML = `<div class="alert-empty"><i class="fa-solid fa-shield-halved"></i>All clear! Nothing needs attention right now.</div>`;
  } else {
    host.innerHTML = alerts
      .slice(0, 8)
      .map(
        (a) => `
      <div class="alert">
        <span class="alert-dot ${a.dot}"></span>
        <div><div class="alert-title">${a.title}</div><div class="alert-body">${a.body}</div></div>
      </div>`,
      )
      .join("");
  }
}

/* ------------------------------------------------------------------ */
/*  ENERGY                                                             */
/* ------------------------------------------------------------------ */

function renderEnergy() {
  $("#energy-tariff-label").textContent = fmt$(state.settings.tariffRate);
  $("#appliance-count").textContent = state.appliances.length;

  const tbody = $("#appliance-tbody");
  if (!state.appliances.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fa-solid fa-plug-circle-plus"></i><h4>No appliances yet</h4><p>Add one on the left to start tracking energy usage.</p></div></td></tr>`;
  } else {
    tbody.innerHTML = state.appliances
      .map((a) => {
        const { daily, monthly, cost } = applianceKwh(a);
        const catColor = CATEGORY_COLORS[a.category] || "#64748B";
        return `<tr>
        <td><div class="row-name">${escapeHtml(a.name)}</div></td>
        <td><span class="badge neutral" style="background:${catColor}22;color:${catColor}">${a.category}</span></td>
        <td>${a.watts} W</td>
        <td>${a.hoursPerDay}</td>
        <td>${fmtNum(daily, 2)}</td>
        <td>${fmtNum(monthly, 1)}</td>
        <td><b>${fmt$(cost)}</b></td>
        <td><div class="row-actions">
          <button title="Edit" onclick="editAppliance('${a.id}')" data-testid="edit-appliance-${a.id}"><i class="fa-solid fa-pen"></i></button>
          <button title="Delete" class="danger" onclick="deleteAppliance('${a.id}')" data-testid="delete-appliance-${a.id}"><i class="fa-solid fa-trash"></i></button>
        </div></td>
      </tr>`;
      })
      .join("");
  }

  // Doughnut by category
  const catAgg = {};
  state.appliances.forEach((a) => {
    const { monthly } = applianceKwh(a);
    catAgg[a.category] = (catAgg[a.category] || 0) + monthly;
  });
  const catLabels = Object.keys(catAgg);
  const catData = Object.values(catAgg);
  const catColors = catLabels.map((l) => CATEGORY_COLORS[l] || "#64748B");

  ensureChart("energy-doughnut-chart", {
    type: "doughnut",
    data: {
      labels: catLabels.length ? catLabels : ["No data"],
      datasets: [
        {
          data: catLabels.length ? catData : [1],
          backgroundColor: catColors.length ? catColors : ["#E2E8F0"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: chartTextColor(), font: { size: 12 } },
        },
      },
    },
  });

  // Bar by appliance
  const sorted = [...state.appliances]
    .sort((a, b) => applianceKwh(b).monthly - applianceKwh(a).monthly)
    .slice(0, 10);
  ensureChart("energy-bar-chart", {
    type: "bar",
    data: {
      labels: sorted.map((a) => a.name),
      datasets: [
        {
          label: "Monthly kWh",
          data: sorted.map((a) => +applianceKwh(a).monthly.toFixed(1)),
          backgroundColor: sorted.map(
            (a) => CATEGORY_COLORS[a.category] || "#10B981",
          ),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: chartTextColor() } },
        y: {
          grid: { color: chartGridColor() },
          ticks: { color: chartTextColor() },
        },
      },
    },
  });
}

/* ------------------------------------------------------------------ */
/*  MAINTENANCE                                                        */
/* ------------------------------------------------------------------ */

function maintStatusFor(m) {
  const nextDate = addMonths(m.lastServiced, m.intervalMonths);
  const daysUntil = diffDays(nextDate);
  let kind, label;
  if (daysUntil < 0) {
    kind = "danger";
    label = `Overdue · ${Math.abs(daysUntil)}d`;
  } else if (daysUntil <= 14) {
    kind = "warn";
    label = `Due in ${daysUntil}d`;
  } else {
    kind = "ok";
    label = "Up to date";
  }
  return { nextDate, daysUntil, kind, label };
}

function renderMaintenance() {
  $("#maint-count").textContent = state.maintenance.length;

  const stats = { ok: 0, warn: 0, danger: 0 };
  state.maintenance.forEach((m) => {
    stats[maintStatusFor(m).kind]++;
  });
  $("#maint-stat-grid").innerHTML = `
    <div class="stat-mini"><span class="sm-lbl">Up to date</span><span class="sm-val" style="color:var(--emerald-600)">${stats.ok}</span></div>
    <div class="stat-mini"><span class="sm-lbl">Due soon</span><span class="sm-val" style="color:#B45309">${stats.warn}</span></div>
    <div class="stat-mini"><span class="sm-lbl">Overdue</span><span class="sm-val" style="color:var(--red-500)">${stats.danger}</span></div>
  `;

  const tbody = $("#maint-tbody");
  if (!state.maintenance.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-screwdriver-wrench"></i><h4>No schedules yet</h4><p>Track your appliances' service dates here.</p></div></td></tr>`;
    return;
  }
  const sorted = [...state.maintenance].sort(
    (a, b) => maintStatusFor(a).daysUntil - maintStatusFor(b).daysUntil,
  );
  tbody.innerHTML = sorted
    .map((m) => {
      const s = maintStatusFor(m);
      return `<tr>
      <td><div class="row-name">${escapeHtml(m.applianceName)}</div><div class="row-sub">Every ${m.intervalMonths} months</div></td>
      <td>${fmtDate(m.lastServiced)}</td>
      <td>${fmtDate(s.nextDate)}</td>
      <td>${escapeHtml(m.contact || "—")}</td>
      <td><span class="badge ${s.kind}">${s.label}</span></td>
      <td><div class="row-actions">
        <button class="ok" title="Mark serviced" onclick="markServiced('${m.id}')" data-testid="serviced-${m.id}"><i class="fa-solid fa-check"></i></button>
        <button title="Edit" onclick="editMaintenance('${m.id}')" data-testid="edit-maint-${m.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="danger" title="Delete" onclick="deleteMaintenance('${m.id}')" data-testid="delete-maint-${m.id}"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`;
    })
    .join("");
}

/* ------------------------------------------------------------------ */
/*  BILLS                                                              */
/* ------------------------------------------------------------------ */

function renderBills() {
  const total = state.bills.reduce((s, b) => s + Number(b.amount), 0);
  const paid = state.bills
    .filter((b) => b.status === "Paid")
    .reduce((s, b) => s + Number(b.amount), 0);
  const unpaid = total - paid;
  $("#bill-total").textContent = fmt$(total);
  $("#bill-paid").textContent = fmt$(paid);
  $("#bill-unpaid").textContent = fmt$(unpaid);
  $("#bill-count").textContent = state.bills.length;

  const fs = $("#bill-filter-status").value;
  const fc = $("#bill-filter-category").value;
  let list = [...state.bills];
  if (fs !== "all") list = list.filter((b) => b.status === fs);
  if (fc !== "all") list = list.filter((b) => b.category === fc);
  list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const tbody = $("#bill-tbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-receipt"></i><h4>No bills to show</h4><p>Adjust filters or add a new bill.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = list
    .map((b) => {
      const d = diffDays(b.dueDate);
      const cat = BILL_COLORS[b.category] || "#64748B";
      let dueBadge;
      if (b.status === "Paid") dueBadge = `<span class="badge ok">Paid</span>`;
      else if (d < 0)
        dueBadge = `<span class="badge danger">Overdue ${Math.abs(d)}d</span>`;
      else if (d <= 5)
        dueBadge = `<span class="badge warn">Due in ${d}d</span>`;
      else dueBadge = `<span class="badge info">Due in ${d}d</span>`;
      return `<tr>
      <td><div class="row-name">${escapeHtml(b.title)}</div></td>
      <td><span class="badge" style="background:${cat}22;color:${cat}">${b.category}</span></td>
      <td><b>${fmt$(b.amount)}</b></td>
      <td>${fmtDate(b.dueDate)}</td>
      <td>${dueBadge}</td>
      <td><div class="row-actions">
        ${b.status === "Unpaid" ? `<button class="ok" title="Mark paid" onclick="markBillPaid('${b.id}')" data-testid="pay-bill-${b.id}"><i class="fa-solid fa-check"></i></button>` : ""}
        <button title="Edit" onclick="editBill('${b.id}')" data-testid="edit-bill-${b.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="danger" title="Delete" onclick="deleteBill('${b.id}')" data-testid="delete-bill-${b.id}"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`;
    })
    .join("");
}

/* ------------------------------------------------------------------ */
/*  INVENTORY                                                          */
/* ------------------------------------------------------------------ */

function warrantyStatus(iso) {
  const d = diffDays(iso);
  if (d === null) return { kind: "neutral", label: "No warranty" };
  if (d < 0) return { kind: "danger", label: "Expired" };
  if (d <= 30) return { kind: "warn", label: "Expiring soon" };
  return { kind: "ok", label: "Under warranty" };
}

function warrantyBreakdown() {
  const b = { covered: 0, expiring: 0, expired: 0 };
  state.inventory.forEach((i) => {
    const s = warrantyStatus(i.warrantyExpiry);
    if (s.kind === "ok") b.covered++;
    else if (s.kind === "warn") b.expiring++;
    else if (s.kind === "danger") b.expired++;
  });
  return b;
}

function renderInventory() {
  $("#inv-count").textContent = state.inventory.length;

  const w = warrantyBreakdown();
  $("#warranty-tiles").innerHTML = `
    <div class="wt ok"><span class="wt-lbl">Under warranty</span><span class="wt-val">${w.covered}</span></div>
    <div class="wt warn"><span class="wt-lbl">Expiring soon</span><span class="wt-val">${w.expiring}</span></div>
    <div class="wt danger"><span class="wt-lbl">Expired</span><span class="wt-val">${w.expired}</span></div>
  `;

  const q = $("#inv-search").value.trim().toLowerCase();
  const fc = $("#inv-filter-category").value;
  let list = [...state.inventory];
  if (fc !== "all") list = list.filter((i) => i.category === fc);
  if (q)
    list = list.filter(
      (i) =>
        (i.itemName || "").toLowerCase().includes(q) ||
        (i.serialNo || "").toLowerCase().includes(q) ||
        (i.notes || "").toLowerCase().includes(q),
    );

  const grid = $("#inv-grid");
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-box-open"></i><h4>No items match</h4><p>Try clearing filters or adding a new asset.</p></div>`;
    return;
  }
  grid.innerHTML = list
    .map((i) => {
      const s = warrantyStatus(i.warrantyExpiry);
      return `<div class="inv-item" data-testid="inv-item-${i.id}">
      <div class="inv-head">
        <div>
          <div class="inv-name">${escapeHtml(i.itemName)}</div>
          <div class="inv-cat">${escapeHtml(i.category)}</div>
        </div>
        <span class="badge ${s.kind}">${s.label}</span>
      </div>
      <div class="inv-meta">
        ${i.price ? `<span><i class="fa-solid fa-tag"></i>${fmt$(i.price)}</span>` : ""}
        ${i.purchaseDate ? `<span><i class="fa-solid fa-calendar"></i>${fmtDate(i.purchaseDate)}</span>` : ""}
        ${i.warrantyExpiry ? `<span><i class="fa-solid fa-shield-halved"></i>${fmtDate(i.warrantyExpiry)}</span>` : ""}
      </div>
      ${i.serialNo ? `<div class="inv-meta"><span><i class="fa-solid fa-barcode"></i>${escapeHtml(i.serialNo)}</span></div>` : ""}
      ${i.notes ? `<div class="inv-notes">${escapeHtml(i.notes)}</div>` : ""}
      <div class="inv-actions">
        <div class="row-actions">
          <button title="Edit" onclick="editInventory('${i.id}')" data-testid="edit-inv-${i.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="danger" title="Delete" onclick="deleteInventory('${i.id}')" data-testid="delete-inv-${i.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>`;
    })
    .join("");
}

/* ------------------------------------------------------------------ */
/*  REPORTS                                                            */
/* ------------------------------------------------------------------ */

function renderReports() {
  const catAgg = {};
  state.bills.forEach((b) => {
    catAgg[b.category] = (catAgg[b.category] || 0) + Number(b.amount);
  });
  const catLabels = Object.keys(catAgg);
  const catData = Object.values(catAgg);
  const catColors = catLabels.map((l) => BILL_COLORS[l] || "#64748B");

  ensureChart("report-doughnut", {
    type: "doughnut",
    data: {
      labels: catLabels.length ? catLabels : ["No bills"],
      datasets: [
        {
          data: catLabels.length ? catData : [1],
          backgroundColor: catColors.length ? catColors : ["#E2E8F0"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: { position: "bottom", labels: { color: chartTextColor() } },
      },
    },
  });

  const appLabels = state.appliances.map((a) => a.name);
  const appData = state.appliances.map(
    (a) => +applianceKwh(a).monthly.toFixed(1),
  );
  ensureChart("report-bar", {
    type: "bar",
    data: {
      labels: appLabels.length ? appLabels : ["No data"],
      datasets: [
        {
          label: "Monthly kWh",
          data: appLabels.length ? appData : [0],
          backgroundColor: state.appliances.map(
            (a, i) => chartPalette[i % chartPalette.length],
          ),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: chartTextColor() } },
        y: {
          grid: { color: chartGridColor() },
          ticks: { color: chartTextColor() },
        },
      },
    },
  });

  const { kwh, cost } = totalMonthlyElectricity();
  const totalBills = state.bills.reduce((s, b) => s + Number(b.amount), 0);
  const unpaid = state.bills
    .filter((b) => b.status === "Unpaid")
    .reduce((s, b) => s + Number(b.amount), 0);
  const invValue = state.inventory.reduce(
    (s, i) => s + Number(i.price || 0),
    0,
  );
  $("#report-summary").innerHTML = `
    <div class="rs-tile"><div class="rs-lbl">Est. electricity cost</div><div class="rs-val">${fmt$(cost)}</div><div class="rs-sub">${fmtNum(kwh, 1)} kWh / month</div></div>
    <div class="rs-tile"><div class="rs-lbl">Total bills</div><div class="rs-val">${fmt$(totalBills)}</div><div class="rs-sub">${state.bills.length} entries</div></div>
    <div class="rs-tile"><div class="rs-lbl">Unpaid balance</div><div class="rs-val">${fmt$(unpaid)}</div><div class="rs-sub">${state.bills.filter((b) => b.status === "Unpaid").length} bills</div></div>
    <div class="rs-tile"><div class="rs-lbl">Inventory value</div><div class="rs-val">${fmt$(invValue)}</div><div class="rs-sub">${state.inventory.length} items</div></div>
  `;
}

/* ------------------------------------------------------------------ */
/*  SETTINGS                                                           */
/* ------------------------------------------------------------------ */

function renderSettings() {
  $("#settings-tariff").value = state.settings.tariffRate;
  $$(".theme-pill").forEach((p) =>
    p.classList.toggle("active", p.dataset.theme === state.settings.theme),
  );
}

/* ------------------------------------------------------------------ */
/*  CRUD — APPLIANCES                                                  */
/* ------------------------------------------------------------------ */

function resetApplianceForm() {
  $("#appliance-id").value = "";
  $("#appliance-form").reset();
  $("#appliance-form-title").textContent = "Add appliance";
  $("#appliance-submit-label").textContent = "Add appliance";
  $("#appliance-cancel").style.display = "none";
}
function editAppliance(id) {
  const a = state.appliances.find((x) => x.id === id);
  if (!a) return;
  $("#appliance-id").value = a.id;
  $("#appliance-name").value = a.name;
  $("#appliance-watts").value = a.watts;
  $("#appliance-hours").value = a.hoursPerDay;
  $("#appliance-category").value = a.category;
  $("#appliance-form-title").textContent = "Edit appliance";
  $("#appliance-submit-label").textContent = "Save changes";
  $("#appliance-cancel").style.display = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function deleteAppliance(id) {
  const a = state.appliances.find((x) => x.id === id);
  if (!a) return;
  askConfirm(
    "Delete appliance?",
    `Remove "${a.name}" from your energy monitor?`,
    () => {
      state.appliances = state.appliances.filter((x) => x.id !== id);
      saveState();
      renderAll();
      toast("Appliance deleted");
    },
  );
}

/* ------------------------------------------------------------------ */
/*  CRUD — MAINTENANCE                                                 */
/* ------------------------------------------------------------------ */

function resetMaintForm() {
  $("#maint-id").value = "";
  $("#maint-form").reset();
  $("#maint-form-title").textContent = "Add service schedule";
  $("#maint-submit-label").textContent = "Add schedule";
  $("#maint-cancel").style.display = "none";
}
function editMaintenance(id) {
  const m = state.maintenance.find((x) => x.id === id);
  if (!m) return;
  $("#maint-id").value = m.id;
  $("#maint-name").value = m.applianceName;
  $("#maint-last").value = m.lastServiced;
  $("#maint-interval").value = m.intervalMonths;
  $("#maint-contact").value = m.contact || "";
  $("#maint-form-title").textContent = "Edit schedule";
  $("#maint-submit-label").textContent = "Save changes";
  $("#maint-cancel").style.display = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function deleteMaintenance(id) {
  const m = state.maintenance.find((x) => x.id === id);
  if (!m) return;
  askConfirm(
    "Delete schedule?",
    `Remove "${m.applianceName}" from maintenance tracker?`,
    () => {
      state.maintenance = state.maintenance.filter((x) => x.id !== id);
      saveState();
      renderAll();
      toast("Schedule deleted");
    },
  );
}
function markServiced(id) {
  const m = state.maintenance.find((x) => x.id === id);
  if (!m) return;
  m.lastServiced = new Date().toISOString().split("T")[0];
  saveState();
  renderAll();
  toast(`"${m.applianceName}" marked as serviced today`);
}

/* ------------------------------------------------------------------ */
/*  CRUD — BILLS                                                       */
/* ------------------------------------------------------------------ */

function resetBillForm() {
  $("#bill-id").value = "";
  $("#bill-form").reset();
  $("#bill-form-title").textContent = "Add bill";
  $("#bill-submit-label").textContent = "Add bill";
  $("#bill-cancel").style.display = "none";
}
function editBill(id) {
  const b = state.bills.find((x) => x.id === id);
  if (!b) return;
  $("#bill-id").value = b.id;
  $("#bill-title").value = b.title;
  $("#bill-category").value = b.category;
  $("#bill-amount").value = b.amount;
  $("#bill-due").value = b.dueDate;
  $("#bill-status").value = b.status;
  $("#bill-form-title").textContent = "Edit bill";
  $("#bill-submit-label").textContent = "Save changes";
  $("#bill-cancel").style.display = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function deleteBill(id) {
  const b = state.bills.find((x) => x.id === id);
  if (!b) return;
  askConfirm("Delete bill?", `Remove "${b.title}"?`, () => {
    state.bills = state.bills.filter((x) => x.id !== id);
    saveState();
    renderAll();
    toast("Bill deleted");
  });
}
function markBillPaid(id) {
  const b = state.bills.find((x) => x.id === id);
  if (!b) return;
  b.status = "Paid";
  saveState();
  renderAll();
  toast(`"${b.title}" marked as paid`);
}

/* ------------------------------------------------------------------ */
/*  CRUD — INVENTORY                                                   */
/* ------------------------------------------------------------------ */

function resetInvForm() {
  $("#inv-id").value = "";
  $("#inv-form").reset();
  $("#inv-form-title").textContent = "Add asset";
  $("#inv-submit-label").textContent = "Add asset";
  $("#inv-cancel").style.display = "none";
}
function editInventory(id) {
  const i = state.inventory.find((x) => x.id === id);
  if (!i) return;
  $("#inv-id").value = i.id;
  $("#inv-name").value = i.itemName;
  $("#inv-category").value = i.category;
  $("#inv-purchase").value = i.purchaseDate || "";
  $("#inv-price").value = i.price || "";
  $("#inv-serial").value = i.serialNo || "";
  $("#inv-warranty").value = i.warrantyExpiry || "";
  $("#inv-notes").value = i.notes || "";
  $("#inv-form-title").textContent = "Edit asset";
  $("#inv-submit-label").textContent = "Save changes";
  $("#inv-cancel").style.display = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function deleteInventory(id) {
  const i = state.inventory.find((x) => x.id === id);
  if (!i) return;
  askConfirm("Delete asset?", `Remove "${i.itemName}" from inventory?`, () => {
    state.inventory = state.inventory.filter((x) => x.id !== id);
    saveState();
    renderAll();
    toast("Asset deleted");
  });
}

/* Expose to inline onclick */
window.editAppliance = editAppliance;
window.deleteAppliance = deleteAppliance;
window.editMaintenance = editMaintenance;
window.deleteMaintenance = deleteMaintenance;
window.markServiced = markServiced;
window.editBill = editBill;
window.deleteBill = deleteBill;
window.markBillPaid = markBillPaid;
window.editInventory = editInventory;
window.deleteInventory = deleteInventory;

/* ------------------------------------------------------------------ */
/*  EXPORT                                                             */
/* ------------------------------------------------------------------ */

function downloadFile(filename, content, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function exportJson() {
  downloadFile("smart-home-companion.json", JSON.stringify(state, null, 2));
  toast("JSON exported");
}

function toCsv(rows) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => esc(r[k])).join(",")),
  ].join("\n");
}
function exportCsv() {
  const parts = [];
  parts.push(
    "# APPLIANCES\n" +
      toCsv(
        state.appliances.map((a) => {
          const c = applianceKwh(a);
          return {
            ...a,
            dailyKwh: c.daily.toFixed(2),
            monthlyKwh: c.monthly.toFixed(2),
            monthlyCost: c.cost.toFixed(2),
          };
        }),
      ),
  );
  parts.push(
    "\n\n# MAINTENANCE\n" +
      toCsv(
        state.maintenance.map((m) => ({
          ...m,
          nextService: maintStatusFor(m).nextDate,
        })),
      ),
  );
  parts.push("\n\n# BILLS\n" + toCsv(state.bills));
  parts.push("\n\n# INVENTORY\n" + toCsv(state.inventory));
  downloadFile("smart-home-companion.csv", parts.join(""), "text/csv");
  toast("CSV exported");
}

/* ------------------------------------------------------------------ */
/*  RENDER ALL                                                         */
/* ------------------------------------------------------------------ */

function renderAll() {
  renderDashboard();
  renderEnergy();
  renderMaintenance();
  renderBills();
  renderInventory();
  renderReports();
  renderSettings();
}

function escapeHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m],
  );
}

/* ------------------------------------------------------------------ */
/*  EVENT WIRING                                                       */
/* ------------------------------------------------------------------ */

function wire() {
  // Nav
  $$(".nav-item").forEach((n) =>
    n.addEventListener("click", () => switchTab(n.dataset.tab)),
  );

  // Sidebar
  $("#mobile-menu-btn").addEventListener("click", openSidebar);
  $("#sidebar-close").addEventListener("click", closeSidebar);
  $("#sidebar-backdrop").addEventListener("click", closeSidebar);

  // Theme
  $("#theme-toggle-desktop").addEventListener("click", toggleTheme);
  $("#theme-toggle-mobile").addEventListener("click", toggleTheme);
  $$(".theme-pill").forEach((p) =>
    p.addEventListener("click", () => {
      applyTheme(p.dataset.theme);
    }),
  );

  // Dashboard quick actions
  $("#quick-demo-btn").addEventListener("click", () => {
    askConfirm(
      "Reload demo data?",
      "This replaces your current data with the demo dataset.",
      () => {
        state = demoData();
        state.settings.theme =
          document.documentElement.getAttribute("data-theme") || "light";
        saveState();
        renderAll();
        toast("Demo data reloaded");
      },
    );
  });

  // Appliance form
  $("#appliance-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#appliance-id").value;
    const payload = {
      name: $("#appliance-name").value.trim(),
      watts: Number($("#appliance-watts").value),
      hoursPerDay: Number($("#appliance-hours").value),
      category: $("#appliance-category").value,
    };
    if (id) {
      const a = state.appliances.find((x) => x.id === id);
      Object.assign(a, payload);
      toast("Appliance updated");
    } else {
      state.appliances.push({ id: uid(), ...payload });
      toast("Appliance added");
    }
    saveState();
    resetApplianceForm();
    renderAll();
  });
  $("#appliance-cancel").addEventListener("click", resetApplianceForm);

  // Maintenance form
  $("#maint-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#maint-id").value;
    const payload = {
      applianceName: $("#maint-name").value.trim(),
      lastServiced: $("#maint-last").value,
      intervalMonths: Number($("#maint-interval").value),
      contact: $("#maint-contact").value.trim(),
    };
    if (id) {
      const m = state.maintenance.find((x) => x.id === id);
      Object.assign(m, payload);
      toast("Schedule updated");
    } else {
      state.maintenance.push({ id: uid(), ...payload });
      toast("Schedule added");
    }
    saveState();
    resetMaintForm();
    renderAll();
  });
  $("#maint-cancel").addEventListener("click", resetMaintForm);

  // Bill form
  $("#bill-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#bill-id").value;
    const payload = {
      title: $("#bill-title").value.trim(),
      category: $("#bill-category").value,
      amount: Number($("#bill-amount").value),
      dueDate: $("#bill-due").value,
      status: $("#bill-status").value,
    };
    if (id) {
      const b = state.bills.find((x) => x.id === id);
      Object.assign(b, payload);
      toast("Bill updated");
    } else {
      state.bills.push({ id: uid(), ...payload });
      toast("Bill added");
    }
    saveState();
    resetBillForm();
    renderAll();
  });
  $("#bill-cancel").addEventListener("click", resetBillForm);
  $("#bill-filter-status").addEventListener("change", renderBills);
  $("#bill-filter-category").addEventListener("change", renderBills);

  // Inventory form
  $("#inv-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#inv-id").value;
    const payload = {
      itemName: $("#inv-name").value.trim(),
      category: $("#inv-category").value,
      purchaseDate: $("#inv-purchase").value,
      price: Number($("#inv-price").value) || 0,
      serialNo: $("#inv-serial").value.trim(),
      warrantyExpiry: $("#inv-warranty").value,
      notes: $("#inv-notes").value.trim(),
    };
    if (id) {
      const i = state.inventory.find((x) => x.id === id);
      Object.assign(i, payload);
      toast("Asset updated");
    } else {
      state.inventory.push({ id: uid(), ...payload });
      toast("Asset added");
    }
    saveState();
    resetInvForm();
    renderAll();
  });
  $("#inv-cancel").addEventListener("click", resetInvForm);
  $("#inv-search").addEventListener("input", renderInventory);
  $("#inv-filter-category").addEventListener("change", renderInventory);

  // Reports export
  $("#export-json").addEventListener("click", exportJson);
  $("#export-csv").addEventListener("click", exportCsv);

  // Settings
  $("#save-tariff").addEventListener("click", () => {
    const v = Number($("#settings-tariff").value);
    if (isNaN(v) || v < 0) {
      toast("Please enter a valid tariff", "error");
      return;
    }
    state.settings.tariffRate = v;
    saveState();
    renderAll();
    toast(`Tariff saved: ${fmt$(v)} / kWh`);
  });
  $("#load-demo-data").addEventListener("click", () => {
    askConfirm(
      "Load demo data?",
      "This will replace all current data with the demo dataset.",
      () => {
        state = demoData();
        saveState();
        renderAll();
        toast("Demo data loaded");
      },
    );
  });
  $("#export-backup").addEventListener("click", exportJson);
  $("#restore-file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.settings || !data.appliances) throw new Error("Invalid file");
        state = data;
        saveState();
        applyTheme(state.settings.theme || "light");
        renderAll();
        toast("Backup restored");
      } catch {
        toast("Invalid backup file", "error");
      }
      e.target.value = "";
    };
    reader.readAsText(f);
  });
  $("#reset-app").addEventListener("click", () => {
    askConfirm(
      "Reset all data?",
      "This clears every appliance, bill, schedule and item. This cannot be undone.",
      () => {
        localStorage.removeItem(STORAGE_KEY);
        loadState();
        applyTheme(state.settings.theme);
        renderAll();
        toast("Application data reset", "info");
      },
    );
  });

  // Confirm modal
  $("#confirm-cancel").addEventListener("click", closeConfirm);
  $("#confirm-ok").addEventListener("click", () => {
    const cb = confirmCallback;
    closeConfirm();
    if (cb) cb();
  });
  $("#confirm-modal").addEventListener("click", (e) => {
    if (e.target.id === "confirm-modal") closeConfirm();
  });
}

/* ------------------------------------------------------------------ */
/*  INIT                                                               */
/* ------------------------------------------------------------------ */

function init() {
  loadState();
  wire();
  applyTheme(state.settings.theme || "light");
  renderAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
