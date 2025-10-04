/**
 * useAsyncAction Hook
 * Eliminates repetitive try/catch/toast/confirm patterns
 *
 * Usage:
 *   const { execute, isProcessing } = useAsyncAction()
 *
 *   const handleAction = () => {
 *     execute({
 *       action: () => dispatch(someAction(id)).unwrap(),
 *       confirm: {
 *         title: 'Confirm Action',
 *         message: 'Are you sure?'
 *       },
 *       successMessage: 'Action completed!',
 *       errorMessage: 'Action failed',
 *       onSuccess: (result) => { /* handle result */ }
 *     })
 *   }
 */

import { useState } from 'react'
import { useConfirm } from '../components/UI/ConfirmDialogProvider'
import { useToast } from '../components/UI/ToastContainer'

export const useAsyncAction = () => {
  const [processingId, setProcessingId] = useState(null)
  const { confirm } = useConfirm()
  const toast = useToast()

  const execute = async ({
    id,
    action,
    confirm: confirmOptions,
    successMessage,
    errorMessage,
    onSuccess,
    onError
  }) => {
    // Show confirmation dialog if options provided
    if (confirmOptions) {
      const confirmed = await confirm(confirmOptions)
      if (!confirmed) return { success: false, cancelled: true }
    }

    try {
      if (id) setProcessingId(id)

      // Execute the action (should return a promise)
      const result = await action()

      // Show success toast if message provided
      if (successMessage) {
        toast.success(successMessage)
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result)
      }

      return { success: true, data: result }
    } catch (error) {
      // Show error toast
      const message = error || errorMessage || 'An error occurred'
      toast.error(message)

      // Call error callback if provided
      if (onError) {
        onError(error)
      }

      return { success: false, error }
    } finally {
      setProcessingId(null)
    }
  }

  const isProcessing = (id) => {
    if (id) return processingId === id
    return processingId !== null
  }

  return { execute, isProcessing, processingId }
}
