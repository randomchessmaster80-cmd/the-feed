with open("app.js", "r") as f:
    content = f.read()

# Remove the old debug alerts
content = content.replace("""if(themeBtn) {
  themeBtn.addEventListener('click', () => { alert("Dark Mode button clicked!"); });
}
if(loginBtn) {
  loginBtn.addEventListener('click', () => { alert("Admin login button clicked!"); });
}""", "")

# Replace the native prompt/alert logic
old_login_logic = """if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const pwd = prompt("Enter Admin Password:");
    if (pwd === "PRANAVRODENT@123") {
      isAdmin = true;
      try { window.sessionStorage.setItem('isAdmin', 'true'); } catch(e){}
      updateAdminUI();
    } else {
      alert("Incorrect Password!");
    }
  });
}"""

new_login_logic = """
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
"""

content = content.replace(old_login_logic, new_login_logic)

with open("app.js", "w") as f:
    f.write(content)
