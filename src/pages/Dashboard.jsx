import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import useAxios from "../hooks/useAxios";
import useProfile from "../hooks/useProfile";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import SafeImage from "../components/SafeImage";
import { filterBooks } from "../utils/searchBooks";
import { getDueStatus } from "../utils/borrowDates";

// Status badge for an active borrow record: overdue (past the return
// date) is red, due today/tomorrow is amber, anything else is blue.
const DueBadge = ({ record }) => {
  const status = getDueStatus(record);
  if (status === "overdue") {
    return <span className="badge badge-error text-white">Overdue</span>;
  }
  if (status === "due-soon") {
    return <span className="badge badge-warning">Due soon</span>;
  }
  return <span className="badge badge-info">Borrowed</span>;
};

DueBadge.propTypes = {
  record: PropTypes.object,
};

// Inline stock editor for one book: a number input + Save button that
// updates the quantity through PUT /books/:id (librarian/admin only).
const StockCell = ({ book, onSaved }) => {
  const axios = useAxios();
  const currentQty = Number(book.quantity) || 0;
  const [value, setValue] = useState(String(currentQty));
  const [isSaving, setIsSaving] = useState(false);

  const parsed = Number(value);
  const isValid =
    value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0;
  const changed = isValid && parsed !== currentQty;

  const handleSave = async () => {
    if (!changed || isSaving) return;
    setIsSaving(true);
    try {
      await axios.put(`/books/${book._id}`, { quantity: parsed });
      toast.success(`Stock updated to ${parsed}`);
      setValue(String(parsed));
      onSaved();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not update the stock. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input input-bordered input-sm w-20"
        aria-label={`Stock for ${book.name}`}
      />
      <button
        className="btn btn-sm btn-primary"
        onClick={handleSave}
        disabled={!changed || isSaving}
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
      {currentQty === 0 && (
        <span className="badge badge-error text-white">Out of stock</span>
      )}
    </div>
  );
};

StockCell.propTypes = {
  book: PropTypes.object.isRequired,
  onSaved: PropTypes.func.isRequired,
};

// Category image editor: the current thumbnail, an image-URL input with
// a live preview, and a Save button (PATCH /admin/categories/:id).
// Category names are not editable — book records reference them.
const CategoryImageEditor = ({ category, onSaved }) => {
  const axios = useAxios();
  const [value, setValue] = useState(category.image || "");
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = value.trim();
  const isValid = trimmed.startsWith("https://");
  const changed = isValid && trimmed !== (category.image || "");
  // Live preview: the typed URL when it looks usable, else the current image.
  const previewSrc = isValid ? trimmed : category.image;

  const handleSave = async () => {
    if (!changed || isSaving) return;
    setIsSaving(true);
    try {
      await axios.patch(`/admin/categories/${category._id}`, {
        image: trimmed,
      });
      toast.success(`${category.name} image updated`);
      setValue(trimmed);
      onSaved();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not update the image. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        <p className="font-bold">{category.name}</p>
        <SafeImage
          src={previewSrc}
          alt={`${category.name} category image`}
          className="h-32 w-full object-contain bg-base-200 rounded-lg"
        />
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://..."
          className="input input-bordered input-sm w-full mt-3"
          aria-label={`Image URL for ${category.name}`}
        />
        <button
          className="btn btn-sm btn-primary mt-2"
          onClick={handleSave}
          disabled={!changed || isSaving}
        >
          {isSaving ? "Saving..." : "Save image"}
        </button>
      </div>
    </div>
  );
};

CategoryImageEditor.propTypes = {
  category: PropTypes.object.isRequired,
  onSaved: PropTypes.func.isRequired,
};

const Dashboard = () => {
  const axios = useAxios();
  const { canManageBooks, isAdmin, isLoading: profileLoading } = useProfile();
  const [searchTerm, setSearchTerm] = useState("");
  // The book currently being deleted (its Delete button is disabled).
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await axios.get("/admin/stats");
      return res.data;
    },
    enabled: canManageBooks,
  });

  // Same query key as the All Books page, so the book list is cached once.
  const {
    data: books = [],
    isLoading: booksLoading,
    isError: booksError,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ["allBooks"],
    queryFn: async () => {
      const res = await axios.get("/books");
      return res.data;
    },
    enabled: canManageBooks,
  });

  const {
    data: borrows = [],
    isLoading: borrowsLoading,
    isError: borrowsError,
    refetch: refetchBorrows,
  } = useQuery({
    queryKey: ["adminBorrows"],
    queryFn: async () => {
      const res = await axios.get("/admin/borrows");
      return res.data;
    },
    enabled: canManageBooks,
  });

  // Same query key as the Add Book page, so the list is cached once.
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("/categories");
      return res.data;
    },
    enabled: canManageBooks,
  });

  const displayBooks = useMemo(
    () => filterBooks(books, searchTerm),
    [books, searchTerm]
  );

  // A stock change also moves the totals, so refresh both.
  const handleStockSaved = () => {
    refetchBooks();
    refetchStats();
  };

  // Delete a book from the dashboard (librarian/admin only). Confirms
  // first — the delete is permanent. The server refuses the delete with
  // a 409 while the book has an active borrow, and that message is shown
  // in the error toast.
  const handleDeleteBook = async (book) => {
    const { isConfirmed } = await Swal.fire({
      title: `Delete "${book.name}"?`,
      text: "This permanently removes the book from the library. Books that are currently borrowed cannot be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!isConfirmed) return;
    setDeletingId(book._id);
    try {
      await axios.delete(`/books/${book._id}`);
      toast.success(`"${book.name}" deleted`);
      refetchBooks();
      refetchStats();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not delete the book. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleRetry = () => {
    refetchStats();
    refetchBooks();
    refetchBorrows();
    refetchCategories();
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  // UI-only gating — the server enforces who can use the dashboard.
  if (!canManageBooks) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Librarians and admins only</p>
        <p className="mt-2">
          Only librarians and admins can access the dashboard.
        </p>
        <Link to="/all-book" className="btn btn-sm btn-primary poppins mt-4">
          Browse books
        </Link>
      </div>
    );
  }

  if (statsLoading || booksLoading || borrowsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  if (statsError || booksError || borrowsError || categoriesError) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Could not load the dashboard</p>
        <button
          className="btn btn-sm btn-primary poppins mt-4"
          onClick={handleRetry}
        >
          Try again
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "Total books", value: stats?.totalBooks ?? 0 },
    { label: "Total copies", value: stats?.totalCopies ?? 0 },
    { label: "Active borrows", value: stats?.activeBorrows ?? 0 },
    {
      label: "Overdue",
      value: stats?.overdueBorrows ?? 0,
      valueClass: stats?.overdueBorrows > 0 ? "text-error" : "",
    },
    { label: "Total users", value: stats?.totalUsers ?? 0 },
    {
      label: "Out of stock",
      value: stats?.outOfStockBooks ?? 0,
      valueClass: stats?.outOfStockBooks > 0 ? "text-warning" : "",
    },
  ];

  return (
    <div className="mt-5">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <span className="text-secondary">Library</span> Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mt-6">
        {statCards.map((card) => (
          <div key={card.label} className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <p className="text-sm opacity-70">{card.label}</p>
              <p
                className={`text-3xl font-bold ${card.valueClass || ""}`}
              >
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin shortcut: user management lives on its own page. */}
      {isAdmin && (
        <div className="card bg-base-100 shadow mt-4">
          <div className="card-body p-4 flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold">User management</p>
              <p className="text-sm opacity-70">
                Manage users and their roles (member, librarian, admin).
              </p>
            </div>
            <Link
              to="/admin/users"
              className="btn btn-sm btn-primary poppins"
            >
              Manage Users
            </Link>
          </div>
        </div>
      )}

      {/* Books: searchable list with inline stock editing. */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-10">
        <h2 className="text-2xl font-bold playfair">Books</h2>
        <Link to="/add-book" className="btn btn-sm btn-primary poppins">
          Add Book
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, author or category"
          className="input input-bordered input-primary w-full max-w-md placeholder:text-primary"
        />
        {searchTerm && (
          <button
            className="btn btn-sm btn-outline btn-primary poppins"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </button>
        )}
      </div>
      {searchTerm.trim() !== "" && books.length > 0 && (
        <p className="mt-3 poppins">
          Showing {displayBooks.length} of {books.length} books
        </p>
      )}
      <div className="card bg-base-100 shadow-xl mt-4 mb-6">
        <div className="card-body p-4 sm:p-8">
          {books.length === 0 ? (
            <p className="text-center my-8 opacity-70">No books yet.</p>
          ) : displayBooks.length === 0 ? (
            <div className="text-center my-8">
              <p className="text-xl font-bold">No books match your search</p>
              <p className="mt-2 poppins">
                Try a different title, author or category.
              </p>
              <button
                className="btn btn-sm btn-primary poppins mt-4"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              {/* Mobile: stacked cards (a 5-column table does not fit). */}
              <div className="md:hidden space-y-3">
                {displayBooks.map((book) => (
                  <div
                    key={book._id}
                    className="rounded-lg border border-base-300 p-3"
                  >
                    <p className="font-medium">{book.name}</p>
                    <p className="text-sm opacity-70">
                      by {book.author} · {book.category}
                    </p>
                    <div className="mt-3">
                      <StockCell book={book} onSaved={handleStockSaved} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Link
                        to={`/books-update/${book._id}`}
                        className="btn btn-sm btn-outline btn-primary poppins"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline btn-error poppins"
                        onClick={() => handleDeleteBook(book)}
                        disabled={deletingId === book._id}
                      >
                        {deletingId === book._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: the full table. */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBooks.map((book) => (
                      <tr key={book._id}>
                        <td className="font-medium">{book.name}</td>
                        <td>{book.author}</td>
                        <td>{book.category}</td>
                        <td>
                          <StockCell
                            book={book}
                            onSaved={handleStockSaved}
                          />
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/books-update/${book._id}`}
                              className="btn btn-sm btn-outline btn-primary poppins"
                            >
                              Edit
                            </Link>
                            <button
                              className="btn btn-sm btn-outline btn-error poppins"
                              onClick={() => handleDeleteBook(book)}
                              disabled={deletingId === book._id}
                            >
                              {deletingId === book._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Categories: edit each category's card image. */}
      <h2 className="text-2xl font-bold playfair mt-10">Categories</h2>
      <p className="text-sm opacity-70 mt-1">
        Update a category&apos;s card image. Names cannot be changed — book
        records reference them.
      </p>
      {categories.length === 0 ? (
        <p className="text-center my-8 opacity-70">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 mb-6">
          {categories.map((category) => (
            <CategoryImageEditor
              key={category._id}
              category={category}
              onSaved={refetchCategories}
            />
          ))}
        </div>
      )}

      {/* Active borrows across all users. */}
      <h2 className="text-2xl font-bold playfair mt-10">
        Active Borrows
        <span className="text-base font-normal opacity-70 ml-2">
          ({borrows.length})
        </span>
      </h2>
      <div className="card bg-base-100 shadow-xl mt-4 mb-6">
        <div className="card-body p-4 sm:p-8">
          {borrows.length === 0 ? (
            <p className="text-center my-8 opacity-70">
              No books are currently borrowed.
            </p>
          ) : (
            <>
              {/* Mobile: stacked cards (a 5-column table does not fit). */}
              <div className="md:hidden space-y-3">
                {borrows.map((record) => {
                  const status = getDueStatus(record);
                  const border =
                    status === "overdue"
                      ? "border-error"
                      : status === "due-soon"
                      ? "border-warning"
                      : "border-base-300";
                  return (
                    <div
                      key={record._id}
                      className={`rounded-lg border border-l-4 ${border} p-3`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-medium">{record.bookName}</div>
                        <DueBadge record={record} />
                      </div>
                      <div className="text-sm opacity-70">
                        by {record.author}
                      </div>
                      <div className="text-sm mt-2 space-y-0.5">
                        <p className="break-all">
                          Borrower: {record.email || "—"}
                        </p>
                        <p>Borrowed: {record.borrowedDate || "—"}</p>
                        <p>Due: {record.retunDate || "—"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Desktop: the full table. Overdue rows are red,
                  due-soon rows are amber. */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Borrower</th>
                      <th>Borrowed</th>
                      <th>Due</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrows.map((record) => {
                      const status = getDueStatus(record);
                      const rowClass =
                        status === "overdue"
                          ? "bg-error/10"
                          : status === "due-soon"
                          ? "bg-warning/10"
                          : "";
                      return (
                        <tr key={record._id} className={rowClass}>
                          <td>
                            <div className="font-medium">
                              {record.bookName}
                            </div>
                            <div className="text-sm opacity-70">
                              by {record.author}
                            </div>
                          </td>
                          <td className="break-all">{record.email}</td>
                          <td>{record.borrowedDate || "—"}</td>
                          <td>{record.retunDate || "—"}</td>
                          <td>
                            <DueBadge record={record} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
