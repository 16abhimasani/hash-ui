export const isValidTagName = (s: string) => {
  return !s.includes(' ') && !s.includes('/') && !s.includes('\\');
};
