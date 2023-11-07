import authors from "../assets/authors.png";
import librarian from "../assets/librarian.png";
import societies from "../assets/societies.png";
import researchers from "../assets/researchers.png";

const OurResources = () => {
    return (
      <div className="m-10">
        <h1 className="text-4xl text-center font-bold playfair mt-5">
          <span className="text-secondary">Our </span> resources
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 mt-5 ">
          <div className="card bg-base-100 ">
            <figure className="px-10 pt-10">
              <img src={researchers} alt="Shoes" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="text-lg font-semibold">Researchers</h2>
              <p className="font-light">
                Register online Discover tools and manage alerts Learn about how
                to access?
              </p>
            </div>
          </div>
          <div className="card bg-base-100 ">
            <figure className="px-10 pt-10">
              <img src={librarian} alt="Shoes" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="text-lg font-semibold">Librarian</h2>
              <p className="font-light">
                Manage your account View products and solutions Find resources
                and support
              </p>
            </div>
          </div>
          <div className="card bg-base-100 ">
            <figure className="px-10 pt-10">
              <img src={societies} alt="Shoes" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="text-lg font-semibold">Societies</h2>
              <p className="font-light">
                Publish with Wiley Explore our resource library Learn about
                topics and trends
              </p>
            </div>
          </div>
          <div className="card bg-base-100 ">
            <figure className="px-10 pt-10">
              <img src={authors} alt="Shoes" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="text-lg font-semibold">Authors!</h2>
              <p className="font-light">Submit a paper Track your article Learn about Open Access</p>
            </div>
          </div>
        </div>
      </div>
    );
};

export default OurResources;