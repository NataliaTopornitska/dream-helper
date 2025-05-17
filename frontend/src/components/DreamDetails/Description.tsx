import styles from './DreamDetails.module.scss';

const Description = ({ content }: { content: string }) => (
  <div className={styles.descriptionContainer}>
    <h2 className={styles.desTitle}>Description</h2>
    <p className={styles.desContent}>{content}</p>
  </div>
);

export default Description;
