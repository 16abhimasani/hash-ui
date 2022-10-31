import { FC } from 'react';

export const ArrowTopRightIcon: FC<{ className?: string }> = ({
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3788 7.5H7.50011V4.5H19.5001V16.5H16.5001V9.62132L7.06077 19.0607L4.93945 16.9393L14.3788 7.5Z"
        fill="black"
      />
    </svg>
  );
};
