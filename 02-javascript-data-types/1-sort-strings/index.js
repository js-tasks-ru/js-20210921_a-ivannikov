/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  // Create array copy
  const arrCopy = [...arr];

  // Define compare function
  const locales = ["ru", "en"];
  const options = { caseFirst: "upper" };
  const cmpFunc = param === "asc" ?
    (a, b) => a.localeCompare(b, locales, options) :
    (a, b) => -a.localeCompare(b, locales, options);

  return arrCopy.sort(cmpFunc);
}
