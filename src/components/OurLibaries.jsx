import libraries from '../assets/libraries.png';

const OurLibaries = () => {
    return (
      <div className='mt-10'>
        
        <div className="hero max-h-screen  ">
          <div className="hero-content flex-col lg:flex-row">
            <img
              src={libraries}
              className="max-w-sm lg:max-w-xl rounded-lg shadow-lg flex-1 object-cover"
            />
            <div className="flax-1">
              <h1 className="text-4xl font-bold playfair mt-5">
                <span className="text-secondary">Our </span> libraries
              </h1>
              <p className="py-6">
                Your reading list is a good place to start, but you will be
                expected to read more widely too. Use Sevi to search for
                information on your topic, and to find books, journal articles
                and other materials in the Library.
              </p>
              <button className="btn btn-primary">Learn More</button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default OurLibaries;