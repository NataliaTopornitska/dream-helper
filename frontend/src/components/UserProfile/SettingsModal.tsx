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
  const [profileCityId, setProfileCityId] = useState(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setName('');
      setPhone('');
      setDirection('');
      setIsCollective(false);
      setSelectedCountry(null);
      setSelectedCity(null);
      setCities([]);
      setProfileCityId(null);
      setErrors({});
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    fetch('http://127.0.0.1:8000/api/v1/users/countries/')
      .then(res => res.json())
      .then(setCountries)
      .catch(err => {
        console.error("Error loading countries:", err);
        setCountries([]);
      });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || countries.length === 0) return;

    fetch('http://127.0.0.1:8000/api/v1/users/profile/', {
      headers: {
        Authorization: `Token ${localStorage.getItem('authToken')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setName(data.name || '');
        setPhone(data.phone_number || '');
        setDirection(data.direction || '');
        setIsCollective(data.is_collective || false);

        const country = countries.find(c => c.id === data.country?.id) || null;
        setSelectedCountry(country);

        setProfileCityId(data.city?.id || null);
      })
      .catch(err => {
        console.error("Error loading profile:", err);
      });
  }, [isOpen, countries]);

  useEffect(() => {
    if (!isOpen || !selectedCountry) {
      setCities([]);
      setSelectedCity(null);
      return;
    }

    fetch(`http://127.0.0.1:8000/api/v1/users/cities/?country=${selectedCountry.id}`)
      .then(res => res.json())
      .then(data => {
        setCities(data);

        if (profileCityId) {
          const matchedCity = data.find(city => city.id === profileCityId);
          if (matchedCity) {
            setSelectedCity(matchedCity);
          }
          setProfileCityId(null);
        }
      })
      .catch(err => {
        console.error("Error loading cities:", err);
        setCities([]);
        setSelectedCity(null);
      });
  }, [selectedCountry, isOpen]);

  useEffect(() => {
    setSelectedCity(null);
  }, [selectedCountry]);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('authChange'));
    onClose();
    navigate('/');
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!selectedCountry) newErrors.country = 'Country is required';
    if (!selectedCity) newErrors.city = 'City is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      name,
      phone_number: phone,
      direction,
      is_collective: isCollective,
      country: selectedCountry?.id || null,
      city: selectedCity?.id || null,
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/users/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.dispatchEvent(new Event("profileUpdated"));
        onClose();
      } else {
        console.error("Error saving profile");
      }
    } catch (err) {
      console.error("Error occurred:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Settings</h2>
        <img
          src="/dream-helper/profile-page/change-setting.png"
          alt="Settings Illustration"
          className="modal-image-p"
        />

        <form className="settings-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                Name <span className="required-star">*</span>
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                onChange={(e) => {
                  const country = countries.find(c => c.id === Number(e.target.value));
                  setSelectedCountry(country);
                }}
                className={errors.country ? 'input-error' : ''}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
              {errors.country && <p className="error-text">{errors.country}</p>}
            </div>

            <div className="form-group">
              <label>
                City <span className="required-star">*</span>
              </label>
              <select
                value={selectedCity?.id || ''}
                onChange={(e) => {
                  const city = cities.find(c => c.id === Number(e.target.value));
                  setSelectedCity(city);
                }}
                className={errors.city ? 'input-error' : ''}
                disabled={!selectedCountry}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="direction">Direction</label>
              <input
                id="direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isCollective}
                  onChange={(e) => setIsCollective(e.target.checked)}
                />
                Is collective
              </label>
            </div>
          </div>

          <div className="signout-link">
            <button type="button" className="signout-button" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          <button className="save-button" type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
