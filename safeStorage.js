// Storage polyfill
window.safeGetItem = function(storage, key) {
  try {
    return window[storage].getItem(key);
  } catch(e) {
    return null;
  }
}
window.safeSetItem = function(storage, key, val) {
  try {
    window[storage].setItem(key, val);
  } catch(e) {}
}
window.safeRemoveItem = function(storage, key) {
  try {
    window[storage].removeItem(key);
  } catch(e) {}
}
