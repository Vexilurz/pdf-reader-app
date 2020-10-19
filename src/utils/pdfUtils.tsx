import React from 'react';
import { IBookmark } from '../types/pdfBookmark';
import { splitTriple, splitDuo } from './splitUtils';

let newPatternWorkResult: boolean = false;
let count_init = 0;

// crunch:
let documentRef;

const getItemOffset = async (pageNumber: number, itemIndex = Infinity) => {
  const page = await documentRef.current.getPage(pageNumber); // shit. here we go again.......
  const textContent = await page.getTextContent();
  console.log('getItemOffset', itemIndex, textContent);

  return textContent.items
    .slice(0, itemIndex)
    .reduce((acc: number, item) => acc + item.str.length, 0);
};

// Calculates total length of all previous pages
const getPageOffset = async (pageNumber) => {
  const pageLengths = await Promise.all(
    Array.from({ length: pageNumber - 1 }, (_, index) =>
      getItemOffset(index + 1)
    )
  );

  return pageLengths.reduce((acc, pageLength) => acc + pageLength, 0);
};

const getItemIndex = (item) => {
  let index = 0;

  while ((item = item.previousSibling) !== null) {
    index += 1;
  }

  return index;
};

export const getTotalOffset = async (container, offset, ref) => {
  documentRef = ref;
  const textLayerItem = container.parentNode;
  const textLayer = textLayerItem.parentNode;
  const page = textLayer.parentNode;
  const pageNumber = parseInt(page.dataset.pageNumber, 10);
  const itemIndex = getItemIndex(textLayerItem);
  const [pageOffset, itemOffset] = await Promise.all([
    getPageOffset(pageNumber),
    getItemOffset(pageNumber, itemIndex),
  ]);

  // CRUNCH:
  // need to do this after next/prev buttons pressed for bookmarks work
  count_init = pageOffset;

  return pageOffset + itemOffset + offset;
};

const getMarkedText = (text: string, color: string, key: any) => {
  return (
    <mark key={key} style={{ backgroundColor: color }}>
      {text}
    </mark>
  );
};

const getUnmarkedText = (text: string, key: any) => {
  return <span key={key}>{text}</span>;
};

const newPattern = (text, bookmark: IBookmark, counter) => {
  // console.log(counter, bookmark.start, bookmark.end, text);
  // let result = getUnmarkedText(text, counter);
  let result = text;
  let dbg = 'unmarked:';
  newPatternWorkResult = false;
  if (counter >= bookmark.start && counter + text.length <= bookmark.end) {
    // mark all text
    dbg = 'mark all text:';
    result = getMarkedText(text, bookmark.color, counter);
    newPatternWorkResult = true;
  } else if (counter >= bookmark.start && counter < bookmark.end) {
    // mark left part
    dbg = 'mark left part:';
    result = splitDuo(bookmark.end - counter)(text);
    result[0] = getMarkedText(result[0], bookmark.color, counter);
    newPatternWorkResult = true;
  } else if (
    counter + text.length > bookmark.start &&
    counter + text.length <= bookmark.end
  ) {
    // mark right part
    dbg = 'mark right part:';
    result = splitDuo(bookmark.start - counter)(text);
    result[1] = getMarkedText(result[1], bookmark.color, counter);
    newPatternWorkResult = true;
  } else if (counter < bookmark.start && counter + text.length > bookmark.end) {
    // mark middle
    dbg = 'mark middle:';
    result = splitTriple(
      bookmark.start - counter,
      bookmark.end - counter
    )(text);
    result[1] = getMarkedText(result[1], bookmark.color, counter);
    newPatternWorkResult = true;
  }
  // console.log(dbg, result);
  return result;
};

export const pdfRenderer = (start, end, bookmarks: IBookmark[]) => {
  let counter = count_init;
  return (textItem) => {
    let pattern = '';
    if (textItem.str) {
      // just our new selection:
      pattern = newPattern(
        textItem.str,
        { start, end, color: 'black' },
        counter
      );
      // after executing newPattern() the newPatternWorkResult variable changed (or not) (yes, this is crunch)
      bookmarks.forEach((bookmark) => {
        if (!newPatternWorkResult)
          pattern = newPattern(textItem.str, bookmark, counter);
      });

      counter += textItem.str.length;
    }
    return pattern;
  };
};
