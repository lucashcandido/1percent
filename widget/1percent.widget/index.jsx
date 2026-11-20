// 1Percent – Schreibtisch-Widget für Übersicht (https://tracesof.net/uebersicht/)
// Liest deine Daten direkt aus deinem privaten Daten-Repo (nur lesen) und zeigt:
// Monat (Einnahmen, Ausgaben, Saldo, Ersparnis, offene Fixkosten), ToDos von heute, Important Dates, letztes Training.
// Einrichtung: config.sh.example → config.sh kopieren und Repo + Token (Contents: Read-only) eintragen.
import { css, run } from "uebersicht";

const APP_URL = "https://lucashcandido.github.io/1percent/";
export const refreshFrequency = 5 * 60 * 1000; // alle 5 Minuten

export const command = `
D="$HOME/Library/Application Support/Übersicht/widgets/1percent.widget"
[ -f ./1percent.widget/config.sh ] && D="./1percent.widget"
[ -f "$D/config.sh" ] || { echo "@@error"; echo "config.sh fehlt"; exit 0; }
. "$D/config.sh"
M=$(date +%Y-%m)
for f in settings todos workouts "$M"; do
  echo "@@$f"
  curl -s -m 20 -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github.raw+json" "https://api.github.com/repos/$REPO/contents/data/$f.json"
  echo
done
`;

/* ---------- Berechnung (ohne React, damit testbar) ---------- */
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
const toks = (s) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 2);
const dayDiff = (a, b) => Math.round((new Date(a + "T12:00") - new Date(b + "T12:00")) / 864e5);
const r2 = (x) => Math.round(x * 100) / 100;

