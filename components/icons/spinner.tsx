import { FC } from 'react';
import styled, { css, keyframes } from 'styled-components';

const spinning = keyframes`
  0% {
    transform: rotate(0);
  }

100% {
  transform: rotate(360deg);
}
`;

const spinningAnimation = css`
  animation: ${spinning} 0.9s ease-in-out infinite;
`;

const SpinnerSvg = styled.svg`
  ${spinningAnimation}
`;

export const SpinnerIcon: FC<{ className?: string; style?: any }> = ({
  className,
  style,
}) => {
  return (
    <SpinnerSvg
      style={style}
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width="14" height="14" fill="url(#pattern0)" />
      <defs>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_2141_2214" transform="scale(0.03125)" />
        </pattern>
        <image
          id="image0_2141_2214"
          width="32"
          height="32"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABNJJREFUWEetl0mIXlUQhb9KnOd5whHHjYio4ITBjajggIrTQtwoGlFBohsVUXcBwUUk4EaUFgSXohBwpRIUHOIMguhG7cSpTUzSGfTK96hqbl66OzGdB4+/+92hTp2qOrduMMfTWguHIqL521o7ATgTuBg4HTgVOAzYH9gE/AR8D3wOfBwRa3PdIpfXPmNzg5Hx01pbFBH/doZvAi4DTgYWA8OY+AAN7AvsBxwA7AP8mEBei4hvCkjt2dvbCUAZb6250R3AdcCRaXR7GhCE4/UrCP/21z0PBg5MZiaAFyNiS2ttcUT8MycAaZeq1topwH3ABcAWKUyDZVRj/Tv+3jNzFLAaWBYRP/TsFoUDoM7z84BHgWOAzUlvGdPDolzaffsxDQumAA3xTwYngQcj4qOeiSEEnfHjgScBUW8dGXCqMZZeaTQcrhdAfT8E2Jbj5kSFRhCO/Q7cHhHfFgj5Ltr15nFABqbTeHmsETPeDT4FvgJMrqn00Ao5F1gCXAWcmA64XjZ6JgzHzRGxbbDdAbgNuBH4uzNelFpq7wJvR8TPc5VusnkGcD9wVzJRewhC5o4GlkfEcwPzucike6LLYj32Eb3MvBER7+Rcx6R0prZTM0o3qnxN4mdyrktdV2DMrSUmZQG4B7gik64oc8zYanxVGZmtlntGjK0lm9X0APB8hsN93VPwhwMrImKZITgCeAQ4NhNLqnwOAj6IiFfHqjhfCJKlGRVtrS0HHgb+SjYFoGO/ANcIQGm9N0VDlE6QduVVAZkc1+6uAFSoFJ3W2lnAqs7BUlIdv0UAtwJXpuBUtlpqH0bExJ4YL4CqaURsb62tBAyHLOikeXIosFIAS4HTuoyt5Hs9ItYsEMAgva21u4FX0kbhMwzvC+CpjInUGztfy8UkWVdluju0j+d0JW5pfpHnQx1khmKdAJ7NhQXAMKj/1qpquMdPB0AVVIoNrQDqEGwCeLr/kFqg4Rf2IgDp9ohW6vujfKsAHsuS6wfU85cjYmohIaiSTE1YATyUVVYMTAhAEbK70eiwJll4KyK+3osATgJeAq5PvbE0lwrgWuCiPIBKrz3JPksFnOmO9jQZWmuKWjmmLZ1dExGbBXAOoBaoz1JjKASyEXgzIv5cCAspzdZ8OedhJxgTcloA6vKd+aHCIAhZ+CQi3lsgAPf3NK1WrM4DbW2ow+hq4MIMQ+WBCxxfHRFf9gk1Xyh6sK01PbePcC+d0vNK9umI2FgARGkDqkw62YmF2L+V5epud2jXO9kdt/Fqvc2snZNGaz//9p1SpvuG5FLgkswF961Fw9kPfGcXFBEbdsGAdGu4PC/vyzGXr48Ic4EegNJ4A2B7ZUvm46J6TSKN2xGpaus7sJ6eJpWK5+tcxayM9wy49291UakQVF9oM+o9QC/coELhBlI53JJSqh03kfxe3jnP7z3tvXHH1kp9sThzMel0WwZsLr1YWJrFRIEog7Vx/e/veKzY047ni8aL3WHjHW5GHQjjdzlwXIIoj8poH5pq0ftvNa8y3nhPzna2zHY1q3CYE+cDdjTGVLr7uPbJNQZU5eZ8W/lf/+/ldACRtW85nZ2ZraRqrI99723ljKH7Iw3Pe6TvxMA8dW1O2NMLyEz3iK3mxfgq3b5eVjZ5Gd2ds+M/2hqbgSqqNokAAAAASUVORK5CYII="
        />
      </defs>
    </SpinnerSvg>
  );
};

