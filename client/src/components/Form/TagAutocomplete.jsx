import { useState, useEffect, useRef } from 'react'
import { API_URL } from '../../config/api'
import './TagAutocomplete.css'

const TagAutocomplete = ({ value, onChange, placeholder = 'Search tags...', helpText }) => {
  const [availableTags, setAvailableTags] = useState([])
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const tagInputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Parse comma-separated string into array on mount or when value changes
  useEffect(() => {
    if (typeof value === 'string' && value.trim()) {
      const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag)
      setSelectedTags(tags)
    } else if (Array.isArray(value)) {
      setSelectedTags(value)
    } else {
      setSelectedTags([])
    }
  }, [value])

  // Fetch available tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_URL}/api/places/tags`)
        const data = await response.json()
        setAvailableTags(data.tags || [])
      } catch (error) {
      }
    }
    fetchTags()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          tagInputRef.current && !tagInputRef.current.contains(event.target)) {
        setShowTagDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter tags based on search query
  const filteredTags = availableTags.filter(({ tag }) => {
    const matchesSearch = tagSearchQuery === '' || tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    const notSelected = !selectedTags.includes(tag)
    return matchesSearch && notSelected
  })

  const handleAddTag = (tag) => {
    const newSelectedTags = [...selectedTags, tag]
    setSelectedTags(newSelectedTags)
    onChange(newSelectedTags.join(', '))
    setTagSearchQuery('')
    setShowTagDropdown(false)
  }

  const handleRemoveTag = (tagToRemove) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove)
    setSelectedTags(newSelectedTags)
    onChange(newSelectedTags.join(', '))
  }

  const handleTagInputChange = (e) => {
    setTagSearchQuery(e.target.value)
    setShowTagDropdown(true)
  }

  const handleTagInputFocus = () => {
    setShowTagDropdown(true)
  }

  const handleTagInputKeyDown = (e) => {
    // Allow manual entry with comma or Enter
    if ((e.key === ',' || e.key === 'Enter') && tagSearchQuery.trim()) {
      e.preventDefault()
      const newTag = tagSearchQuery.trim()
      if (!selectedTags.includes(newTag)) {
        handleAddTag(newTag)
      } else {
        setTagSearchQuery('')
      }
    }
  }

  return (
    <div className="form-group">
      <label>Tags</label>
      <div className="tag-autocomplete">
        <div className="tag-input-wrapper" ref={tagInputRef}>
          <input
            type="text"
            value={tagSearchQuery}
            onChange={handleTagInputChange}
            onFocus={handleTagInputFocus}
            onKeyDown={handleTagInputKeyDown}
            placeholder={placeholder}
            className="tag-search-input"
          />
        </div>

        {showTagDropdown && filteredTags.length > 0 && (
          <div className="tag-dropdown" ref={dropdownRef}>
            {filteredTags.slice(0, 10).map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="tag-dropdown-item"
              >
                <span className="tag-name">#{tag}</span>
                <span className="tag-count">{count}</span>
              </button>
            ))}
          </div>
        )}

        {selectedTags.length > 0 && (
          <div className="selected-tags">
            {selectedTags.map(tag => (
              <span key={tag} className="tag-chip">
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove-btn"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      {helpText && <p className="help-text">{helpText}</p>}
    </div>
  )
}

export default TagAutocomplete
