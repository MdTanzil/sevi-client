/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import hero from "../assets/hero.png";

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/all-book?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/all-book");
    }
  };

  return (
    <div className="hero min-h-[85vh] lg:min-h-screen">
      <div className="hero-content flex-col gap-0 lg:gap-10 lg:flex-row-reverse px-4">
        <img
          src={hero}
          alt="Library research illustration"
          className="max-w-[260px] sm:max-w-xs lg:max-w-lg rounded-lg shadow-sm lg:shadow-2xl object-cover"
        />
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold playfair">
            Today's research, <br /> tomorrow's innovation
          </h1>
          <p className="py-4 sm:py-6">
            Accelerating research discovery to shape a better future
          </p>
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 w-full max-w-lg mx-auto lg:mx-0"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books, articles, keywords "
              className="input input-bordered flex-1 min-w-0 input-primary placeholder:text-primary"
            />
            <button type="submit" className="btn btn-square text-primary ml-1">
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;
