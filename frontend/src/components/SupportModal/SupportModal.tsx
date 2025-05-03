import React from 'react';
import './SupportModal.scss';

type SupportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dream: Dream;
};

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Support</h2>
        <div className="line-above"></div>
        <img src="/dream-helper/home-page/help-interface.png"
          alt="Support"
          className="modal-img"
        />
        <p>
          Thank you! Every contribution, even the smallest one, is a step closer
          to making a dream come true. Together, we create something truly
          magical!
        </p>
        <div className="line-below"></div>
        <label className="checkbox">
          <input type="checkbox" />
          Make a donation anonymously
        </label>
        <div className="line-belows"></div>
        <h3 className='h3-Amount'>Choose Amount</h3>
        <div className="preset-amounts">
          <button>5$</button>
          <button>15$</button>
          <button>30$</button>
        </div>

        <p className="or-text">or</p>

        <h3>Your Own Amount</h3>
        <input type="number" placeholder="0$" className="amount-input" />

        <button className="support-submit">Support</button>
      </div>
    </div>
  );
};

export default SupportModal;
