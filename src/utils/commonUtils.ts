export const deletePathFromFilename = (path: string): string => {
  return path.replace(/^.*[\\\/]/, '');
};

export const getPathWithoutFilename = (path: string) => {
  // path.replace('\\', '/');
  return path.substring(0, path.lastIndexOf('\\'));
};
