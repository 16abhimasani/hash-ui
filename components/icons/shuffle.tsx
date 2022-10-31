import { FC } from 'react';

export const ShuffleIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 14 14"
    >
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9.333 1.75h2.917v2.917M2.333 11.667L12.25 1.75M12.25 9.333v2.917H9.333M8.75 8.75l3.5 3.5M2.333 2.333L5.25 5.25"
      ></path>
    </svg>
  );
};
