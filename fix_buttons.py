with open("app.js", "r") as f:
    lines = f.readlines()

output = []
skip = False
for line in lines:
    if "const themeBtn = document.getElementById('theme-toggle');" in line:
        skip = True
    if "let isAdmin = sessionStorage.getItem('isAdmin') === 'true';" in line:
        output.append(line) # keep this one
        continue
    if "if (localStorage.getItem('theme') === 'dark') {" in line:
        skip = True
    if "loginBtn.addEventListener('click'" in line:
        skip = True
    if "logoutBtn.addEventListener('click'" in line:
        skip = True
    
    if skip and line.strip() == "});":
        skip = False
        continue
        
    if not skip:
        # Also remove the duplicate elements
        if "const loginBtn = document.getElementById('admin-login');" in line: continue
        if "const logoutBtn = document.getElementById('admin-logout');" in line: continue
        output.append(line)

with open("app.js", "w") as f:
    f.writelines(output)
