import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import {  useNavigate, useParams } from "react-router-dom";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import SafeImage from "../components/SafeImage";
import {
  MAX_BORROW_DAYS,
  maxReturnDate,
  minReturnDate,
  validateReturnDate,
} from "../utils/borrowDates";

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
    queryKey: ["book"],
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
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Could not load this book</p>
        <button
          className="btn btn-sm btn-primary poppins mt-4"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
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
    //  console.log(alreadyBorrowInfo.data);
    const findInfo = alreadyBorrowInfo.data.find((d) => d.bookId == _id);
    // console.log(findInfo);
    if (findInfo) {
      Swal.fire("You  Already borrowed this book");
      return;
    }

    // jodi boita  borrow kora nah thake
    let retunDate = null;
    const { value: date } = await Swal.fire({
      title: "Select return date",
      text: `Books can be borrowed for up to ${MAX_BORROW_DAYS} days.`,
      input: "date",
      // The picker itself only offers today .. today + 5 days, and the
      // validator guards against a manually typed out-of-range date.
      inputValidator: (value) => {
        const check = validateReturnDate(value);
        return check.valid ? undefined : check.message;
      },
      didOpen: () => {
        const input = Swal.getInput();
        input.min = minReturnDate();
        input.max = maxReturnDate();
      },
    });
    if (date) {
      retunDate = date;
    }

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
    if (retunDate) {
      try {
        await axios.post("/borrow", borrowBook);
        await axios.patch(`/books-quantity-decrease/${_id}`);
        Swal.fire(`Please Return before ${retunDate}`, "successfully borrow");
        refetch();
      } catch (error) {
        toast.error(
          error?.response?.data?.error ||
            "Could not borrow the book. Please try again."
        );
      }
    }
  };

  // adding read  button functionality

  const handleReadButton = () => {
    const url = `/reading/${_id}`
    navigate(url)

    //
  }
  return (
    <div className="px-2">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <span className="text-secondary">Book</span> Details
      </h1>
      <div className="mt-5">
        <div className="flex flex-col w-full lg:flex-row items-center">
          <div className="grid  card  rounded-box place-items-center">
            <SafeImage
              src={imageUrl}
              className="rounded-lg h-[300px] w-[200px] sm:h-[350px] sm:w-[230px] object-cover"
              alt={name}
            />
            <p> {category}</p>
            <div className="flex flex-wrap justify-center gap-2 w-full">
              <button
                onClick={handleBorrow}
                disabled={quantity < 1 || atBorrowLimit}
                className=" btn btn-sm btn-secondary text-black font-normal normal-case"
              >
                Borrow
              </button>
              <button onClick={handleReadButton} className="btn btn-sm btn-secondary text-black font-normal normal-case">
                Read
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={isWishlistBusy}
                className="btn btn-sm btn-outline btn-secondary font-normal normal-case"
              >
                {isWishlisted ? (
                  <FaHeart className="text-secondary" />
                ) : (
                  <FaRegHeart />
                )}
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
            {quantity < 1 && (
              <p className="text-xs text-error mt-1 text-center px-2">
                Out of stock — Borrow is unavailable right now. Add it to
                your wishlist and we will notify you when it is back.
              </p>
            )}
            {atBorrowLimit && (
              <p className="text-xs text-warning mt-1">
                Borrow limit reached ({MAX_ACTIVE_BORROWS}/{MAX_ACTIVE_BORROWS})
                — return a book to borrow another.
              </p>
            )}
          </div>
          <div className="divider lg:divider-horizontal"></div>
          <div className="grid flex-1   bg-base-100 rounded-box p-1">
            <div className="p-2">
              <h2 className=" text-2xl font-semibold text-center playfair">
                {name}
              </h2>
              <h4 className="text-lg font-medium ">
                Author: <span className="text-primary playfair">{author}</span>{" "}
              </h4>
              <p className="mt-2">
                {" "}
                <span className="text-lg font-medium">
                  Available Copies :
                </span>{" "}
                {quantity}
              </p>
              <p className="mt-2">
                <span className="text-lg font-medium">Category : </span>
                {category}
              </p>
              {isbn && (
                <p className="mt-2">
                  <span className="text-lg font-medium">ISBN : </span>
                  {isbn}
                </p>
              )}
              {publisher && (
                <p className="mt-2">
                  <span className="text-lg font-medium">Publisher : </span>
                  {publisher}
                </p>
              )}
              {publishedYear && (
                <p className="mt-2">
                  <span className="text-lg font-medium">
                    Published Year :{" "}
                  </span>
                  {publishedYear}
                </p>
              )}
              {language && (
                <p className="mt-2">
                  <span className="text-lg font-medium">Language : </span>
                  {language}
                </p>
              )}
              {pages && (
                <p className="mt-2">
                  <span className="text-lg font-medium">Pages : </span>
                  {pages}
                </p>
              )}
              <div className="my-1">
                <Rating
                  style={{ maxWidth: 120 }}
                  value={(rating || 0) / 2}
                  readOnly
                  className="ml-0 lg:ml-2"
                />
                <div className="mt-1">{`Review : ${getRating(
                  Math.round(rating / 2)
                )}`}</div>
              </div>
              <h4 className="text-lg font-medium">Short Description :</h4>
              <p className="mt-3"> {shortDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBook;
