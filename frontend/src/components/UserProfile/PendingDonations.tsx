import React, { useEffect, useState } from 'react';
import './PendingDonations.scss';

interface Donation {
  id: number;
  date: string;
  dream: string;
  amount: number;
  url_payment: string;
}

const PendingDonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    fetch('http://127.0.0.1:8000/api/v1/users/profile/prepared_donations/', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch prepared donations');
        }
        return res.status === 204 ? [] : res.json();
      })
      .then((data) => setDonations(data))
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('error');
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (error || donations.length === 0) {
    return null;
  }

  return (
    <div className="pending-wrapper">
      <h2>Pending</h2>
      <div className="pending-table">
        {donations.map((donation) => (
          <div className="pending-row" key={donation.id}>
            <span>Donation Made</span>
            <span>{formatDate(donation.date)}</span>
            <div className="divider" />
            <span>Dream Name</span>
            <span>{donation.dream}</span>
            <div className="divider" />
            <span>Amount</span>
            <span>{Number(donation.amount).toLocaleString()} $</span>
            <div className="divider" />
            <button className="cancel-btn" disabled>
              Cancel Donation
            </button>
            <a
              href={donation.url_payment}
              target="_blank"
              rel="noopener noreferrer"
              className="try-again-btn"
            >
              Try Again
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingDonations;
