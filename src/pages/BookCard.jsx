import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { PropTypes } from "prop-types";
import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  const {
    _id,
    name,
    author,
    quantity,
    imageUrl,
    category,
    rating,
    
  } = book;
  return (
    <div className="p-1 shadow-lg bg-base-100 m-1 rounded-lg   ">
      <figure className="mx-auto w-3/4  flex justify-center ">
        <img src={imageUrl} className=" h-56 object-cover" alt="Shoes" />
      </figure>
      <div className="">
        <h2 className="text-lg font-medium text-center mt-2 text-primary">
          {name.slice(0, 25)}
        </h2>
        <p className="text-center playfair  font-medium">by {author}</p>

        <p className="text-center font-medium ">
          <span className=""> {category}</span>{" "}
        </p>
        <p className="text-center text-sm font-medium ">
          Available :  <span className="font-bold">{quantity}</span>{" "}
        </p>

        <Rating
          style={{ maxWidth: 120 }}
          value={rating / 2}
          readOnly
          className="mx-auto"
        />
        <div className="flex justify-center gap-2 ">
          <Link to={`/books-details/${_id}`}>
            <button className="p-2 m-1 bg-secondary rounded-md text-sm">
              Details
            </button>
          </Link>
          <Link to={`/books-update/${_id}`}>
            <button className="p-2 m-1 bg-secondary rounded-md text-sm">
              Update
            </button>
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
