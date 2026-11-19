import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="mt-5 max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <span className="text-secondary">About</span> Sevi
      </h1>
      <p className="text-center mt-4 opacity-80 max-w-2xl mx-auto">
        Sevi is a library management system for readers, librarians, and
        small community libraries — browse the catalogue, borrow books, and
        keep track of your reading in one place.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Browse the catalogue</h2>
            <p>
              Explore books by category or search by title, author, or
              category — with live availability on every book.
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Borrow in seconds</h2>
            <p>
              Pick a book, choose a return date within 5 days, and it is
              yours. Members can borrow up to 3 books at a time.
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl sm:col-span-2 lg:col-span-1">
          <div className="card-body">
            <h2 className="card-title">Your membership card</h2>
            <p>
              Every member gets a virtual library card with their borrow
              history — what you borrowed, when it is due, and when you
              returned it.
            </p>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title">How borrowing works</h2>
          <ul className="steps steps-vertical sm:steps-horizontal w-full mt-4">
            <li className="step step-primary">Find a book</li>
            <li className="step step-primary">Borrow it (up to 5 days)</li>
            <li className="step step-primary">Read it</li>
            <li className="step step-primary">Return it on time</li>
          </ul>
          <p className="mt-4">
            Books are due within 5 days of borrowing. Your profile page
            shows a warning when a book is due soon, and highlights overdue
            books in red so nothing slips past you.
          </p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-6 mb-6">
        <div className="card-body">
          <h2 className="card-title">Who runs the library?</h2>
          <p>
            Sevi has three roles. <strong>Members</strong> browse, borrow,
            and return books. <strong>Librarians</strong> also add and update
            books in the catalogue. <strong>Admins</strong> manage members
            and their roles. New members start as members — an admin can
            promote you to librarian from the Users page.
          </p>
          <div className="card-actions mt-4">
            <Link to="/all-book" className="btn btn-primary">
              Browse books
            </Link>
            <Link to="/register" className="btn btn-outline btn-primary">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
