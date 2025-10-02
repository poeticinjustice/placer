import { useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import {
  ChatBubbleLeftIcon,
  TrashIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../UI/LoadingSpinner'
import { formatRelativeTime } from '../../utils/dateFormatter'
import { API_URL } from '../../config/api'
import TiptapEditor from '../Editor/TiptapEditor'
import './CommentSection.css'

const CommentSection = ({ placeId, initialComments = [], onCommentAdded, onCommentDeleted }) => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await axios.post(
        `${API_URL}/api/places/${placeId}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const addedComment = response.data.comment
      setComments([...comments, addedComment])
      setNewComment('')

      if (onCommentAdded) {
        onCommentAdded(addedComment)
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      setError(err.response?.data?.message || 'Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      setDeletingId(commentId)
      setError(null)

      await axios.delete(
        `${API_URL}/api/places/${placeId}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setComments(comments.filter(c => c._id !== commentId))

      if (onCommentDeleted) {
        onCommentDeleted(commentId)
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
      setError(err.response?.data?.message || 'Failed to delete comment')
    } finally {
      setDeletingId(null)
    }
  }

  const canDeleteComment = (comment) => {
    if (!isAuthenticated) return false
    return comment.author._id === user._id || user.role === 'admin'
  }

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h3>
          <ChatBubbleLeftIcon className="icon" />
          Comments ({comments.length})
        </h3>
      </div>

      {error && (
        <div className="comment-error">
          {error}
        </div>
      )}

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
                  <img src={comment.author.avatar} alt={comment.author.firstName} />
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
                      {comment.isAnonymous ? 'Anonymous' : `${comment.author.firstName} ${comment.author.lastName || ''}`}
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
                  dangerouslySetInnerHTML={{ __html: comment.content }}
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