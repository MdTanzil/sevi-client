
import { PropTypes } from 'prop-types';
import { Link } from 'react-router-dom';

const CategoriesCard = ({ categorie}) => {
  const {name,image} = categorie
  
  return (
    <div className="card lg:card-side shadow-xl">
      <figure className="max-h-48 max-w-xs mx-auto">
        <img className=" object-cover" src={image} alt="Album" />
      </figure>
      <div className="card-body justify-center items-center">
        <h2 className="card-title">{name}</h2>

        <div>
          <Link to={`books-category/${name}`}>
            <button className="btn btn-primary">Show Books</button>
          </Link>
        </div>
        {/* <div className="card-actions justify-end">
        </div> */}
      </div>
    </div>
  );
};
CategoriesCard.propTypes = {
  categorie: PropTypes.object,
};

export default CategoriesCard;