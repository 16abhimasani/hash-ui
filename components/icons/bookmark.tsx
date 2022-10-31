import { FC } from 'react';

export const BookmarkIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="13"
      height="16"
      viewBox="0 0 13 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.900098 0H12.1001C12.3123 0 12.5158 0.0816576 12.6658 0.227009C12.8158 0.372361 12.9001 0.569499 12.9001 0.775057V15.612C12.9002 15.6813 12.8811 15.7493 12.8448 15.809C12.8085 15.8688 12.7564 15.918 12.6938 15.9515C12.6312 15.9851 12.5605 16.0018 12.489 15.9999C12.4175 15.9979 12.3479 15.9775 12.2873 15.9406L6.5001 12.4242L0.712897 15.9398C0.652392 15.9767 0.582808 15.9971 0.511379 15.9991C0.439951 16.001 0.369287 15.9844 0.306734 15.9509C0.244181 15.9175 0.192023 15.8684 0.155684 15.8088C0.119345 15.7492 0.100151 15.6812 0.100098 15.612V0.775057C0.100098 0.569499 0.184383 0.372361 0.334412 0.227009C0.484441 0.0816576 0.687924 0 0.900098 0ZM11.3001 1.55011H1.7001V13.5108L6.5001 10.5958L11.3001 13.5108V1.55011Z"
        fill="black"
      />
    </svg>
  );
};
