import { useState, useEffect } from 'react';
import '../DreamCarousel/DreamCarousel.scss';
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

const ProfileDreams: React.FC = () => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDream, setActiveDream] = useState<Dream | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchDreams() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found, please log in');
          return;
        }

        const response = await fetch(
          'http://127.0.0.1:8000/api/v1/profiles/mine/my_dreams/',
          {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Data loading error, status: ' + response.status);
        }

        const data = await response.json();
        setDreams(data);
      } catch (error) {
        console.error('Помилка завантаження з API:', error);
        setDreams([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDreams();
  }, []);

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % dreams.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + dreams.length) % dreams.length);
  };

  const visibleDreams = () => {
    const displayCount = isMobile ? 1 : window.innerWidth < 1024 ? 2 : 4;
    const result = [];

    for (let i = 0; i < displayCount; i++) {
      const index = (currentIndex + i) % dreams.length;
      result.push(dreams[index]);
    }

    return result;
  };

  return (
    <section className="dream-carousel" id="dreams">
      <div className="dream-carousel-container">
        <h2 className="dream-carousel-title">My Dreams</h2>

        {isLoading ? (
          <p>Loading dreams...</p>
        ) : dreams.length === 0 ? (
          <p>You haven't added any dreams yet.</p>
        ) : (
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
                            event.currentTarget.classList.add('loaded');
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
                      <Link to={`/dreams/${dream.id}`} className="dream-title-link">
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
                        <span>{collected.toLocaleString('fr-FR')}$</span>
                        <span>{goalAmount.toLocaleString('fr-FR')}$</span>
                      </div>
                    </div>
                    <div className="dream-dreamer-label">
                      {dream.dreamer ? `Initiated for: ${dream.dreamer}` : '\u00A0'}
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="carousel-nav next" onClick={handleNext}>
              &gt;
            </button>
          </div>
        )}
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

export default ProfileDreams;
