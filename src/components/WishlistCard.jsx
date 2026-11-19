import { useState } from "react";
import { PropTypes } from "prop-types";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Link } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import toast from "react-hot-toast";
import SafeImage from "./SafeImage";

const WishlistCard = ({ entry, refetch }) => {
  const axios = useAxios();
  const [isRemoving, setIsRemoving] = useState(false);

  const { book, bookId } = entry;
  const { _id, name, author, quantity, imageUrl, category, rating } = book;
  // Quantities can arrive as strings (the book form sends them that
  // way), so compare numerically.
  const outOfStock = Number(quantity ?? 0) < 1;

  const handleRemove = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await axios.delete(`/wishlist/${bookId}`);
      toast.success("Removed from your wishlist");
      refetch();
    } catch (error) {
      toast.error("Could not remove the book. Please try again.");
      setIsRemoving(false);
    }
  };

  return (
    <div className="p-1 shadow-lg hover:shadow-xl transition-shadow bg-base-100 m-1 rounded-xl border-2 border-transparent">
      <figure className="flex justify-center relative">
        <SafeImage
          src={imageUrl}
          alt={name}
          className="h-56 w-full object-cover rounded-t-lg"
        />
        <span
          className={`badge absolute top-3 right-3 shadow ${
            outOfStock ? "badge-error text-white" : "badge-success"
          }`}
        >
          {outOfStock ? "Out of stock" : `${quantity} left`}
        </span>
      </figure>
      <div className="px-2 pb-2">
        <h2
          className="text-lg font-medium text-center mt-2 text-primary truncate"
          title={name}
        >
          {name}
        </h2>
        <p className="text-center playfair font-medium">by {author}</p>
        <Rating
          style={{ maxWidth: 120 }}
          value={(rating || 0) / 2}
          readOnly
          className="mx-auto"
        />
        <p className="text-center font-medium ">
          <span className=""> Categories : {category}</span>{" "}
        </p>

        <div className="flex justify-center gap-2 ">
          <Link
            to={`/books-details/${_id}`}
            className="btn btn-sm btn-secondary text-black font-normal normal-case m-1"
          >
            View Details
          </Link>
          <button
            className="btn btn-sm btn-outline btn-error font-normal normal-case m-1"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

WishlistCard.propTypes = {
  entry: PropTypes.object,
  refetch: PropTypes.func,
};

export default WishlistCard;
