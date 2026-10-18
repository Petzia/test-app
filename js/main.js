import { natalChart } from './modules/chart.js';
import { localToUtc } from './modules/time.js';
import { loadProfiles, saveProfiles, clearProfiles } from './modules/profiles.js';
import { renderToday, renderNatal, renderDestiny, renderSky, renderCompat } from './modules/views.js';
import { openProfileForm } from './modules/form.js';
import { el } from './modules/dom.js';

const TABS = ['today', 'natal', 'destiny', 'sky', 'compat'];
const ui = {
  main: document.getElementById('view'),
  tabs: [...document.querySelectorAll('[data-tab]')],
  profileSelect: document.getElementById('profile'),
  editBtn: document.getElementById('edit-profile'),
  addBtn: document.getElementById('add-profile'),
  resetBtn: document.getElementById('reset'),
  dialog: document.getElementById('profile-dialog'),
};

const state = {
  profiles: loadProfiles(),
  current: 0,
  tab: 'today',
  dayOffset: 0,
  compat: [0, 0],
};
const defaultCompat = () => [0, Math.min(1, state.profiles.length - 1)];
state.compat = defaultCompat();

function birthOf(profile) {
  const { utc, offsetMinutes } = localToUtc(profile.date, profile.time ?? '12:00', profile.timeZone);
  return { utc, offsetMinutes, latitude: profile.latitude, longitude: profile.longitude, timeKnown: profile.time !== null };
}

const chartCache = new Map();
function chartOf(profile) {
  const key = JSON.stringify(profile);
  if (!chartCache.has(key)) {
    const birth = birthOf(profile);
    chartCache.set(key, { birth, chart: natalChart(birth) });
  }
  return chartCache.get(key);
}

function renderProfileSelect() {
  ui.profileSelect.replaceChildren(...state.profiles.map((p, i) => {
    const option = el('option', { value: String(i), text: p.name });
    option.selected = i === state.current;
    return option;
  }));
}

function render() {
  for (const tab of ui.tabs) {
    const active = tab.dataset.tab === state.tab;
    tab.setAttribute('aria-pressed', String(active));
    tab.classList.toggle('active', active);
  }
  const profile = state.profiles[state.current];
  const { chart, birth } = chartOf(profile);
  if (state.tab === 'today') {
    renderToday(ui.main, profile, chart, state.dayOffset, (offset) => {
      state.dayOffset = offset;
      render();
    });
  } else if (state.tab === 'natal') {
    renderNatal(ui.main, profile, chart, birth);
  } else if (state.tab === 'destiny') {
    renderDestiny(ui.main, profile, chart, birth);
  } else if (state.tab === 'sky') {
    renderSky(ui.main);
  } else {
    const charts = state.profiles.map((p) => chartOf(p).chart);
    renderCompat(ui.main, state.profiles, charts, state.compat, (index, value) => {
      state.compat[index] = value;
      render();
    });
  }
}

function persist() {
  saveProfiles(state.profiles);
  state.current = Math.min(state.current, state.profiles.length - 1);
  state.compat = state.compat.map((i) => Math.min(i, state.profiles.length - 1));
  renderProfileSelect();
  render();
}

function saveProfile(profile) {
  const index = state.profiles.findIndex((p) => p.id === profile.id);
  if (index >= 0) {
    state.profiles[index] = profile;
    state.current = index;
  } else {
    state.profiles.push(profile);
    state.current = state.profiles.length - 1;
  }
  persist();
}

function deleteProfile(profile) {
  if (state.profiles.length <= 1) return;
  state.profiles = state.profiles.filter((p) => p.id !== profile.id);
  persist();
}

ui.tabs.forEach((tab) => tab.addEventListener('click', () => {
  state.tab = TABS.includes(tab.dataset.tab) ? tab.dataset.tab : 'today';
  render();
  ui.main.querySelector('h2')?.focus();
}));
ui.profileSelect.addEventListener('change', () => {
  state.current = Number(ui.profileSelect.value);
  state.dayOffset = 0;
  render();
});
ui.editBtn.addEventListener('click', () => openProfileForm(ui.dialog, state.profiles[state.current], {
  onSave: saveProfile,
  onDelete: state.profiles.length > 1 ? deleteProfile : null,
}));
ui.addBtn.addEventListener('click', () => openProfileForm(ui.dialog, null, { onSave: saveProfile }));
ui.resetBtn.addEventListener('click', () => {
  clearProfiles();
  state.profiles = loadProfiles();
  state.current = 0;
  state.compat = defaultCompat();
  renderProfileSelect();
  render();
});

renderProfileSelect();
render();
