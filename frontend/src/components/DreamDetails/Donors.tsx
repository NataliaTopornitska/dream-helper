import React, { useState, useEffect } from 'react';
import styles from './DreamDetails.module.scss';
import allDonations from '../../api/all_donations.json';

const Donors = ({ dreamId }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDonors(allDonations);
    setLoading(false);
  }, [dreamId]);

  if (loading) {
    return <div>Loading donors...</div>;
  }

  return (
    <div className={styles.donorsContainer}>
      <h3 className={styles.donorsTitle}>Donors</h3>
      <div className={styles.donorsTable}>
        {donors.map((donor) => (
          <div key={donor.id} className={styles.donorRow}>
            <div className={styles.donorInfo}>
              <img
                src={donor.donator_profile?.thumbnail_url || "/dream-helper/dream-details/avatar.png"}
                alt="avatar"
                className={styles.donorAvatar}
              />
              <span className={styles.donorName}>
                {donor.is_anonymous ? 'Anonymous' : donor.donator_profile?.name || 'Anonymous'}
              </span>
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
        ))}
      </div>
    </div>
  );
};

export default Donors;
