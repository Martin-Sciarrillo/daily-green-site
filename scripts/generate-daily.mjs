#!/usr/bin/env node
// Genera/actualiza la actividad diaria del site y reconstruye index.html.
// Cada invocacion garantiza un diff (para que cada commit cuente como contribucion).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOG_DIR = join(ROOT, "content", "log");
const DATA = join(ROOT, "data", "streak.json");

mkdirSync(LOG_DIR, { recursive: true });
mkdirSync(dirname(DATA), { recursive: true });

// --- Fecha local (TZ configurable por env, default America/Argentina/Buenos_Aires) ---
const TZ = process.env.SITE_TZ || "America/Argentina/Buenos_Aires";
const now = new Date();
const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
});
const day = fmt.format(now); // YYYY-MM-DD
const time = new Intl.DateTimeFormat("es-AR", {
  timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}).format(now);

// --- Tips rotativos para darle contenido real al post del dia ---
const TIPS = [
  "Commit chico todos los dias > un commit gigante una vez por mes.",
  "El verde del grafico es relativo a tu dia mas activo: lo que importa es la constancia.",
  "Automatiza lo aburrido, escribi lo que importa.",
  "Un sistema gana siempre a la fuerza de voluntad.",
  "Documentar hoy es ahorrar tiempo a tu yo del futuro.",
  "La mejor metrica es la que cambia tu comportamiento.",
  "Hecho es mejor que perfecto, pero medido es mejor que hecho.",
];
const tip = TIPS[Math.floor(Date.now() / 86400000) % TIPS.length];

// --- Estado / streak ---
let state = { totalPings: 0, days: {}, firstDay: day };
if (existsSync(DATA)) {
  try { state = JSON.parse(readFileSync(DATA, "utf8")); } catch { /* reset */ }
}
state.totalPings = (state.totalPings || 0) + 1;
state.days[day] = (state.days[day] || 0) + 1;
const streak = computeStreak(Object.keys(state.days).sort());
writeFileSync(DATA, JSON.stringify(state, null, 2) + "\n");

// --- Entrada del dia ---
const logFile = join(LOG_DIR, `${day}.md`);
if (!existsSync(logFile)) {
  writeFileSync(logFile,
    `# ${day}\n\n> ${tip}\n\n## Actividad\n\n- ${time} — primer ping del dia\n`);
} else {
  const prev = readFileSync(logFile, "utf8");
  writeFileSync(logFile, prev + `- ${time} — ping #${state.days[day]}\n`);
}

// --- Reconstruir index.html ---
buildIndex(state, streak);

console.log(`OK ${day} ${time} | pings hoy=${state.days[day]} | streak=${streak}`);

function computeStreak(sortedDays) {
  if (sortedDays.length === 0) return 0;
  let s = 1;
  for (let i = sortedDays.length - 1; i > 0; i--) {
    const a = new Date(sortedDays[i]); const b = new Date(sortedDays[i - 1]);
    if ((a - b) === 86400000) s++; else break;
  }
  return s;
}

function buildIndex(state, streak) {
  const days = readdirSync(LOG_DIR).filter(f => f.endsWith(".md")).sort().reverse();
  const items = days.map(f => {
    const d = f.replace(".md", "");
    const n = state.days[d] || 0;
    return `      <li><strong>${d}</strong> — ${n} actividad(es)</li>`;
  }).join("\n");
  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Daily Activity — Martin Sciarrillo</title>
  <style>
    :root { color-scheme: dark; }
    body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      background:#0d1117; color:#c9d1d9; max-width:760px; margin:40px auto; padding:0 20px; }
    h1 { color:#39d353; }
    .stats { display:flex; gap:24px; margin:24px 0; }
    .card { background:#161b22; border:1px solid #30363d; border-radius:8px;
      padding:16px 20px; flex:1; }
    .big { font-size:2rem; color:#39d353; }
    ul { line-height:1.8; } a { color:#58a6ff; }
    footer { margin-top:40px; color:#8b949e; font-size:.85rem; }
  </style>
</head>
<body>
  <h1>🟩 Daily Activity Log</h1>
  <p>Site auto-actualizado por GitHub Actions. Cada dia suma actividad real y verde al grafico.</p>
  <div class="stats">
    <div class="card"><div class="big">${streak}</div><div>dias de racha</div></div>
    <div class="card"><div class="big">${Object.keys(state.days).length}</div><div>dias activos</div></div>
    <div class="card"><div class="big">${state.totalPings}</div><div>contribuciones</div></div>
  </div>
  <h2>Historial</h2>
  <ul>
${items}
  </ul>
  <footer>Generado ${new Date().toISOString()} · TZ ${TZ}</footer>
</body>
</html>
`;
  writeFileSync(join(ROOT, "index.html"), html);
}
