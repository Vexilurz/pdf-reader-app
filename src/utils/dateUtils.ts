const trialDays = 14;
const licenseYears = 1;

export const getNewExpiringDate = (): string => {
  const dueDate = new Date();
  dueDate.setFullYear(dueDate.getFullYear() + licenseYears);
  return dueDate.toISOString();
};

export const getNewTrialDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + trialDays);
  return date.toISOString();
};
