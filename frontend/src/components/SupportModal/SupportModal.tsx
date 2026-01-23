import React, { useState } from 'react';
import './SupportModal.scss';

type Dream = {
  id: number;
};

type SupportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dream: Dream;
};

const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  dream,
}) => {
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('authToken'));

  if (!isOpen) {
    return null;
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value === '') {
      setDonationAmount(null);
    } else {
      const parsedValue = parseFloat(value);

      if (!isNaN(parsedValue) && parsedValue >= 0) {
        setDonationAmount(parsedValue);
      }
    }
  };

  const handleSupportClick = async () => {
    try {
      const url = `http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dream.id}/make_donation/`;

      const body = {
        amount: null,
        your_amount: donationAmount,
        is_anonymous: isAnonymous,
        follow: false,
      };

      const authToken = localStorage.getItem('authToken');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Token ${authToken}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Donation request failed');
      }

      const data = await response.json();

      window.location.href = data.session_url;
    } catch (error) {}
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <h2>Support</h2>
        <div className="line-above"></div>
        <img
          src="/dream-helper/home-page/help-interface.png"
          alt="Support"
          className="modal-img"
        />
        <p>
          Thank you! Every contribution, even the smallest one, is a step closer
          to making a dream come true. Together, we create something truly
          magical!
        </p>
        <div className="line-below"></div>

        <div className="donation-checkbox-wrapper">
          <label
            className={`checkbox ${isLoggedIn ? 'label-authenticated' : 'unauthenticated'}`}
          >
            {!isLoggedIn ? (
              <span className="custom-icon" />
            ) : (
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
              />
            )}
            Make a donation anonymously
          </label>

          {!isLoggedIn && (
            <p className="anonymous-note">
              Your donation will automatically be recorded as anonymous because
              you are not logged into your account.
            </p>
          )}
        </div>

        <div className="line-belows"></div>
        <h3 className="h3-Amount">Choose Amount</h3>
        <div className="preset-amounts">
          <button onClick={() => setDonationAmount(5)}>$5</button>
          <button onClick={() => setDonationAmount(15)}>$15</button>
          <button onClick={() => setDonationAmount(30)}>$30</button>
        </div>

        <p className="or-text">or</p>

        <h3 className="own-h3">Your Own Amount</h3>
        <input
          type="number"
          placeholder="0$"
          className="amount-input"
          value={donationAmount === null ? '' : donationAmount}
          onChange={handleAmountChange}
          min={0}
        />

        <button
          className="support-submit"
          onClick={handleSupportClick}
          disabled={donationAmount === null}
        >
          Support
        </button>
      </div>
    </div>
  );
};

export default SupportModal;
