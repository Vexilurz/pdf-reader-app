export interface IBookmark {
  comment: string;
  file: string;
  start: number;
  end: number;
  color: string;
}

// bookmark factory
export const createBookmark = (
  comment: string,
  file: string,
  start: number,
  end: number,
  color: string
): IBookmark => {
  return { comment, file, start, end, color };
};

const TEST_FILE = 'D:/Work/documenthub_v2/public/example.pdf';
export const TEST_BOOKMARKS: IBookmark[] = [
  createBookmark('comment', TEST_FILE, 5, 10, 'red'),
  createBookmark('comment', TEST_FILE, 100, 200, 'cyan'),
  createBookmark('comment', TEST_FILE, 300, 350, 'green'),
  // collisioned bookmarks
  createBookmark('comment', TEST_FILE, 614, 906, 'olive'),
  createBookmark('comment', TEST_FILE, 730, 1200, 'lime'),
  // second page
  createBookmark('comment', TEST_FILE, 5500, 6000, 'purple'),
];
