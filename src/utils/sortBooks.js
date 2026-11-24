// Sort options for the All Books page. Sorting is client-side: it runs
// after the search/filter, before pagination, and never mutates the
// cached query data (sortBooks always copies first).
export const SORT_OPTIONS = [
  { value: "default", label: "Default order" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
  { value: "author-asc", label: "Author A–Z" },
  { value: "newest", label: "Newest first" },
  { value: "rating-desc", label: "Highest rated" },
  { value: "author-desc", label: "Author Z–A" },
  { value: "available", label: "Available first" },
];

const titleOf = (book) => book?.name || "";
const authorOf = (book) => book?.author || "";
const ratingOf = (book) => Number(book?.rating) || 0;
const quantityOf = (book) => Number(book?.quantity) || 0;

// Case-insensitive title comparison, used as the tie-breaker for every
// sort so the order is deterministic when the main keys are equal.
const byTitle = (a, b) =>
  titleOf(a).localeCompare(titleOf(b), undefined, { sensitivity: "base" });

const COMPARATORS = {
  "title-asc": (a, b) => byTitle(a, b),
  "title-desc": (a, b) => byTitle(b, a),
  "author-asc": (a, b) =>
    authorOf(a).localeCompare(authorOf(b), undefined, {
      sensitivity: "base",
    }) || byTitle(a, b),
  "author-desc": (a, b) =>
    authorOf(b).localeCompare(authorOf(a), undefined, {
      sensitivity: "base",
    }) || byTitle(a, b),
  // MongoDB ObjectIds embed a creation timestamp, so comparing them as
  // strings orders books by when they were added (newest first).
  newest: (a, b) => String(b._id).localeCompare(String(a._id)),
  "rating-desc": (a, b) => ratingOf(b) - ratingOf(a) || byTitle(a, b),
  available: (a, b) =>
    (quantityOf(b) > 0) - (quantityOf(a) > 0) || byTitle(a, b),
};

// Returns a NEW array sorted by `sortBy`. "default" (or an unknown
// value) keeps the server order.
export const sortBooks = (books, sortBy) => {
  if (!Array.isArray(books)) return [];
  const compare = COMPARATORS[sortBy];
  if (!compare) return [...books];
  return [...books].sort(compare);
};
