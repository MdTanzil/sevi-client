// Filter a list of books by a search query and availability.
//
// The query is matched case-insensitively against the book name, author and
// category. An empty query matches every book. When availableOnly is true,
// only books with at least one copy in stock are kept.
export const filterBooks = (books, query, availableOnly = false) => {
  const list = Array.isArray(books) ? books : [];
  const term = (query || "").trim().toLowerCase();
  return list.filter((book) => {
    if (availableOnly && !(book.quantity > 0)) {
      return false;
    }
    if (!term) {
      return true;
    }
    const haystack = [book.name, book.author, book.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
};

export default filterBooks;
