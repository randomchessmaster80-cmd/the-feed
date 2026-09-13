import re

with open("index.html", "r") as f:
    html = f.read()

# Remove the link input field from HTML
link_field = """      <label>Link (optional — video, image, post)
        <input type="url" id="f-link" placeholder="https://...">
      </label>"""
html = html.replace(link_field, "")
with open("index.html", "w") as f:
    f.write(html)

with open("app.js", "r") as f:
    js = f.read()

# 1. Make the Add Entry button always visible
js = js.replace("${isAdmin ? `<button class=\"btn-primary add-btn\">+ Add Entry</button>` : ''}", 
                "<button class=\"btn-primary add-btn\">+ Add Entry</button>")

# 2. Make the Add Entry button clickable by anyone
old_admin_block = """  if (isAdmin) {
    const addBtn = sectionEl.querySelector('.add-btn');
    if (addBtn) addBtn.addEventListener('click', () => openModal());"""

new_admin_block = """  const addBtn = sectionEl.querySelector('.add-btn');
  if (addBtn) addBtn.addEventListener('click', () => openModal());

  if (isAdmin) {"""
js = js.replace(old_admin_block, new_admin_block)

# 3. Remove link from openModal
js = re.sub(r"document\.getElementById\('f-link'\)\.value = entry\.link \|\| '';\n\s*", "", js)

# 4. Remove link from payload
js = re.sub(r"link:\s*document\.getElementById\('f-link'\)\.value,?\n\s*", "", js)

with open("app.js", "w") as f:
    f.write(js)
