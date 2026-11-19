import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="footer p-6 sm:p-10 bg-base-200 text-base-content mt-10">
      <aside>
        <img src={logo} alt="Sevi logo" />
        <p className="font-bold text-lg">Sevi</p>
        <p>
          Your community library — browse, borrow,
          <br />
          and keep track of your reading.
        </p>
      </aside>
      <nav>
        <header className="footer-title">Library</header>
        <Link className="link link-hover" to="/all-book">
          All Books
        </Link>
        <Link className="link link-hover" to="/">
          Categories
        </Link>
        <Link className="link link-hover" to="/borrowed-book">
          Borrowed Books
        </Link>
        <Link className="link link-hover" to="/profile">
          My Profile
        </Link>
      </nav>
      <nav>
        <header className="footer-title">Sevi</header>
        <Link className="link link-hover" to="/about">
          About us
        </Link>
        <Link className="link link-hover" to="/contact">
          Contact
        </Link>
        <Link className="link link-hover" to="/faq">
          FAQ
        </Link>
      </nav>
      <nav>
        <header className="footer-title">Legal</header>
        <Link className="link link-hover" to="/terms">
          Terms of use
        </Link>
        <Link className="link link-hover" to="/privacy">
          Privacy policy
        </Link>
        <Link className="link link-hover" to="/cookies">
          Cookie policy
        </Link>
      </nav>
    </footer>
  );
};
export default Footer;
