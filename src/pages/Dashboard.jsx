import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useAxios from "../hooks/useAxios";
import useProfile from "../hooks/useProfile";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import SafeImage from "../components/SafeImage";
import DashboardLayout from "../components/DashboardLayout";
import { filterBooks } from "../utils/searchBooks";
import { getDueStatus } from "../utils/borrowDates";

// Status badge for an active borrow record: overdue (past the return
// date) is red, due today/tomorrow is amber, anything else is blue.
const DueBadge = ({ record }) => {
  const status = getDueStatus(record);
  if (status === "overdue") {
    return <Chip label="Overdue" color="error" size="small" />;
  }
  if (status === "due-soon") {
    return <Chip label="Due soon" color="warning" size="small" />;
  }
  return <Chip label="Borrowed" color="info" size="small" />;
};

DueBadge.propTypes = {
  record: PropTypes.object,
};

// Read-only stock display for one book: the quantity plus an
// "Out of stock" chip at zero. Stock is changed from the Edit link
// (Update Book page), not inline.
const StockDisplay = ({ book }) => {
  const qty = Number(book.quantity) || 0;
  return (
    <div className="flex items-center gap-2">
      <span>{qty}</span>
      {qty === 0 && <Chip label="Out of stock" color="error" size="small" />}
    </div>
  );
};

StockDisplay.propTypes = {
  book: PropTypes.object.isRequired,
};

const VALID_SECTIONS = ["overview", "books", "borrows", "categories"];

