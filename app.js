const data = window.SITE_DATA;
const tabs = document.getElementById('tabs');
const main = document.getElementById('main');
let currentSection = Object.keys(data.sections)[0];

// Theme & Admin Logic
const themeBtn = document.getElementById('theme-toggle');
const loginBtn = document.getElementById('admin-login');
const logoutBtn = document.getElementById('admin-logout');
let isAdmin = sessionStorage.getItem('isAdmin') === 'true';

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

function updateAdminUI() {
  if (isAdmin) {
    document.body.classList.add('is-admin');
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    document.body.classList.remove('is-admin');
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
  render();
}

loginBtn.addEventListener('click', () => {
  const pwd = prompt("Enter Admin Password:");
  if (pwd === "PRANAVRODENT@123") {
    isAdmin = true;
    sessionStorage.setItem('isAdmin', 'true');
    updateAdminUI();
  } else {
    alert("Incorrect Password!");
  }
});

logoutBtn.addEventListener('click', () => {
  isAdmin = false;
  sessionStorage.removeItem('isAdmin');
  updateAdminUI();
});

function render() {
  // Tabs
  tabs.innerHTML = '';
  Object.entries(data.sections).forEach(([key, sec]) => {
    const btn = document.createElement('button');
    btn.className = `tab ${key === currentSection ? 'active' : ''}`;
    btn.textContent = sec.label;
    btn.dataset.target = key;
    btn.addEventListener('click', () => {
      currentSection = key;
      render();
    });
    tabs.appendChild(btn);
  });

  // Main content
  main.innerHTML = '';
  const sec = data.sections[currentSection];
  const sectionEl = document.createElement('section');
  sectionEl.className = 'feed-section active';
  sectionEl.id = `sec-${currentSection}`;

  const header = document.createElement('div');
  header.className = 'section-header';
  
  let headerHtml = `
    <h2>${sec.label}</h2>
    <p>${sec.description}</p>
    ${sec.kindnessNote ? `<p class="kindness-note">${sec.kindnessNote}</p>` : ''}
  `;
  if (isAdmin) {
    headerHtml += `<button class="btn-primary add-btn" data-sec="${currentSection}">${sec.addButtonText}</button>`;
  }
  header.innerHTML = headerHtml;
  sectionEl.appendChild(header);

  const entriesDiv = document.createElement('div');
  entriesDiv.className = 'entries';

  if (!sec.entries || sec.entries.length === 0) {
    entriesDiv.innerHTML = '<p style="opacity:0.5; font-style:italic;">Nothing here yet...</p>';
  } else {
    sec.entries.forEach((entry, index) => {
      const entryEl = document.createElement('div');
      entryEl.className = 'entry';
      
      let mediaHtml = '';
      if (entry.media) {
        if (entry.media.startsWith('data:video')) {
          mediaHtml = `<video controls class="entry-media" src="${entry.media}"></video>`;
        } else {
          mediaHtml = `<img class="entry-media" src="${entry.media}">`;
        }
      }

      entryEl.innerHTML = `
        <div class="entry-meta">${entry.date}</div>
        <h3 class="entry-title">${entry.title}</h3>
        <p class="entry-body">${entry.body}</p>
        ${entry.link ? `<a href="${entry.link}" target="_blank" class="entry-link">View Link &rarr;</a>` : ''}
        ${mediaHtml}
        <div class="admin-actions admin-only">
          <button class="btn-small edit-btn" data-index="${index}">Edit</button>
          <button class="btn-small del-btn" data-index="${index}">Delete</button>
        </div>
      `;
      entriesDiv.appendChild(entryEl);
    });
  }

  sectionEl.appendChild(entriesDiv);
  main.appendChild(sectionEl);

  // Bind Admin Buttons
  if (isAdmin) {
    const addBtn = sectionEl.querySelector('.add-btn');
    if (addBtn) addBtn.addEventListener('click', () => openModal());

    sectionEl.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm("Delete this entry?")) {
          const idx = e.target.dataset.index;
          data.sections[currentSection].entries.splice(idx, 1);
          generateFullDataCode();
        }
      });
    });

    sectionEl.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.dataset.index;
        openModal(idx);
      });
    });
  }
}

// Modal Logic
const modal = document.getElementById('modal-backdrop');
const closeBtn = document.getElementById('modal-close');
const form = document.getElementById('entry-form');
let editingIndex = null;
let base64Media = null;

function openModal(index = null) {
  editingIndex = index;
  base64Media = null;
  form.reset();
  
  if (index !== null) {
    const entry = data.sections[currentSection].entries[index];
    document.getElementById('f-title').value = entry.title;
    document.getElementById('f-body').value = entry.body;
    document.getElementById('f-link').value = entry.link || '';
    base64Media = entry.media || null;
  }
  
  document.getElementById('modal-output').hidden = true;
  modal.style.display = 'flex';
}

closeBtn.addEventListener('click', () => modal.style.display = 'none');

document.getElementById('f-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => base64Media = ev.target.result;
  reader.readAsDataURL(file);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const newEntry = {
    title: document.getElementById('f-title').value,
    body: document.getElementById('f-body').value,
    link: document.getElementById('f-link').value,
    date: new Date().toISOString().split('T')[0],
    media: base64Media
  };

  if (editingIndex !== null) {
    data.sections[currentSection].entries[editingIndex] = newEntry;
  } else {
    data.sections[currentSection].entries.unshift(newEntry);
  }

  generateFullDataCode();
});

function generateFullDataCode() {
  const codeStr = `window.SITE_DATA = ${JSON.stringify(data, null, 2)};`;
  const codeBox = document.getElementById('modal-code');
  codeBox.value = codeStr;
  document.getElementById('modal-output').hidden = false;
  render();
}

document.getElementById('copy-code').addEventListener('click', () => {
  const codeBox = document.getElementById('modal-code');
  codeBox.select();
  document.execCommand('copy');
  alert("Copied! Now open data.js, paste over everything, and push to GitHub!");
});

// Init
updateAdminUI();
