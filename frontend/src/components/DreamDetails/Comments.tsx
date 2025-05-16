import { useEffect, useState } from 'react';
import styles from './DreamDetails.module.scss';
import allCommentsData from '../../api/all_comments.json';

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

const Comments = ({ dreamId }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allComments = allCommentsData as Comment[];
    const filtered = allComments.filter(comment => comment.dream_id === dreamId);
    setComments(filtered);
  }, [dreamId]);

  // Backend
  
  //   useEffect(() => {
  //   const fetchComments = async () => {
  //     try {
  //       const response = await fetch(`http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dreamId}/all_comments/`);
  //       const data = await response.json();
  //       console.log('Fetched comments:', data);
  //       setComments(data);
  //     } catch (error) {
  //       console.error('Error fetching comments:', error);
  //       setComments([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (dreamId) {
  //     fetchComments();
  //   }
  // }, [dreamId]);

  const handleSend = () => {
    if (!newComment.trim()) return;

    const fakeComment: Comment = {
      id: Date.now(),
      dream_id: dreamId,
      content: newComment,
      created_at: new Date().toISOString(),
      owner_profile: {
        user: 999,
        name: 'You',
        thumbnail_url: null,
      },
    };

    setComments(prev => [fakeComment, ...prev]);
    setNewComment('');
  };

  return (
    <>
      <h2 className={styles.commentTitle}>Coments</h2>

      <div className={styles.wrapper}>
        <div className={styles.inputRow}>
          <img
            src="/dream-helper/dream-details/avatar.png"
            alt="avatar"
            className={styles.avatarMain}
          />
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Your text here"
            className={styles.inputField}
          />
          <button className={styles.sendButton} onClick={handleSend}>Send</button>
        </div>
        <div className={styles.commentsList}>
          {comments.map(comment => (
            <div key={comment.id} className={styles.commentItem}>
              <img
                src={comment.owner_profile.thumbnail_url || '/dream-helper/dream-details/avatar.png'}
                alt="avatar"
                className={styles.avatar}
              />
              <div className="comment-i">
                <strong className="comment-author">{comment.owner_profile.name}</strong>
                <p className="comment-text">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Comments;