const Dashboard = () => {
  const axios = useAxios();
  const { canManageBooks, isLoading: profileLoading } = useProfile();
  const [searchTerm, setSearchTerm] = useState("");
  // The book currently being deleted (its Delete button is disabled).
  const [deletingId, setDeletingId] = useState(null);

  // Visible dashboard section, from the ?section= query param so the URL
  // stays shareable and refresh-safe (unknown values fall back to
  // overview). Kept in state so switching sections does not remount the
  // page or refetch the data; the param update keeps the URL in sync.
  const [searchParams, setSearchParams] = useSearchParams();
  const paramSection = searchParams.get("section");
  const [section, setSection] = useState(
    VALID_SECTIONS.includes(paramSection) ? paramSection : "overview"
  );
  useEffect(() => {
    setSection(
      VALID_SECTIONS.includes(paramSection) ? paramSection : "overview"
    );
  }, [paramSection]);
  const changeSection = (next) => {
    setSection(next);
    setSearchParams({ section: next });
  };

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

  // Books per category, for the Categories table (counted client-side
  // from the already-fetched book list).
  const booksPerCategory = useMemo(() => {
    const counts = {};
    books.forEach((book) => {
      if (!book.category) return;
      counts[book.category] = (counts[book.category] || 0) + 1;
    });
    return counts;
  }, [books]);

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
        <CircularProgress size={48} />
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
        <Button
          component={Link}
          to="/all-book"
          variant="contained"
          size="small"
          sx={{ mt: 2 }}
        >
          Browse books
        </Button>
      </div>
    );
  }

  if (statsLoading || booksLoading || borrowsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center my-48">
        <CircularProgress size={48} />
      </div>
    );
  }

  if (statsError || booksError || borrowsError || categoriesError) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Could not load the dashboard</p>
        <Button
          variant="contained"
          size="small"
          onClick={handleRetry}
          sx={{ mt: 2 }}
        >
          Try again
        </Button>
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
      valueColor: stats?.overdueBorrows > 0 ? "error.main" : undefined,
    },
    { label: "Total users", value: stats?.totalUsers ?? 0 },
    {
      label: "Out of stock",
      value: stats?.outOfStockBooks ?? 0,
      valueColor: stats?.outOfStockBooks > 0 ? "warning.main" : undefined,
    },
  ];

  return (
    <DashboardLayout active={section} onSectionChange={changeSection}>
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <Box component="span" sx={{ color: "secondary.main" }}>
          Library
        </Box>{" "}
        Dashboard
      </h1>

      {/* Overview: the stat cards. */}
      {section === "overview" && (
        <>
          <h2 className="text-2xl font-bold playfair mt-6">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mt-4">
            {statCards.map((card) => (
              <Card key={card.label}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="p"
                    sx={{
                      fontSize: "1.875rem",
                      fontWeight: 700,
                      color: card.valueColor || "text.primary",
                    }}
                  >
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Books: searchable list. Stock is read-only here — use Edit
          to change it. */}
      {section === "books" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
            <h2 className="text-2xl font-bold playfair">Books</h2>
        <Button
          component={Link}
          to="/add-book"
          variant="contained"
          size="small"
        >
          Add Book
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <TextField
          type="text"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, author or category"
          sx={{ width: "100%", maxWidth: "28rem" }}
        />
        {searchTerm && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </Button>
        )}
      </div>
      {searchTerm.trim() !== "" && books.length > 0 && (
        <p className="mt-3 poppins">
          Showing {displayBooks.length} of {books.length} books
        </p>
      )}
      <Card elevation={4} className="mt-4 mb-6">
        <CardContent
          sx={{
            p: { xs: 2, sm: 4 },
            "&:last-child": { pb: { xs: 2, sm: 4 } },
          }}
        >
          {books.length === 0 ? (
            <p className="text-center my-8 opacity-70">No books yet.</p>
          ) : displayBooks.length === 0 ? (
            <div className="text-center my-8">
              <p className="text-xl font-bold">No books match your search</p>
              <p className="mt-2 poppins">
                Try a different title, author or category.
              </p>
              <Button
                variant="contained"
                size="small"
                onClick={() => setSearchTerm("")}
                sx={{ mt: 2 }}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile: stacked cards (a 5-column table does not fit). */}
              <div className="md:hidden space-y-3">
                {displayBooks.map((book) => (
                  <Box
                    key={book._id}
                    sx={{
                      borderRadius: 2,
                      border: 1,
                      borderColor: "divider",
                      p: 1.5,
                    }}
                  >
                    <p className="font-medium">{book.name}</p>
                    <p className="text-sm opacity-70">
                      by {book.author} · {book.category}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm opacity-70">Stock:</span>
                      <StockDisplay book={book} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        component={Link}
                        to={`/books-update/${book._id}`}
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteBook(book)}
                        disabled={deletingId === book._id}
                      >
                        {deletingId === book._id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </Box>
                ))}
              </div>
              {/* Desktop: the full table. */}
              <TableContainer className="hidden md:block">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody
                    sx={{
                      "& .MuiTableRow-root:nth-of-type(odd)": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {displayBooks.map((book) => (
                      <TableRow key={book._id}>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {book.name}
                        </TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.category}</TableCell>
                        <TableCell>
                          <StockDisplay book={book} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              component={Link}
                              to={`/books-update/${book._id}`}
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteBook(book)}
                              disabled={deletingId === book._id}
                            >
                              {deletingId === book._id
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
        </>
      )}

      {/* Categories: thumbnail, name, and book count in a table. */}
      {section === "categories" && (
        <>
          <h2 className="text-2xl font-bold playfair mt-6">Categories</h2>
          <Card elevation={4} className="mt-4 mb-6">
            <CardContent
              sx={{
                p: { xs: 2, sm: 4 },
                "&:last-child": { pb: { xs: 2, sm: 4 } },
              }}
            >
              {categories.length === 0 ? (
                <p className="text-center my-8 opacity-70">
                  No categories yet.
                </p>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Books</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody
                      sx={{
                        "& .MuiTableRow-root:nth-of-type(odd)": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      {categories.map((category) => (
                        <TableRow key={category._id}>
                          <TableCell>
                            <SafeImage
                              src={category.image}
                              alt={`${category.name} category image`}
                              className="h-12 w-16 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {category.name}
                          </TableCell>
                          <TableCell>
                            {booksPerCategory[category.name] || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Active borrows across all users. */}
      {section === "borrows" && (
        <>
          <h2 className="text-2xl font-bold playfair mt-6">
        Active Borrows
        <span className="text-base font-normal opacity-70 ml-2">
          ({borrows.length})
        </span>
      </h2>
      <Card elevation={4} className="mt-4 mb-6">
        <CardContent
          sx={{
            p: { xs: 2, sm: 4 },
            "&:last-child": { pb: { xs: 2, sm: 4 } },
          }}
        >
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
                  const borderColor =
                    status === "overdue"
                      ? "error.main"
                      : status === "due-soon"
                      ? "warning.main"
                      : "divider";
                  return (
                    <Box
                      key={record._id}
                      sx={{
                        borderRadius: 2,
                        border: 1,
                        borderLeft: 4,
                        borderColor,
                        p: 1.5,
                      }}
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
                    </Box>
                  );
                })}
              </div>
              {/* Desktop: the full table. Overdue rows are red,
                  due-soon rows are amber. */}
              <TableContainer className="hidden md:block">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Book</TableCell>
                      <TableCell>Borrower</TableCell>
                      <TableCell>Borrowed</TableCell>
                      <TableCell>Due</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {borrows.map((record) => {
                      const status = getDueStatus(record);
                      // Theme-aware row tint: a soft red/amber wash that
                      // reads in both light and dark mode.
                      const rowBg =
                        status === "overdue"
                          ? (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(244, 67, 54, 0.25)"
                                : "rgba(244, 67, 54, 0.06)"
                          : status === "due-soon"
                          ? (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255, 152, 0, 0.25)"
                                : "rgba(255, 152, 0, 0.08)"
                          : undefined;
                      return (
                        <TableRow
                          key={record._id}
                          sx={{ backgroundColor: rowBg }}
                        >
                          <TableCell>
                            <div className="font-medium">
                              {record.bookName}
                            </div>
                            <div className="text-sm opacity-70">
                              by {record.author}
                            </div>
                          </TableCell>
                          <TableCell className="break-all">
                            {record.email}
                          </TableCell>
                          <TableCell>{record.borrowedDate || "—"}</TableCell>
                          <TableCell>{record.retunDate || "—"}</TableCell>
                          <TableCell>
                            <DueBadge record={record} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
