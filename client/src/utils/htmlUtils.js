/**
 * Strips HTML tags from a string and returns plain text
 * @param {string} html - HTML string to strip tags from
 * @returns {string} Plain text without HTML tags
 */
export const stripHtml = (html) => {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || tmp.innerText || '').trim()
}
