import React, { useEffect, useState, useRef } from 'react';
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
  const [otherCountries, setOtherCountries] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [otherCity, setOtherCity] = useState('');
  const [cities, setCities] = useState([]);
  const [personAddress, setPersonAddress] = useState('');
  const [direction, setDirection] = useState('');
  const [isCollective, setIsCollective] = useState(false);
  const [dreamDescription, setDreamDescription] = useState('');
  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/dreamhelper/categories/')
      .then(res => res.json())
      .then(setCategories)
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/profiles/countries/')
      .then(res => res.json())
      .then(setCountries)
      .catch(err => console.error('Failed to fetch countries:', err));
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/profiles/other_countries/')
      .then(res => res.json())
      .then(setOtherCountries)
      .catch(err => console.error('Failed to fetch other countries:', err));
  }, []);

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

  const fileInputRef = useRef(null);

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');

    if (!selectedCategory && !otherCategory) {
      setCategoryError(true);
    } else {
      setCategoryError(false);
    }

    if (!dreamTitle || !dreamDescription || !goalAmount || (!selectedCategory && !otherCategory)) {
      return;
    }

    let forWhom = null;

    if (isForAnother) {
      forWhom = {
        name: personFullName,
        phone: personPhoneNumber,
        country: selectedCountry?.id || null,
        other_country: otherCountry || '',
        city: selectedCity?.id || null,
        other_city: otherCity || '',
        address: personAddress || '',
        direction: direction || '',
        is_collective: isCollective,
      };
    }

    const payload = {
      title: dreamTitle,
      to_another: isForAnother,
      categories:
        selectedCategory && selectedCategory !== 'other'
          ? [categories.find(cat => cat.name === selectedCategory)?.id]
          : [],
      new_category: otherCategory || '',
      content: dreamDescription,
      goal: Number(goalAmount),
      for_whom: isForAnother ? forWhom : null,
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/dreamhelper/dreams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();

        console.error('Failed to create dream:', errData);
        alert('Could not submit dream: ' + (errData?.error || res.statusText));

        return;
      }

      const data = await res.json();

      console.log('Dream created successfully:', data);

      const dreamId = data.id;

      const file = fileInputRef.current?.files[0];

      if (file) {
        const formData = new FormData();

        formData.append('photo', file);

        const uploadRes = await fetch(`http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${dreamId}/upload_dream_photo/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();

          console.error('Photo upload failed:', uploadError);
          alert('Dream created, but photo upload failed.');
        } else {
          console.log('Photo uploaded successfully.');
        }
      }

      onClose();
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Something went wrong while submitting your dream.');
    }
  };

  const dreamDescriptionBlock = (
    <div className="create-section">
      <h3 className="tell-us_dream">Tell us about your dream</h3>
      <p className="describe-us">
        Describe your dream in more detail. What do you want to achieve or experience? Why is it important to you? Open up about your dream in a heartfelt way. Describe your emotions, your hopes, and what this dream means to you. Help others feel connected to your journey so they understand why it matters.
      </p>
      <textarea
        placeholder="Your text here"
        value={dreamDescription}
        onChange={e => {
          setDreamDescription(e.target.value);
          e.target.setCustomValidity("");
        }}
        onInvalid={e => e.target.setCustomValidity("Please fill out this field.")}
        required
      />
    </div>
  );

  const validateCategory = () => {
    if (!selectedCategory && !otherCategory) {
      setCategoryError(true);
    } else {
      setCategoryError(false);
    }
  };

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <button className="create-close-btn" onClick={onClose}>×</button>

        <h2 className="create-modal-title">Create a Dream</h2>

        <form onSubmit={handleSubmit}>
          <div className="create-modal-content">
            <div className="create-left-section">
             <div className="create-photo-upload" onClick={handlePhotoClick} style={{ cursor: 'pointer' }}>
                <img src="/dream-helper/profile-page/add-dream.png" alt="Upload" />
                <p>
                  *The photo you upload doesn’t have to be of yourself, but it should represent a dream you want to make come true.
                </p>
                <input
                  type="file"
                  id="dream-photo"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="create-right-section">
              <div className="create-form-group">
                <h4 className="create-field-heading">Dream Title</h4>
                <label htmlFor="dream-title">Write a short title that reflects the essence of your dream</label>
                <input
                  type="text"
                  placeholder="Your Dream"
                  value={dreamTitle}
                  onChange={(e) => {
                    setDreamTitle(e.target.value);
                    e.target.setCustomValidity("");
                  }}
                  onInvalid={(e) => e.target.setCustomValidity("Please fill out this field.")}
                  required
                  maxLength={45}
                />
              </div>


              <div className="create-form-group">
                <input
                  type="number"
                  id="goal-amount"
                  placeholder="Enter your amount"
                  value={goalAmount}
                  onChange={e => {
                    setGoalAmount(e.target.value);
                    e.target.setCustomValidity("");
                  }}
                  onInvalid={e => e.target.setCustomValidity("Please fill out this field.")}
                  required
                  min={1}
                />
              </div>

              <div className="create-form-group">
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={e => {
                    setSelectedCategory(e.target.value);
                    e.target.setCustomValidity("");
                  }}
                  onInvalid={e => e.target.setCustomValidity("Please select an option.")}
                  required={!otherCategory}
                  className="create-form-input"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="create-form-group">
                <input
                  type="text"
                  id="other-category-input"
                  placeholder="Other Category"
                  value={otherCategory}
                  onChange={e => {
                    setOtherCategory(e.target.value);
                    const select = document.getElementById("category-select");
                    if (select) select.setCustomValidity("");
                  }}
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

          {!isForAnother && dreamDescriptionBlock}

          {isForAnother && (
            <>
              <div className="create-section dream-for-another-section">
                <h3>Dream For Another *</h3>
                <p>
                  *Fill this if you're creating a dream for someone else
                </p>
                <div className="create-grid-2">
                  <div className="create-form-group">
                    <label htmlFor="person-full-name">
                      Name <span className="required-stars">*</span>
                    </label>
                    <input
                      id="person-full-name"
                      placeholder="Full name"
                      value={personFullName}
                      onChange={e => {
                        setPersonFullName(e.target.value);
                        e.target.setCustomValidity("");
                      }}
                      onInvalid={e => e.target.setCustomValidity("Please fill out this field.")}
                      required
                    />
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-phone-number">
                      Phone <span className="required-stars">*</span>
                    </label>
                    <input
                      id="person-phone-number"
                      placeholder="Phone number"
                      value={personPhoneNumber}
                      onChange={e => {
                        const onlyNums = e.target.value.replace(/\D/g, "");
                        setPersonPhoneNumber(onlyNums);
                        e.target.setCustomValidity("");
                      }}
                      onInvalid={e => {
                        if (e.target.validity.valueMissing) {
                          e.target.setCustomValidity("Please fill out this field.");
                        } else if (e.target.validity.patternMismatch) {
                          e.target.setCustomValidity("Minimum 6 digits, numbers only.");
                        } else {
                          e.target.setCustomValidity("");
                        }
                      }}
                      onInput={e => e.target.setCustomValidity("")}
                      required
                      pattern="[0-9]{6,}"
                    />
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-country">
                      Country <span className="required-stars">*</span>
                    </label>
                    <select
                      id="person-country"
                      value={selectedCountry?.id || ''}
                      onChange={e => {
                        const country = countries.find(c => c.id === Number(e.target.value)) || null;
                        setSelectedCountry(country);
                        setSelectedCity(null);
                        e.target.setCustomValidity("");
                      }}
                      onInvalid={e => e.target.setCustomValidity("Please select a country.")}
                      required={!otherCountry}
                      disabled={!!otherCountry}
                    >
                      <option value="">Select country</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-other-country">
                      Other country
                    </label>
                    <select
                      id="person-other-country"
                      value={otherCountry}
                      onChange={e => setOtherCountry(e.target.value)}
                    >
                      <option value="">Select other country</option>
                      {otherCountries.map(country => (
                        <option key={country.id} value={country.name}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-city">
                      City <span className="required-stars">*</span>
                    </label>

                    <select
                      id="person-city"
                      value={selectedCity?.id || ''}
                      onChange={e => {
                        const city = cities.find(c => c.id === Number(e.target.value)) || null;
                        setSelectedCity(city);
                        e.target.setCustomValidity("");
                      }}
                      onInvalid={e => e.target.setCustomValidity("Please select an option.")}
                      disabled={!selectedCountry || !!otherCountry}
                      required={!!selectedCountry && !otherCountry}
                    >
                      <option value="">Select city</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-other-city">
                      Other city
                    </label>
                    <input
                      id="person-other-city"
                      placeholder="Enter city"
                      value={otherCity}
                      onChange={e => setOtherCity(e.target.value)}
                      required={!!otherCountry}
                      onInvalid={e => {
                        if (e.target.validity.valueMissing) {
                          e.target.setCustomValidity("Please fill out this field.");
                        } else {
                          e.target.setCustomValidity("");
                        }
                      }}
                      onInput={e => e.target.setCustomValidity("")}
                    />
                  </div>

                  <div className="create-form-group">
                    <label htmlFor="person-direction">Direction</label>
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

              {dreamDescriptionBlock}
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
