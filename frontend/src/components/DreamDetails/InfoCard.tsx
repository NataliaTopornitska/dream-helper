import styles from './DreamDetails.module.scss';

const InfoCard = ({ dream }) => {
  return (
    <div className={styles.infoCard}>
      <div className={styles.topRow}>
        <p>
          <span className={styles.cardLabel}>Name</span>
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
        <span className={styles.cardValue}>{dream.city}</span>
      </p>
      <p>
        <span className={styles.cardLabel}>Category</span>
        <span className={styles.cardValue}>{dream.categories}</span>
      </p>
      <p>
        <span className={styles.cardLabel}>Type</span>
        <span className={styles.cardValue}>
          {dream.to_another ? 'For Others' : 'Personal Dream'}
        </span>
      </p>
      <p>
        <span className={styles.cardLabel}>Goal</span>
        <span className={styles.cardValue}>
          {Math.round(Number(dream.goal))
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
          $
        </span>
      </p>
      <p>
        <span className={styles.cardLabel}>Created</span>
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
          style={{
            width: `${Math.min(dream.level_completed, 100)}%`,
          }}
        ></div>
      </div>

      <div className={styles.amountRow}>
        {dream.status === 'Completed' ? (
          <div className={styles.amountItemCentered}>
            <span className={styles.amountLabel}>Collected</span>
            <span className={styles.amountValue}>
              {dream.total_amount_donations}$
            </span>
          </div>
        ) : (
          <>
            <div className={styles.amountItem}>
              <span className={styles.amountLabel}>Collected</span>
              <span className={styles.amountValue}>
                {Math.round(Number(dream.total_amount_donations))
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                $
              </span>
            </div>
            <div className={styles.amountItem}>
              <span className={styles.amountLabel}>Need</span>
              <span className={styles.amountValue}>
                {Math.round(
                  Number(dream.goal) - Number(dream.total_amount_donations),
                )
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                $
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InfoCard;
