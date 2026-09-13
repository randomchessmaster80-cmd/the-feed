const SUPABASE_URL = 'https://dexwsauticoyhrzyazti.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRleHdzYXV0aWNveWhyenlhenRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTI5MjQsImV4cCI6MjEwNDI4ODkyNH0.xMxPgOsPlnOPk9f3l91eZa61R2BtdfdXlT6Kbfi-1Tg';
let dbClient = null;
try {
  if (window.supabase) dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.error("Supabase load failed:", e);
}

const data = window.SITE_DATA;
const tabs = document.getElementById('tabs');
const main = document.getElementById('main');
let currentSection = data && data.sections ? Object.keys(data.sections)[0] : '';
let dbEntries = [];

const themeBtn = document.getElementById('theme-toggle');
const loginBtn = document.getElementById('admin-login');
const logoutBtn = document.getElementById('admin-logout');

// Use polyfill if available, else standard with try/catch inside
let isAdmin = false;
try { isAdmin = window.sessionStorage.getItem('isAdmin') === 'true'; } catch(e){}

try {
  if (window.localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
  }
} catch(e){}

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    try {
      window.localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    } catch(e){}
  });
}

function updateAdminUI() {
  if (isAdmin) {
    document.body.classList.add('is-admin');
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    document.body.classList.remove('is-admin');
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
  render();
}


const loginModal = document.getElementById('login-modal-backdrop');
const loginClose = document.getElementById('login-modal-close');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    if (loginModal) {
      document.getElementById('login-password').value = '';
      if(loginError) loginError.style.display = 'none';
      loginModal.style.display = 'flex';
    }
  });
}

if (loginClose) {
  loginClose.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pwd = document.getElementById('login-password').value;
    if (pwd === "RODENT@123") {
      isAdmin = true;
      try { window.sessionStorage.setItem('isAdmin', 'true'); } catch(e){}
      updateAdminUI();
      if (loginModal) loginModal.style.display = 'none';
    } else {
      if (loginError) loginError.style.display = 'block';
    }
  });
}


if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    isAdmin = false;
    try { window.sessionStorage.removeItem('isAdmin'); } catch(e){}
    updateAdminUI();
  });
}

async function fetchEntries() {
  if (!dbClient) return render();
  try {
    const { data: entries, error } = await dbClient
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && entries) {
      dbEntries = entries;
    }
  } catch(e) {
    console.error("Fetch error:", e);
  }
  render();
}

function render() {
  if (!tabs || !main || !data) return;
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
  if (!currentSection) return;
  const sec = data.sections[currentSection];
  const sectionEl = document.createElement('section');
  sectionEl.className = 'feed-section active';

  let headerHtml = `
    <div class="section-header">
      <h2>${sec.label}</h2>
      <p>${sec.description}</p>
      ${sec.kindnessNote ? `<p class="kindness-note">${sec.kindnessNote}</p>` : ''}
      <button class="btn-primary add-btn">+ Add Entry</button>
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

  const addBtn = sectionEl.querySelector('.add-btn');
  if (addBtn) addBtn.addEventListener('click', () => openModal());

  if (isAdmin) {

    sectionEl.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm("Delete this entry forever?")) {
          const id = e.target.dataset.id;
          if(dbClient) await dbClient.from('entries').delete().eq('id', id);
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
  if(form) form.reset();
  const formBtn = document.querySelector('#entry-form button');
  if(formBtn) formBtn.textContent = id ? "Save Changes" : "Post to Live Site";
  const outputDiv = document.getElementById('modal-output');
  if(outputDiv) outputDiv.hidden = true;
  
  if (id) {
    const entry = dbEntries.find(e => e.id === id);
    if(entry) {
      document.getElementById('f-title').value = entry.title || '';
      document.getElementById('f-body').value = entry.body || '';
      }
  }
  
  if(modal) modal.style.display = 'flex';
}
if(closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');

if(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!dbClient) {
      alert("Database is currently disconnected!");
      return;
    }
    const fileInput = document.getElementById('f-file');
    const file = fileInput.files[0];
    let mediaUrl = null;
    
    const submitBtn = document.querySelector('#entry-form button');
    if(submitBtn) submitBtn.textContent = "Uploading... Please wait.";
    if(submitBtn) submitBtn.disabled = true;

    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error } = await dbClient.storage.from('media').upload(fileName, file);
        if (data) {
          const { data: publicUrlData } = dbClient.storage.from('media').getPublicUrl(fileName);
          mediaUrl = publicUrlData.publicUrl;
        }
      } else if (editingId) {
        const entry = dbEntries.find(e => e.id === editingId);
        if(entry) mediaUrl = entry.media_url;
      }

      const payload = {
        section: currentSection,
        title: document.getElementById('f-title').value,
        body: document.getElementById('f-body').value,
        };
      if (mediaUrl) payload.media_url = mediaUrl;

      if (editingId) {
        await dbClient.from('entries').update(payload).eq('id', editingId);
      } else {
        await dbClient.from('entries').insert([payload]);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save entry.");
    }

    if(submitBtn) submitBtn.disabled = false;
    if(modal) modal.style.display = 'none';
    fetchEntries();
  });
}

const outputEl = document.getElementById('modal-output');
if (outputEl) outputEl.style.display = 'none';

updateAdminUI();
fetchEntries();

