import { useEffect, useState } from 'react';

const Comments = ({ dreamId }: { dreamId: number }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch(
      `http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dreamId}/all_comments/`,
    )
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setComments(data))
      .catch(error => console.error('Fetch error:', error));
  }, [dreamId]);

  return (
    <div>
      <h3>Comments</h3>
      {comments.map((comment: any, idx: number) => (
        <div key={idx}>
          <strong>{comment.user_name}</strong>: {comment.text}
        </div>
      ))}
    </div>
  );
};

export default Comments;
