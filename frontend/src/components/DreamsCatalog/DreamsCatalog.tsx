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
import fundingoalData from '../../api/funding_goal.json';
import popularityData from '../../api/popularity.json';
import typeOptions from '../../api/type.json';

const DreamsCatalog = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');
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

  const sortOptions: SortOption[] = popularityData;

  const fetchDreams = async () => {
    const response = await fetch(`http://127.0.0.1:8000/api/v1/dreamhelper/dreams/?status=${activeTab}`);
    const data = await response.json();
  
    console.log("API Response:", data); // Проверяем, что API возвращает данные
  
    setDreams(data.results);  
    setFilteredDreams(data.results); // Загружаем сразу, чтобы не было пустого состояния
  
    setPagination({
      next: data.next || "",
      previous: data.previous || "",
      count: data.count,
      num_pages: data.num_pages
    });
  };
  

  const fetchCategories = async () => {
    const response = await fetch('http://127.0.0.1:8000/api/v1/dreamhelper/categories/');
    const data = await response.json();

    setCategories(data);
  };

  const fetchCountries = async () => {
    const response = await fetch('http://127.0.0.1:8000/api/v1/users/countries/');
    const data = await response.json();
    setCountries(data);
  };

  const fetchCities = async (country: string = "") => { // Значение по умолчанию — пустая строка
    const response = await fetch(`http://127.0.0.1:8000/api/v1/users/cities/?country=${country}`);
    const data = await response.json();
    setCities(data);
  };

  useEffect(() => {
    fetchCities(""); // Загружаем ВСЕ города при первой загрузке
  }, []); // Пустой массив означает вызов `fetchCities()` только при первичной загрузке

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
        setIsFundingDropdownOpen(false);
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);  

  useEffect(() => {
    fetchDreams(); // Загружаем мечты
    fetchCategories();
    fetchCountries();
  }, [activeTab]); // Теперь API загружается один раз при рендере и при смене вкладки
  
  useEffect(() => {
    if (selectedCountry) { 
      fetchCities(selectedCountry ? selectedCountry.id.toString(): "");  // Если `selectedCountry` нет, передаём ""
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
    if (dreams.length > 0) {
      console.log("Updated filteredDreams:", dreams);
      setFilteredDreams(dreams);
  
      setPagination({
        next: pagination.next, // Используем новое значение API
        previous: pagination.previous,
        count: pagination.count,
        num_pages: pagination.num_pages, // Загружаем из API
      });
    }
  }, [dreams]);
  
  useEffect(() => {                                             ///////////////////////////////////////diagnoz
    console.log("Updated filteredDreams:", filteredDreams);  
  }, [filteredDreams]);
  
  const handleSearch = () => {
    const queryParams = new URLSearchParams();
  
    if (selectedCategory) queryParams.append("category", String(selectedCategory.id));
  
    // ❌ Если выбран город, НЕ передавать страну
    if (!selectedCity && selectedCountry) {
      queryParams.append("country", String(selectedCountry.id));
    }
  
    if (selectedCity) {
      queryParams.append("city", String(selectedCity.id));
    }
  
    if (selectedType) {
      queryParams.append("dream_type", selectedType === "Collective" ? "True" : "False");
    }
  
    if (selectedFundingRange) {
      queryParams.append("goal_range", selectedFundingRange?.value || ""); // Берем value напрямую
    }
  
    if (selectedSortOption) {
      const sortParam = selectedSortOption.direction === "asc"
        ? selectedSortOption.field
        : `-${selectedSortOption.field}`;
      queryParams.append("popularity", sortParam);
    }
  
    queryParams.append("status", activeTab);
    queryParams.append("page", currentPage.toString());
    queryParams.append("page_size", dreamsPerPage.toString());
  
    fetch(`http://127.0.0.1:8000/api/v1/dreamhelper/dreams?${queryParams.toString()}`)
      .then(response => response.json())
      .then(data => {
        console.log("API Response:", data.results); // Проверяем новые данные
        setFilteredDreams(data.results); // Загружаем мечты
        setPagination({
          next: data.next || "",
          previous: data.previous || "",
          count: data.count,
          num_pages: data.num_pages
        }); // Обновляем пагинацию
        console.log("Updated pagination with filters:", pagination);
      })
      .catch(error => console.error("Ошибка запроса:", error));  
  };  
  
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedFundingRange(null);
    setSelectedSortOption(null);
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedType(null);
    setCurrentPage(1); // Возвращаемся на первую страницу
    
    fetchDreams(); // Повторно загружаем данные с сервера, чтобы восстановить pagination
    fetchCities(""); // Запрашиваем все города
  };  

  const handlePageChange = (pageUrl: string) => {
    if (pageUrl) {
      fetch(pageUrl)
        .then(response => response.json())
        .then(data => {
          console.log("API Response:", data); // Проверяем API-ответ
  
          setFilteredDreams(data.results);
          setPagination({
            next: data.next, // Обновляем ссылку на следующую страницу
            previous: data.previous, // Обновляем ссылку на предыдущую страницу
            count: data.count,
            num_pages: data.num_pages
          });
        })
        .catch(error => console.error("Ошибка запроса:", error));
    }
  };  

  console.log("pagination:", pagination);    //////////////////////////////////

  const renderPagination = () => {
    if (pagination.count === 0) { return null; } // Проверяем по количеству записей, а не по URL
  
    return (
      <div className="pagination">
        <button
          className="pagination-arrow"
          disabled={!pagination.previous}
          onClick={() => handlePageChange(pagination.previous)}
        >
          &lt;
        </button>
    
        <span> *** </span> {/* Отображает текущую страницу */}
    
        <button
          className="pagination-arrow"
          disabled={!pagination.next}
          onClick={() => handlePageChange(pagination.next)}
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
              {typeOptions && typeOptions.length > 0 && typeOptions.map((type, index) => (
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
                    const newPageSize = size === "All" ? 10000 : (size as number);
                    setDreamsPerPage(newPageSize);
                    setIsDreamsPerPageDropdownOpen(false);
                    setCurrentPage(1);
                    
                    // Делаем новый запрос в API с выбранным количеством элементов на странице
                    fetch(`http://127.0.0.1:8000/api/v1/dreamhelper/dreams?page_size=${newPageSize}`)
                      .then(response => response.json())
                      .then(data => {
                        setFilteredDreams(data.results);
                        setPagination({
                          next: data.next,
                          previous: data.previous,
                          count: data.count,
                          num_pages: data.num_pages // Теперь берём актуальные данные из API
                        });
                      })
                      .catch(error => console.error("Ошибка запроса:", error));
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
        {filteredDreams.map(dream => {
          const goalAmount = parseInt(dream.goal) || 1;
          const collected = dream.total_amount_donations;
          const progressPercent = Math.min((collected / goalAmount) * 100, 100);

          return (
            <div key={dream.id} className="dream-card">
              <div className="dream-image">
                <img
                  src={dream.thumbnail_url || "/home-page/a-dream.png"}
                  alt={dream.title}
                  className="dream-img"
                  onLoad={(e) => (e.target as HTMLImageElement).classList.add("loaded")}
                  onError={(e) => {
                    console.log("Image not found for dream:", dream.id);
                    (e.target as HTMLImageElement).src = "/dream-helper/home-page/a-dream.png";
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
                  <span>${collected.toLocaleString('en-US')}</span>
                  <span>${goalAmount.toLocaleString('en-US')}</span>
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

