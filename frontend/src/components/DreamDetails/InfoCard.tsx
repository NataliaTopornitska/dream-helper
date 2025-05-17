import styles from './DreamDetails.module.scss';

const InfoCard = ({ dream }) => {
  return (
    <div className={styles.infoCard}>
      <div className={styles.topRow}>
       <p>
        <span className={styles.cardLabel}>Owner Name</span>
        <span className={styles.cardValue}>{dream.owner}</span>
      </p>
        <div className={styles.statItem}>
          <img
            src="/dream-helper/home-page/eye.svg"
            alt="Views"
            className={styles.statIcon}
          />
          <span className={styles.statValue}>{dream.number_views}</span>
        </div>
      </div>
      <p>
        <span className={styles.cardLabel}>From</span>
        <span className={styles.cardValue}>{dream.from}</span>
      </p>
      <p>
        <span className={styles.cardLabel}>Category</span>
        <span className={styles.cardValue}>{dream.categories.join(', ')}</span>
      </p>
      <p>
        <span className={styles.cardLabel}>Type</span>
        <span className={styles.cardValue}>
          {dream.to_another ? 'For Others' : 'Personal Dream'}
        </span>
      </p>
      <p>
        <span className={styles.cardLabel}>Goal</span>
        <span className={styles.cardValue}>{dream.goal}$</span>
      </p>
      <p>
        <span className={styles.cardLabel}>Date of Creation</span>
        <span className={styles.cardValue}>
          {new Date(dream.created_at).toLocaleDateString()}
        </span>
      </p>
        <p>
        <span className={styles.cardLabel}>Status</span>
        <span className={styles.cardValue}>{dream.status}</span>
      </p>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${dream.level_completed}%` }}
        ></div>
      </div>
      <div className={styles.amountRow}>
        <p className={styles.amountItem}>
          <span className={styles.amountLabel}>Collected</span>
          <span className={styles.amountValue}>{dream.total_amount_donations}$</span>
        </p>
        <p className={styles.amountItem}>
          <span className={styles.amountLabel}>Need</span>
          <span className={styles.amountValue}>
            {(+dream.goal - +dream.total_amount_donations).toFixed(2)}$
          </span>
        </p>
      </div>
    </div>
  );
};

export default InfoCard;
