import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import PropTypes from 'prop-types';

const CommentList = ({ plantId, reviewId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchCommentsWithUserDetails = async () => {
      try {
        // Fetch comments for the given plantId
        const commentResponse = await api.get(`/comments?plantId=${plantId}`);
        if (commentResponse.status !== 200) {
          throw new Error('Failed to fetch comments');
        }

        const commentsData = commentResponse.data.filter(
          (comment) => comment.reviewId === reviewId
        );

        // Fetch user details for each comment
        const commentsWithUsers = await Promise.all(
          commentsData.map(async (comment) => {
            const userResponse = await api.get(`/users/${comment.userId}`);
            if (userResponse.status !== 200) {
              throw new Error(`Failed to fetch user for userId: ${comment.userId}`);
            }

            const user = userResponse.data;

            return {
              ...comment,
              userFullName: `${user.firstName} ${user.lastName}`, // Combine first and last name
            };
          })
        );

        setComments(commentsWithUsers);
      } catch (err) {
        console.error('Error fetching comments with user details:', err);
        setError('Failed to load comments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommentsWithUserDetails();
  }, [plantId, reviewId]);

  const handleDelete = async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      if (response.status === 200) {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again later.');

      // Clear the error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="ui comments">
      <h3 className="ui dividing header">Comments</h3>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="content">
              <span
                className="author"
                aria-label={`Comment by ${comment.userFullName}`}
              >
                {comment.userFullName}
              </span>
              <div className="text">{comment.content}</div>
              {auth && auth.userId === comment.userId && (
                <button
                  className="ui red button delete-button"
                  onClick={() => handleDelete(comment.id)}
                  aria-label="Delete comment"
                >
                  Delete Comment
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No comments yet. Be the first to add one!</p>
      )}
    </div>
  );
};

CommentList.propTypes = {
  plantId: PropTypes.number.isRequired, // plantId must be a number and required
  reviewId: PropTypes.number.isRequired, // reviewId must be a number and required
};

export default CommentList;
