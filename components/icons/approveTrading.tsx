import { FC } from 'react';

export const ApproveTradingIcon: FC<{ className?: string }> = ({
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
        d="M19.7 12.3L11.7 4.3C11.5 4.1 11.3 4 11 4H5C4.4 4 4 4.4 4 5V11C4 11.3 4.1 11.5 4.3 11.7L12.3 19.7C12.5 19.9 12.7 20 13 20C13.3 20 13.5 19.9 13.7 19.7L19.7 13.7C20.1 13.3 20.1 12.7 19.7 12.3ZM8 9C7.4 9 7 8.6 7 8C7 7.4 7.4 7 8 7C8.6 7 9 7.4 9 8C9 8.6 8.6 9 8 9Z"
        fill="black"
      />
    </svg>
  );
};
