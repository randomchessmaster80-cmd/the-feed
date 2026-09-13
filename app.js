const SUPABASE_URL = 'https://dexwsauticoyhrzyazti.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRleHdzYXV0aWNveWhyenlhenRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTI5MjQsImV4cCI6MjEwNDI4ODkyNH0.xMxPgOsPlnOPk9f3l91eZa61R2BtdfdXlT6Kbfi-1Tg';
let supabase = null;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.error("Supabase failed to load. Adblocker or network issue:", e);
}

const data = window.SITE_DATA;
const tabs = document.getElementById('tabs');
const main = document.getElementById('main');
let currentSection = Object.keys(data.sections)[0];
let dbEntries = [];

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

async function fetchEntries() {
  if (!supabase) return render();
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });
  if (!error) {
    dbEntries = entries;
  }
  render();
}

function render() {
  tabs.innerHTML = '';
  Object.entries(data.sections).forEach(([key, sec]) => {
    const btn = document.createElement('button');
    btn.className = `tab ${key === currentSection ? 'active' : ''}`;
    btn.textContent = sec.label;
    btn.addEventListener('click', () => {
      currentSection = key;
      render();
    });
    tabs.appendChild(btn);
  });

  main.innerHTML = '';
  const sec = data.sections[currentSection];
  const sectionEl = document.createElement('section');
  sectionEl.className = 'feed-section active';

  let headerHtml = `
    <div class="section-header">
      <h2>${sec.label}</h2>
      <p>${sec.description}</p>
      ${sec.kindnessNote ? `<p class="kindness-note">${sec.kindnessNote}</p>` : ''}
      ${isAdmin ? `<button class="btn-primary add-btn">+ Add Entry</button>` : ''}
    </div>
    <div class="entries">
  `;

  const sectionEntries = dbEntries.filter(e => e.section === currentSection);
  if (sectionEntries.length === 0) {
    headerHtml += '<p style="opacity:0.5; font-style:italic;">Nothing here yet...</p>';
  } else {
    sectionEntries.forEach(entry => {
      let mediaHtml = '';
      if (entry.media_url) {
        if (entry.media_url.endsWith('.mp4')) {
          mediaHtml = `<video controls class="entry-media" src="${entry.media_url}"></video>`;
        } else {
          mediaHtml = `<img class="entry-media" src="${entry.media_url}">`;
        }
      }
      
      const dateStr = new Date(entry.created_at).toISOString().split('T')[0];

      headerHtml += `
        <div class="entry">
          <div class="entry-meta">${dateStr}</div>
          <h3 class="entry-title">${entry.title}</h3>
          <p class="entry-body">${entry.body}</p>
          ${entry.link ? `<a href="${entry.link}" target="_blank" class="entry-link">View Link &rarr;</a>` : ''}
          ${mediaHtml}
          ${isAdmin ? `
            <div class="admin-actions admin-only">
              <button class="btn-small edit-btn" data-id="${entry.id}">Edit</button>
              <button class="btn-small del-btn" data-id="${entry.id}">Delete</button>
            </div>
          ` : ''}
        </div>
      `;
    });
  }
  headerHtml += `</div>`;
  sectionEl.innerHTML = headerHtml;
  main.appendChild(sectionEl);

  if (isAdmin) {
    const addBtn = sectionEl.querySelector('.add-btn');
    if (addBtn) addBtn.addEventListener('click', () => openModal());

    sectionEl.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm("Delete this entry forever?")) {
          const id = e.target.dataset.id;
          await supabase.from('entries').delete().eq('id', id);
          fetchEntries();
        }
      });
    });

    sectionEl.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        openModal(id);
      });
    });
  }
}

const modal = document.getElementById('modal-backdrop');
const closeBtn = document.getElementById('modal-close');
const form = document.getElementById('entry-form');
let editingId = null;

function openModal(id = null) {
  editingId = id;
  form.reset();
  document.querySelector('#entry-form button').textContent = id ? "Save Changes" : "Post to Live Site";
  document.getElementById('modal-output').hidden = true;
  
  if (id) {
    const entry = dbEntries.find(e => e.id === id);
    document.getElementById('f-title').value = entry.title;
    document.getElementById('f-body').value = entry.body;
    document.getElementById('f-link').value = entry.link || '';
  }
  
  modal.style.display = 'flex';
}
closeBtn.addEventListener('click', () => modal.style.display = 'none');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('f-file');
  const file = fileInput.files[0];
  let mediaUrl = null;
  
  document.querySelector('#entry-form button').textContent = "Uploading... Please wait.";
  document.querySelector('#entry-form button').disabled = true;

  if (file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    if (!supabase) throw new Error('No Supabase');
const { data, error } = await supabase.storage.from('media').upload(fileName, file);
    if (data) {
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName);
      mediaUrl = publicUrlData.publicUrl;
    }
  } else if (editingId) {
    const entry = dbEntries.find(e => e.id === editingId);
    mediaUrl = entry.media_url;
  }

  const payload = {
    section: currentSection,
    title: document.getElementById('f-title').value,
    body: document.getElementById('f-body').value,
    link: document.getElementById('f-link').value,
  };
  if (mediaUrl) payload.media_url = mediaUrl;

  if (editingId) {
    await supabase.from('entries').update(payload).eq('id', editingId);
  } else {
    await supabase.from('entries').insert([payload]);
  }

  document.querySelector('#entry-form button').disabled = false;
  modal.style.display = 'none';
  fetchEntries();
});

// Hide the old copy/paste output area since it's fully automated now
document.getElementById('modal-output').style.display = 'none';

updateAdminUI();
fetchEntries();
