export const getNewExpiringDate = (): string => {
  const dueDate = new Date();
  dueDate.setFullYear(dueDate.getFullYear() + 1);
  return dueDate.toISOString();
};

export const getNewTrialDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString();
};
