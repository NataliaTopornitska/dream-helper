import React, { useEffect, useState } from 'react';
import './PendingDonations.scss';

interface Donation {
  id: number;
  date: string;
  dream: number;
  title: string;
  amount: number | string;
  url_payment: string;
}

const PendingDonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonations = () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      fetch('http://127.0.0.1:8000/api/v1/profiles/mine/prepared_donations/', {
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
    };

    fetchDonations();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        fetchDonations();
      }
    };

    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const cancelDonation = (id: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    fetch(`http://127.0.0.1:8000/api/v1/dreamhelper/donations/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        status: 'Canceled',
        url_payment: '',
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to cancel donation');
        }
        return res.json();
      })
      .then(() => {
        setDonations((prev) => prev.filter((donation) => donation.id !== id));
      })
      .catch((err) => {
        console.error(err);
        alert('Помилка при скасуванні пожертви');
      });
  };

  if (error || donations.length === 0) {
    return null;
  }

  return (
    <div className="pending-wrapper">
      <h2>Prepared</h2>
      <div className="pending-table">
        {donations.map((donation) => (
          <div className="pending-row" key={donation.id}>
            <div className="col col-date">
              <span>Date</span>
              <span>{formatDate(donation.date)}</span>
            </div>
            <div className="divider" />

            <div className="col col-title">
              <span>{donation.title}</span>
            </div>
            <div className="divider" />

            <div className="col col-amount">
              <span>Amount</span>
              <span>{Number(donation.amount).toLocaleString()} $</span>
            </div>
            <div className="divider" />

            <button className="cancel-btn" onClick={() => cancelDonation(donation.id)}>
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
