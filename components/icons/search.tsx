import { FC } from 'react';

export const SearchIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="16 / search">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.4263 16.5476C13.0972 17.4637 11.4862 18 9.75 18C5.19365 18 1.5 14.3063 1.5 9.75C1.5 5.19365 5.19365 1.5 9.75 1.5C14.3063 1.5 18 5.19365 18 9.75C18 11.4862 17.4637 13.0972 16.5476 14.4263L22.0607 19.9393L19.9393 22.0607L14.4263 16.5476ZM9.75 15C12.6495 15 15 12.6495 15 9.75C15 6.8505 12.6495 4.5 9.75 4.5C6.8505 4.5 4.5 6.8505 4.5 9.75C4.5 12.6495 6.8505 15 9.75 15Z"
          fill="black"
        />
      </g>
    </svg>
  );
};
