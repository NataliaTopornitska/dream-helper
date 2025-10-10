import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './DreamDetails.module.scss';
import InfoCard from './InfoCard';
import Description from './Description';
import Donors from './Donors';
import Comments from './Comments';
import SupportButton from './SupportButton';

const DreamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dream, setDream] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const token = localStorage.getItem('authToken');
        console.log('Token:', token);

        let adminCheck = false;
        let profile: any = null;

        if (token) {
          const profileRes = await fetch('http://127.0.0.1:8000/api/v1/users/me/', {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (profileRes.ok) {
            profile = await profileRes.json();
            console.log('Profile:', profile);

            if (
              profile.id === 1 &&
              profile.email?.trim().toLowerCase() === 'az@a.com' &&
              profile.is_staff === true
            ) {
              adminCheck = true;
              setIsAdmin(true);
              console.log('Admin access granted');
            }
          } else {
            console.warn('Failed to fetch profile:', profileRes.status);
          }
        } else {
          console.warn('No token found in localStorage');
        }

        const dreamRes = await fetch(`http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${id}/`, {
          headers: token
            ? { Authorization: `Token ${token}` }
            : {},
        });

        if (!dreamRes.ok) throw new Error('Dream not found');
        const dreamData = await dreamRes.json();

        console.log('DreamData:', dreamData);
        console.log('Profile:', profile);

        console.log('Dream status:', dreamData.status);
        console.log('Admin check:', adminCheck);

        if (dreamData.status?.toLowerCase() === 'application') {
          const isOwner = profile && profile.name === dreamData.owner;

          if (!(adminCheck || isOwner)) {
            setHasPermission(false);

            return;
          }
        }

        setDream(dreamData);
      } catch (err) {
        console.error('Error loading dream:', err);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) return <p>Loading...</p>;
  if (!hasPermission)
    return (
      <p style={{ padding: '2rem', fontSize: '18px' }}>
        You don't have permission to view this dream.
      </p>
    );
  if (!dream) return <p>Dream not found.</p>;

  return (
    <div className={styles.dreamDetails}>
      <button
        className={styles.backButton}
        onClick={() => navigate(-1)}
        aria-label="Go back"
        type="button"
      >
        <img
          src="/dream-helper/dream-details/back.png"
          alt="Back"
          className={styles.backIcon}
        />
      </button>

      <h1 className={styles.dreamTitle}>{dream.title}</h1>

      <div className={styles.header}>
        <div className={styles.imageWrapper}>
          <img
            src={
              dream.photo_url?.trim() ||
              dream.thumbnail_url?.trim() ||
              '/dream-helper/dreams-page/block-1.png'
            }
            alt={dream.title}
            className={styles.dreamImageStyled}
            onError={e => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = '/dream-helper/dreams-page/block-1.png';
            }}
          />
        </div>
        <InfoCard dream={dream} />
      </div>

      <div className={styles.detailsWrapper}>
        <div className={styles.descriptionSide}>
          <div className={styles.descriptionContainer}>
            <Description content={dream.content} />
          </div>
          <div className={styles.commentsContainer}>
            <Comments dreamId={dream.id} />
          </div>
        </div>
        <div className={styles.sidebar}>
          <Donors dreamId={dream.id} />
          <SupportButton dream={dream} />
        </div>
      </div>
    </div>
  );
};

export default DreamDetails;
