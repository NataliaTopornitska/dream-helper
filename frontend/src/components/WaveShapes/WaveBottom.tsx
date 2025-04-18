import React from 'react';

const WaveBottom: React.FC = () => {
  return (
    <svg
      width="100%"
      height="200"
      viewBox="0 0 1440 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className="wave-bottom"
    >
      <path
        d="M0 200H1440V50C1080 0 720 80 360 30C240 10 120 20 0 50V200Z"
        fill="#B0C4F7"
      />
    </svg>
  );
};

export default WaveBottom;
