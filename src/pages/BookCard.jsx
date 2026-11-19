import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { PropTypes } from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import useProfile from "../hooks/useProfile";

const BookCard = ({ book }) => {
  const { _id, name, author, quantity, imageUrl, category, rating } = book;
  const { canManageBooks } = useProfile();
  const navigate = useNavigate();
  const outOfStock = (quantity ?? 0) < 1;

  const openDetails = () => navigate(`/books-details/${_id}`);

  // Keyboard support for the clickable card. Ignore key presses that
  // come from the Update button inside the card (it handles Enter itself).
  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetails();
    }
  };

  return (
    <article
      onClick={openDetails}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details of ${name}`}
      className="group card bg-base-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden rounded-xl"
    >
      <figure className="relative h-64 sm:h-72 overflow-hidden">
        <SafeImage
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="badge badge-secondary absolute top-3 left-3 shadow">
          {category}
        </span>
        <span
          className={`badge absolute top-3 right-3 shadow ${
            outOfStock ? "badge-error text-white" : "badge-success"
          }`}
        >
          {outOfStock ? "Out of stock" : `${quantity} left`}
        </span>
      </figure>
      <div className="card-body p-4">
        <h2
          className="card-title text-lg leading-snug line-clamp-2 min-h-[3.5rem]"
          title={name}
        >
          {name}
        </h2>
        <p className="text-sm opacity-70 truncate" title={author}>
          by {author}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Rating
            style={{ maxWidth: 100 }}
            value={(rating || 0) / 2}
            readOnly
          />
          <span className="text-sm font-medium">
            {rating ? `${rating}/10` : "No rating"}
          </span>
        </div>
        {canManageBooks && (
          <div className="card-actions justify-end mt-2">
            <Link
              to={`/books-update/${_id}`}
              onClick={(e) => e.stopPropagation()}
              className="btn btn-sm btn-outline btn-primary"
            >
              Update
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};
BookCard.propTypes = {
  book: PropTypes.object,
};

export default BookCard;
