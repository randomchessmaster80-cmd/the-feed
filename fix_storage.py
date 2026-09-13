with open("app.js", "r") as f:
    content = f.read()

content = content.replace('window.safeGetItem("sessionStorage", "isAdmin") === \\\'true\\\';', "window.safeGetItem('sessionStorage', 'isAdmin') === 'true';")
content = content.replace('window.safeGetItem("localStorage", "theme\\') === \\'dark")', "window.safeGetItem('localStorage', 'theme') === 'dark'")
content = content.replace("window.safeSetItem(\"localStorage\", \"theme\", document.body.classList.contains('dark-mode') ? 'dark' : 'light');", "window.safeSetItem('localStorage', 'theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');")

with open("app.js", "w") as f:
    f.write(content)
