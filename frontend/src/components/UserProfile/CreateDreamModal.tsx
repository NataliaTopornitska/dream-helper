import React, { useEffect, useState } from 'react';
import './CreateDreamModal.scss';

const CreateDreamModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [isForAnother, setIsForAnother] = useState(false);
  const [dreamTitle, setDreamTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [personFullName, setPersonFullName] = useState('');
  const [personPhoneNumber, setPersonPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [otherCountry, setOtherCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [otherCity, setOtherCity] = useState('');
  const [cities, setCities] = useState([]);
  const [personAddress, setPersonAddress] = useState('');
  const [direction, setDirection] = useState('');
  const [isCollective, setIsCollective] = useState(false);
  const [dreamDescription, setDreamDescription] = useState('');

  // Завантаження категорій
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/dreamhelper/categories/')
      .then(res => res.json())
      .then(setCategories)
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  // Завантаження країн
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/profiles/countries/')
      .then(res => res.json())
      .then(setCountries)
      .catch(err => console.error('Failed to fetch countries:', err));
  }, []);

  // Завантаження міст при зміні країни
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      setSelectedCity(null);
      return;
    }
    fetch(`http://127.0.0.1:8000/api/v1/profiles/cities/?country=${selectedCountry.id}`)
      .then(res => res.json())
      .then(setCities)
      .catch(err => {
        console.error('Failed to fetch cities:', err);
        setCities([]);
      });
  }, [selectedCountry]);

  if (!isOpen) return null;

  const handleSubmit = e => {
    e.preventDefault();

    const formData = {
      dreamTitle,
      goalAmount,
      category: selectedCategory === 'other' ? otherCategory : selectedCategory,
      isForAnother,
      ...(isForAnother && {
        personFullName,
        personPhoneNumber,
        personCountry: selectedCountry ? selectedCountry.id : null,
        personOtherCountry: otherCountry,
        personCity: selectedCity ? selectedCity.id : null,
        personOtherCity: otherCity,
        personAddress,
        direction,
        isCollective,
      }),
      ...(isForAnother && { dreamDescription }),
    };

    console.log('Dream Data:', formData);
    // Тут можеш відправити formData на сервер
  };

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <button className="create-close-btn" onClick={onClose}>×</button>

        <h2 className="create-modal-title">Create a Dream</h2>

        <form onSubmit={handleSubmit}>
          <div className="create-modal-content">
            <div className="create-left-section">
              <div className="create-photo-upload">
                <img src="/dream-helper/profile-page/add-dream.png" alt="Upload" />
                <p>
                  *The photo you upload doesn’t have to be of yourself, but it should represent a dream you want to make come true. This way, visitors to the website will immediately understand what it’s about.
                </p>
                <input type="file" id="dream-photo" style={{ display: 'none' }} />
              </div>
            </div>

            <div className="create-right-section">
              <div className="create-form-group">
                <h4 className="create-field-heading">Dream Title</h4>
                <label htmlFor="dream-title">Write a short title that reflects the essence of your dream</label>
                <input
                  type="text"
                  id="dream-title"
                  placeholder="Your Dream"
                  maxLength={45}
                  value={dreamTitle}
                  onChange={e => setDreamTitle(e.target.value)}
                  required
                />
              </div>

              <div className="create-form-group">
                <label htmlFor="goal-amount">Goal</label>
                <input
                  type="number"
                  id="goal-amount"
                  placeholder="Enter your amount"
                  value={goalAmount}
                  onChange={e => setGoalAmount(e.target.value)}
                  required
                  min={1}
                />
              </div>

              <div className="create-form-group">
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="create-form-group">
                {/* <label htmlFor="other-category-input">Other Category</label> */}
                <input
                  type="text"
                  id="other-category-input"
                  placeholder="Other Category"
                  value={otherCategory}
                  onChange={e => setOtherCategory(e.target.value)}
                />
              </div>

              <div className="create-form-group create-checkbox-group">
                <label htmlFor="dream-for-another">
                  <input
                    type="checkbox"
                    id="dream-for-another"
                    checked={isForAnother}
                    onChange={() => setIsForAnother(!isForAnother)}
                  />
                  Dream For Another
                </label>
              </div>
            </div>
          </div>

          {isForAnother && (
            <>
              <div className="create-section dream-for-another-section">
                <h3>Dream For Another *</h3>
                <p>
                  *Take into account. You should only fill in this information if the dream you are creating belongs to someone else and you want to make it for them
                </p>
                <div className="create-grid-2">
                  <div className="create-form-group">
                    <label htmlFor="person-full-name">
                      Name of the person you create dream for <span className="required-star">*</span>
                    </label>
                    <input
                      id="person-full-name"
                      placeholder="Full name of the person"
                      value={personFullName}
                      onChange={e => setPersonFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-phone-number">
                      Phone of the person you create dream for <span className="required-star">*</span>
                    </label>
                    <input
                      id="person-phone-number"
                      placeholder="Phone number of the person"
                      value={personPhoneNumber}
                      onChange={e => setPersonPhoneNumber(e.target.value)}
                      required
                    />
                  </div>

                   <div className="create-form-group">
                    <label htmlFor="person-country">
                      Country of the person you create dream for <span className="required-star">*</span>
                    </label>
                    <select
                      id="person-country"
                      value={selectedCountry?.id || ''}
                      onChange={e => {
                        const country = countries.find(c => c.id === Number(e.target.value)) || null;
                        setSelectedCountry(country);
                        setSelectedCity(null);
                      }}
                      required
                    >
                      <option value="">Select country</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-other-country">Other country</label>
                    <input
                      id="person-other-country"
                      placeholder="Other country"
                      value={otherCountry}
                      onChange={e => setOtherCountry(e.target.value)}
                    />
                  </div>

                   <div className="create-form-group">
                    <label htmlFor="person-city">
                      City of the person you create dream for <span className="required-star">*</span>
                    </label>
                    <select
                      id="person-city"
                      value={selectedCity?.id || ''}
                      onChange={e => {
                        const city = cities.find(c => c.id === Number(e.target.value)) || null;
                        setSelectedCity(city);
                      }}
                      disabled={!selectedCountry}
                      required
                    >
                      <option value="">Select city</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-other-city">Other city</label>
                    <input
                      id="person-other-city"
                      placeholder="Other city"
                      value={otherCity}
                      onChange={e => setOtherCity(e.target.value)}
                    />
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-direction">Direction of the person you create dream for</label>
                    <input
                      id="person-direction"
                      placeholder="Direction"
                      value={direction}
                      onChange={e => setDirection(e.target.value)}
                    />
                  </div>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isCollective}
                      onChange={e => setIsCollective(e.target.checked)}
                    />
                    Is collective
                  </label>
                </div>
              </div>

              <div className="create-section">
                <h3 className='tell-us'>Tell us about your dream</h3>
                <p className='describe-us'>
                  Describe your dream in more detail. What do you want to achieve or experience? Why is it important to you?Open up about your dream in a heartfelt way. Describe your emotions, your hopes, and what this dream means to you. Help others feel connected to your journey so they understand why it matters.
                </p>
                <textarea
                  placeholder="Your text here"
                  value={dreamDescription}
                  onChange={e => setDreamDescription(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="create-submit-wrapper">
            <button type="submit" className="create-submit-btn">
              Share Your Dream
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDreamModal;
