import React, { useState, useEffect } from 'react';
import styles from './DreamDetails.module.scss';
import allDonations from '../../api/all_donations.json';

const Donors = ({ dreamId }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);


  // Frontend

   useEffect(() => {
    setDonors(allDonations);
    setLoading(false);
  }, [dreamId]);



  // Backend

  // useEffect(() => {
  //   const fetchDonors = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch(`http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dreamId}/all_donations/`);
  //       const data = await response.json();
  //       console.log('Fetched donors data:', data);
  //       setDonors(data);
  //     } catch (error) {
  //       console.error('Error fetching donors:', error);
  //       setDonors([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (dreamId) {
  //     fetchDonors();
  //   }
  // }, [dreamId]);

  // if (loading) {
  //   return <div>Loading donors...</div>;
  // }

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
