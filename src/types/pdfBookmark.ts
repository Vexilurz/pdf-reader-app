export interface IBookmark {
  start: number;
  end: number;
  color: string;
}

// bookmark factory
export const createBookmark = (
  start: number,
  end: number,
  color: string
): IBookmark => {
  return { start, end, color };
};

export const TEST_BOOKMARKS: IBookmark[] = [
  createBookmark(5, 10, 'red'),
  createBookmark(100, 200, 'cyan'),
  createBookmark(300, 350, 'green'),
  // collisioned bookmarks
  createBookmark(614, 906, 'olive'),
  createBookmark(730, 1200, 'lime'),
  // second page
  createBookmark(5500, 6000, 'purple'),
];
