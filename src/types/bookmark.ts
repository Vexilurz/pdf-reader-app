export interface IBookmark {
  comment: string;
  start: number;
  end: number;
  color: string;
}

// bookmark factory
export const createBookmark = (
  comment: string,
  start: number,
  end: number,
  color: string
): IBookmark => {
  return { comment, start, end, color };
};

export const TEST_BOOKMARKS: IBookmark[] = [
  createBookmark('comment', 5, 10, 'red'),
  createBookmark('comment', 100, 200, 'cyan'),
  createBookmark('comment', 300, 350, 'green'),
  // collisioned bookmarks
  createBookmark('comment', 614, 906, 'olive'),
  createBookmark('comment', 730, 1200, 'lime'),
  // second page
  createBookmark('comment', 5500, 6000, 'purple'),
];
