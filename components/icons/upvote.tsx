import { FC } from 'react';

export const UpvoteIcon: FC<{ className?: string; color?: string }> = ({
  className,
  color,
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="16"
      fill="none"
      viewBox="0 0 10 16"
    >
      <path
        fill={color ?? '#C6C6C6'}
        d="M10 4.868L8.572 6.115 6.01 3.878V15.5H3.99V3.878L1.43 6.115 0 4.868 5 .5l5 4.368z"
      ></path>
    </svg>
  );
};

export const DownvoteIcon: FC<{ className?: string; color?: string }> = ({
  className,
  color,
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="16"
      fill="none"
      viewBox="0 0 11 16"
    >
      <path
        fill={color ?? '#C6C6C6'}
        d="M0 11.632l1.428-1.247 2.562 2.237V1h2.02v11.622l2.56-2.237L10 11.632 5 16l-5-4.368z"
      ></path>
    </svg>
  );
};
