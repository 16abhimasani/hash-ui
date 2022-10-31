import { FC } from 'react';

export const CheckMarkIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.99999 11.2L1.79999 6.99998L0.399994 8.39998L5.99999 14L18 1.99998L16.6 0.599976L5.99999 11.2Z"
        fill="#000000"
      />
    </svg>
  );
};
