import { useEffect } from 'react'

/**
 * Custom hook to dynamically update document title
 * @param {string} title - The title to set for the page
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title ? `${title} | Placer` : 'Placer'

    // Cleanup function to restore previous title
    return () => {
      document.title = prevTitle
    }
  }, [title])
}

export default useDocumentTitle
