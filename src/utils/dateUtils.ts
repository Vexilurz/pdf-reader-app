export const getNewExpiringDate = (): string => {
  const dueDate = new Date();
  dueDate.setFullYear(dueDate.getFullYear() + 1);
  return dueDate.toISOString();
};