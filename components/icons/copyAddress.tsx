import { FC } from 'react';

export const CopyAddressIcon: FC<{ className?: string }> = ({ className }) => {
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
        d="M15 16H5C4.447 16 4 15.553 4 15V5C4 4.448 4.447 4 5 4H15C15.553 4 16 4.448 16 5V15C16 15.553 15.553 16 15 16Z"
        fill="black"
      />
      <path
        d="M19 20H8V18H18V8H20V19C20 19.553 19.553 20 19 20Z"
        fill="black"
      />
    </svg>
  );
};