export function compute(raw, now = new Date()) {
  const parts = {};
  String(raw || "").split(/^@@/m).forEach((chunk) => {
    const i = chunk.indexOf("\n");
    if (i < 0) return;
    const k = chunk.slice(0, i).trim(), body = chunk.slice(i + 1).trim();
    if (k) parts[k] = body;
  });
  if (parts.error !== undefined) return { error: "config.sh fehlt – siehe README im Widget-Ordner." };
  const j = (k) => { try { return JSON.parse(parts[k]); } catch (e) { return null; } };
  const S = j("settings"), T = j("todos"), W = j("workouts");
  const today = iso(now), month = today.slice(0, 7);
  if (!S || !S.cats) {
    const msg = (parts.settings || "").slice(0, 120);
    return { error: /Bad credentials|401/.test(msg) ? "Token ungültig." : /Not Found/.test(msg) ? "Repo nicht gefunden oder kein Zugriff." : "Keine Verbindung zu GitHub." };
  }
  const M = j(month) || { tx: [] };
  const xferCats = new Set((S.cats || []).filter((c) => c.transfer).map((c) => c.name));
  const isX = (t) => !!t.rb || xferCats.has(t.category);
  const tx = (M.tx || []).filter((t) => t.date && t.date.startsWith(month));
  const plain = tx.filter((t) => !isX(t));
  const inc = r2(plain.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0));
  const exp = r2(plain.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0));

  // Ersparnis: Kontostand, sonst Buchungen (Space-Sicht zählt mit eigenem Vorzeichen, Doppelungen einmal)
  let saved = null;
  const savings = S.savings || [];
  if (savings.length) {
    const bal = savings.map((n) => ((S.bal || {})[n] || {})[month]).filter((b) => b && b.s != null && b.e != null);
    if (bal.length === savings.length) saved = r2(bal.reduce((a, b) => a + (b.e - b.s), 0));
    else {
      const sn = (t) => { const tk = new Set(toks(t.desc)); return savings.some((n) => toks(n).every((w) => tk.has(w))); };
      const sav = tx.filter(sn), space = sav.filter((t) => /hauptkonto|main account/i.test(t.desc)), main = sav.filter((t) => !space.includes(t)), used = new Set();
      let v = space.reduce((a, t) => a + t.amount, 0);
      for (const m of main) { const k = space.find((s) => !used.has(s) && Math.abs(s.amount + m.amount) < 0.005 && Math.abs(dayDiff(s.date, m.date)) <= 2); if (k) used.add(k); else v -= m.amount; }
      saved = r2(v);
    }
  }

  // Fixkosten offen
  const fixed = (S.fixed || []).filter((f) => (!f.from || month >= f.from) && (!f.to || month <= f.to));
  const done = (S.fixDone || {})[month] || {};
  const fixOpen = fixed.filter((f) => {
    if (done[f.id] === true) return false;
    if (done[f.id] === false) return true;
    const kw = norm(f.kw || f.name);
    return !tx.some((t) => t.amount < 0 && norm(t.desc).includes(kw) && Math.abs(Math.abs(t.amount) - f.amount) <= Math.max(1, f.amount * 0.1) && (!f.account || !t.account || t.account === f.account));
  });
  const late = fixOpen.filter((f) => f.day && f.day < now.getDate()).length;

  // ToDos + Important Dates
  const todo = (T && T.todo) || [];
  const todayTodos = todo.filter((x) => !x.kind && x.date === today).sort((a, b) => (a.c || 0) - (b.c || 0));
  const overdue = todo.filter((x) => !x.kind && !x.done && x.date < today).length;
  const next = (x) => { if (x.rep !== "y") return x.date; const y = now.getFullYear(); let d = y + x.date.slice(4); if (d < today) d = y + 1 + x.date.slice(4); return d; };
  const dates = todo.filter((x) => x.kind === "imp").map((x) => ({ x, d: next(x) })).filter((o) => o.d >= today)
    .sort((a, b) => a.d.localeCompare(b.d) || (a.x.time || "99").localeCompare(b.x.time || "99")).slice(0, 4)
    .map((o) => ({ text: o.x.text, date: o.d, time: o.x.time || "", in: dayDiff(o.d, today), age: o.x.rep === "y" && o.x.y ? +o.d.slice(0, 4) - o.x.y : 0 }));

  // Training
  const wo = ((W && W.wo) || []).filter((w) => !w.kind && (w.muscles || []).length && new Date(w.ts.length === 16 ? w.ts + ":00" : w.ts) <= now).sort((a, b) => b.ts.localeCompare(a.ts))[0];
  const water = ((W && W.wo) || []).filter((w) => w.kind === "water" && w.ts.slice(0, 10) === today).reduce((a, w) => a + ((w.m && w.m.ml) || 0), 0);
  const training = wo ? { title: wo.title || "Training", h: Math.floor((now - new Date(wo.ts + (wo.ts.length === 16 ? ":00" : ""))) / 36e5) } : null;

  return { month, inc, exp, net: r2(inc + exp), saved, fixOpen: fixOpen.length, fixAll: fixed.length, late, todayTodos, overdue, dates, training, water };
}

