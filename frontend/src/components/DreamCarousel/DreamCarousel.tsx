import { useState, useEffect } from 'react';
import './DreamCarousel.scss';
import randomDreams from '../../api/random_dreams.json';
import { useIsMobile } from '../../hooks/use-mobile';

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
  const isMobile = useIsMobile();

  const shuffleArray = (array: Dream[]) => {
    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
  };

  useEffect(() => {
    const shuffledDreams = shuffleArray(randomDreams);
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
                    <img
                      src={dream.thumbnail_url || 'img/home-page/a-dream.png'}
                      alt={dream.title}
                      onLoad={event => {
                        const img = event.currentTarget;

                        img.classList.add('loaded');
                      }}
                      onError={event => {
                        const img = event.currentTarget;

                        if (
                          img.src !==
                          window.location.origin + 'img/home-page/a-dream.png'
                        ) {
                          img.src = 'img/home-page/a-dream.png';
                        }
                      }}
                      className="dream-img"
                    />
                  </div>
                  <h3 className="dream-title">{dream.title}</h3>
                  <p className="dream-content">
                    {dream.content.length > 140
                      ? dream.content.slice(0, 140) + '...'
                      : dream.content}
                  </p>
                  <div className="dream-progress">
                    <div className="progress-labels">
                      <span>Collected</span>
                      <span>Need</span>
                    </div>
                    <div className="progress-values">
                      <span>{collected.toLocaleString('uk-UA')}₴</span>
                      <span>{goalAmount.toLocaleString('uk-UA')}₴</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="dream-support-btn">Support</button>
                </div>
              );
            })}
          </div>

          <button className="carousel-nav next" onClick={handleNext}>
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
};

export default DreamCarousel;
