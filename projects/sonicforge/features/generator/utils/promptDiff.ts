
/**
 * Compares two comma-separated style strings and identifies added/removed keywords.
 */
export const diffStyleStrings = (base: string, variation: string): { added: string[], removed: string[] } => {
  const baseSet = new Set(base.toLowerCase().split(',').map(s => s.trim()).filter(Boolean));
  const variationSet = new Set(variation.toLowerCase().split(',').map(s => s.trim()).filter(Boolean));

  const added = Array.from(variationSet).filter(item => !baseSet.has(item));
  const removed = Array.from(baseSet).filter(item => !variationSet.has(item));

  return { added, removed };
};
