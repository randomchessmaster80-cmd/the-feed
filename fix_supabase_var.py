with open("app.js", "r") as f:
    content = f.read()

# Only replace the instances where we use the client
content = content.replace("await supabase\n", "await dbClient\n")
content = content.replace("supabase.storage", "dbClient.storage")
content = content.replace("await supabase", "await dbClient")

with open("app.js", "w") as f:
    f.write(content)