/* ---------- Darstellung ---------- */
const eur = (v) => (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const monthName = (m) => new Date(m + "-01T12:00").toLocaleDateString("de-DE", { month: "long" });
const when = (n, d) => (n === 0 ? "heute" : n === 1 ? "morgen" : n <= 30 ? `in ${n} Tagen` : d.slice(8) + "." + d.slice(5, 7) + ".");
const open = () => run(`open "${APP_URL}"`);

export const className = css`
  top: 24px; right: 24px; width: 300px;
  font-family: -apple-system, "SF Pro Text", "Helvetica Neue", sans-serif; color: #e8eaee; -webkit-font-smoothing: antialiased;
  .card { background: rgba(10, 12, 16, 0.78); -webkit-backdrop-filter: blur(24px) saturate(160%); border: 1px solid rgba(255,255,255,.10);
    border-radius: 18px; padding: 14px 16px 12px; box-shadow: 0 18px 50px rgba(0,0,0,.45); cursor: pointer; }
  .head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .logo { font: italic 900 22px/1 "Barlow Condensed", "Helvetica Neue", sans-serif; letter-spacing: -.5px; }
  .mon { font: italic 800 13px/1 "Barlow Condensed", "Helvetica Neue", sans-serif; text-transform: uppercase; letter-spacing: .06em; color: #9aa3b2; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; margin-bottom: 4px; }
  .l { font-size: 10.5px; color: #8a93a3; text-transform: uppercase; letter-spacing: .05em; }
  .v { font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .pos { color: #4ade80; } .neg { color: #f87171; } .mut { color: #8a93a3; }
  h4 { margin: 10px 0 4px; font: italic 800 12px/1 "Barlow Condensed", "Helvetica Neue", sans-serif; text-transform: uppercase; letter-spacing: .07em; color: #9aa3b2; }
  .row { display: flex; justify-content: space-between; gap: 8px; font-size: 12.5px; padding: 2px 0; }
  .row span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .row span + span { flex: none; white-space: nowrap; }
  .done { text-decoration: line-through; color: #6b7280; }
  .soon { color: #f87171; }
  .foot { margin-top: 8px; font-size: 10.5px; color: #6b7280; display: flex; justify-content: space-between; }
`;

export const render = ({ output, error }) => {
  const d = compute(output);
  if (error || d.error) return <div className="card" onClick={open}><div className="head"><span className="logo">1P</span></div><div className="mut" style={{ fontSize: 12.5 }}>{d.error || "Fehler beim Laden."}</div></div>;
  const openT = d.todayTodos.filter((t) => !t.done);
  return (
    <div className="card" onClick={open} title="1Percent öffnen">
      <div className="head"><span className="logo">1P</span><span className="mon">{monthName(d.month)}</span></div>
      <div className="grid">
        <div><div className="l">Einnahmen</div><div className="v pos">{eur(d.inc)}</div></div>
        <div><div className="l">Ausgaben</div><div className="v neg">{eur(d.exp)}</div></div>
        <div><div className="l">Saldo</div><div className={"v " + (d.net >= 0 ? "pos" : "neg")}>{eur(d.net)}</div></div>
        {d.saved !== null ? <div><div className="l">Ersparnis</div><div className={"v " + (d.saved > 0 ? "pos" : d.saved < 0 ? "neg" : "")}>{eur(d.saved)}</div></div>
          : <div><div className="l">Fixkosten offen</div><div className="v">{d.fixOpen}/{d.fixAll}</div></div>}
      </div>
      {d.saved !== null && d.fixAll > 0 && <div className="row"><span className="mut">Fixkosten offen</span><span className={d.late ? "neg" : ""}>{d.fixOpen} von {d.fixAll}{d.late ? ` · ${d.late} überfällig` : ""}</span></div>}

      <h4>Heute {openT.length ? `· ${openT.length} offen` : ""}</h4>
      {d.todayTodos.length ? d.todayTodos.slice(0, 5).map((t) => <div className="row" key={t.id}><span className={t.done ? "done" : ""}>{t.done ? "✓ " : "○ "}{t.text}</span></div>)
        : <div className="row mut"><span>Keine ToDos für heute</span></div>}
      {d.todayTodos.length > 5 && <div className="row mut"><span>+ {d.todayTodos.length - 5} weitere</span></div>}
      {d.overdue > 0 && <div className="row neg"><span>{d.overdue} offen von früheren Tagen</span></div>}

      {d.dates.length > 0 && <h4>Important Dates</h4>}
      {d.dates.map((o, i) => <div className="row" key={i}><span>{o.text}{o.age ? ` (${o.age})` : ""}</span><span className={o.in <= 7 ? "soon" : "mut"}>{when(o.in, o.date)}{o.time ? `, ${o.time}` : ""}</span></div>)}

      <div className="foot"><span>{d.training ? `Training: ${d.training.title}, vor ${d.training.h < 48 ? d.training.h + " h" : Math.floor(d.training.h / 24) + " Tagen"}` : ""}</span><span>{d.water ? `💧 ${(d.water / 1000).toLocaleString("de-DE")} l` : ""}</span></div>
    </div>
  );
};
