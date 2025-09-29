import { useState, useCallback } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useDebounce } from '../../hooks/useDebounce'
import './SearchBar.css'

const SearchBar = ({
  onSearch,
  placeholder = "Search places...",
  initialValue = '',
  className = ''
}) => {
  const [query, setQuery] = useState(initialValue)

  // Debounce search queries to avoid too many API calls
  const debouncedSearch = useCallback(
    useDebounce((searchQuery) => {
      onSearch(searchQuery)
    }, 300),
    [onSearch]
  )

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className={`search-bar ${className}`}>
      <div className="search-input-container">
        <MagnifyingGlassIcon className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button
            onClick={handleClear}
            className="clear-search-btn"
            type="button"
            aria-label="Clear search"
          >
            <XMarkIcon className="clear-icon" />
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar