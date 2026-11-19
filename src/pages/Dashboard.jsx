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
  Pagination,
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
import CheckIcon from "@mui/icons-material/Check";
import useAxios from "../hooks/useAxios";
import useProfile from "../hooks/useProfile";
import toast from "react-hot-toast";
import SafeImage from "../components/SafeImage";
import DashboardLayout from "../components/DashboardLayout";
import CategoryFormDialog from "../components/CategoryFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import LendBookDialog from "../components/LendBookDialog";
import EditReturnDateDialog from "../components/EditReturnDateDialog";
import { filterBooks } from "../utils/searchBooks";
import { getDueStatus } from "../utils/borrowDates";

// Rows per page in the dashboard tables (books, categories, borrows).
const PAGE_SIZE = 10;

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
  // The book/category/borrow awaiting confirmation in a dialog.
  const [pendingDeleteBook, setPendingDeleteBook] = useState(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);
  const [pendingMarkReturned, setPendingMarkReturned] = useState(null);
  // Per-section pagination (each resets to 1 when its search changes).
  const [booksPage, setBooksPage] = useState(1);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [borrowsPage, setBorrowsPage] = useState(1);
  // Category add/edit dialog: { open, category } (category null = add).
  const [categoryDialog, setCategoryDialog] = useState({
    open: false,
    category: null,
  });
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [lendDialogOpen, setLendDialogOpen] = useState(false);
  // Edit-return-date dialog: { open, record }.
  const [editReturnDialog, setEditReturnDialog] = useState({
    open: false,
    record: null,
  });
  const [returningId, setReturningId] = useState(null);

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

  // Users, for borrower display names in the tracking summary and for
  // the lend dialog's user selector.
  const {
    data: adminUsers = [],
    isLoading: adminUsersLoading,
    isError: adminUsersError,
    refetch: refetchAdminUsers,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await axios.get("/admin/users");
      return res.data;
    },
    enabled: canManageBooks,
  });

  const displayBooks = useMemo(
    () => filterBooks(books, searchTerm),
    [books, searchTerm]
  );

  // Pagination applies AFTER the search/filter. The page clamps when the
  // list shrinks under it (e.g. a book is deleted on the last page).
  const paginate = (list, page) => {
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    return {
      totalPages,
      currentPage,
      pageItems: list.slice(start, start + PAGE_SIZE),
      rangeStart: list.length === 0 ? 0 : start + 1,
      rangeEnd: Math.min(start + PAGE_SIZE, list.length),
    };
  };
  const booksPaging = paginate(displayBooks, booksPage);
  const borrowsPaging = paginate(borrows, borrowsPage);

  // Categories, filtered by the search box, then paginated.
  const displayCategories = useMemo(() => {
    const term = categorySearch.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) =>
      c.name?.toLowerCase().includes(term)
    );
  }, [categories, categorySearch]);
  const categoriesPaging = paginate(displayCategories, categoriesPage);

  // Borrow tracking: group the active borrows by borrower — how many
  // books each user currently holds, and their earliest due date.
  const borrowerSummary = useMemo(() => {
    const byEmail = {};
    borrows.forEach((record) => {
      const email = record.email || "Unknown";
      if (!byEmail[email]) {
        byEmail[email] = {
          email,
          count: 0,
          earliestDue: record.retunDate || null,
        };
      }
      byEmail[email].count += 1;
      if (
        record.retunDate &&
        (!byEmail[email].earliestDue ||
          record.retunDate < byEmail[email].earliestDue)
      ) {
        byEmail[email].earliestDue = record.retunDate;
      }
    });
    return Object.values(byEmail).sort((a, b) => b.count - a.count);
  }, [borrows]);

  const userNameByEmail = useMemo(() => {
    const map = {};
    adminUsers.forEach((u) => {
      map[u.email] = u.name || null;
    });
    return map;
  }, [adminUsers]);

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
    setPendingDeleteBook(null);
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

  // Delete a category from the dashboard (librarian/admin only). The
  // server refuses with a 409 while any book uses the category, and that
  // message is shown in the error toast.
  const handleDeleteCategory = async (category) => {
    setPendingDeleteCategory(null);
    setDeletingCategoryId(category._id);
    try {
      await axios.delete(`/admin/categories/${category._id}`);
      toast.success(`"${category.name}" deleted`);
      refetchCategories();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not delete the category. Please try again."
      );
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // Mark a borrow returned on the borrower's behalf (book handed back at
  // the desk). The server restores the book quantity by 1.
  const handleMarkReturned = async (record) => {
    setPendingMarkReturned(null);
    setReturningId(record._id);
    try {
      await axios.post(`/admin/borrows/${record._id}/return`);
      toast.success(`"${record.bookName}" returned`);
      refetchBorrows();
      refetchBooks();
      refetchStats();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not return the book. Please try again."
      );
    } finally {
      setReturningId(null);
    }
  };

  const handleRetry = () => {
    refetchStats();
    refetchBooks();
    refetchBorrows();
    refetchCategories();
    refetchAdminUsers();
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

  if (
    statsLoading ||
    booksLoading ||
    borrowsLoading ||
    categoriesLoading ||
    adminUsersLoading
  ) {
    return (
      <div className="flex justify-center my-48">
        <CircularProgress size={48} />
      </div>
    );
  }

  if (
    statsError ||
    booksError ||
    borrowsError ||
    categoriesError ||
    adminUsersError
  ) {
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setBooksPage(1);
          }}
          placeholder="Search by title, author or category"
          sx={{ width: "100%", maxWidth: "28rem" }}
        />
        {searchTerm && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSearchTerm("");
              setBooksPage(1);
            }}
          >
            Clear
          </Button>
        )}
      </div>
      {books.length > 0 && (
        <p className="mt-3 poppins">
          Showing {booksPaging.rangeStart}–{booksPaging.rangeEnd} of{" "}
          {displayBooks.length} books
          {searchTerm.trim() !== "" && ` (${books.length} total)`}
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
                onClick={() => {
                  setSearchTerm("");
                  setBooksPage(1);
                }}
                sx={{ mt: 2 }}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile: stacked cards (a 5-column table does not fit). */}
              <div className="md:hidden space-y-3">
                {booksPaging.pageItems.map((book) => (
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
                        onClick={() => setPendingDeleteBook(book)}
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
                      {/* Sticky Actions column: on narrow screens the table
                          scrolls horizontally, but Edit/Delete stay pinned
                          on the right instead of sliding out of view. */}
                      <TableCell
                        sx={{
                          position: "sticky",
                          right: 0,
                          backgroundColor: "background.paper",
                          borderLeft: "1px solid",
                          borderColor: "divider",
                          zIndex: 1,
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody
                    sx={{
                      "& .MuiTableRow-root:nth-of-type(odd)": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {booksPaging.pageItems.map((book) => (
                      <TableRow key={book._id}>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {book.name}
                        </TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.category}</TableCell>
                        <TableCell>
                          <StockDisplay book={book} />
                        </TableCell>
                        <TableCell
                          sx={{
                            position: "sticky",
                            right: 0,
                            backgroundColor: "background.paper",
                            borderLeft: "1px solid",
                            borderColor: "divider",
                          }}
                        >
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
                              onClick={() => setPendingDeleteBook(book)}
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
      {booksPaging.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <Pagination
            count={booksPaging.totalPages}
            page={booksPaging.currentPage}
            onChange={(_event, page) => setBooksPage(page)}
            color="primary"
            aria-label="Books pages"
          />
        </Box>
      )}
        </>
      )}

      {/* Categories: searchable table with add, edit and delete. */}
      {section === "categories" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
            <h2 className="text-2xl font-bold playfair">Categories</h2>
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                setCategoryDialog({ open: true, category: null })
              }
            >
              Add Category
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <TextField
              type="text"
              size="small"
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value);
                setCategoriesPage(1);
              }}
              placeholder="Search categories by name"
              sx={{ width: "100%", maxWidth: "28rem" }}
            />
            {categorySearch && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setCategorySearch("");
                  setCategoriesPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
          {categories.length > 0 && (
            <p className="mt-3 poppins">
              Showing {categoriesPaging.rangeStart}–
              {categoriesPaging.rangeEnd} of {displayCategories.length}{" "}
              categories
              {categorySearch.trim() !== "" &&
                ` (${categories.length} total)`}
            </p>
          )}
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
              ) : displayCategories.length === 0 ? (
                <div className="text-center my-8">
                  <p className="text-xl font-bold">
                    No categories match your search
                  </p>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setCategorySearch("");
                      setCategoriesPage(1);
                    }}
                    sx={{ mt: 2 }}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile: stacked cards. */}
                  <div className="md:hidden space-y-3">
                    {categoriesPaging.pageItems.map((category) => (
                      <Box
                        key={category._id}
                        sx={{
                          borderRadius: 2,
                          border: 1,
                          borderColor: "divider",
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <SafeImage
                          src={category.image}
                          alt={`${category.name} category image`}
                          className="h-12 w-16 object-cover rounded shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm opacity-70">
                            {booksPerCategory[category.name] || 0} books
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() =>
                                setCategoryDialog({
                                  open: true,
                                  category,
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => setPendingDeleteCategory(category)}
                              disabled={
                                deletingCategoryId === category._id
                              }
                            >
                              {deletingCategoryId === category._id
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </Box>
                    ))}
                  </div>
                  {/* Desktop: the full table. */}
                  <TableContainer className="hidden md:block">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Image</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Books</TableCell>
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
                        {categoriesPaging.pageItems.map((category) => (
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
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<EditIcon />}
                                  onClick={() =>
                                    setCategoryDialog({
                                      open: true,
                                      category,
                                    })
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={() =>
                                    setPendingDeleteCategory(category)
                                  }
                                  disabled={
                                    deletingCategoryId === category._id
                                  }
                                >
                                  {deletingCategoryId === category._id
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
          {categoriesPaging.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <Pagination
                count={categoriesPaging.totalPages}
                page={categoriesPaging.currentPage}
                onChange={(_event, page) => setCategoriesPage(page)}
                color="primary"
                aria-label="Categories pages"
              />
            </Box>
          )}
        </>
      )}

      {/* Active borrows across all users, with per-user tracking. */}
      {section === "borrows" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
            <h2 className="text-2xl font-bold playfair">
              Active Borrows
              <span className="text-base font-normal opacity-70 ml-2">
                ({borrows.length})
              </span>
            </h2>
            <Button
              variant="contained"
              size="small"
              onClick={() => setLendDialogOpen(true)}
            >
              Lend a Book
            </Button>
          </div>
          {/* Tracking: who is holding books, how many, and the earliest
              due date per borrower. */}
          {borrowerSummary.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
              {borrowerSummary.map((borrower) => (
                <Card key={borrower.email} elevation={2}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {userNameByEmail[borrower.email] || borrower.email}
                    </Typography>
                    {/* Only show the email line when a real display name
                        exists — otherwise the email would print twice. */}
                    {userNameByEmail[borrower.email] &&
                      userNameByEmail[borrower.email] !== borrower.email && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          className="break-all"
                        >
                          {borrower.email}
                        </Typography>
                      )}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Holding {borrower.count}{" "}
                      {borrower.count === 1 ? "book" : "books"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Earliest due: {borrower.earliestDue || "—"}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {borrows.length > 0 && (
            <p className="mt-4 poppins">
              Showing {borrowsPaging.rangeStart}–{borrowsPaging.rangeEnd} of{" "}
              {borrows.length} active borrows
            </p>
          )}
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
              {/* Mobile: stacked cards (a 6-column table does not fit). */}
              <div className="md:hidden space-y-3">
                {borrowsPaging.pageItems.map((record) => {
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
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            setEditReturnDialog({ open: true, record })
                          }
                        >
                          Edit date
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={() => setPendingMarkReturned(record)}
                          disabled={returningId === record._id}
                        >
                          {returningId === record._id
                            ? "Returning..."
                            : "Mark returned"}
                        </Button>
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
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {borrowsPaging.pageItems.map((record) => {
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
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() =>
                                  setEditReturnDialog({
                                    open: true,
                                    record,
                                  })
                                }
                              >
                                Edit date
                              </Button>
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={<CheckIcon />}
                                onClick={() => setPendingMarkReturned(record)}
                                disabled={returningId === record._id}
                              >
                                {returningId === record._id
                                  ? "Returning..."
                                  : "Mark returned"}
                              </Button>
                            </div>
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
      {borrowsPaging.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <Pagination
            count={borrowsPaging.totalPages}
            page={borrowsPaging.currentPage}
            onChange={(_event, page) => setBorrowsPage(page)}
            color="primary"
            aria-label="Borrows pages"
          />
        </Box>
      )}
        </>
      )}

      {/* Dialogs shared by the sections above. */}
      <CategoryFormDialog
        open={categoryDialog.open}
        onClose={() => setCategoryDialog({ open: false, category: null })}
        category={categoryDialog.category}
        onSaved={() => {
          refetchCategories();
          refetchBooks();
          refetchStats();
        }}
      />
      <LendBookDialog
        open={lendDialogOpen}
        onClose={() => setLendDialogOpen(false)}
        users={adminUsers}
        books={books}
        onSaved={() => {
          refetchBorrows();
          refetchBooks();
          refetchStats();
        }}
      />
      <EditReturnDateDialog
        open={editReturnDialog.open}
        onClose={() => setEditReturnDialog({ open: false, record: null })}
        record={editReturnDialog.record}
        onSaved={() => {
          refetchBorrows();
          refetchStats();
        }}
      />
      <ConfirmDialog
        open={Boolean(pendingDeleteBook)}
        onClose={() => setPendingDeleteBook(null)}
        onConfirm={() => handleDeleteBook(pendingDeleteBook)}
        title={`Delete "${pendingDeleteBook?.name}"?`}
        message="This permanently removes the book from the library. Books that are currently borrowed cannot be deleted."
        confirmLabel="Delete"
        confirmColor="error"
      />
      <ConfirmDialog
        open={Boolean(pendingDeleteCategory)}
        onClose={() => setPendingDeleteCategory(null)}
        onConfirm={() => handleDeleteCategory(pendingDeleteCategory)}
        title={`Delete "${pendingDeleteCategory?.name}"?`}
        message={
          (booksPerCategory[pendingDeleteCategory?.name] || 0) > 0
            ? `This category has ${booksPerCategory[pendingDeleteCategory.name]} book(s) — it cannot be deleted until they move to another category.`
            : "This permanently removes the category."
        }
        confirmLabel="Delete"
        confirmColor="error"
      />
      <ConfirmDialog
        open={Boolean(pendingMarkReturned)}
        onClose={() => setPendingMarkReturned(null)}
        onConfirm={() => handleMarkReturned(pendingMarkReturned)}
        title={`Mark "${pendingMarkReturned?.bookName}" returned?`}
        message={`Borrowed by ${pendingMarkReturned?.email}. The book quantity will be restored by 1.`}
        confirmLabel="Mark returned"
        confirmColor="success"
      />
    </DashboardLayout>
  );
};

export default Dashboard;
