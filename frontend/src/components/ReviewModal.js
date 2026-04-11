import React, { useState } from 'react';
import './ReviewModal.css';
import { FiStar, FiX, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const REVIEW_TAGS = [
  'On Time',
  'Professional',
  'Good Quality',
  'Clean Work',
  'Great Communication',
  'Value for Money'
];

const ReviewModal = ({ booking, isOpen, onClose, onReviewSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/reviews`, null, {
        params: {
          bookingId: booking.id,
          rating: rating,
          comment: comment,
          tags: selectedTags.join(',')
        }
      });
      
      toast.success('Thank you for your feedback!');
      onReviewSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="review-modal-content">
        <button className="close-modal-btn" onClick={onClose}>
          <FiX />
        </button>

        <div className="review-header">
          <h2>How was your service?</h2>
          <p>Your feedback helps us maintain high quality standards for {booking.service?.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="star-rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <FiStar fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>

          <div className="tags-container">
            <p className="section-label">What stood out?</p>
            <div className="tags-grid">
              {REVIEW_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {selectedTags.includes(tag) && <FiCheck size={14} style={{ marginRight: '4px' }} />}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="comment-container">
            <p className="section-label">Tell us more (optional)</p>
            <textarea
              placeholder="Was there something specific you enjoyed or something we could improve?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            className={`submit-review-btn ${rating > 0 ? 'valid' : ''}`}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

