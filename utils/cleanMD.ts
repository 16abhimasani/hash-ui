export const cleanMD = (md: string) => {
  const replacedLinkWithAnchor = md.replace(
    /\[([^\]]+)\]\(([^\)]+)\)/g,
    '<a target="_blank" rel="noopener noreferrer nofollow" href="$2">$1</a>',
  );
  return replacedLinkWithAnchor;
};
