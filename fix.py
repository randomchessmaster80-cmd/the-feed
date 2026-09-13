with open("app.js", "r") as f:
    content = f.read()

# Replace the supabase initialization with a safe one
content = content.replace("const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);", """let supabase = null;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.error("Supabase failed to load. Adblocker or network issue:", e);
}""")

# Add null check to fetchEntries
content = content.replace("async function fetchEntries() {", """async function fetchEntries() {
  if (!supabase) return render();""")

# Add null check to form submit
content = content.replace("const { data, error } = await supabase.storage.from('media').upload(fileName, file);", """if (!supabase) throw new Error('No Supabase');
const { data, error } = await supabase.storage.from('media').upload(fileName, file);""")

with open("app.js", "w") as f:
    f.write(content)
