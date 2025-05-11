import { useEffect, useState } from 'react';

const Donors = ({ dreamId }: { dreamId: number }) => {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    fetch(
      `http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dreamId}/all_donations/`,
    )
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setDonors(data.slice(0, 5)))
      .catch(error => console.error('Fetch error:', error));
  }, [dreamId]);

  return (
    <div>
      <h3>Donors</h3>
      {donors.map((donor: any, idx: number) => (
        <div key={idx}>
          <p>
            {donor.full_name} - {donor.amount}$ |{' '}
            {new Date(donor.date).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Donors;
