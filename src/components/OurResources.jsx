import authors from "../assets/authors.png";
import librarian from "../assets/librarian.png";
import societies from "../assets/societies.png";
import researchers from "../assets/researchers.png";

const OurResources = () => {
    return (
      <div className="mx-2 my-8 sm:m-10">
        <h1 className="text-3xl sm:text-4xl text-center font-bold playfair mt-5">
          <span className="text-secondary">Our </span> resources
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 ">
          <div className="card bg-base-100 ">
            <figure className="px-10 pt-10">
              <img src={researchers} alt="Researchers" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="text-lg font-semibold">Researchers</h2>
              <p className="font-light">
                Search the catalogue, discover new arrivals, and keep track
                of your reading list.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 ">
            <figure className="px-10 pt-10">
              <img src={librarian} alt="Librarian" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="text-lg font-semibold">Librarian</h2>
              <p className="font-light">
                Manage the catalogue, track loans and returns, and support
                members.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 ">
            <figure className="px-10 pt-10">
              <img src={societies} alt="Societies" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="text-lg font-semibold">Societies</h2>
              <p className="font-light">
                Reading circles and book clubs — share recommendations with
                fellow members.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 ">
            <figure className="px-10 pt-10">
              <img src={authors} alt="Authors" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="text-lg font-semibold">Authors!</h2>
              <p className="font-light">
                Browse featured authors and their works in the Sevi catalogue.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
};

export default OurResources;