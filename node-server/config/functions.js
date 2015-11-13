// functions.js
// ========

module.exports = {
  // Simple function to clone an object.
  clone: function(a) {
    return JSON.parse(JSON.stringify(a));
  }
}
