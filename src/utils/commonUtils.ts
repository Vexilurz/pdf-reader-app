export const deletePathFromFilename = (path: string): string => {
  return path.replace(/^.*[\\\/]/, '');
};

export const getPathWithoutFilename = (path: string) => {
  path.replaceAll('\\', '/');
  return path.substring(0, path.lastIndexOf('\\'));
};

export const getFileExt = (path: string) => {
  return path.split('.').pop();
};
