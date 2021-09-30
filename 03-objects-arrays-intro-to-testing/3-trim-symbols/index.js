/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  // Process special cases
  if (size === undefined) return string;
  if (size === 0) return '';

  let lastChar = null, count = 0;

  const reduceFn = (result, char) => {
    if (lastChar !== char) {
      lastChar = char;
      count = 0;
    }
    if (++count > size) return result;
    return result + char;
  };

  return string.split('').reduce(reduceFn, '');
}
