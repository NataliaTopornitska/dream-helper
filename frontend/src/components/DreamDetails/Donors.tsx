import React, { useState, useEffect } from 'react';
import styles from './DreamDetails.module.scss';
import allDonations from '../../api/all_donations.json';

const Donors = ({ dreamId }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Фільтрація по dreamId — якщо потрібно
    // Якщо файл містить всі донати з різних мрій, фільтруй так:
    // const filteredDonors = allDonations.filter(d => d.dream_id === dreamId);

    // Якщо файл уже містить тільки донати для певної мрії:
    setDonors(allDonations);
    setLoading(false);
  }, [dreamId]);

  if (loading) {
    return <div>Loading donors...</div>;
  }

  return (
    <div className={styles.donorsContainer}>
      <h3 className={styles.donorsTitle}>Donors</h3>
      <ul className={styles.donorsList}>
        {donors.map(donor => (
          <li key={donor.id} className={styles.donorItem}>
            <div className={styles.donorInfo}>
              <div className={styles.donorAvatar}>
                <img
                  src={donor.donator_profile?.thumbnail_url || "https://via.placeholder.com/30"}
                  alt={`Avatar ${donor.donator_profile?.name || 'Anonymous'}`}
                />
              </div>
              <span className={styles.donorName}>
                {donor.is_anonymous ? 'Anonymous' : donor.donator_profile?.name}
              </span>
            </div>
            <div className={styles.donationDetails}>
              <span className={styles.donationAmount}>{donor.amount} $</span>
              <span className={styles.donationDate}>
                {new Date(donor.date).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Donors;
