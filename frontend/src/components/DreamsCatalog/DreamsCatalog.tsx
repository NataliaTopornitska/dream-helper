import { useEffect, useState, useRef } from 'react';
import './DreamsCatalog.scss';
import {
  Dream,
  FundingRange,
  SortOption,
  Category,
  Country,
  City,
} from '../../types/dreams';
import { useNavigate } from 'react-router-dom';
import fundingoalData from '../../api/funding_goal.json';
import popularityData from '../../api/popularity.json';
import typeOptions from '../../api/type.json';
import { Link } from 'react-router-dom';
import SupportModal from '../SupportModal/SupportModal';
import CreateDreamModal from '../UserProfile/CreateDreamModal';
import { useSearchParams } from 'react-router-dom';

const DreamsCatalog = () => {
  const [activeTab, setActiveTab] = useState<
    'Active' | 'Completed' | 'Application'
  >('Active');
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [filteredDreams, setFilteredDreams] = useState<Dream[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedFundingRange, setSelectedFundingRange] =
    useState<FundingRange | null>(null);
  const [selectedSortOption, setSelectedSortOption] =
    useState<SortOption | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dreamsPerPage, setDreamsPerPage] = useState(8);
  const [pagination, setPagination] = useState({
    next: '',
    previous: '',
    count: 0,
    num_pages: 0,
  });

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFundingDropdownOpen, setIsFundingDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isDreamsPerPageDropdownOpen, setIsDreamsPerPageDropdownOpen] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fundingRanges: FundingRange[] = fundingoalData;
  const [activeDream, setActiveDream] = useState<Dream | null>(null);

  const sortOptions: SortOption[] = popularityData;
  const [selectedPerPage, setSelectedPerPage] = useState<string | number>(
    'Per Page',
  );
  const currentPageNumber = currentPage || 1;
  const totalPages = pagination.num_pages;
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    email: string;
    is_staff: boolean;
    is_active: boolean;
  } | null>(null);
  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [isProfileIncompleteModalOpen, setIsProfileIncompleteModalOpen] =
    useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleCategoryChange = (category: string) => {
    const foundCategory = categories.find(
      cat => cat.name === category || cat.id.toString() === category,
    );

    setSelectedCategory(foundCategory || null);

    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);

      if (category === 'all') {
        newParams.delete('category');
      } else {
        newParams.set('category', category);
      }

      return newParams;
    });

    setIsCategoryDropdownOpen(false);
  };

  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    if (category === 'all') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory({ id: 0, name: category });
    }
  }, [category]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/users/me/', {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();

        setCurrentUser(data);
      } catch (error) {}
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (
      activeTab === 'Application' &&
      currentUser &&
      currentUser.id === 1 &&
      currentUser.email === 'az@a.com' &&
      currentUser.is_staff &&
      currentUser.is_active
    ) {
      const applicationDreams = dreams.filter(
        (dream: any) => dream.status === 'Application',
      );

      const indexStart = (currentPage - 1) * dreamsPerPage;
      const indexEnd = indexStart + dreamsPerPage;

      setFilteredDreams(applicationDreams.slice(indexStart, indexEnd));
      setPagination({
        ...pagination,
        count: applicationDreams.length,
        num_pages: Math.ceil(applicationDreams.length / dreamsPerPage),
      });
    }
  }, [activeTab, dreams, currentUser, currentPage, dreamsPerPage]);

  const fetchDreams = async () => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    const categoryParam = category !== 'all' ? `&category=${category}` : '';
    const statusParam =
      activeTab === 'Application'
        ? '&status=Application'
        : `&status=${activeTab}`;

    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/dreamhelper/dreams/?page=${currentPage}&page_size=${dreamsPerPage}${categoryParam}${statusParam}`,
      { method: 'GET', headers },
    );

    const data = await response.json();

    setDreams(data.results);
    setFilteredDreams(data.results);
    setPagination({
      next: data.next || '',
      previous: data.previous || '',
      count: data.count,
      num_pages: data.num_pages,
    });
  };

  const fetchCategories = async () => {
    const response = await fetch(
      'http://127.0.0.1:8000/api/v1/dreamhelper/categories/',
    );
    const data = await response.json();

    setCategories(data);
  };

  const fetchCountries = async () => {
    const response = await fetch(
      'http://127.0.0.1:8000/api/v1/profiles/countries/',
    );
    const data = await response.json();

    setCountries(data);
  };

  const fetchCities = async (country: string = '') => {
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/profiles/cities/?country=${country}`,
    );
    const data = await response.json();

    setCities(data);
  };

  useEffect(() => {
    fetchCities('');
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
        setIsFundingDropdownOpen(false);
        setIsSortDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDreams();
    fetchCategories();
    fetchCountries();
  }, [activeTab, category]);

  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry ? selectedCountry.id.toString() : '');
    }
  }, [selectedCountry]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
        setIsFundingDropdownOpen(false);
        setIsSortDropdownOpen(false);
        setIsCountryDropdownOpen(false);
        setIsCityDropdownOpen(false);
        setIsTypeDropdownOpen(false);
        setIsDreamsPerPageDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/profiles/mine/', {
          headers: {
            Authorization: `Token ${localStorage.getItem('authToken') || ''}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load profile data');
        }

        const data = await res.json();

        setProfileData(data);
      } catch (err) {}
    };

    fetchProfile();
  }, []);

  const handleAddDream = () => {
    const authToken = localStorage.getItem('authToken');
    const email = profileData?.email || localStorage.getItem('username') || '';

    if (!authToken) {
      setIsProfileIncompleteModalOpen(true);
    } else if (
      !profileData?.name ||
      profileData.name.trim() === '' ||
      profileData.name === email
    ) {
      localStorage.setItem('showIncompleteModal', 'true');
      navigate('/profile');
    } else {
      setIsDreamModalOpen(true);
    }
  };

  useEffect(() => {
    if (category === 'all') {
      setSelectedCategory(null);
    } else {
      const foundCategory = categories.find(
        cat => cat.id.toString() === category || cat.name === category,
      );

      setSelectedCategory(foundCategory || null);
    }
  }, [category, categories]);

  useEffect(() => {
    if (dreams.length > 0) {
      setFilteredDreams(dreams);

      setPagination({
        next: pagination.next,
        previous: pagination.previous,
        count: pagination.count,
        num_pages: pagination.num_pages,
      });
    }
  }, [dreams]);

  useEffect(() => {}, [filteredDreams]);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    if (selectedCategory) {
      queryParams.append('category', String(selectedCategory.id));
    }

    if (!selectedCity && selectedCountry) {
      queryParams.append('country', String(selectedCountry.id));
    }

    if (selectedCity) {
      queryParams.append('city', String(selectedCity.id));
    }

    if (selectedType) {
      queryParams.append(
        'dream_type',
        selectedType === 'Collective' ? 'True' : 'False',
      );
    }

    if (selectedFundingRange) {
      queryParams.append('goal_range', selectedFundingRange?.value || '');
    }

    if (selectedSortOption) {
      const sortParam =
        selectedSortOption.direction === 'asc'
          ? selectedSortOption.field
          : `-${selectedSortOption.field}`;

      queryParams.append('popularity', sortParam);
    }

    setCurrentPage(1);

    queryParams.append('status', activeTab);
    queryParams.append('page', '1');
    queryParams.append('page_size', dreamsPerPage.toString());

    setSearchParams(queryParams);

    fetch(
      `http://127.0.0.1:8000/api/v1/dreamhelper/dreams?${queryParams.toString()}`,
    )
      .then(response => response.json())
      .then(data => {
        setFilteredDreams(data.results);
        setPagination({
          next: data.next || '',
          previous: data.previous || '',
          count: data.count,
          num_pages: data.num_pages,
        });
      })
      .catch(() => {});
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedFundingRange(null);
    setSelectedSortOption(null);
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedType(null);
    setCurrentPage(1);
    fetchDreams();
    fetchCities('');
    setSelectedPerPage('Per Page');
    setDreamsPerPage(8);
  };

  const getCurrentDreams = () => {
    return filteredDreams;
  };

  const handlePageChange = (pageUrl: string) => {
    if (activeTab === 'Application') {
      if (pageUrl === pagination.next) {
        setCurrentPage(currentPage + 1);
      }

      if (pageUrl === pagination.previous) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      // решта fetch як раніше
      if (pageUrl) {
        fetch(pageUrl)
          .then(response => response.json())
          .then(data => {
            setFilteredDreams(data.results);
            setPagination({
              next: data.next,
              previous: data.previous,
              count: data.count,
              num_pages: data.num_pages,
            });
            const pageNumber = new URL(pageUrl).searchParams.get('page');

            if (pageNumber) {
              setCurrentPage(Number(pageNumber));
            }
          })
          .catch(() => {});
      }
    }
  };

  const renderPagination = () => {
    if (pagination.count === 0) {
      return null;
    }

    return (
      <div className="pagination-and-add-wrapper">
        <div className="pagination-controls">
          <button
            className="pagination-arrow"
            disabled={!pagination.previous}
            onClick={() => handlePageChange(pagination.previous)}
          >
            &lt;
          </button>

          <span>
            {currentPage} / {pagination.num_pages}
          </span>

          <button
            className="pagination-arrow"
            disabled={!pagination.next}
            onClick={() => handlePageChange(pagination.next)}
          >
            &gt;
          </button>
        </div>

        <button className="add-dream-button" onClick={handleAddDream}>
          Add My Dream
        </button>
      </div>
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength) + '...';
  };

  const currentDreams = getCurrentDreams();

  return (
    <div className="dreams-catalog">
      <div className="filter-tabs">
        <button
          className={`tab ${activeTab === 'Active' ? 'Active' : ''}`}
          onClick={() => setActiveTab('Active')}
        >
          Active Dreams
        </button>
        <button
          className={`tab ${activeTab === 'Completed' ? 'Active' : ''}`}
          onClick={() => setActiveTab('Completed')}
        >
          Fulfilled Dreams
        </button>
        {currentUser &&
          currentUser.id === 1 &&
          currentUser.email === 'az@a.com' &&
          currentUser.is_staff &&
          currentUser.is_active && (
            <button
              className={`tab ${activeTab === 'Application' ? 'Active' : ''}`}
              onClick={() => setActiveTab('Application')}
            >
              New Dreams
            </button>
          )}
      </div>

      <div ref={wrapperRef} className="filter-controls">
        <div className="dropdown-wrapper">
          <button
            className="filter-button"
            onClick={() => {
              setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
              setIsFundingDropdownOpen(false);
              setIsSortDropdownOpen(false);
              setIsCountryDropdownOpen(false);
              setIsCityDropdownOpen(false);
              setIsTypeDropdownOpen(false);
              setIsDreamsPerPageDropdownOpen(false);
            }}
          >
            {selectedCategory ? selectedCategory.name : 'Category'}{' '}
            <span className="arrow">⮟</span>
          </button>
          {isCategoryDropdownOpen && (
            <div className="dropdown-menu">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsCategoryDropdownOpen(false);
                  }}
                >
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <button
            className="filter-button"
            onClick={() => {
              setIsFundingDropdownOpen(!isFundingDropdownOpen);
              setIsCategoryDropdownOpen(false);
              setIsSortDropdownOpen(false);
              setIsCountryDropdownOpen(false);
              setIsCityDropdownOpen(false);
              setIsTypeDropdownOpen(false);
              setIsDreamsPerPageDropdownOpen(false);
            }}
          >
            {selectedFundingRange ? selectedFundingRange.label : 'Funding Goal'}{' '}
            <span className="arrow">⮟</span>
          </button>
          {isFundingDropdownOpen && (
            <div className="dropdown-menu">
              {fundingRanges.map(range => (
                <div
                  key={range.id}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedFundingRange(range);
                    setIsFundingDropdownOpen(false);
                  }}
                >
                  {range.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <button
            className="filter-button"
            onClick={() => {
              setIsSortDropdownOpen(!isSortDropdownOpen);
              setIsCategoryDropdownOpen(false);
              setIsFundingDropdownOpen(false);
              setIsCountryDropdownOpen(false);
              setIsCityDropdownOpen(false);
              setIsTypeDropdownOpen(false);
              setIsDreamsPerPageDropdownOpen(false);
            }}
          >
            {selectedSortOption ? selectedSortOption.label : 'Popularity'}{' '}
            <span className="arrow">⮟</span>
          </button>
          {isSortDropdownOpen && (
            <div className="dropdown-menu scrollable">
              {sortOptions.map(option => (
                <div
                  key={option.id}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedSortOption(option);
                    setIsSortDropdownOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <button
            className="filter-button"
            onClick={() => {
              setIsCountryDropdownOpen(!isCountryDropdownOpen);
              setIsCategoryDropdownOpen(false);
              setIsFundingDropdownOpen(false);
              setIsSortDropdownOpen(false);
              setIsCityDropdownOpen(false);
              setIsTypeDropdownOpen(false);
              setIsDreamsPerPageDropdownOpen(false);
            }}
          >
            {selectedCountry ? selectedCountry.name : 'Country'}{' '}
            <span className="arrow">⮟</span>
          </button>
          {isCountryDropdownOpen && (
            <div className="dropdown-menu">
              {countries.map(country => (
                <div
                  key={country.id}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCountry(country);
                    setIsCountryDropdownOpen(false);
                  }}
                >
                  {country.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <button
            className="filter-button"
            onClick={() => {
              setIsCityDropdownOpen(!isCityDropdownOpen);
              setIsCategoryDropdownOpen(false);
              setIsFundingDropdownOpen(false);
              setIsSortDropdownOpen(false);
              setIsCountryDropdownOpen(false);
              setIsTypeDropdownOpen(false);
              setIsDreamsPerPageDropdownOpen(false);
            }}
          >
            {selectedCity ? selectedCity.name : 'City'}{' '}
            <span className="arrow">⮟</span>
          </button>
          {isCityDropdownOpen && (
            <div className="dropdown-menu">
              {cities.map(city => (
                <div
                  key={city.id}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCity(city);
                    setIsCityDropdownOpen(false);
                  }}
                >
                  {city.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <button
            className="filter-button"
            onClick={() => {
              setIsTypeDropdownOpen(!isTypeDropdownOpen);
              setIsCategoryDropdownOpen(false);
              setIsFundingDropdownOpen(false);
              setIsSortDropdownOpen(false);
              setIsCountryDropdownOpen(false);
              setIsCityDropdownOpen(false);
              setIsDreamsPerPageDropdownOpen(false);
            }}
          >
            {selectedType || 'Type'} <span className="arrow">⮟</span>
          </button>
          {isTypeDropdownOpen && (
            <div className="dropdown-menu">
              {typeOptions &&
                typeOptions.length > 0 &&
                typeOptions.map((type, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedType(type);
                      setIsTypeDropdownOpen(false);
                    }}
                  >
                    {type}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <button
            className="filter-button"
            onClick={() => {
              setIsDreamsPerPageDropdownOpen(!isDreamsPerPageDropdownOpen);
              setIsCategoryDropdownOpen(false);
              setIsFundingDropdownOpen(false);
              setIsSortDropdownOpen(false);
              setIsCountryDropdownOpen(false);
              setIsCityDropdownOpen(false);
              setIsTypeDropdownOpen(false);
            }}
          >
            {selectedPerPage} <span className="arrow">⮟</span>
          </button>
          {isDreamsPerPageDropdownOpen && (
            <div className="dropdown-menu">
              {[4, 8, 16, 'All'].map((size, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => {
                    const newPageSize =
                      size === 'All' ? 10000 : (size as number);

                    setSelectedPerPage(size);
                    setDreamsPerPage(newPageSize);
                    setIsDreamsPerPageDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                >
                  {size}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="search-button" onClick={handleSearch}>
          Search
        </button>

        <button className="reset-button" onClick={resetFilters}>
          <img
            src="/dream-helper/dreams-page/icons_rotate.png"
            alt="Reset"
            className="icon"
          />
        </button>
      </div>

      {currentDreams.length === 0 ? (
        <div className="no-dreams">
          <img
            src="/dream-helper/dreams-page/none.png"
            alt="No dreams"
            className="no-dreams-image"
          />
          <p className="no-dreams-title">No dreams found just yet</p>
          <p className="no-dreams-subtitle">
            But every big dream starts with a small step. Maybe yours will be
            the first?
          </p>
        </div>
      ) : (
        <>
          <div className="dreams-grid">
            {getCurrentDreams().map(dream => {
              const goalAmount = parseInt(dream.goal) || 1;
              const collected = dream.total_amount_donations;
              const progressPercent = Math.min(
                (collected / goalAmount) * 100,
                100,
              );

              return (
                <div key={dream.id} className="dream-card">
                  <div className="dream-image">
                    <Link to={`/dreams/${dream.id}`}>
                      <img
                        src={dream.thumbnail_url || '/home-page/a-dream.png'}
                        alt={dream.title}
                        className="dream-img"
                        onLoad={e =>
                          (e.target as HTMLImageElement).classList.add('loaded')
                        }
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            '/dream-helper/home-page/a-dream.png';
                        }}
                      />
                    </Link>
                    <div className="dream-stats">
                      <div className="stat-item">
                        <img
                          src="/dream-helper/home-page/eye.svg"
                          alt="Views"
                          className="stat-icon"
                        />
                        <span>{dream.number_views}</span>
                      </div>
                      <div className="stat-item">
                        <img
                          src="/dream-helper/home-page/comment.svg"
                          alt="Comments"
                          className="stat-icon"
                        />
                        <span>{dream.number_comments}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="dream-title">
                    <Link
                      to={`/dreams/${dream.id}`}
                      className="dream-title-link"
                    >
                      {dream.title}
                    </Link>
                  </h3>
                  <p className="dream-content">
                    {truncateText(dream.content, 140)}
                  </p>

                  <div className="dream-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="progress-labels">
                      <span>Collected</span>
                      <span>Need</span>
                    </div>
                    <div className="progress-values">
                      <span>{collected.toLocaleString('fr-FR')}$</span>
                      <span>{goalAmount.toLocaleString('fr-FR')}$</span>
                    </div>
                  </div>
                  <div className="dream-actions">
                    {activeTab === 'Completed' ? (
                      <span className="collected-text">Collected</span>
                    ) : (
                      <button
                        className="dream-support-btn"
                        onClick={() => setActiveDream(dream)}
                      >
                        Support
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {renderPagination()}
          {activeDream && (
            <SupportModal
              isOpen={true}
              dream={activeDream}
              onClose={() => setActiveDream(null)}
            />
          )}
        </>
      )}

      {isDreamModalOpen && (
        <CreateDreamModal
          isOpen={isDreamModalOpen}
          onClose={() => setIsDreamModalOpen(false)}
        />
      )}

      {isProfileIncompleteModalOpen && (
        <div className="profile-incomplete-modal">
          <div className="modal-h-content">
            <button
              className="close-modal-cross"
              onClick={() => setIsProfileIncompleteModalOpen(false)}
              aria-label="Close modal"
            >
              ✖
            </button>
            <p>
              You are not logged in yet. Please log in and complete the required
              fields to add your dream!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamsCatalog;
