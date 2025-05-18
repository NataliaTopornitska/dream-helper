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

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, dream }) => {
  const [donationAmount, setDonationAmount] = useState<number | string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') {
      setDonationAmount('');
    } else {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        setDonationAmount(parsedValue);
      }
    }
  };

  const handleSupportClick = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dream.id}/make_donation/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: donationAmount }),
        }
      );

      if (!response.ok) {
        throw new Error('Donation request failed');
      }

      setShowSuccessMessage(true);

         setTimeout(() => {
      setShowSuccessMessage(false);
      onClose();
    }, 3000);
  } catch (error) {
    console.error('Error making donation:', error);
  }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {showSuccessMessage ? (
          <>
            <h2 className="support-title">Support</h2>
            <div className="success-message">
              <p>Thank you for your generosity!</p>
            </div>
          </>
        ) : (
          <>
            <h2>Support</h2>
            <div className="line-above"></div>
            <img
              src="/dream-helper/home-page/help-interface.png"
              alt="Support"
              className="modal-img"
            />
            <p>
              Thank you! Every contribution, even the smallest one, is a step
              closer to making a dream come true. Together, we create something
              truly magical!
            </p>
            <div className="line-below"></div>
            <label className="checkbox">
              <input type="checkbox" />
              Make a donation anonymously
            </label>
            <div className="line-belows"></div>
            <h3 className="h3-Amount">Choose Amount</h3>
            <div className="preset-amounts">
              <button onClick={() => setDonationAmount(5)}>$5</button>
              <button onClick={() => setDonationAmount(15)}>$15</button>
              <button onClick={() => setDonationAmount(30)}>$30</button>
            </div>

            <p className="or-text">or</p>

            <h3>Your Own Amount</h3>
            <input
              type="number"
              placeholder="0$"
              className="amount-input"
              value={donationAmount}
              onChange={handleAmountChange}
            />

            <button className="support-submit" onClick={handleSupportClick}>
              Support
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportModal;

