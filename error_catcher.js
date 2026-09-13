window.addEventListener('error', function(e) {
  const errDiv = document.createElement('div');
  errDiv.style = "position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:9999;padding:20px;font-size:20px;font-weight:bold;";
  errDiv.innerText = "JS ERROR: " + e.message + " at " + e.filename + ":" + e.lineno;
  document.body.appendChild(errDiv);
});
window.addEventListener('unhandledrejection', function(e) {
  const errDiv = document.createElement('div');
  errDiv.style = "position:fixed;top:50px;left:0;width:100%;background:orange;color:white;z-index:9999;padding:20px;font-size:20px;font-weight:bold;";
  errDiv.innerText = "PROMISE REJECTION: " + e.reason;
  document.body.appendChild(errDiv);
});
