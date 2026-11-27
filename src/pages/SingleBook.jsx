import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { useNavigate, useParams } from "react-router-dom";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import SafeImage from "../components/SafeImage";
import BookCard from "./BookCard";
import BookReviews from "../components/BookReviews";
import BookReservations from "../components/BookReservations";
import BorrowDialog from "../components/BorrowDialog";

const MAX_ACTIVE_BORROWS = 3;
const SingleBook = () => {
  /**
   * TODO:  Single product detail page
   *
   * */
  const axios = useAxios();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate()
  const queryClient = useQueryClient();
  const [isWishlistBusy, setIsWishlistBusy] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const books = async () => {
    const res = await axios.get(`/single-book/${id}`);
    return res.data;
  };
  const {
    data: book,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    // Keyed on the book id: without it, navigating from one book to
    // another briefly showed the previous book's details until the
    // refetch landed.
    queryKey: ["book", id],
    queryFn: books,
  });

  // The caller's active borrows — the Borrow button is disabled at the
  // 3-book limit (the server enforces the limit too).
  const { data: myBorrows = [] } = useQuery({
    queryKey: ["borrowbooks"],
    queryFn: async () => {
      const res = await axios.get("/borrows");
      return res.data;
    },
  });
  const atBorrowLimit = myBorrows.length >= MAX_ACTIVE_BORROWS;

  // The caller's wishlist (same cache as the Wishlist page) — the
  // heart button below toggles this book on and off it.
  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await axios.get("/wishlist");
      return res.data;
    },
  });
  const isWishlisted = wishlist.some(
    (entry) => String(entry.bookId) === String(id)
  );

  // Other books from the same category, for the "Similar books" section
  // below. Same endpoint the category pages use; keyed on the category
  // so it refetches when navigating to a book in another category.
  const { data: categoryBooks = [] } = useQuery({
    queryKey: ["similar-books", book?.category],
    queryFn: async () => {
      const res = await axios.get(`/books/${book.category}`);
      return res.data;
    },
    enabled: !!book?.category,
  });
  const similarBooks = categoryBooks
    .filter((entry) => String(entry._id) !== String(id))
    .slice(0, 4);

  const handleWishlistToggle = async () => {
    if (isWishlistBusy) return;
    setIsWishlistBusy(true);
    try {
      if (isWishlisted) {
        await axios.delete(`/wishlist/${id}`);
        toast.success("Removed from your wishlist");
      } else {
        await axios.post("/wishlist", { bookId: id });
        toast.success("Added to your wishlist");
      }
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not update your wishlist. Please try again."
      );
    } finally {
      setIsWishlistBusy(false);
    }
  };
  if (isLoading) {
    return (
      <Box className="flex justify-center my-48">
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (isError || !book) {
    return (
      <Box className="my-48 text-center">
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Could not load this book
        </Typography>
        <Button
          variant="contained"
          size="small"
          sx={{ mt: 2 }}
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </Box>
    );
  }
  const {
    _id,
    name,
    author,
    quantity,
    imageUrl,
    category,
    rating,
    shortDescription,
    isbn,
    publisher,
    publishedYear,
    language,
    pages,
    earliestReturnDate,
  } = book;
  const getRating = (rating) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Nothing special";
      case 3:
        return "Average";
      case 4:
        return "Very good";
      case 5:
        return "Excellent";
      default:
        return "None";
    }
  };
  const handleBorrow = async () => {
    // if borrowBook already exists

    const alreadyBorrowInfo = await axios.get("/borrows");
    const findInfo = alreadyBorrowInfo.data.find((d) => d.bookId == _id);
    if (findInfo) {
      toast.error("You already borrowed this book");
      return;
    }

    // jodi boita borrow kora nah thake — pick a return date first.
    setBorrowDialogOpen(true);
  };

  const handleBorrowConfirm = async (retunDate) => {
    setBorrowDialogOpen(false);
    const borrowBook = {
      name: user.displayName || "none",
      bookName: name || "",
      bookImage: imageUrl || "",
      bookCategorie: category || "",
      email: user.email || "none",
      bookId: _id,
      retunDate: retunDate,
      borrowedDate: new Date().toISOString().split("T")[0],
      author: author || "none",
      rating: rating || 0,
    };

    // Only decrease the quantity after the borrow actually succeeded —
    // a failed borrow (e.g. the 3-book limit) must not touch the stock.
    try {
      await axios.post("/borrow", borrowBook);
      await axios.patch(`/books-quantity-decrease/${_id}`);
      toast.success(
        `Borrowed successfully — please return before ${retunDate}`
      );
      refetch();
      // Borrowing cancels the borrower's reservation on the server, so
      // the queue section must refresh too — otherwise it still shows
      // the (now gone) reservation until the next page load.
      queryClient.invalidateQueries({
        queryKey: ["book-reservations", _id],
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not borrow the book. Please try again."
      );
    }
  };

  // adding read  button functionality

  const handleReadButton = () => {
    const url = `/reading/${_id}`
    navigate(url)

    //
  }
  return (
    <Box className="px-2">
      <Typography
        component="h1"
        className="playfair"
        sx={{
          fontSize: { xs: "1.875rem", sm: "2.25rem" },
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        <Box component="span" sx={{ color: "secondary.main" }}>
          Book
        </Box>{" "}
        Details
      </Typography>
      <Box sx={{ mt: 2.5 }}>
        <Box className="flex flex-col w-full lg:flex-row items-center">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <SafeImage
              src={imageUrl}
              className="rounded-lg h-[300px] w-[200px] sm:h-[350px] sm:w-[230px] object-cover"
              alt={name}
            />
            <Typography sx={{ mt: 1 }}>{category}</Typography>
            <Box className="flex flex-wrap justify-center gap-2 w-full">
              <Button
                onClick={handleBorrow}
                disabled={quantity < 1 || atBorrowLimit}
                variant="contained"
                color="secondary"
                size="small"
                sx={{ color: "#000", textTransform: "none", fontWeight: 400 }}
              >
                Borrow
              </Button>
              <Button
                onClick={handleReadButton}
                variant="contained"
                color="secondary"
                size="small"
                sx={{ color: "#000", textTransform: "none", fontWeight: 400 }}
              >
                Read
              </Button>
              <Button
                onClick={handleWishlistToggle}
                disabled={isWishlistBusy}
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={
                  isWishlisted ? (
                    <FaHeart style={{ color: "#fdc800" }} />
                  ) : (
                    <FaRegHeart />
                  )
                }
                sx={{ textTransform: "none", fontWeight: 400 }}
              >
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
            </Box>
            {quantity < 1 && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, textAlign: "center", px: 1 }}
              >
                Out of stock — Borrow is unavailable right now. Reserve
                it below to join the queue, or add it to your wishlist
                and we will notify you when it is back.
              </Typography>
            )}
            {quantity < 1 && earliestReturnDate && (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, textAlign: "center", px: 1 }}
              >
                Expected back on {earliestReturnDate} — the earliest
                borrowed copy returns then.
              </Typography>
            )}
            {atBorrowLimit && (
              <Typography variant="caption" color="warning" sx={{ mt: 0.5 }}>
                Borrow limit reached ({MAX_ACTIVE_BORROWS}/{MAX_ACTIVE_BORROWS})
                — return a book to borrow another.
              </Typography>
            )}
          </Box>
          <Divider
            sx={{ display: { xs: "block", lg: "none" }, width: "100%", my: 2 }}
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", lg: "block" }, mx: 2 }}
          />
          <Box
            sx={{
              flex: 1,
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 0.5,
              width: "100%",
            }}
          >
            <Box sx={{ p: 1 }}>
              <Typography
                component="h2"
                variant="h5"
                className="playfair"
                sx={{ fontWeight: 600, textAlign: "center" }}
              >
                {name}
              </Typography>
              <Typography
                component="h4"
                sx={{ fontSize: "1.125rem", fontWeight: 500 }}
              >
                Author:{" "}
                <Box
                  component="span"
                  className="playfair"
                  sx={{ color: "primary.main" }}
                >
                  {author}
                </Box>{" "}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                {" "}
                <Box
                  component="span"
                  sx={{ fontSize: "1.125rem", fontWeight: 500 }}
                >
                  Available Copies :
                </Box>{" "}
                {quantity}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <Box
                  component="span"
                  sx={{ fontSize: "1.125rem", fontWeight: 500 }}
                >
                  Category :{" "}
                </Box>
                {category}
              </Typography>
              {isbn && (
                <Typography sx={{ mt: 1 }}>
                  <Box
                    component="span"
                    sx={{ fontSize: "1.125rem", fontWeight: 500 }}
                  >
                    ISBN :{" "}
                  </Box>
                  {isbn}
                </Typography>
              )}
              {publisher && (
                <Typography sx={{ mt: 1 }}>
                  <Box
                    component="span"
                    sx={{ fontSize: "1.125rem", fontWeight: 500 }}
                  >
                    Publisher :{" "}
                  </Box>
                  {publisher}
                </Typography>
              )}
              {publishedYear && (
                <Typography sx={{ mt: 1 }}>
                  <Box
                    component="span"
                    sx={{ fontSize: "1.125rem", fontWeight: 500 }}
                  >
                    Published Year :{" "}
                  </Box>
                  {publishedYear}
                </Typography>
              )}
              {language && (
                <Typography sx={{ mt: 1 }}>
                  <Box
                    component="span"
                    sx={{ fontSize: "1.125rem", fontWeight: 500 }}
                  >
                    Language :{" "}
                  </Box>
                  {language}
                </Typography>
              )}
              {pages && (
                <Typography sx={{ mt: 1 }}>
                  <Box
                    component="span"
                    sx={{ fontSize: "1.125rem", fontWeight: 500 }}
                  >
                    Pages :{" "}
                  </Box>
                  {pages}
                </Typography>
              )}
              <Box sx={{ my: 0.5 }}>
                <Rating
                  style={{ maxWidth: 120 }}
                  value={(rating || 0) / 2}
                  readOnly
                  className="ml-0 lg:ml-2"
                />
                <Typography sx={{ mt: 0.5 }}>{`Review : ${getRating(
                  Math.round(rating / 2)
                )}`}</Typography>
              </Box>
              <Typography
                component="h4"
                sx={{ fontSize: "1.125rem", fontWeight: 500 }}
              >
                Short Description :
              </Typography>
              <Typography sx={{ mt: 1.5 }}> {shortDescription}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <BookReviews bookId={id} />
      <BookReservations bookId={id} quantity={quantity} />
      {similarBooks.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography
            component="h2"
            variant="h5"
            className="playfair"
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Similar books
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {similarBooks.map((similar) => (
              <BookCard book={similar} key={similar._id} />
            ))}
          </div>
        </Box>
      )}
      <BorrowDialog
        open={borrowDialogOpen}
        onClose={() => setBorrowDialogOpen(false)}
        bookName={name}
        onConfirm={handleBorrowConfirm}
      />
    </Box>
  );
};

export default SingleBook;
