/* Oshneer View — static server + booking endpoint + booking database. Node 18+ (Node 22.5+ uses SQLite).
   Every booking request is SAVED to a database first, then emailed. Secrets come from env vars (.env). */
const http = require("http"), fs = require("fs"), path = require("path");
try { fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/).forEach(l => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }); } catch (_) {}

const PORT = process.env.PORT || 3000, ROOT = __dirname;
const TO = (process.env.BOOKING_TO || "razimonthebeat@gmail.com");          // comma-separate to add more recipients
const DRY = process.env.MAIL_DRY_RUN === "1", ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const DATA = process.env.DATA_DIR || path.join(ROOT, "data"); fs.mkdirSync(DATA, { recursive: true });

/* ---------------- Database ---------------- */
const COLS = ["created_at", "type", "name", "email", "phone", "guests", "room", "checkin", "checkout", "hours", "message", "ip"];
let store;
try {
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(path.join(DATA, "bookings.db"));
  db.exec(`CREATE TABLE IF NOT EXISTS bookings(id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT, type TEXT, name TEXT, email TEXT, phone TEXT, guests TEXT, room TEXT, checkin TEXT, checkout TEXT, hours TEXT, message TEXT, ip TEXT, emailed INTEGER DEFAULT 0, email_error TEXT)`);
  store = {
    kind: "SQLite (data/bookings.db)",
    add: r => Number(db.prepare(`INSERT INTO bookings(${COLS.join(",")}) VALUES(${COLS.map(() => "?").join(",")})`).run(...COLS.map(c => r[c] ?? "")).lastInsertRowid),
    mark: (id, ok, err) => db.prepare("UPDATE bookings SET emailed=?, email_error=? WHERE id=?").run(ok ? 1 : 0, err || "", id),
    unsent: () => db.prepare("SELECT * FROM bookings WHERE emailed=0 ORDER BY id LIMIT 20").all(),
    all: () => db.prepare("SELECT * FROM bookings ORDER BY id DESC").all()
  };
} catch (_) { // older Node: fall back to a JSON file
  const f = path.join(DATA, "bookings.json"), load = () => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return []; } }, save = a => fs.writeFileSync(f, JSON.stringify(a, null, 1));
  store = {
    kind: "JSON file (data/bookings.json) — use Node 22.5+ for SQLite",
    add: r => { const a = load(), id = (a.at(-1)?.id || 0) + 1; a.push({ id, ...r, emailed: 0, email_error: "" }); save(a); return id; },
    mark: (id, ok, err) => { const a = load(), x = a.find(b => b.id === id); if (x) { x.emailed = ok ? 1 : 0; x.email_error = err || ""; save(a); } },
    unsent: () => load().filter(b => !b.emailed).slice(0, 20),
    all: () => load().reverse()
  };
}

