import { FC } from 'react';

export const DisconnectWalletIcon: FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 16.4139L19.414 11.9999L15 7.58594L13.586 8.99994L15.586 10.9999H9V12.9999H15.586L13.586 14.9999L15 16.4139Z"
        fill="black"
      />
      <path
        d="M16 18H7V6H16V4H6C5.448 4 5 4.448 5 5V19C5 19.552 5.448 20 6 20H16V18Z"
        fill="black"
      />
    </svg>
  );
};
