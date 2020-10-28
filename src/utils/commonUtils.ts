export const deletePathFromFilename = (path: string): string => {
  return path.replace(/^.*[\\\/]/, '');
}