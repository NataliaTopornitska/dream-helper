import { useState, useEffect } from 'react';
import styles from './DreamDetails.module.scss';

const Donors = ({ dreamId }: { dreamId: number }) => {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dreamId}/all_donations/`,
        );
        const data = await response.json();

        setDonors(data);
      } catch (error) {
        setDonors([]);
      } finally {
        setLoading(false);
      }
    };

    if (dreamId) {
      fetchDonors();
    }
  }, [dreamId]);

  if (loading) {
    return <div>Loading donors...</div>;
  }

  if (!donors || donors.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#191919' }}>
        No donors yet.
      </div>
    );
  }

  return (
    <div className={styles.donorsContainer}>
      <h3 className={styles.donorsTitle}>Donors</h3>
      <div className={styles.donorsTable}>
        {donors.map(donor => {
          const avatarSrc =
            donor.is_anonymous === true ||
            donor.donator_profile?.name === 'Anonymous'
              ? '/dream-helper/dream-details/anonymous.png'
              : donor.donator_profile?.thumbnail_url ||
                '/dream-helper/profile-page/profile-photo.png';

          const donorName =
            donor.is_anonymous === true ||
            donor.donator_profile?.name === 'Anonymous'
              ? 'Anonymous'
              : donor.donator_profile?.name || 'Anonymous';

          return (
            <div key={donor.id} className={styles.donorRow}>
              <div className={styles.donorInfo}>
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className={styles.donorAvatar}
                />
                <span className={styles.donorName}>{donorName}</span>
              </div>
              <div className={styles.donorAmount}>
                <span className={styles.dLabel}>Amount</span>
                <span className={styles.dValue}>{Number(donor.amount)} $</span>
              </div>
              <div className={styles.donorDate}>
                <span className={styles.dLabel}>Date</span>
                <span className={styles.dValue}>
                  {new Date(donor.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Donors;
