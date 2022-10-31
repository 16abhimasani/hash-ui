import { FC } from 'react';
import styled from 'styled-components';

export const ChevronUpIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="16 / chevron-top">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0001 9.62132L4.06077 17.5607L1.93945 15.4393L12.0001 5.37868L22.0608 15.4393L19.9395 17.5607L12.0001 9.62132Z"
          fill="black"
        />
      </g>
    </svg>
  );
};

export const ChevronDownIcon = styled(ChevronUpIcon)`
  transform: rotate(180deg);
`;

export const ChevronRightIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.07234 13.6596C5.75954 13.9716 5.25314 13.9716 4.94114 13.6596C4.62834 13.3468 4.62834 12.8404 4.94114 12.5284L9.36914 8.09956L4.94114 3.67075C4.62834 3.35795 4.62834 2.85155 4.94114 2.53955C5.25314 2.22675 5.75954 2.22675 6.07234 2.53955L11.0747 7.54276C11.3819 7.84996 11.3819 8.34836 11.0747 8.65636L6.07234 13.6596Z"
        fill="#999998"
      />
    </svg>
  );
};
