/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import SafeImage from "../components/SafeImage";

const Error = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center">
      <div className="container flex flex-col md:flex-row items-center justify-between px-5 text-gray-700">
        <div className="w-full lg:w-1/2 mx-2 sm:mx-8">
          <div className="text-6xl sm:text-7xl text-primary font-extrabold mb-8">
            {" "}
            404
          </div>
          <p className="text-2xl md:text-3xl font-light leading-normal mb-8">
            Sorry we couldn't find the page you're looking for
          </p>
          <Link className="btn btn-primary" to={"/"}>
            back to homepage
          </Link>
        </div>
        <div className="w-full lg:flex lg:justify-end lg:w-1/2 mx-2 sm:mx-5 my-8 sm:my-12">
          <SafeImage
            src="https://user-images.githubusercontent.com/43953425/166269493-acd08ccb-4df3-4474-95c7-ad1034d3c070.svg"
            className="w-full max-w-md"
            alt="Page not found"
          />
        </div>
      </div>
    </div>
  );
};

export default Error;
