import { useEffect, useState } from 'react';
import styles from './DreamDetails.module.scss';

interface Comment {
  id: number;
  dream_id: number;
  content: string;
  created_at: string;
  owner_profile: {
    user: number;
    name: string;
    thumbnail_url: string | null;
  };
}

interface CommentsProps {
  dreamId: number;
}

interface UserProfile {
  thumbnail_url: string | null;
}

const Comments = ({ dreamId }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    setIsLoggedIn(!!token);

    if (token) {
      fetch('http://127.0.0.1:8000/api/v1/profiles/mine/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setUserProfile(data);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dreamId}/all_comments/`,
        );
        const data = await response.json();

        setComments(data);
      } catch (error) {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    if (dreamId) {
      fetchComments();
    }
  }, [dreamId]);

  const handleSend = async () => {
    if (!newComment.trim()) {
      return;
    }

    if (!isLoggedIn) {
      alert('Please log in to post comments.');

      return;
    }

    const authToken = localStorage.getItem('authToken');

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dreamId}/add_comment/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${authToken}`,
          },
          body: JSON.stringify({
            content: newComment.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || 'Failed to post comment.');

        return;
      }

      setNewComment('');

      setLoading(true);
      const fetchResponse = await fetch(
        `http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dreamId}/all_comments/`,
      );
      const allComments = await fetchResponse.json();

      setComments(allComments);
      setLoading(false);
    } catch (error) {
      alert('Error posting comment');
    }
  };

  return (
    <>
      <h2 className={styles.commentTitle}>Comments</h2>

      <div className={styles.wrapper}>
        <div className={styles.inputRow}>
          <img
            src={
              userProfile?.thumbnail_url ||
              '/dream-helper/profile-page/profile-photo.png'
            }
            alt="avatar"
            className={styles.avatarMain}
          />
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={
              isLoggedIn ? 'Your text here' : 'Please log in to comment'
            }
            className={styles.inputField}
            disabled={!isLoggedIn}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!isLoggedIn || !newComment.trim()}
            title={
              !isLoggedIn ? 'Log in to enable sending comments' : undefined
            }
          >
            Send
          </button>
        </div>

        <div
          className={`${styles.commentsList} ${
            comments.length > 3 ? styles.scrollable : ''
          }`}
        >
          {loading ? (
            <p>Loading comments...</p>
          ) : comments.length === 0 ? null : (
            comments.map(comment => (
              <div key={comment.id} className={styles.commentItem}>
                <img
                  src={
                    comment.owner_profile.thumbnail_url ||
                    '/dream-helper/profile-page/profile-photo.png'
                  }
                  alt="avatar"
                  className={styles.avatar}
                />
                <div className={styles.commentI}>
                  <strong className={styles.commentAuthor}>
                    {comment.owner_profile.name}
                  </strong>
                  <p className={styles.commentText}>{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Comments;
