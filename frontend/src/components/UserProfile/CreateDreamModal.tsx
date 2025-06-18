import React from 'react';
import './CreateDreamModal.scss';

const CreateDreamModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="dream-modal-overlay" onClick={onClose}>
      <div className="dream-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <h2 className="modal-title">Create a Dream</h2>

        <div className="modal-content">
          <div className="left-section">
            <div className="photo-upload">
              <img src="/dream-helper/create-dream/folder.png" alt="Upload" />
              <p>
                The photo you upload doesn’t have to be of yourself, but it
                should represent a dream you want to make come true.
              </p>
            </div>
          </div>

          <div className="right-section">
            <div className="form-group">
              <label>Your Dream</label>
              <input type="text" placeholder="Write a short title..." />
            </div>

            <div className="form-group">
              <label>Goal</label>
              <input type="number" placeholder="Enter your amount" />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select>
                <option>Select Category</option>
                <option>Health</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Dream For Another</label>
              <select>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Dream For Another</h3>
          <p>
            Take into account. You should only fill this in if the dream you are creating belongs to someone else.
          </p>
          <div className="grid-2">
            <input placeholder="Full name of the person" />
            <input placeholder="Phone number of the person" />
            <input placeholder="Email address of the person (optional)" />
            <input placeholder="Country where the person lives" />
            <input placeholder="City where the person lives" />
            <input placeholder="Home address of the person" />
          </div>
        </div>

        <div className="section">
          <h3>Tell us about your dream</h3>
          <p>
            Describe your dream in more detail. What do you want to achieve or experience? Why is it important to you?
          </p>
          <textarea placeholder="Your text here"></textarea>
        </div>

        <div className="submit-wrapper">
          <button className="submit-btn">Share Your Dream</button>
        </div>
      </div>
    </div>
  );
};

export default CreateDreamModal;
