(function () {
  "use strict";
  var S = window.SITE, $ = function (s, c) { return (c || document).querySelector(s); };
  var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mail = S.business.email, h0 = S.hosts[0] || {};

  /* ---------- Rooms ---------- */
  $("#roomGrid").innerHTML = S.rooms.map(function (r) {
    var img = r.image
      ? '<img src="' + esc(r.image) + '" alt="' + esc(r.alt) + '" width="800" height="600" loading="lazy">'
      : '<div class="room__empty">Photo coming soon</div>';
    return '<article class="room"><div class="room__img">' + img + '</div><div class="room__body">' +
      "<h3>" + esc(r.name) + '</h3><p class="room__meta">' + esc(r.beds) + (r.bath ? " · " + esc(r.bath) : "") + "</p>" +
      '<p class="room__price">' + esc(r.price) + '</p><a class="btn btn--maroon" href="#contact" data-room="' + esc(r.name) + '">BOOK THIS ROOM</a></div></article>';
  }).join("");
  $("#priceNote").textContent = S.priceNote || "";
  var sel = $("#room");
  S.rooms.forEach(function (r) { var o = document.createElement("option"); o.value = o.textContent = r.name; sel.appendChild(o); });

  /* ---------- Facilities ---------- */
  $("#facGrid").innerHTML = (S.facilities || []).map(function (f) {
    return '<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><div><h3>' + esc(f.title) + "</h3><p>" + esc(f.text) + "</p></div></li>";
  }).join("");
  $("#facNote").textContent = S.facilitiesNote || "";

  /* ---------- Guest reviews ---------- */
  var star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="currentColor"/></svg>';
  $("#guestGrid").innerHTML = S.guests.map(function (g) {
    var r = Math.max(0, Math.min(5, g.rating || 0)), stars = "";
    for (var i = 0; i < r; i++) stars += star;
    var rev = g.quote ? '<blockquote class="review"><div class="review__top"><span class="stars" role="img" aria-label="' + r + ' out of 5 stars">' + stars + '</span><span class="review__score">' + r.toFixed(1) + "</span>" +
      (g.source ? '<span class="review__src">' + esc(g.source) + "</span>" : "") + "</div><p>" + esc(g.quote) + "</p>" +
      '<footer>' + (g.name ? "<cite>" + esc(g.name) + "</cite>" : "") + (g.url ? ' <a href="' + esc(g.url) + '" target="_blank" rel="noopener">Read on Google</a>' : "") + "</footer></blockquote>" : "";
    return '<div class="guest' + (rev ? "" : " guest--solo") + '"><figure><img src="' + esc(g.photo) + '" alt="' + esc(g.alt) + '" width="576" height="768" loading="lazy"><figcaption>' + esc(g.caption) + "</figcaption></figure>" + rev + "</div>";
  }).join("");

  /* ---------- Gallery + lightbox ---------- */
  var gal = S.gallery, filt = $("#galFilters"), grid = $("#galGrid");
  grid.innerHTML = gal.map(function (g, i) {
    return '<button class="tile" data-i="' + i + '" data-cat="' + esc(g.category) + '" aria-label="Open photo: ' + esc(g.alt) + '"><img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" width="' + g.w + '" height="' + g.h + '" loading="lazy"></button>';
  }).join("");
  filt.innerHTML = S.galleryCategories.map(function (c, i) { return '<button class="chip" aria-pressed="' + (i === 0) + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
  filt.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    filt.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c === b); });
    grid.querySelectorAll(".tile").forEach(function (t) { t.hidden = !(b.dataset.cat === "All" || t.dataset.cat === b.dataset.cat); });
  });
  var lb = $("#lightbox"), cur = 0, lastFocus;
  function visible() { return Array.prototype.filter.call(grid.querySelectorAll(".tile"), function (t) { return !t.hidden; }); }
  function show(i) {
    var v = visible(); if (!v.length) return; cur = (i + v.length) % v.length;
    var g = gal[v[cur].dataset.i]; $("#lbImg").src = g.full; $("#lbImg").alt = g.alt; $("#lbCap").textContent = g.alt;
  }
  grid.addEventListener("click", function (e) {
    var t = e.target.closest(".tile"); if (!t) return;
    lastFocus = t; show(visible().indexOf(t)); if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
  });
  $("#lbClose").onclick = function () { lb.close(); };
  $("#lbPrev").onclick = function () { show(cur - 1); };
  $("#lbNext").onclick = function () { show(cur + 1); };
  lb.addEventListener("close", function () { if (lastFocus) lastFocus.focus(); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });

  /* ---------- Hosts ---------- */
  $("#hostGrid").innerHTML = S.hosts.map(function (h) {
    var ini = h.name.split(" ").map(function (w) { return w[0]; }).join("");
    var ph = h.photo ? '<img src="' + esc(h.photo) + '" alt="Portrait of ' + esc(h.name) + '" loading="lazy">' : '<span aria-hidden="true">' + esc(ini) + "</span>";
    return '<article class="host"><div class="host__photo">' + ph + "</div><div><h3>" + esc(h.name) + '</h3><p class="host__role">' + esc(h.role) + '</p><a href="tel:' + esc(h.tel) + '">' + esc(h.phone) + "</a></div></article>";
  }).join("");

  /* ---------- Contact, footer, social, location ---------- */
  $("#contactList").innerHTML = '<div><dt>Email</dt><dd><a href="mailto:' + esc(mail) + '">' + esc(mail) + "</a></dd></div>" +
    S.hosts.map(function (h) { return "<div><dt>" + esc(h.name) + '</dt><dd><a href="tel:' + esc(h.tel) + '">' + esc(h.phone) + "</a></dd></div>"; }).join("");
  $("#callNow").href = "tel:" + h0.tel; $("#emailUs").href = "mailto:" + mail;
  $("#footContact").innerHTML = S.hosts.map(function (h) { return '<p><a href="tel:' + esc(h.tel) + '">' + esc(h.phone) + "</a></p>"; }).join("") + '<p><a href="mailto:' + esc(mail) + '">' + esc(mail) + "</a></p>";
  var ig = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor"/></svg>';
  var fb = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" stroke-linejoin="round"/></svg>';
  var soc = "";
  if (S.social.instagram.url) soc += '<li><a href="' + esc(S.social.instagram.url) + '" target="_blank" rel="noopener">' + ig + "Instagram</a></li>";
  if (S.social.facebook.url) soc += '<li><a href="' + esc(S.social.facebook.url) + '" target="_blank" rel="noopener">' + fb + "Facebook</a></li>";
  $("#footSocial").innerHTML = soc;
  $("#directions").href = S.map.directionsUrl;
  $("#mapBox").innerHTML = S.map.embedUrl
    ? '<iframe src="' + esc(S.map.embedUrl) + '" title="Map showing Oshneer View Guest House" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>'
    : '<div class="map-card"><img src="assets/img/aerial-24.webp" alt="Aerial view of Parwak village and the gorge beside it" loading="lazy"><div>Parwak, Upper Chitral</div></div>';

  /* structured data (only facts supplied by the owner) */
  $("#ld-json").textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "LodgingBusiness", name: S.business.name, email: mail,
    telephone: h0.tel, address: { "@type": "PostalAddress", addressLocality: "Parwak", addressRegion: "Upper Chitral", addressCountry: "PK" },
    sameAs: [S.social.instagram.url, S.social.facebook.url].filter(Boolean) });

  /* ---------- Nav ---------- */
  var nav = $("#nav"), burger = $("#burger");
  function setOpen(o) { nav.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); }
  burger.onclick = function () { setOpen(!nav.classList.contains("open")); };
  $("#navLinks").addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

  /* ---------- Hero video + cinematic scroll ---------- */
  var vid = $("#heroVideo"), content = $("#heroContent"), vh = window.innerHeight, ticking = false;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (reduce || saveData) { vid.removeAttribute("autoplay"); vid.pause(); vid.style.display = "none"; }
  else { vid.addEventListener("loadedmetadata", function () { vid.playbackRate = 0.75; }); vid.playbackRate = 0.75; var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
  function onScroll() {
    var y = window.scrollY; nav.classList.toggle("is-solid", y > vh * 0.12);
    if (!reduce && y < vh * 1.2) {
      var pr = Math.min(y / vh, 1);
      vid.style.transform = "scale(" + (1 + pr * 0.12) + ")"; vid.style.opacity = 1 - pr * 0.55;
      content.style.transform = "translate3d(0," + (-pr * 60) + "px,0)"; content.style.opacity = Math.max(0, 1 - pr * 1.6);
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", function () { vh = window.innerHeight; });
  document.addEventListener("visibilitychange", function () { if (document.hidden) vid.pause(); else if (!reduce && !saveData) vid.play().catch(function () {}); });
  onScroll();

  /* ---------- Booking form ---------- */
  var form = $("#bookingForm"), status = $("#formStatus"), btn = $("#submitBtn");
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  var iso = today.toISOString().slice(0, 10); $("#checkin").min = iso; $("#checkout").min = iso;
  function mode() { return form.type.value === "Room stay" ? "room" : "lawn"; }
  function applyMode() {
    var room = mode() === "room";
    form.querySelectorAll(".room-only").forEach(function (e) { e.hidden = !room; });
    form.querySelectorAll(".lawn-only").forEach(function (e) { e.hidden = room; });
    $("#checkinLabel").textContent = room ? "Check-in date" : "Date";
  }
  form.querySelectorAll('input[name="type"]').forEach(function (r) { r.addEventListener("change", applyMode); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-room],a[data-prefill]"); if (!a) return;
    if (a.dataset.room) { form.type.value = "Room stay"; applyMode(); sel.value = a.dataset.room; }
    else if (a.dataset.prefill === "lawn") { form.querySelector('input[value="Lawn / Dining only"]').checked = true; applyMode(); }
    else if (a.dataset.prefill === "menu") { var m = $("#message"); if (!m.value) m.value = "I would like to know today's menu."; }
  });
  applyMode();

  function setErr(id, msg) { var el = $("#" + id), er = $("#" + id + "-err"); if (er) er.textContent = msg || ""; if (el) { if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); } return !msg; }
  function validate() {
    var ok = true, v = function (n) { return form[n].value.trim(); }, room = mode() === "room";
    ok = setErr("name", v("name").length < 2 ? "Enter your full name." : "") && ok;
    ok = setErr("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email")) ? "" : "Enter a valid email address.") && ok;
    ok = setErr("phone", v("phone").replace(/\D/g, "").length < 7 ? "Enter a phone number we can call." : "") && ok;
    var g = parseInt(v("guests"), 10); ok = setErr("guests", g >= 1 && g <= 30 ? "" : "Enter a number of guests from 1 to 30.") && ok;
    var ci = v("checkin"); ok = setErr("checkin", !ci ? "Choose a date." : ci < iso ? "Choose today or a later date." : "") && ok;
    var co = v("checkout"); ok = setErr("checkout", room ? (!co ? "Choose a check-out date." : co <= ci ? "Check-out must be after check-in." : "") : "") && ok;
    return ok;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault(); status.className = "status"; status.textContent = "";
    if (!validate()) { var bad = form.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); return; }
    var room = mode() === "room", d = {};
    ["name", "email", "phone", "guests", "checkin", "message", "website"].forEach(function (n) { d[n] = form[n].value.trim(); });
    d.type = form.type.value; d.room = room ? form.room.value : ""; d.checkout = room ? form.checkout.value : ""; d.hours = room ? "" : form.hours.value;
    btn.disabled = true; btn.textContent = "SENDING…";
    fetch(S.booking.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error((res.j && res.j.error) || "failed");
        form.reset(); applyMode(); status.className = "status ok"; status.textContent = S.booking.successMessage;
      })
      .catch(function (err) {
        status.className = "status bad";
        status.innerHTML = "Your request was not sent. Please try again, or call <a href=\"tel:" + esc(h0.tel) + "\">" + esc(h0.phone) + "</a> or email <a href=\"mailto:" + esc(mail) + "\">" + esc(mail) + "</a>.";
      })
      .then(function () { btn.disabled = false; btn.textContent = "REQUEST BOOKING"; status.focus(); });
  });
})();
