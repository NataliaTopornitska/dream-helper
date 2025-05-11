import styles from './DreamDetails.module.scss';

const InfoCard = ({ dream }) => {
  return (
    <div className={styles.infoCard}>
      <p>
        <strong>Owner ID:</strong> {dream.owner}
      </p>
      <p>
        <strong>Category:</strong> {dream.categories.join(', ')}
      </p>
      <p>
        <strong>Type:</strong>{' '}
        {dream.to_another ? 'For Others' : 'Personal Dream'}
      </p>
      <p>
        <strong>Goal:</strong> ${dream.goal}
      </p>
      <p>
        <strong>Date of Creation:</strong>{' '}
        {new Date(dream.created_at).toLocaleDateString()}
      </p>
      <p>
        <strong>Status:</strong> {dream.status}
      </p>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${dream.level_completed}%` }}
        ></div>
      </div>
      <p>
        <strong>Collected:</strong> ${dream.total_amount_donations}
      </p>
      <p>
        <strong>Need:</strong> $
        {(+dream.goal - +dream.total_amount_donations).toFixed(2)}
      </p>
    </div>
  );
};

export default InfoCard;
