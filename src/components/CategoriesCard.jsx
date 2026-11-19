import { PropTypes } from "prop-types";
import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";

const CategoriesCard = ({ categorie }) => {
  const { name, image } = categorie;

  return (
    <div className="card lg:card-side shadow-xl hover:shadow-2xl transition-shadow overflow-hidden">
      <figure className="h-48 w-full lg:h-auto lg:w-64 shrink-0">
        <SafeImage src={image} alt={name} className="h-full w-full object-cover" />
      </figure>
      <div className="card-body justify-center items-center">
        <h2 className="card-title">{name}</h2>

        <div>
          <Link to={`books-category/${name}`} className="btn btn-primary">
            Show Books
          </Link>
        </div>
      </div>
    </div>
  );
};
CategoriesCard.propTypes = {
  categorie: PropTypes.object,
};

export default CategoriesCard;
