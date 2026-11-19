import { Link } from "react-router-dom";
import libraries from '../assets/libraries.png';

const OurLibaries = () => {
    return (
      <div className='mt-10'>

        <div className="hero max-h-screen  ">
          <div className="hero-content flex-col lg:flex-row px-4">
            <img
              src={libraries}
              alt="Sevi libraries"
              className="w-full max-w-[300px] sm:max-w-sm lg:max-w-xl rounded-lg shadow-lg flex-1 object-cover"
            />
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold playfair mt-5">
                <span className="text-secondary">Our </span> libraries
              </h1>
              <p className="py-6">
                Your reading list is a good place to start, but you will be
                expected to read more widely too. Use Sevi to search for
                information on your topic, and to find books, journal articles
                and other materials in the Library.
              </p>
              <Link to="/about" className="btn btn-primary">Learn More</Link>
            </div>
          </div>
        </div>
      </div>
    );
};

export default OurLibaries;