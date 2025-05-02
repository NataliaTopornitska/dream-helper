import React, { useState, useEffect } from 'react';
import './Statistics.scss';

// import statisticsData from '../../api/statistics.json';

const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState({
    totalDreams: 0,
    people: 0,
    anonymousDonations: 0,
    totalDonations: 0,
  });

//   useEffect(() => {
//     if (statisticsData && statisticsData.length > 0) {
//       const data = statisticsData[0];
//
//       setStatistics({
//         totalDreams: data.total_dreams,
//         people: data.people,
//         anonymousDonations: data.anonymous_donations,
//         totalDonations: data.total_donations,
//       });
//     }
//   }, []);
  useEffect(() => {
    async function fetchStatistics() {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/dreamhelper/statistics/");
        if (!response.ok) {
          throw new Error("Error getting data.");
        }
        const data = await response.json();

        setStatistics({
          totalDreams: data.total_dreams,
          people: data.people,
          anonymousDonations: data.anonymous_donations,
          totalDonations: data.total_donations,
        });
      } catch (error) {
        console.error("Error getting statistics data:", error);
      }
    }

    fetchStatistics();
  }, []);

  // For the backend

  // useEffect(() => {
  //   async function fetchStatistics() {
  //     try {
  //       const response = await fetch(
  //         'http://127.0.0.1:8000/api/v1/dreamhelper/statistics/',
  //       );

  //       if (!response.ok) {
  //         throw new Error('Error getting data.');
  //       }

  //       const data = await response.json();

  //       setStatistics({
  //         totalDreams: data.total_dreams,
  //         people: data.people,
  //         anonymousDonations: data.anonymous_donations,
  //         totalDonations: data.total_donations,
  //       });
  //     } catch (error) {
  //       console.error('Error getting statistics data:', error);
  //     }
  //   }

  //   fetchStatistics();
  // }, []);

  return (
    <section className="statistics">
      <div className="statistics-wave-bg"></div>
      <div className="statistics-container">
        <h2 className="statistics-title">Dream Statistics</h2>
        <div className="statistics-grid">
          <div className="stat-card">
            <img
              src="/dream-helper/home-page/block2-1.png"
              alt="Hot air balloon"
              className="stat-icon"
            />
            <h3 className="stat-label">Dreams fulfilled</h3>
            <p className="stat-value">{statistics.totalDreams}</p>
          </div>

          <div className="stat-card">
            <img
              src="/dream-helper/home-page/block2-2.png"
              alt="Active person with items"
              className="stat-icon"
            />
            <h3 className="stat-label">Active fundraisers</h3>
            <p className="stat-value">{statistics.people}</p>
          </div>

          <div className="stat-card">
            <img
              src="/dream-helper/home-page/block2-3.png"
              alt="Anonymous donation"
              className="stat-icon"
            />
            <h3 className="stat-label">Anonymous donations</h3>
            <p className="stat-value">${statistics.anonymousDonations}</p>
          </div>

          <div className="stat-card">
            <img
              src="/dream-helper/home-page/block2-4.png"
              alt="Donation box with coins"
              className="stat-icon"
            />
            <h3 className="stat-label">Total donations</h3>
            <p className="stat-value">${statistics.totalDonations}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
