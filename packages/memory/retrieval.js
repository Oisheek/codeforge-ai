/**
 * Retrieval utilities for finding relevant context.
 * For V1, uses simple keyword matching.
 */

function findRelevantContext(query, documents, topK = 5) {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = documents.map((doc) => {
    const text = (doc.content || '').toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      const matches = text.split(term).length - 1;
      score += matches;
    }
    return { ...doc, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .filter((d) => d.score > 0)
    .slice(0, topK);
}

module.exports = { findRelevantContext };