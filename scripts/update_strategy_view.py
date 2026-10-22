import os

file_path = os.path.abspath("web/src/ielts/views/strategy.ts")
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# Add import at top
if 'import tipsData' not in code:
    code = code.replace(
        "import strategyData from '../data/strategy.json';\nimport { esc, h } from '../ui';",
        "import strategyData from '../data/strategy.json';\nimport tipsData from '../../assets/data/ielts-tips.json';\nimport { esc, h } from '../ui';\nimport { ttsAvailable } from '../tts';"
    )

strat_view_start = code.find("export function strategyView(root: HTMLElement): () => void {")
assert strat_view_start != -1, "strategyView not found"

header_and_cards = code[:strat_view_start]

new_strategy_view = """export interface TipItem {
  id: string;
  slug: string;
  title: string;
  skill: string;
  category: string;
  rating: number | null;
  votes: string;
  views: number;
  date: string;
  summary: string;
  headings: string[];
  content_text: string;
}

const ALL_TIPS: TipItem[] = tipsData as TipItem[];

export function strategyView(root: HTMLElement): () => void {
  const allCards = getAllCards();
  let currentSkillFilter = 'all';
  let searchQuery = '';

  root.innerHTML = '';
  root.append(
    h('h1', 'ie-title', 'IELTS Master Strategy & Knowledge Codex'),
    h(
      'p',
      'ie-lead',
      'The authoritative IELTS strategy compendium: 46 tactical exam blueprints from the Band 7+ master curriculum alongside 746 official articles & lessons from IELTS Online Tests.'
    )
  );

  // Master Mode Switcher
  const modeSwitcher = h('div', 'ie-mode-switcher');
  const btnBlueprints = h(
    'button',
    'ie-mode-btn is-active',
    `📐 46 Tactical Blueprints (Formulas & Traps)`
  );
  const btnVault = h(
    'button',
    'ie-mode-btn',
    `💡 746 IELTS Knowledge Vault & Tips Explorer`
  );
  modeSwitcher.append(btnBlueprints, btnVault);
  root.append(modeSwitcher);

  // Container 1: Blueprints (Existing 46 cards)
  const blueprintsContainer = h('div', 'ie-blueprints-container');

  // Top Controls Bar: Skill filter tabs + Search input
  const controlsBar = h('div', 'ie-strategy-controls');

  const filterTabs = h('div', 'ie-tabs ie-strategy-tabs');
  filterTabs.setAttribute('role', 'tablist');
  filterTabs.setAttribute('aria-label', 'Filter strategy by skill');

  const tabsConfig = [
    { id: 'all', label: 'All' },
    { id: 'reading', label: 'Reading (14 Types)' },
    { id: 'listening', label: 'Listening' },
    { id: 'writing1', label: 'Writing T1' },
    { id: 'writing2', label: 'Writing T2' },
    { id: 'speaking', label: 'Speaking' },
    { id: 'cbt', label: 'CBT Navigation' }
  ];

  tabsConfig.forEach(t => {
    const btn = h('button', `ie-tab ${t.id === currentSkillFilter ? 'is-on' : ''}`, esc(t.label));
    btn.setAttribute('role', 'tab');
    btn.setAttribute('data-filter', t.id);
    btn.setAttribute('aria-selected', t.id === currentSkillFilter ? 'true' : 'false');
    btn.addEventListener('click', () => {
      currentSkillFilter = t.id;
      filterTabs.querySelectorAll('.ie-tab').forEach(b => {
        const on = (b as HTMLElement).getAttribute('data-filter') === t.id;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      renderCards();
    });
    filterTabs.append(btn);
  });

  const searchBox = h('div', 'ie-search-box');
  const searchInput = h('input', 'ie-input ie-search') as HTMLInputElement;
  searchInput.type = 'search';
  searchInput.placeholder = 'Search formulas, traps, question types, or synonyms...';
  searchInput.setAttribute('aria-label', 'Search strategy cards');
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderCards();
  });
  searchBox.append(searchInput);

  const expandAllBtn = h('button', 'ie-btn ie-expand-all', 'Expand All Drawers');
  let allExpanded = false;
  expandAllBtn.addEventListener('click', () => {
    allExpanded = !allExpanded;
    expandAllBtn.textContent = allExpanded ? 'Collapse All Drawers' : 'Expand All Drawers';
    cardsGrid.querySelectorAll('.ie-strategy-card').forEach(cardEl => {
      cardEl.classList.toggle('is-open', allExpanded);
      const toggle = cardEl.querySelector('.ie-drawer-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', allExpanded ? 'true' : 'false');
        toggle.textContent = allExpanded ? 'Hide Details ▲' : 'Details & Formula ▼';
      }
    });
  });

  const actionsBar = h('div', 'ie-strategy-actions');
  actionsBar.append(searchBox, expandAllBtn);

  controlsBar.append(filterTabs, actionsBar);
  blueprintsContainer.append(controlsBar);

  const countBadge = h('div', 'ie-count-badge', '');
  blueprintsContainer.append(countBadge);

  const cardsGrid = h('div', 'ie-cards ie-strategy-grid');
  blueprintsContainer.append(cardsGrid);

  function renderCards(): void {
    cardsGrid.innerHTML = '';

    const filtered = allCards.filter(c => {
      const matchSkill = matchesSkillFilter(c.skill, currentSkillFilter);
      if (!matchSkill) return false;
      if (!searchQuery) return true;

      const titleMatch = c.title.toLowerCase().includes(searchQuery);
      const skillMatch = c.skill.toLowerCase().includes(searchQuery);
      const formulaMatch = c.formula ? c.formula.toLowerCase().includes(searchQuery) : false;
      const tipsMatch = c.tips.some(t => t.toLowerCase().includes(searchQuery));
      const trapsMatch = c.traps ? c.traps.some(tr => tr.toLowerCase().includes(searchQuery)) : false;
      const synMatch = c.synonymPairs
        ? c.synonymPairs.some(
            s => s.promptWord.toLowerCase().includes(searchQuery) || s.passageWord.toLowerCase().includes(searchQuery)
          )
        : false;

      return titleMatch || skillMatch || formulaMatch || tipsMatch || trapsMatch || synMatch;
    });

    countBadge.innerHTML = `Showing <b>${filtered.length}</b> strategy card${filtered.length === 1 ? '' : 's'}${
      currentSkillFilter !== 'all' ? ` in <em>${esc(currentSkillFilter)}</em>` : ''
    }${searchQuery ? ` matching "<em>${esc(searchQuery)}</em>"` : ''}`;

    if (!filtered.length) {
      cardsGrid.append(
        h(
          'div',
          'ie-empty-message',
          '<p class="ie-note">No strategy cards match your current filter and search query. Try switching skill tabs or clearing search.</p>'
        )
      );
      return;
    }

    filtered.forEach(c => {
      const card = h('article', 'ie-card ie-strategy-card');
      card.id = c.id;
      card.setAttribute('data-id', c.id);
      card.setAttribute('data-skill', c.skill);

      const header = h('div', 'ie-strategy-header');
      header.innerHTML = `
        <div class="ie-strategy-meta">
          <span class="ie-skill-badge">${esc(c.skill)}</span>
          ${c.sectionRef ? `<small class="ie-sec-ref">${esc(c.sectionRef)}</small>` : ''}
        </div>
        <h3 class="ie-strategy-title">${esc(c.title)}</h3>
      `;

      const formulaSnippet = c.formula
        ? `<div class="ie-formula-snippet"><code>${esc(c.formula)}</code></div>`
        : '';

      const toggleBtn = h('button', 'ie-btn ie-drawer-toggle', 'Details & Formula ▼');
      toggleBtn.setAttribute('aria-expanded', 'false');

      const drawer = h('div', 'ie-strategy-drawer');

      let formulaBlock = '';
      if (c.formula) {
        formulaBlock = `
          <div class="ie-drawer-section ie-section-formula">
            <h4>📐 Tactical Formula &amp; Step-by-Step Algorithm</h4>
            <div class="ie-formula-code">${esc(c.formula)}</div>
          </div>
        `;
      }

      let trapsBlock = '';
      if (c.traps && c.traps.length) {
        trapsBlock = `
          <div class="ie-drawer-section ie-section-traps">
            <h4>⚠️ Common Examiner Traps &amp; Distractors</h4>
            <ul class="ie-traps-list">
              ${c.traps.map(tr => `<li>${esc(tr)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      let synBlock = '';
      if (c.synonymPairs && c.synonymPairs.length) {
        synBlock = `
          <div class="ie-drawer-section ie-section-synonyms">
            <h4>🔄 Exam Synonym Mapping Engine</h4>
            <div class="ie-table-wrap">
              <table class="ie-table ie-synonym-table">
                <thead>
                  <tr>
                    <th>Prompt / Question Phrase</th>
                    <th>Passage / Audio Counterpart</th>
                  </tr>
                </thead>
                <tbody>
                  ${c.synonymPairs
                    .map(
                      sp =>
                        `<tr><td><code>${esc(sp.promptWord)}</code></td><td><code>${esc(sp.passageWord)}</code></td></tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      const tipsBlock = `
        <div class="ie-drawer-section ie-section-tips">
          <h4>💡 Actionable Execution Tips</h4>
          <ul class="ie-tips-list">
            ${c.tips.map(t => `<li>${esc(t)}</li>`).join('')}
          </ul>
        </div>
      `;

      drawer.innerHTML = formulaBlock + trapsBlock + synBlock + tipsBlock;

      function toggleOpen(e?: Event): void {
        if (e) e.stopPropagation();
        const isOpen = card.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggleBtn.textContent = isOpen ? 'Hide Details ▲' : 'Details & Formula ▼';
      }

      toggleBtn.addEventListener('click', toggleOpen);
      header.addEventListener('click', () => toggleOpen());
      card.addEventListener('click', e => {
        if (e.target === card) toggleOpen(e);
      });

      card.append(header, h('div', '', formulaSnippet), toggleBtn, drawer);
      cardsGrid.append(card);
    });
  }

  // ==========================================
  // CONTAINER 2: 746 TIPS VAULT & EXPLORER
  // ==========================================
  const vaultContainer = h('div', 'ie-vault-container');
  vaultContainer.style.display = 'none';

  let vaultSkill = 'all';
  let vaultQuery = '';
  let vaultSort = 'views'; // 'views' | 'rating' | 'date'
  let vaultLimit = 24;

  const vaultControls = h('div', 'ie-tips-controls');

  // Top search & sort row
  const barTop = h('div', 'ie-tips-bar-top');
  const searchWrap = h('div', 'ie-tips-search-wrap');
  const vSearchInput = h('input', 'ie-tips-search') as HTMLInputElement;
  vSearchInput.type = 'search';
  vSearchInput.placeholder = 'Search 746 tips, rules, essays, or grammar lessons...';
  vSearchInput.setAttribute('aria-label', 'Search IELTS Tips');
  const searchIcon = h('span', 'ie-tips-search-icon', '🔍');
  searchWrap.append(searchIcon, vSearchInput);

  const sortSelect = h('select', 'ie-tips-sort') as HTMLSelectElement;
  sortSelect.setAttribute('aria-label', 'Sort tips');
  sortSelect.innerHTML = `
    <option value="views">🔥 Most Popular (Views)</option>
    <option value="rating">⭐ Highest Rated</option>
    <option value="date">📅 Newest Added</option>
  `;

  barTop.append(searchWrap, sortSelect);

  // Skill filter chips
  const chipsRow = h('div', 'ie-tips-chips');
  const skillChips = [
    { id: 'all', label: 'All', icon: '🌐' },
    { id: 'Writing', label: 'Writing', icon: '✍️' },
    { id: 'Grammar', label: 'Grammar 101', icon: '🏛️' },
    { id: 'Vocabulary', label: 'Vocabulary', icon: '📚' },
    { id: 'Speaking', label: 'Speaking', icon: '🎙️' },
    { id: 'Reading', label: 'Reading', icon: '📖' },
    { id: 'Listening', label: 'Listening', icon: '🎧' },
    { id: 'General & Strategies', label: 'General & Strategies', icon: '🧭' }
  ];

  function renderChips(): void {
    chipsRow.innerHTML = '';
    skillChips.forEach(sc => {
      const count =
        sc.id === 'all'
          ? ALL_TIPS.length
          : ALL_TIPS.filter(t => t.skill === sc.id).length;
      const chip = h(
        'button',
        `ie-tips-chip ${vaultSkill === sc.id ? 'is-active' : ''}`,
        `<span>${sc.icon}</span> <span>${esc(sc.label)}</span> <span class="ie-tips-chip-count">${count}</span>`
      );
      chip.addEventListener('click', () => {
        vaultSkill = sc.id;
        vaultLimit = 24;
        renderChips();
        renderVault();
      });
      chipsRow.append(chip);
    });
  }

  vaultControls.append(barTop, chipsRow);
  vaultContainer.append(vaultControls);

  const vaultStats = h('div', 'ie-count-badge', '');
  vaultContainer.append(vaultStats);

  const vaultGrid = h('div', 'ie-tips-grid');
  vaultContainer.append(vaultGrid);

  const loadMoreBtn = h('button', 'ie-btn ie-btn-primary', 'Load More Strategies (24+)');
  loadMoreBtn.style.margin = 'var(--space-16) auto';
  loadMoreBtn.style.display = 'block';
  loadMoreBtn.addEventListener('click', () => {
    vaultLimit += 24;
    renderVault();
  });
  vaultContainer.append(loadMoreBtn);

  // Reading Modal Element
  const modalOverlay = h('div', 'ie-tip-modal-overlay');
  const modalBox = h('div', 'ie-tip-modal-box');
  const modalHeader = h('div', 'ie-tip-modal-header');
  const modalTitle = h('h3', '', 'Strategy Guide');
  modalTitle.style.margin = '0';
  modalTitle.style.fontSize = 'var(--text-lg)';
  const closeBtn = h('button', 'ie-tip-modal-close', '✕');
  closeBtn.setAttribute('aria-label', 'Close modal');
  modalHeader.append(modalTitle, closeBtn);

  const modalBody = h('div', 'ie-tip-modal-body');
  modalBox.append(modalHeader, modalBody);
  modalOverlay.append(modalBox);
  root.append(modalOverlay);

  function closeModal(): void {
    modalOverlay.classList.remove('is-active');
    if (ttsAvailable()) speechSynthesis.cancel();
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('is-active')) {
      closeModal();
    }
  });

  function openTipDetail(tip: TipItem): void {
    modalTitle.textContent = tip.title;
    modalBody.innerHTML = '';

    const metaRow = h('div', 'ie-tip-meta-header');
    metaRow.innerHTML = `
      <div style="display:flex; gap: var(--space-8); align-items:center;">
        <span class="ie-skill-badge ie-skill-${esc(tip.skill.split(' ')[0])}">${esc(tip.skill)}</span>
        <span style="font-size: var(--text-xs); color: var(--ink-muted);">${esc(tip.category)}</span>
      </div>
      <div style="font-size: var(--text-xs); color: var(--ink-muted);">
        👁️ ${tip.views.toLocaleString()} views ${tip.rating ? `· ⭐ ${tip.rating} (${esc(tip.votes)})` : ''} · 📅 ${esc(tip.date)}
      </div>
    `;

    const audioRow = h('div', '', '');
    if (ttsAvailable()) {
      const listenBtn = h('button', 'ie-btn', '🔊 Listen to Audio Lesson (en-GB)');
      listenBtn.addEventListener('click', () => {
        speechSynthesis.cancel();
        const textToRead = `${tip.title}. ${tip.summary}. ${tip.content_text.slice(0, 1500)}`;
        const u = new SpeechSynthesisUtterance(textToRead);
        u.lang = 'en-GB';
        u.rate = 0.95;
        speechSynthesis.speak(u);
      });
      audioRow.append(listenBtn);
    }

    const summaryBox = h('div', 'ie-tipcard', `
      <div style="padding: var(--space-12); background: rgba(56, 189, 248, 0.08); border-left: 3px solid var(--accent-cyan); border-radius: 8px; margin: var(--space-12) 0;">
        <b style="color: var(--accent-cyan);">Executive Key Takeaways:</b>
        <p style="margin-top: var(--space-6); color: var(--ink-primary);">${esc(tip.summary)}</p>
      </div>
    `);

    // Format full article content
    const contentEl = h('div', 'ie-tip-full-content');
    const paras = tip.content_text.split(/\\n\\n+/);
    paras.forEach(p => {
      const trimmed = p.trim();
      if (!trimmed) return;
      if (trimmed.length < 80 && !trimmed.endsWith('.')) {
        contentEl.append(h('h3', '', esc(trimmed)));
      } else {
        contentEl.append(h('p', '', esc(trimmed)));
      }
    });

    modalBody.append(metaRow, audioRow, summaryBox, contentEl);
    modalOverlay.classList.add('is-active');
  }

  function renderVault(): void {
    vaultGrid.innerHTML = '';

    let filtered = ALL_TIPS.filter(t => {
      if (vaultSkill !== 'all' && t.skill !== vaultSkill) return false;
      if (!vaultQuery) return true;
      const q = vaultQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.headings.some(h => h.toLowerCase().includes(q))
      );
    });

    // Sort
    if (vaultSort === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (vaultSort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (vaultSort === 'date') {
      filtered.sort((a, b) => (b.date > a.date ? 1 : -1));
    }

    const totalViewsInFilter = filtered.reduce((acc, it) => acc + it.views, 0);
    vaultStats.innerHTML = `Displaying <b>${Math.min(vaultLimit, filtered.length)}</b> of <b>${filtered.length}</b> articles ${
      vaultSkill !== 'all' ? `in <em>${esc(vaultSkill)}</em>` : ''
    } · Cumulative views: <b>${totalViewsInFilter.toLocaleString()}</b>`;

    if (!filtered.length) {
      vaultGrid.append(
        h(
          'div',
          'ie-empty-message',
          '<p class="ie-note">No articles match your current search. Try clearing keywords or selecting "All".</p>'
        )
      );
      loadMoreBtn.style.display = 'none';
      return;
    }

    const batch = filtered.slice(0, vaultLimit);
    batch.forEach(tip => {
      const card = h('article', 'ie-card ie-tip-vault-card');
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');

      const metaHeader = h('div', 'ie-tip-meta-header');
      const skillClass = `ie-skill-${esc(tip.skill.split(' ')[0])}`;
      metaHeader.innerHTML = `
        <span class="ie-skill-badge ${skillClass}">${esc(tip.skill)}</span>
        <span class="ie-tip-views">👁️ ${tip.views > 9999 ? (tip.views / 1000).toFixed(1) + 'k' : tip.views} views</span>
      `;

      const titleEl = h('h3', 'ie-tip-card-title', esc(tip.title));
      const summaryEl = h('p', 'ie-tip-card-summary', esc(tip.summary));

      const footer = h('div', 'ie-tip-card-footer');
      footer.innerHTML = `
        <span style="color: var(--ink-muted); font-size: var(--text-2xs);">${
          tip.rating ? `⭐ ${tip.rating.toFixed(1)} (${esc(tip.votes)})` : esc(tip.date)
        }</span>
        <span class="ie-tip-read-btn">Read Full Guide →</span>
      `;

      card.append(metaHeader, titleEl, summaryEl, footer);

      card.addEventListener('click', () => openTipDetail(tip));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTipDetail(tip);
        }
      });

      vaultGrid.append(card);
    });

    loadMoreBtn.style.display = vaultLimit < filtered.length ? 'block' : 'none';
  }

  // Switcher event handlers
  btnBlueprints.addEventListener('click', () => {
    btnBlueprints.classList.add('is-active');
    btnVault.classList.remove('is-active');
    blueprintsContainer.style.display = 'block';
    vaultContainer.style.display = 'none';
  });

  btnVault.addEventListener('click', () => {
    btnVault.classList.add('is-active');
    btnBlueprints.classList.remove('is-active');
    blueprintsContainer.style.display = 'none';
    vaultContainer.style.display = 'block';
    renderChips();
    renderVault();
  });

  vSearchInput.addEventListener('input', () => {
    vaultQuery = vSearchInput.value.trim();
    vaultLimit = 24;
    renderVault();
  });

  sortSelect.addEventListener('change', () => {
    vaultSort = sortSelect.value;
    renderVault();
  });

  root.append(blueprintsContainer, vaultContainer);

  renderCards();

  return () => {
    if (ttsAvailable()) speechSynthesis.cancel();
  };
}
"""

full_code = header_and_cards + new_strategy_view

with open(file_path, "w", encoding="utf-8") as f:
    f.write(full_code)

print("Updated strategy.ts successfully!")
