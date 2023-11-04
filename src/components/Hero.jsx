/* eslint-disable react/no-unescaped-entities */
import hero from '../assets/hero.png';

const Hero = () => {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img src={hero} className="max-w-xl rounded-lg shadow-2xl" />
          <div>
            <h1 className="text-5xl font-bold playfair">
              Today's research, <br /> tomorrow's innovation
            </h1>
            <p className="py-6">
              Accelerating research discovery to shape a better future
            </p>
            <input
              type="text"
              placeholder="Search books, articles, keywords"
              className="input input-bordered w-3/4 input-primary"
            />
            <button className="btn btn-square text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
};

export default Hero;