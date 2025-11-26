import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiStar, FiX } from 'react-icons/fi'

export default function ReviewModal({ order, restaurantId, onClose, onSuccess }) {
  const [rating, setRating] = useState(5)
  const [foodRating, setFoodRating] = useState(5)
  const [deliveryRating, setDeliveryRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.post('/reviews', {
        restaurantId,
        orderId: order._id,
        rating,
        foodRating,
        deliveryRating,
        comment: comment.trim() || undefined
      })
      toast.success('Review submitted successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <FiStar fill={star <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Rate Your Experience</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <StarRating
            value={rating}
            onChange={setRating}
            label="Overall Rating *"
          />

          <StarRating
            value={foodRating}
            onChange={setFoodRating}
            label="Food Quality *"
          />

          <StarRating
            value={deliveryRating}
            onChange={setDeliveryRating}
            label="Delivery Experience *"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field w-full"
              rows="4"
              placeholder="Share your experience..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

