import { useRef } from 'react'

export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null)

  return (...args) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}