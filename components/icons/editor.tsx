import { FC } from 'react';

export const FormatBoldIcon: FC<{ className?: string }> = ({ className }) => {
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
        d="M15.6 11.79C16.57 11.12 17.25 10.02 17.25 9C17.25 6.74 15.5 5 13.25 5H7V19H14.04C16.13 19 17.75 17.3 17.75 15.21C17.75 13.69 16.89 12.39 15.6 11.79V11.79ZM10 7.5H13C13.83 7.5 14.5 8.17 14.5 9C14.5 9.83 13.83 10.5 13 10.5H10V7.5ZM13.5 16.5H10V13.5H13.5C14.33 13.5 15 14.17 15 15C15 15.83 14.33 16.5 13.5 16.5Z"
        fill="#323232"
      />
    </svg>
  );
};

export const FormatStrikeThroughIcon: FC<{ className?: string }> = ({
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
        d="M10.2222 18H13.7778V15.4H10.2222V18ZM5.77778 5V7.6H10.2222V10.2H13.7778V7.6H18.2222V5H5.77778ZM4 13.6667H20V11.9333H4V13.6667Z"
        fill="#323232"
      />
    </svg>
  );
};

export const FormatItalicIcon: FC<{ className?: string }> = ({ className }) => {
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
        d="M10 4V7H12.21L8.79 15H6V18H14V15H11.79L15.21 7H18V4H10Z"
        fill="#323232"
      />
    </svg>
  );
};

export const FormatCodeIcon: FC<{ className?: string }> = ({ className }) => {
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
        d="M10 15.825L6.2915 12L10 8.175L8.8583 7L4 12L8.8583 17L10 15.825Z"
        fill="#323232"
      />
      <path
        d="M14 15.825L17.7085 12L14 8.175L15.1417 7L20 12L15.1417 17L14 15.825Z"
        fill="#323232"
      />
    </svg>
  );
};

export const FormatLinkIcon: FC<{ className?: string }> = ({ className }) => {
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
        d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12ZM8 13H16V11H8V13ZM17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z"
        fill="#323232"
      />
    </svg>
  );
};

export const FormatTitleIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 4V7H10.5V19H13.5V7H19V4H5Z" fill="#323232" />
    </svg>
  );
};

export const FormatUnorderedListIcon: FC<{ className?: string }> = ({
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
        d="M4 10.5C3.17 10.5 2.5 11.17 2.5 12C2.5 12.83 3.17 13.5 4 13.5C4.83 13.5 5.5 12.83 5.5 12C5.5 11.17 4.83 10.5 4 10.5ZM4 4.5C3.17 4.5 2.5 5.17 2.5 6C2.5 6.83 3.17 7.5 4 7.5C4.83 7.5 5.5 6.83 5.5 6C5.5 5.17 4.83 4.5 4 4.5ZM4 16.5C3.17 16.5 2.5 17.18 2.5 18C2.5 18.82 3.18 19.5 4 19.5C4.82 19.5 5.5 18.82 5.5 18C5.5 17.18 4.83 16.5 4 16.5ZM7 19H21V17H7V19ZM7 13H21V11H7V13ZM7 5V7H21V5H7Z"
        fill="#323232"
      />
    </svg>
  );
};

export const FormatOrderedListIcon: FC<{ className?: string }> = ({
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
        d="M2 17H4V17.5H3V18.5H4V19H2V20H5V16H2V17ZM3 8H4V4H2V5H3V8ZM2 11H3.8L2 13.1V14H5V13H3.2L5 10.9V10H2V11ZM7 5V7H21V5H7ZM7 19H21V17H7V19ZM7 13H21V11H7V13Z"
        fill="#323232"
      />
    </svg>
  );
};
