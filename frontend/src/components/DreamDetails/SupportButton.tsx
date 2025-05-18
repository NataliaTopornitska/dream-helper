import { useState } from 'react';
import styles from './DreamDetails.module.scss';
import SupportModal from '../SupportModal/SupportModal';
import { Dream } from '../../types';

type SupportButtonProps = {
  dream: Dream;
};

const SupportButton = ({ dream }: SupportButtonProps) => {
  const [activeDream, setActiveDream] = useState<Dream | null>(null);

  return (
    <>
      <button
        className={styles.dButton}
        onClick={() => setActiveDream(dream)}
      >
        Support
      </button>

      {activeDream && (
        <SupportModal
          isOpen={true}
          dream={activeDream}
          onClose={() => setActiveDream(null)}
        />
      )}
    </>
  );
};

export default SupportButton;
