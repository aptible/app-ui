export const dateDescSort = (
  a: { createdAt: string },
  b: { createdAt: string },
) => {
  const dateA = new Date(a.createdAt).getTime();
  const dateB = new Date(b.createdAt).getTime();
  return dateB - dateA;
};
