import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsModal.scss';

const SettingsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [direction, setDirection] = useState('');
  const [isCollective, setIsCollective] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [otherCountry, setOtherCountry] = useState('');
  const [otherCity, setOtherCity] = useState('');
  const [isLocationFixed, setIsLocationFixed] = useState(false);
  const [errors, setErrors] = useState({});
  const [otherCountries, setOtherCountries] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPhone('');
      setDirection('');
      setIsCollective(false);
      setSelectedCountry(null);
      setSelectedCity(null);
      setCities([]);
      setOtherCountry('');
      setOtherCity('');
      setIsLocationFixed(false);
      setErrors({});
      document.body.style.overflow = '';

      return;
    }

    document.body.style.overflow = 'hidden';

    fetch('http://127.0.0.1:8000/api/v1/profiles/countries/')
      .then(res => res.json())
      .then(setCountries)
      .catch(() => {});

    fetch('http://127.0.0.1:8000/api/v1/profiles/other_countries/')
      .then(res => res.json())
      .then(setOtherCountries)
      .catch(() => {});

    fetch('http://127.0.0.1:8000/api/v1/profiles/mine/', {
      headers: {
        Authorization: `Token ${localStorage.getItem('authToken')}`,
      },
    })
      .then(res => res.json())
      .then(profile => {
        if (profile.name) {
          const rawName =
            profile.is_collective &&
            profile.name.startsWith('"') &&
            profile.name.endsWith('"')
              ? profile.name.slice(1, -1)
              : profile.name;

          setName(rawName);
        }

        setPhone(profile.phone_number || '');
        setDirection(profile.direction || '');
        setIsCollective(profile.is_collective || false);
        setOtherCountry(profile.other_country || '');
        setOtherCity(profile.other_city || '');

        if (profile.city) {
          setSelectedCity(profile.city);
          setSelectedCountry(profile.country);
          setIsLocationFixed(true);
        } else if (profile.country) {
          setSelectedCountry(profile.country);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!selectedCountry || isLocationFixed) {
      return;
    }

    fetch(
      `http://127.0.0.1:8000/api/v1/profiles/cities/?country=${selectedCountry.id}`,
    )
      .then(res => res.json())
      .then(setCities)
      .catch(() => {
        setCities([]);
      });
  }, [selectedCountry, isLocationFixed]);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('authChange'));
    onClose();
    navigate('/');
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!selectedCity && !otherCity.trim()) {
      newErrors.city = 'City is required';
    }

    if (isCollective === null) {
      newErrors.is_collective = 'Collective flag is required';
    }

    return newErrors;
  };

  const handleCollectiveChange = checked => {
    if (!checked) {
      setName(prevName => {
        if (prevName.startsWith('"') && prevName.endsWith('"')) {
          return prevName.slice(1, -1);
        }

        return prevName;
      });
    }

    setIsCollective(checked);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);

      return;
    }

    const payload = {
      name: isCollective ? `"${name}"` : name,
      direction,
      is_collective: isCollective,
      country: selectedCountry ? selectedCountry.id : null,
      city: selectedCity ? selectedCity.id : null,
      other_country: otherCountry,
      other_city: otherCity,
    };

    if (phone.trim()) {
      payload.phone_number = phone.trim();
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/profiles/mine/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.dispatchEvent(new Event('profileUpdated'));
        onClose();
      } else {
        const errorData = await res.json();
      }
    } catch (err) {}
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title-s">Settings</h2>
        <img
          src="/dream-helper/profile-page/change-setting.png"
          alt="Settings Illustration"
          className="modal-image-s"
        />

        <form className="settings-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="name"
                placeholder="Your Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number{' '}
                <span
                  className="required-star"
                  style={{ visibility: 'hidden' }}
                >
                  *
                </span>
              </label>
              <input
                id="phone"
                placeholder="Your Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Country <span className="required-star">*</span>
              </label>
              <select
                value={selectedCountry?.id || ''}
                onChange={e => {
                  const country = countries.find(
                    c => c.id === Number(e.target.value),
                  );

                  setSelectedCountry(country || null);
                  setSelectedCity(null);
                }}
                disabled={isLocationFixed}
                className={errors.country ? 'input-error' : ''}
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && <p className="error-text">{errors.country}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="otherCountry">
                Other country{' '}
                <span
                  className="required-star"
                  style={{ visibility: 'hidden' }}
                >
                  *
                </span>
              </label>
              <select
                id="otherCountry"
                value={otherCountry}
                onChange={e => setOtherCountry(e.target.value)}
              >
                <option value="">Select Other Country</option>
                {otherCountries.map(country => (
                  <option key={country.id} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                City <span className="required-star">*</span>
              </label>
              <select
                value={selectedCity?.id || ''}
                onChange={e => {
                  const city = cities.find(
                    c => c.id === Number(e.target.value),
                  );

                  setSelectedCity(city || null);
                }}
                disabled={isLocationFixed || !selectedCountry}
                className={errors.city ? 'input-error' : ''}
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="otherCity">
                Other city{' '}
                <span
                  className="required-star"
                  style={{ visibility: 'hidden' }}
                >
                  *
                </span>
              </label>
              <input
                id="otherCity"
                placeholder="Name of Your City"
                value={otherCity}
                onChange={e => setOtherCity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="direction">
                Direction{' '}
                <span
                  className="required-star"
                  style={{ visibility: 'hidden' }}
                >
                  *
                </span>
              </label>
              <input
                id="direction"
                placeholder="Name of Your Direction"
                value={direction}
                onChange={e => setDirection(e.target.value)}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isCollective}
                  onChange={e => handleCollectiveChange(e.target.checked)}
                />
                <span className="is-collective">Is collective</span>
              </label>
            </div>
          </div>

          <button className="save-button" type="submit">
            Save Changes
          </button>

          <div className="signout-link">
            <button
              type="button"
              className="signout-button"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
