import { FC } from 'react';

export const ShareIcon: FC<{ className?: string; style?: any }> = ({
  className,
  style,
}) => {
  return (
    <svg
      style={style}
      className={className}
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2026_6097)">
        <path
          d="M7.49961 3.4V12H9.49961V3.4L13.4996 7.4L14.8996 6L9.19961 0.3C8.79961 -0.1 8.19961 -0.1 7.79961 0.3L2.09961 6L3.49961 7.4L7.49961 3.4Z"
          fill="black"
        />
        <path
          d="M14.5 14H2.5V11H0.5V15C0.5 15.6 0.9 16 1.5 16H15.5C16.1 16 16.5 15.6 16.5 15V11H14.5V14Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_2026_6097">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
