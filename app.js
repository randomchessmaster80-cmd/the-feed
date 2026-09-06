(function () {
  const DATA = window.SITE_DATA;
  const tabsEl = document.getElementById('tabs');
  const mainEl = document.getElementById('main');

  document.getElementById('site-title').textContent = DATA.title;
  document.getElementById('site-tagline').textContent = DATA.tagline;

  const sectionKeys = Object.keys(DATA.sections);

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderCard(entry) {
    const card = document.createElement('div');
    card.className = 'card';
    const title = document.createElement('h3');
    title.textContent = entry.title;
    card.appendChild(title);

    if (entry.body) {
      const body = document.createElement('p');
      body.textContent = entry.body;
      card.appendChild(body);
    }

    const meta = document.createElement('div');
    meta.className = 'meta';
    const dateSpan = document.createElement('span');
    dateSpan.textContent = formatDate(entry.date);
    meta.appendChild(dateSpan);

    if (entry.link) {
      const link = document.createElement('a');
      link.className = 'card-link';
      link.href = entry.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'View →';
      meta.appendChild(link);
    }
    card.appendChild(meta);
    return card;
  }

  function renderSection(key, sec, index) {
    const section = document.createElement('section');
    section.className = 'section' + (index === 0 ? ' active' : '');
    section.dataset.section = key;

    const head = document.createElement('div');
    head.className = 'section-head';
    const headText = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = sec.label;
    const desc = document.createElement('p');
    desc.textContent = sec.description || '';
    headText.appendChild(h2);
    headText.appendChild(desc);
    head.appendChild(headText);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.textContent = sec.addButtonText || '+ Add entry';
    addBtn.addEventListener('click', () => openModal(key, sec));
    head.appendChild(addBtn);

    section.appendChild(head);

    if (sec.kindnessNote) {
      const note = document.createElement('p');
      note.className = 'kindness-note';
      note.textContent = sec.kindnessNote;
      section.appendChild(note);
    }

    const grid = document.createElement('div');
    grid.className = 'grid';

    if (!sec.entries || sec.entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Nothing here yet.';
      section.appendChild(empty);
    } else {
      sec.entries
        .slice()
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .forEach(entry => grid.appendChild(renderCard(entry)));
      section.appendChild(grid);
    }

    mainEl.appendChild(section);
  }

  function renderTab(key, sec, index) {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (index === 0 ? ' active' : '');
    btn.dataset.section = key;
    btn.textContent = sec.label;
    btn.addEventListener('click', () => switchTo(key));
    tabsEl.appendChild(btn);
  }

  function switchTo(key) {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.section === key);
    });
    document.querySelectorAll('.section').forEach(s => {
      s.classList.toggle('active', s.dataset.section === key);
    });
  }

  sectionKeys.forEach((key, i) => {
    renderTab(key, DATA.sections[key], i);
    renderSection(key, DATA.sections[key], i);
  });

  // ---------- Add-entry modal ----------
  const backdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalHint = document.getElementById('modal-hint');
  const form = document.getElementById('entry-form');
  const output = document.getElementById('modal-output');
  const codeBox = document.getElementById('modal-code');
  let currentKey = null;

  function openModal(key, sec) {
    currentKey = key;
    modalTitle.textContent = 'Add to ' + sec.label;
    modalHint.textContent = 'Fill this in, then paste the generated code into data.js.';
    form.reset();
    output.hidden = true;
    backdrop.classList.add('open');
  }

  function closeModal() {
    backdrop.classList.remove('open');
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('f-title').value.trim();
    const body = document.getElementById('f-body').value.trim();
    const link = document.getElementById('f-link').value.trim();
    const today = new Date().toISOString().slice(0, 10);

    const snippet =
`{
  title: ${JSON.stringify(title)},
  body: ${JSON.stringify(body)},
  link: ${JSON.stringify(link)},
  date: ${JSON.stringify(today)}
},`;

    codeBox.value = snippet;
    output.hidden = false;
  });

  document.getElementById('copy-code').addEventListener('click', () => {
    codeBox.select();
    document.execCommand('copy');
  });
})();
