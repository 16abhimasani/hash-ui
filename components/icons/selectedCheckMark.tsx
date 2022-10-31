import { FC } from 'react';

export const SelectedCheckMark: FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.5 12.75C3.04813 12.75 0.25 9.95187 0.25 6.5C0.25 3.04813 3.04813 0.25 6.5 0.25C9.95187 0.25 12.75 3.04813 12.75 6.5C12.75 9.95187 9.95187 12.75 6.5 12.75ZM5.87687 9L10.2956 4.58062L9.41187 3.69687L5.87687 7.2325L4.10875 5.46437L3.225 6.34812L5.87687 9Z"
        fill="black"
      />
    </svg>
  );
};
