import { FC } from 'react';

export const VolumeIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="24 / music / volume-high">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 8.61803L12 6.61803V17.382L8 15.382V8.61803ZM6.76393 6.99999L14 3.38196V20.618L6.76393 17H3C1.89543 17 1 16.1046 1 15V8.99999C1 7.89542 1.89543 6.99999 3 6.99999H6.76393ZM6 8.99999H3V15H6V8.99999ZM19.6791 3.45671C21.7136 5.48074 23 8.5681 23 12C23 15.4319 21.7136 18.5192 19.6791 20.5433L18.1031 19.2825C19.8488 17.6536 21 15.0122 21 12C21 8.98782 19.8488 6.34635 18.1031 4.71747L19.6791 3.45671ZM19 12C19 9.58933 18.0649 7.41237 16.5748 5.94019L14.9973 7.20218C16.2072 8.2917 17 10.0257 17 12C17 13.9743 16.2072 15.7083 14.9973 16.7978L16.5748 18.0598C18.0649 16.5876 19 14.4107 19 12Z"
          fill="black"
        />
      </g>
    </svg>
  );
};

export const VolumeMuteIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="24 / music / volume-off">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 8.61803L12 6.61803V17.382L8 15.382V8.61803ZM6.76393 6.99999L14 3.38196V20.618L6.76393 17H3C1.89543 17 1 16.1046 1 15V8.99999C1 7.89542 1.89543 6.99999 3 6.99999H6.76393ZM6 8.99999H3V15H6V8.99999ZM20.4142 12L22.7071 14.2929L21.2929 15.7071L19 13.4142L16.7071 15.7071L15.2929 14.2929L17.5858 12L15.2929 9.7071L16.7071 8.29289L19 10.5858L21.2929 8.29289L22.7071 9.7071L20.4142 12Z"
          fill="black"
        />
      </g>
    </svg>
  );
};
