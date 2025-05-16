import { useState, useEffect } from 'react';
import './DreamCarousel.scss';
import randomDreams from '../../api/random_dreams.json';
import { useIsMobile } from '../../use-mobile';
import SupportModal from '../SupportModal/SupportModal';
import { Link } from 'react-router-dom';

export interface Dream {
  id: number;
  owner: number;
  title: string;
  to_another: boolean;
  dreamer: number | null;
  categories: number[];
  content: string;
  goal: string;
  photo_url: string | null;
  thumbnail_url: string | null;
  status: 'Active' | 'Inactive' | string;
  created_at: string;
  number_donations: number;
  total_amount_donations: number;
  number_comments: number;
  number_views: number;
}

const DreamCarousel: React.FC = () => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDream, setActiveDream] = useState<Dream | null>(null);
  const isMobile = useIsMobile();

  const shuffleArray = (array: Dream[]) => {
    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
  };

//   useEffect(() => {
//     const shuffledDreams = shuffleArray(randomDreams);
//     let selectedDreams: Dream[] = [];
//
//     if (shuffledDreams.length >= 8) {
//       selectedDreams = shuffledDreams.slice(0, 8);
//     } else {
//       const repeats = Math.ceil(8 / shuffledDreams.length);
//
//       for (let i = 0; i < repeats; i++) {
//         selectedDreams = [...selectedDreams, ...shuffledDreams];
//       }
//
//       selectedDreams = selectedDreams.slice(0, 8);
//     }
//
//     setDreams(selectedDreams);
//   }, []);

  // For the backend

  useEffect(() => {
    async function fetchDreams() {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/v1/dreamhelper/dreams/get_random_dreams/',
        );

        if (!response.ok) {
          throw new Error('Data loading error');
        }

        const data = await response.json();

        console.log('Loaded data:', data);

        const shuffledDreams = shuffleArray(data);
        let selectedDreams: Dream[] = [];

        if (shuffledDreams.length >= 8) {
          selectedDreams = shuffledDreams.slice(0, 8);
        } else {
          const repeats = Math.ceil(8 / shuffledDreams.length);

          for (let i = 0; i < repeats; i++) {
            selectedDreams = [...selectedDreams, ...shuffledDreams];
          }

          selectedDreams = selectedDreams.slice(0, 8);
        }

        setDreams(selectedDreams);
      } catch (error) {
        console.error('Ошибка загрузки с API:', error);
      }
    }

    fetchDreams();
  }, []);

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % dreams.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      prevIndex => (prevIndex - 1 + dreams.length) % dreams.length,
    );
  };

  const visibleDreams = () => {
    if (dreams.length === 0) {
      return [];
    }

    const result = [];
    const displayCount = isMobile ? 1 : window.innerWidth < 1024 ? 2 : 4;

    for (let i = 0; i < displayCount; i++) {
      if (dreams.length === 0) {
        break;
      }

      const index = (currentIndex + i) % dreams.length;

      result.push(dreams[index]);
    }

    return result;
  };

  if (dreams.length === 0) {
    return <div className="dream-carousel loading">Loading dreams...</div>;
  }

  return (
    <section className="dream-carousel" id="dreams">
      <div className="dream-carousel-container">
        <h2 className="dream-carousel-title">Dreams we fulfill</h2>

        <div className="carousel">
          <button className="carousel-nav prev" onClick={handlePrev}>
            &lt;
          </button>

          <div className="carousel-container">
            {visibleDreams().map(dream => {
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
                      src={dream.thumbnail_url || 'home-page/a-dream.png'}
                      alt={dream.title}
                      onLoad={event => {
                        const img = event.currentTarget;

                        img.classList.add('loaded');
                      }}
                      onError={event => {
                        const img = event.currentTarget;

                        if (
                          img.src !==
                          window.location.origin + 'home-page/a-dream.png'
                        ) {
                          img.src = 'home-page/a-dream.png';
                        }
                      }}
                      className="dream-img"
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
                      <span>{collected.toLocaleString('en-US')}₴</span>
                      <span>{goalAmount.toLocaleString('uk-UA')}₴</span>
                    </div>
                  </div>
                  <button className="dream-support-btn"
                    onClick={() => setActiveDream(dream)}
                  >
                   Support
                  </button>
                </div>
              );
            })}
          </div>

          <button className="carousel-nav next" onClick={handleNext}>
            &gt;
          </button>
        </div>
      </div>

      {activeDream && (
        <SupportModal
          isOpen={true}
          dream={activeDream}
          onClose={() => setActiveDream(null)}
        />
      )}
    </section>
  );
};

export default DreamCarousel;
