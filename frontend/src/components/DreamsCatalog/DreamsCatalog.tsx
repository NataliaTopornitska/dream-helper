import { useEffect, useState } from 'react';
import dreamsData from '../../api/dreams.json';
import './DreamsCatalog.scss';
import {
  Dream,
  DreamResponse,
  FundingRange,
  SortOption,
  Category,
  Country,
  City,
} from '../../types/dreams';
import categoriesData from '../../api/categories.json';
import citiesData from '../../api/cities.json';
import countriesData from '../../api/countries.json';
import fundingoalData from '../../api/funding_goal.json';
import popularityData from '../../api/popularity.json';
import typeOptions from '../../api/type.json';

const DreamsCatalog = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
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
  const [totalPages, setTotalPages] = useState(1);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFundingDropdownOpen, setIsFundingDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isDreamsPerPageDropdownOpen, setIsDreamsPerPageDropdownOpen] =
    useState(false);

  const fundingRanges: FundingRange[] = fundingoalData;

  const sortOptions: SortOption[] = popularityData;

  const typesOption: string[] = typeOptions;

  const fetchDreams = () => {
    const data = dreamsData as DreamResponse;

    setDreams(data.results);
    setFilteredDreams(data.results.filter(dream => dream.status === 'Active'));
    const totalDreams = data.results.filter(
      dream => dream.status === 'Active',
    ).length;

    setTotalPages(Math.ceil(totalDreams / dreamsPerPage));
  };

  const fetchCategories = () => {
    setCategories(categoriesData);
  };

  const fetchCountries = () => {
    setCountries(countriesData);
  };

  const fetchCities = () => {
    setCities(citiesData);
  };

  useEffect(() => {
    fetchDreams();
    fetchCategories();
    fetchCountries();
    fetchCities();
  }, []);

  useEffect(() => {
    if (activeTab === 'active') {
      const activeDreams = dreams.filter(dream => dream.status === 'Active');

      setFilteredDreams(activeDreams);
      setTotalPages(Math.ceil(activeDreams.length / dreamsPerPage));
    } else {
      const completedDreams = dreams.filter(
        dream => dream.status === 'Completed',
      );

      setFilteredDreams(completedDreams);
      setTotalPages(Math.ceil(completedDreams.length / dreamsPerPage));
    }

    setCurrentPage(1);
  }, [activeTab, dreams, dreamsPerPage]);

  const handleSearch = () => {
    const result = dreams.filter(dream => {
      if (activeTab === 'active' && dream.status !== 'Active') {
        return false;
      }

      if (activeTab === 'completed' && dream.status !== 'Completed') {
        return false;
      }

      if (selectedCategory && !dream.categories.includes(selectedCategory.id)) {
        return false;
      }

      if (selectedFundingRange) {
        const goalValue = parseFloat(dream.goal);
        const { minValue, maxValue } = selectedFundingRange;

        if (minValue !== null && goalValue < minValue) return false;
        if (maxValue !== null && goalValue > maxValue) return false;
      }

      if (selectedType) {
        const isPrivate = !dream.to_another;

        if (
          (selectedType === 'Private' && !isPrivate) ||
          (selectedType === 'Collective' && isPrivate)
        ) {
          return false;
        }
      }

      return true;
    });

    if (selectedSortOption) {
      const { field, direction } = selectedSortOption;

      result.sort((a: any, b: any) => {
        let valueA = a[field];
        let valueB = b[field];

        if (typeof valueA === 'string' && !isNaN(Number(valueA))) {
          valueA = Number(valueA);
        }

        if (typeof valueB === 'string' && !isNaN(Number(valueB))) {
          valueB = Number(valueB);
        }

        if (valueA < valueB) {
          return direction === 'asc' ? -1 : 1;
        }

        if (valueA > valueB) {
          return direction === 'asc' ? 1 : -1;
        }

        return 0;
      });
    }

    setFilteredDreams(result);
    setTotalPages(Math.ceil(result.length / dreamsPerPage));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedFundingRange(null);
    setSelectedSortOption(null);
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedType(null);

    if (activeTab === 'active') {
      const activeDreams = dreams.filter(dream => dream.status === 'Active');

      setFilteredDreams(activeDreams);
      setTotalPages(Math.ceil(activeDreams.length / dreamsPerPage));
    } else {
      const completedDreams = dreams.filter(
        dream => dream.status === 'Completed',
      );

      setFilteredDreams(completedDreams);
      setTotalPages(Math.ceil(completedDreams.length / dreamsPerPage));
    }

    setCurrentPage(1);
  };

  const getCurrentDreams = () => {
    const startIndex = (currentPage - 1) * dreamsPerPage;
    const endIndex = startIndex + dreamsPerPage;

    return filteredDreams.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
  };

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-item ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-arrow"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          &lt;
        </button>
        {pages}
        <button
          className="pagination-arrow"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          &gt;
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

  return (
    <div className="dreams-catalog">
      <div className="filter-tabs">
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Dreams
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Fulfilled Dreams
        </button>
      </div>

      <div className="filter-controls">
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
              {typeOptions.map((type, index) => (
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
            Dreams Per Page <span className="arrow">⮟</span>
          </button>
          {isDreamsPerPageDropdownOpen && (
            <div className="dropdown-menu">
              {[4, 8, 16, 'All'].map((size, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => {
                    setDreamsPerPage(
                      size === 'All' ? filteredDreams.length : (size as number),
                    );
                    setIsDreamsPerPageDropdownOpen(false);
                    setTotalPages(
                      Math.ceil(
                        filteredDreams.length /
                          (size === 'All'
                            ? filteredDreams.length
                            : (size as number)),
                      ),
                    );
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

      <div className="dreams-grid">
        {getCurrentDreams().map(dream => {
          const goalAmount = parseInt(dream.goal) || 1;
          const collected = dream.total_amount_donations;
          const progressPercent = Math.min((collected / goalAmount) * 100, 100);

          return (
            <div key={dream.id} className="dream-card">
              <div className="dream-image">
                <img
                  src={dream.thumbnail_url || '/home-page/a-dream.png'}
                  alt={dream.title}
                  className="dream-img"
                  onLoad={e => e.target.classList.add('loaded')}
                  onError={e => {
                    console.log('Image not found for dream:', dream.id);
                    e.target.src = '/dream-helper/home-page/a-dream.png';
                  }}
                />
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

              <h3 className="dream-title">{dream.title}</h3>
              <p className="dream-content">
                {dream.content.length > 140
                  ? dream.content.slice(0, 140) + '...'
                  : dream.content}
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
                  <span>{collected.toLocaleString('uk-UA')}₴</span>
                  <span>{goalAmount.toLocaleString('uk-UA')}₴</span>
                </div>
              </div>

              <button className="dream-support-btn">Support</button>
            </div>
          );
        })}
      </div>

      {renderPagination()}
    </div>
  );
};

export default DreamsCatalog;