/* ---------------- Email ---------------- */
let transporter = null;
if (!DRY) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) console.warn("WARNING: SMTP_USER / SMTP_PASS not set — requests are saved to the database but NOT emailed yet.");
  else transporter = require("nodemailer").createTransport({ host: process.env.SMTP_HOST || "smtp.gmail.com", port: +(process.env.SMTP_PORT || 465), secure: (process.env.SMTP_PORT || "465") === "465", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function rowsOf(b) {
  const room = b.type === "Room stay";
  return [["Booking #", b.id], ["Type", b.type], ["Name", b.name], ["Email", b.email], ["Phone", b.phone], ["Guests", b.guests],
    ...(room ? [["Preferred room", b.room], ["Check-in", b.checkin], ["Check-out", b.checkout]] : [["Date", b.checkin], ["Hours needed", b.hours || "—"]]),
    ["Message", b.message || "—"], ["Received", b.created_at]];
}
async function sendMail(b) {
  const rows = rowsOf(b), text = rows.map(r => r.join(": ")).join("\n") + "\n\nBooking REQUEST only — not a confirmed reservation.";
  const html = "<h2>New booking request</h2><table cellpadding=6>" + rows.map(r => `<tr><td><b>${r[0]}</b></td><td>${esc(r[1]).replace(/\n/g, "<br>")}</td></tr>`).join("") + "</table><p>Booking request only — not a confirmed reservation. Reply to this email to contact the guest.</p>";
  if (DRY) { console.log("[dry-run] would email " + TO + "\n" + text); return; }
  if (!transporter) throw new Error("email not configured");
  await transporter.sendMail({ from: `"Oshneer View website" <${process.env.SMTP_USER}>`, to: TO, replyTo: b.email, subject: `Booking request #${b.id}: ${b.type} — ${b.name}`, text, html });
}
async function deliver(b) { try { await sendMail(b); store.mark(b.id, true); return true; } catch (e) { store.mark(b.id, false, e.message); console.error("mail error (saved, will retry):", e.message); return false; } }
setInterval(async () => { if (DRY || !transporter) return; for (const b of store.unsent()) await deliver(b); }, 10 * 60 * 1000).unref();

/* ---------------- HTTP ---------------- */
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".mp4": "video/mp4", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain", ".xml": "application/xml" };
const hits = new Map();
const limited = ip => { const now = Date.now(), a = (hits.get(ip) || []).filter(t => now - t < 3600e3); a.push(now); hits.set(ip, a); return a.length > 5; };
const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
const clean = (v, n) => String(v == null ? "" : v).replace(/[\r\n]+/g, " ").trim().slice(0, n);

function handleBooking(req, res) {
  let body = ""; req.on("data", c => { body += c; if (body.length > 20000) req.destroy(); });
  req.on("end", async () => {
    let d; try { d = JSON.parse(body); } catch { return send(res, 400, { error: "Invalid request" }); }
    if (d.website) return send(res, 200, { ok: true }); // honeypot
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    if (limited(ip)) return send(res, 429, { error: "Too many requests" });
    const f = { created_at: new Date().toISOString(), ip, name: clean(d.name, 100), email: clean(d.email, 150), phone: clean(d.phone, 30), guests: clean(d.guests, 3), type: clean(d.type, 30), room: clean(d.room, 40), checkin: clean(d.checkin, 10), checkout: clean(d.checkout, 10), hours: clean(d.hours, 3), message: String(d.message || "").trim().slice(0, 1500) };
    const date = /^\d{4}-\d{2}-\d{2}$/, room = f.type === "Room stay";
    if (f.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) || f.phone.replace(/\D/g, "").length < 7 || !(+f.guests >= 1) || !date.test(f.checkin) || (room && (!date.test(f.checkout) || f.checkout <= f.checkin)) || !["Room stay", "Lawn / Dining only"].includes(f.type))
      return send(res, 400, { error: "Please check the form fields" });
    let id; try { id = store.add(f); } catch (e) { console.error("db error:", e.message); return send(res, 500, { error: "Could not save" }); }
    deliver({ id, ...f });                 // email in the background; the request is already safely stored
    send(res, 200, { ok: true });
  });
}
function csv(rows) {
  const cols = ["id", ...COLS, "emailed", "email_error"], q = v => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  return [cols.join(","), ...rows.map(r => cols.map(c => q(r[c])).join(","))].join("\n");
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  res.setHeader("X-Content-Type-Options", "nosniff"); res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (url.pathname === "/api/booking") return req.method === "POST" ? handleBooking(req, res) : send(res, 405, { error: "POST only" });
  if (url.pathname === "/admin/bookings.csv" || url.pathname === "/admin/bookings.json") {   // owner export, needs ADMIN_TOKEN
    const tok = (req.headers.authorization || "").replace(/^Bearer /, "") || url.searchParams.get("token") || "";
    if (!ADMIN_TOKEN || tok !== ADMIN_TOKEN) { res.writeHead(401); return res.end("Unauthorized"); }
    const rows = store.all();
    if (url.pathname.endsWith(".csv")) { res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=bookings.csv", "Cache-Control": "no-store" }); return res.end(csv(rows)); }
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" }); return res.end(JSON.stringify(rows));
  }
  let p = decodeURIComponent(url.pathname); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, path.normalize(p));
  const blocked = /^\/(server\.js|package(-lock)?\.json|\.env.*|README\.md|node_modules|data|\.gitignore)/.test(p);
  if (!file.startsWith(ROOT) || blocked) { res.writeHead(404); return res.end("Not found"); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end("Not found"); }
    const ext = path.extname(file), h = { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": /^\/assets\//.test(p) ? "public, max-age=2592000" : "no-cache" };
    if (ext === ".mp4" && req.headers.range) {
      const [s, e] = req.headers.range.replace("bytes=", "").split("-"), a = +s, b = e ? +e : st.size - 1;
      res.writeHead(206, { ...h, "Content-Range": `bytes ${a}-${b}/${st.size}`, "Accept-Ranges": "bytes", "Content-Length": b - a + 1 }); return fs.createReadStream(file, { start: a, end: b }).pipe(res);
    }
    h["Content-Length"] = st.size; if (ext === ".mp4") h["Accept-Ranges"] = "bytes";
    res.writeHead(200, h); fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, () => console.log(`Oshneer View on http://localhost:${PORT} · database: ${store.kind} · emails to: ${TO}`));
