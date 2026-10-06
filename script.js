const envelope = document.getElementById("envelope");
const letter = document.getElementById("letter");
const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const OPEN_DURATION = prefersReducedMotion ? 500 : 2200;

let opened = false;

function updateMusicButton() {
  if (!musicToggle || !music) return;
  const isMuted = music.muted;
  musicToggle.textContent = isMuted ? "🔇" : "♫";
  musicToggle.setAttribute("aria-label", isMuted ? "Unmute music" : "Mute music");
}

function toggleMusic() {
  if (!music) return;
  music.muted = !music.muted;
  if (!music.muted) {
    music.volume = 0.3;
    music.play().catch(() => {});
  }
  updateMusicButton();
}

function finishOpening() {
  document.body.classList.add("is-open");
  envelope.hidden = true;
  if (music) {
    music.volume = 0.3;
    music.muted = false;
    music.play().catch(() => {});
    updateMusicButton();
  }
  letter.focus({ preventScroll: true });
}

function openInvitation() {
  if (opened) return;
  opened = true;
  document.body.classList.add("is-opening");
  setTimeout(finishOpening, OPEN_DURATION);
}

envelope.addEventListener("click", openInvitation);
if (musicToggle) musicToggle.addEventListener("click", toggleMusic);

// Skip the envelope while editing: open index.html#letter
if (location.hash === "#letter") {
  opened = true;
  finishOpening();
}

document.getElementById("celebrationLink").addEventListener("click", () => {
  document.getElementById("calendarSection").scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
});

// ==========================================================
// Calendar — November 2026 (1st falls on a Sunday)
// ==========================================================
const DAYS_IN_MONTH = 30;
const FIRST_WEEKDAY = 0; // 0 = Sunday, matches the Su Mo Tu... header

const EVENTS = {
  majlis: {
    day: 20,
    title: "Majlis",
    image: "images/card-majlis.jpg",
    w: 510, h: 552,
    location: "https://maps.app.goo.gl/wFMA7sZPoyCmeqJFA",
    locationTop: "80%",
    hidden: true,
  },
  mehndi: {
    day: 23,
    title: "Mehendi",
    image: "images/card-mehndi.jpg",
    w: 510, h: 391,
    location: "https://maps.app.goo.gl/AcAZkhQPv7zAUroM9",
    locationTop: "75%",
    hidden: true,
  },
  reception: {
    day: 26,
    title: "Reception",
    image: "images/card-reception.jpg",
    w: 1240, h: 1748,
    location: "https://maps.app.goo.gl/96gTvTLZ1gy8xEJUA",
    locationTop: "81%",
    hidden: false,
  },
};

const calGrid = document.getElementById("calGrid");
for (let i = 0; i < FIRST_WEEKDAY; i++) {
  const blank = document.createElement("span");
  blank.className = "cal-day is-blank";
  calGrid.appendChild(blank);
}
for (let day = 1; day <= DAYS_IN_MONTH; day++) {
  const visibleEvents = Object.entries(EVENTS).filter(([, event]) => !event.hidden);
  const eventKey = visibleEvents.find(([, event]) => event.day === day)?.[0];
  const cell = document.createElement(eventKey ? "button" : "span");
  cell.className = "cal-day" + (eventKey ? " is-marked" : "");
  cell.textContent = day;
  if (eventKey) {
    cell.type = "button";
    cell.setAttribute("aria-label", `${day} November — ${EVENTS[eventKey].title}`);
    cell.dataset.event = eventKey;
  }
  calGrid.appendChild(cell);
}

// ---------- Modal ----------
const modal = document.getElementById("eventModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalImage = document.getElementById("modalImage");
const modalLocation = document.getElementById("modalLocation");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");
let lastFocused = null;

function renderEvent(key) {
  const e = EVENTS[key];
  modalImage.src = e.image;
  modalImage.alt = e.title + " invitation";
  modalImage.width = e.w;
  modalImage.height = e.h;
  modalLocation.href = e.location;
  modalLocation.setAttribute("aria-label", `Open ${e.title} location in Google Maps`);
  modalLocation.style.setProperty("--location-top", e.locationTop);
  modalTitle.textContent = e.title;
}

function openModal(key) {
  if (!EVENTS[key]) return;
  lastFocused = document.activeElement;
  renderEvent(key);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  modalClose.focus();
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

document.addEventListener("click", (ev) => {
  const trigger = ev.target.closest("[data-event]");
  if (trigger) openModal(trigger.dataset.event);
});
modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});
