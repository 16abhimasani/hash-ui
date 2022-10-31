export const lowerCaseCheck = (
  a: string | undefined | null,
  b: string | undefined | null,
) => {
  if (!a || !b) {
    return false;
  }
  return a?.toLowerCase()?.includes(b?.toLowerCase()) ?? false;
};

export function shortenString(str: string, chars = 4): string {
  return `${str.substring(0, chars)}...${str.substring(str.length - chars)}`;
}

export function formatDecimalNumber(
  str: string,
  numNumbersAfterDecimal: number = 3,
): string {
  if (
    str.indexOf('.') === -1 ||
    str.indexOf('.') + numNumbersAfterDecimal > str.length
  ) {
    return str;
  }

  if (str.startsWith('0.')) {
    let index = 2;
    for (let i = index; i < str.length; ++i) {
      if (str[i] !== '0') {
        index = i;
        break;
      }
    }
    return str.slice(0, index + numNumbersAfterDecimal + 1);
  }
  return str.slice(0, str.indexOf('.') + numNumbersAfterDecimal + 1);
}

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
