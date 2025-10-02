import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const usePageTitle = (title) => {
  const location = useLocation()

  useEffect(() => {
    const pageTitle = title ? `${title} | Placer` : 'Placer'
    document.title = pageTitle
  }, [title, location])
}

export default usePageTitle
