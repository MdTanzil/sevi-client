import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { PropTypes } from "prop-types";
import { Link } from "react-router-dom";
import SafeImage from "../components/SafeImage";

const BookCard = ({ book }) => {
  const { _id, name, author, quantity, imageUrl, category, rating } = book;
  return (
    <div className="p-1 shadow-lg bg-base-100 m-1 rounded-lg">
      <figure className="flex justify-center">
        <SafeImage
          src={imageUrl}
          alt={name}
          className="h-56 w-full object-cover rounded-t-lg"
        />
      </figure>
      <div className="px-2 pb-2">
        <h2
          className="text-lg font-medium text-center mt-2 text-primary truncate"
          title={name}
        >
          {name}
        </h2>
        <p className="text-center playfair font-medium">by {author}</p>

        <p className="text-center font-medium">
          <span className=""> {category}</span>{" "}
        </p>
        <p className="text-center text-sm font-medium ">
          Available : <span className="font-bold">{quantity}</span>{" "}
        </p>

        <Rating
          style={{ maxWidth: 120 }}
          value={(rating || 0) / 2}
          readOnly
          className="mx-auto"
        />
        <div className="flex justify-center gap-2 ">
          <Link
            to={`/books-details/${_id}`}
            className="btn btn-sm btn-secondary text-black font-normal normal-case m-1"
          >
            Details
          </Link>
          <Link
            to={`/books-update/${_id}`}
            className="btn btn-sm btn-secondary text-black font-normal normal-case m-1"
          >
            Update
          </Link>
        </div>
      </div>
    </div>
  );
};
BookCard.propTypes = {
  book: PropTypes.object,
};

export default BookCard;
