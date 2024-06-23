function cleanTitle(title) {
  return title.replace(/ *\([^)]*\)| *\[[^\]]*\]| *\{[^}]*\}/g, '').trim();
}

module.exports = {
  cleanTitle,
};
