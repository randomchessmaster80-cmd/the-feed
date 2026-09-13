with open("index.html", "r") as f:
    content = f.read()

modal_html = """
<!-- Admin Login Modal -->
<div class="modal-backdrop" id="login-modal-backdrop" style="display: none;">
  <div class="modal" style="max-width: 300px;">
    <button class="modal-close" id="login-modal-close" aria-label="Close">&times;</button>
    <h2>Admin Login</h2>
    <p id="login-error" style="color:var(--tea); display:none; font-weight:bold; margin-bottom:10px;">Incorrect Password!</p>
    <form id="login-form">
      <label>Password
        <input type="password" id="login-password" required>
      </label>
      <button type="submit" class="btn-primary" style="margin-top:15px; width:100%;">Login</button>
    </form>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
"""

content = content.replace('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>', modal_html)

with open("index.html", "w") as f:
    f.write(content)
