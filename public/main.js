'use strict';

const GITHUB_USER = 'alvinhum-AI';

// ── Nav: frosted-glass on scroll ─────────────────────────────────
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Nav: mobile toggle ───────────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const navLinksEl = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const open = navLinksEl.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ── Theme toggle ─────────────────────────────────────────────────
const ICON_MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const ICON_SUN  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

const themeToggle = document.getElementById('theme-toggle');

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeToggle.innerHTML     = dark ? ICON_SUN : ICON_MOON;
  themeToggle.ariaLabel     = dark ? 'Switch to light mode' : 'Switch to dark mode';
  sessionStorage.setItem('theme', dark ? 'dark' : 'light');
}

applyTheme(sessionStorage.getItem('theme') === 'dark');

themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
});

// ── Scroll fade-in ───────────────────────────────────────────────
const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (motionOK) {
  const fadeObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
} else {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}

// ── GitHub repos ─────────────────────────────────────────────────
const LANG_COLORS = {
  Python:     '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  C:          '#555555',
  Go:         '#00ADD8',
  Rust:       '#dea584',
  Shell:      '#89e051',
  Jupyter:    '#DA5B0B',
};

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function langDot(language) {
  if (!language) return '';
  const color = LANG_COLORS[language] || '#8a7f74';
  return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><circle cx="5" cy="5" r="5" fill="${color}"/></svg>`;
}

function buildRepoCard(repo) {
  const stars = repo.stargazers_count > 0
    ? `<span class="repo-card__stars">&#9733; ${repo.stargazers_count}</span>`
    : '';

  const desc = repo.description
    ? `<p class="repo-card__desc">${escHtml(repo.description)}</p>`
    : `<p class="repo-card__desc" style="font-style:italic;opacity:.7">No description</p>`;

  const lang = repo.language
    ? `<div class="repo-card__footer">${langDot(repo.language)}<span class="repo-card__lang">${escHtml(repo.language)}</span></div>`
    : '';

  return `<a href="${escHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="repo-card">
  <div class="repo-card__header">
    <span class="repo-card__name">${escHtml(repo.name)}</span>
    ${stars}
  </div>
  ${desc}
  ${lang}
</a>`;
}

async function loadRepos() {
  const statusEl = document.getElementById('repos-status');
  const gridEl   = document.getElementById('repos-grid');

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`
    );
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

    const repos = await res.json();
    const visible = repos.filter(r => !r.fork);

    if (visible.length === 0) {
      statusEl.textContent = 'No public repositories yet — check back soon.';
      return;
    }

    gridEl.innerHTML = visible.map(buildRepoCard).join('');
    statusEl.textContent = '';
  } catch (_err) {
    statusEl.textContent =
      "Repositories couldn't be loaded right now. Visit my GitHub profile directly.";
  }
}

loadRepos();
