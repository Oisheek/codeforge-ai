/**
 * Generate unified diff patches for file changes.
 */

function generatePatch(filePath, oldContent, newContent) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  const patch = [];
  patch.push(`--- a/${filePath}`);
  patch.push(`+++ b/${filePath}`);

  // Simple line-by-line diff (not a full diff algorithm, but works for most cases)
  const maxLen = Math.max(oldLines.length, newLines.length);
  let inChange = false;

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      if (inChange) {
        inChange = false;
      }
      patch.push(` ${oldLine || ''}`);
    } else {
      inChange = true;
      if (oldLine !== undefined) patch.push(`-${oldLine}`);
      if (newLine !== undefined) patch.push(`+${newLine}`);
    }
  }

  return patch.join('\n');
}

module.exports = { generatePatch };