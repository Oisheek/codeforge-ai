/**
 * Changelog generation utilities.
 */

function generateChangelogEntry(version, changes) {
  const date = new Date().toISOString().split('T')[0];
  const entry = [`## [${version}] - ${date}`, ''];

  const categories = {
    added: [],
    changed: [],
    fixed: [],
    removed: [],
  };

  for (const change of changes) {
    if (categories[change.type]) {
      categories[change.type].push(change.description);
    } else {
      categories.changed.push(change.description);
    }
  }

  for (const [category, items] of Object.entries(categories)) {
    if (items.length === 0) continue;
    entry.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    for (const item of items) {
      entry.push(`- ${item}`);
    }
    entry.push('');
  }

  return entry.join('\n');
}

module.exports = { generateChangelogEntry };