export const SpinnerDarkIcon: FC<{ className?: string; style?: any }> = ({
  className,
  style,
}) => {
  return (
    <SpinnerSvg
      style={style}
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width="14" height="14" fill="url(#pattern0)" />
      <defs>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_2271_646" transform="scale(0.03125)" />
        </pattern>
        <image
          id="image0_2271_646"
          width="32"
          height="32"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABIZJREFUWEetl13I3nMYxz+Pt3nfvI7lZcu8nEgLZYicCOWlWds40E6ICSWcjIQzpRyQciKaUg5FKUdIlHkdSmlOMPM6M5sZ00fX9+7a/7m3Z3bvX//nvp/fy3V9r+/1va7f755i989UTe2sz5OAM4ALgPnAacDRwCzgD+Ab4CvgY+B94PvadwCgjdjZxWOcDGG46Z/m+HpgMXAKcGCbc79rDwYOAQ4FDgK+LiAvAJ83ILE58jcOQJxraDlwNXBMOd1RDgThfD7d43c/tXkEcFgxswZ4Eviz1vzdox0C8H+pOhW4FTivNjqmwzjVWX+H452ZY4F3gPuA9QVyxEQHkMjPAe4Bjge2Fr1x5ppQLu2+fU57HWjyL4MbgDuA9zoTARDnc4HVgKi3DxzInDmWXmk0He4XQMaPBP6qeTWR1Migcz8By4AvAkIDod1o7gdkYFs5T8Q6UfEa+ABYV+L6tVJmhZwNXA5cBpxcAbhfRjoTpuOGAjrVASwFrgN+b85DqaX2BvAq8O0eStepBcBtwE3FRGwIQuaOAx4HHhVYUqDoHmgqNmIf0cvMS8BrNeZc6jq1nUBcEoEp4odb/bsvYNSWbK0PgFuAS0p0ocw5c6vz12uzY9NqecBI+oTgbgceq3RoN+meDTxlZTgwB7gbOKGEJVU+hwNvA8/XRsfGdrMxKeldVLrvAjYVm9owsO+AK11oa11ZTUOULpB226sNxPLpnXEGCYymZcKcLywGE2AYMvAlArgRuLQaTtRqqb0L2MX2xXlQGJDl+kylQxYcM41HOS6AVcDpTbER34vARxMCCAs3A8+Vj4AzDW8J4MHKidRHzVKnSDY24ewt9cNWr11L85M6HyJiwW3U4SPt2E0P9+BQPHbDSZ6o3i6olkytAEYi9ctDA5Wbcx0/sR8BSLdHtK0+DOh7u3/urZLrE/bzZwFbbaLYVyay35TeWVUWBtb4xSbk7UanqXVZeAX4bD8CmAc8DVxTlWFzWyWAq4Dz6wBKv/Yk+7Dqd5IyDGs2NcWoLX0ZrBW2VQBnVS+wP6fVunAL8DLwy4QsqHZrPsF52AlGQW7ToX15RQ0kDepBFtYCb04IQPueprmKRRP62hwxXAEsqjREB25w3vP70+JybwTZ1xi59whtGZSRR+zeObYEgCi9gNomXezCIPa7bTm3237QDJtOP7Ds9V7FbMU6jT2/+1phO9L5dHIRcGEdyTnXA8b5LwvE5hnqUbp1nMgTfWy5/be6+Ixarw4Uy7WA1yvp8XFTXkWkc29EdjWNKFwfT09FZcfzTTOL886Atn/M0R46kzcvo/4OMAq7YVKhAanMfcBW7bxCcjzRuc7xTnt37py/mJz/7wmAfNeBDHhd8odFIkwkbozDGM7/4+bCnn4ErfOwOw1AB2H+LgZOLBCJKE57anJF72NZF8Vb+6Zt2uHWGeisRBPn1o3GnEq3Brqodgco5eZ6r/I//N8fp72WLaczS9m2VAH03PdooxlT93M53uORPo6BoT4iPDXhnV5AKt0j1v0CMr+2bl/r2/ukYzM+/wIFTWyZkI5mdgAAAABJRU5ErkJggg=="
        />
      </defs>
    </SpinnerSvg>
  );
};
