import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import '../Styler/AllStyles.css'

const AddReview = ({ plantId, onAddReview }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(1); // Default rating is 1
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { auth } = useAuth(); // Get the auth context

  const getToken = () => {
    // Fallback to sessionStorage if auth context is missing
    return auth?.token || sessionStorage.getItem('token');
  };

  const getUserId = () => {
    // Fallback to sessionStorage for userId
    return auth?.userId || sessionStorage.getItem('userId');
  };

  // Check if user is logged in
  const isLoggedIn = getToken() && getUserId();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    const userId = parseInt(getUserId(), 10);

    if (!token || !userId) {
      setError('You must be logged in to submit a review.');
      return;
    }

    try {
      const response = await api.post(
        '/reviews',
        { plantId, userId, content, rating },
        { headers: { Authorization: `Bearer ${token}` } } // Use token in headers
      );

      if (response.status === 201) {
        const newReview = response.data.review;
        setSuccessMessage('Review added successfully!');
        setContent('');
        setRating(1);
        setError(null);

        if (onAddReview) {
          onAddReview(newReview);
        }
      } else {
        throw new Error('Failed to add review');
      }
    } catch (err) {
      console.error('Error adding review:', err);
      setError('Failed to add review. Please try again later.');
      setSuccessMessage(''); // Clear success message on error
    }
  };

  const handleStarClick = (index) => {
    setRating(index);
  };

  const handleInputChange = () => {
    // Reset error and success messages when user types
    setError(null);
    setSuccessMessage('');
  };

  return (
    <div className="add-review">
      {isLoggedIn && (
        <>
          <h3>Add a Review</h3>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                handleInputChange();
              }}
              placeholder="Write your review here"
              required
            />
            <br />
            <label>
              Rating:
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => handleStarClick(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </label>
            <br />
            <button className="button" type="submit">
              Submit Review
            </button>
          </form>
        </>
      ) }
    </div>
  );
};

export default AddReview;
