import { useState } from "react";
import { PropTypes } from "prop-types";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import useAxios from "../hooks/useAxios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import SafeImage from "./SafeImage";

const BorrowCard = ({ data, refetch }) => {
  const axios = useAxios();
  const [isReturning, setIsReturning] = useState(false);

  const {
    _id,
    bookName,
    bookImage,
    bookCategorie,
    bookId,
    retunDate,
    borrowedDate,
    author,
    rating,
  } = data;

  const handleReturn = () => {
    if (isReturning) return;
    setIsReturning(true);
    axios
      .delete(`borrows/${_id}`)
      .then(() => {
        Swal.fire("Successfully return");
        refetch();
      })
      .catch(() => {
        toast.error("Could not return the book. Please try again.");
        setIsReturning(false);
      });
    axios.patch(`/books-quantity-increase/${bookId}`).catch(() => {});
  };
  return (
    <div className="p-1 shadow-lg bg-base-100 m-1 rounded-lg">
      <figure className="flex justify-center">
        <SafeImage
          src={bookImage}
          alt={bookName}
          className="h-56 w-full object-cover rounded-t-lg"
        />
      </figure>
      <div className="px-2 pb-2">
        <h2
          className="text-lg font-medium text-center mt-2 text-primary truncate"
          title={bookName}
        >
          {bookName}
        </h2>
        <p className="text-center playfair font-medium">by {author}</p>
        <Rating
          style={{ maxWidth: 120 }}
          value={(rating || 0) / 2}
          readOnly
          className="mx-auto"
        />
        <p className="text-center font-medium ">
          <span className=""> Categories : {bookCategorie}</span>{" "}
        </p>

        <p className="text-center font-medium ">
          <span className=""> Borrow Date : {borrowedDate}</span>{" "}
        </p>
        <p className="text-center font-medium ">
          <span className=""> Return Date : {retunDate}</span>{" "}
        </p>

        <div className="flex justify-center gap-2 ">
          <button
            className="btn btn-sm btn-secondary text-black font-normal normal-case m-1"
            onClick={handleReturn}
            disabled={isReturning}
          >
            {isReturning ? "Returning..." : "Return"}
          </button>
        </div>
      </div>
    </div>
  );
};

BorrowCard.propTypes = {
  data: PropTypes.object,
  refetch: PropTypes.func,
};

export default BorrowCard;
