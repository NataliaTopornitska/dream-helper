import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './DreamDetails.module.scss';
import InfoCard from './InfoCard';
import Description from './Description';
import Donors from './Donors';
import Comments from './Comments';
import SupportButton from './SupportButton';

const DreamDetails = () => {
  const { id } = useParams();
  const [dream, setDream] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`http://127.0.0.1:8000/api/v1/dreamhelper/dreams/${id}/`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setDream(data))
      .catch(error => console.error('Fetch error:', error));
  }, [id]);

  if (!dream) return <p>Loading...</p>;

  return (
    <div className={styles.dreamDetails}>
      <h1 className={styles.dreamTitle}>{dream.title}</h1>
      <div className={styles.header}>
  <img
  src={dream.photo_url || dream.thumbnail_url}
  alt={dream.title}
  className={`${styles.dreamImage} ${styles.dreamImageStyled}`}
  onError={(e) => {
    const target = e.currentTarget as HTMLImageElement;
    target.onerror = null;
    target.src = '/dream-helper/dream-details/details-d.png';
  }}
/>

        <InfoCard dream={dream} />
      </div>
<div className={styles.detailsWrapper}>
  <div className={styles.descriptionContainer}>
  <Description content={dream.content} />
</div>
  <div className={styles.sidebar}>
    <Donors dreamId={dream.id} />
    <SupportButton />
  </div>
</div>
      <Comments dreamId={dream.id} />
    </div>
  );
};

export default DreamDetails;
