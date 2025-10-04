import { useState } from 'react'
import { useSelector } from 'react-redux'
import DOMPurify from 'dompurify'
import {
  ChatBubbleLeftIcon,
  TrashIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../UI/LoadingSpinner'
import { formatRelativeTime } from '../../utils/dateFormatter'
import { api } from '../../services/api'
import { handleApiError } from '../../utils/apiErrorHandler'
import { useConfirm } from '../UI/ConfirmDialogProvider'
import { useToast } from '../UI/ToastContainer'
import TiptapEditor from '../Editor/TiptapEditor'
import './CommentSection.css'

const CommentSection = ({ placeId, initialComments = [], onCommentAdded, onCommentDeleted }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { confirm } = useConfirm()
  const toast = useToast()

  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)

      const response = await api.places.addComment(placeId, { content: newComment })
      const addedComment = response.data.comment
      setComments([...comments, addedComment])
      setNewComment('')

      if (onCommentAdded) {
        onCommentAdded(addedComment)
      }

      toast.success('Comment posted successfully')
    } catch (err) {
      toast.error(handleApiError(err, 'Failed to add comment'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    const confirmed = await confirm('Delete this comment?')
    if (!confirmed) return

    try {
      setDeletingId(commentId)

      await api.places.deleteComment(placeId, commentId)
      setComments(comments.filter(c => c._id !== commentId))

      if (onCommentDeleted) {
        onCommentDeleted(commentId)
      }

      toast.success('Comment deleted')
    } catch (err) {
      toast.error(handleApiError(err, 'Failed to delete comment'))
    } finally {
      setDeletingId(null)
    }
  }

  const canDeleteComment = (comment) => {
    if (!isAuthenticated || !user) return false

    // Admin can delete anything
    if (user.role === 'admin') return true

    // Regular user can only delete their own comments
    // Handle both user.id (from auth state) and user._id
    const userId = user.id || user._id
    const commentAuthorId = comment.author?._id || comment.author

    return commentAuthorId === userId
  }

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h3>
          <ChatBubbleLeftIcon className="icon" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="comment-form-header">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="comment-avatar" />
            ) : (
              <div className="comment-avatar-placeholder">
                <UserCircleIcon className="icon" />
              </div>
            )}
          </div>
          <div className="comment-form-body">
            <TiptapEditor
              content={newComment}
              onChange={setNewComment}
              placeholder="Write a comment..."
            />
            <div className="comment-form-footer">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner size="small" /> : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="comment-auth-prompt">
          <p>Please sign in to leave a comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="comments-empty">
            <ChatBubbleLeftIcon className="empty-icon" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-avatar">
                {comment.author?.avatar ? (
                  <img src={comment.author.avatar} alt={comment.author.firstName || 'User'} />
                ) : (
                  <div className="comment-avatar-placeholder">
                    <UserCircleIcon className="icon" />
                  </div>
                )}
              </div>

              <div className="comment-content">
                <div className="comment-header">
                  <div className="comment-author">
                    <span className="author-name">
                      {comment.isAnonymous || !comment.author ? 'Anonymous' : `${comment.author.firstName || 'User'} ${comment.author.lastName || ''}`}
                    </span>
                    <span className="comment-date">{formatRelativeTime(comment.createdAt)}</span>
                  </div>

                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="comment-delete-btn"
                      disabled={deletingId === comment._id}
                      title="Delete comment"
                    >
                      {deletingId === comment._id ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <TrashIcon className="icon" />
                      )}
                    </button>
                  )}
                </div>

                <div
                  className="comment-text"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection
