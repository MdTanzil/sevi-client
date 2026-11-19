import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
import toast from "react-hot-toast";
import SafeImage from "./SafeImage";

const NavBar = () => {
  const { user, logout, setUser, loading } = useAuth();
  const { canManageBooks, isAdmin } = useProfile();

  // Single source of truth for the nav links — rendered in the desktop
  // menu, in the avatar dropdown on mobile, and in the logged-out mobile
  // hamburger menu.
  const links = [
    { to: "/", label: "Home", show: true },
    { to: "/add-book", label: "Add Book", show: canManageBooks },
    { to: "/all-book", label: "All Book", show: true },
    { to: "/borrowed-book", label: "Borrowed Book", show: true },
    { to: "/admin/users", label: "Users", show: isAdmin },
    { to: "/about", label: "About", show: true },
    { to: "/faq", label: "FAQ", show: true },
  ].filter((link) => link.show);

  const navLinkClass = ({ isActive, isPending }) =>
    isPending ? "pending" : isActive ? "bg-[#723182] text-white" : "";

  // The same links as menu items; `itemClassName` lets the mobile-only
  // copies hide themselves on desktop.
  const navItems = (itemClassName) =>
    links.map((link) => (
      <li key={link.to} className={itemClassName}>
        <NavLink to={link.to} className={navLinkClass}>
          {link.label}
        </NavLink>
      </li>
    ));

  const handleLogOut = () => {
    logout()
      .then(() => {
        // Sign-out successful.
        toast.success("Log-out successful");
        setUser(null);
      })
      .catch(() => {
        toast.error("Log-out unsuccessful");
      });
  };

  // Avatar image: photo when the account has one, otherwise the first
  // letter of the display name (or email).
  const avatarImage = user?.photoURL ? (
    <SafeImage
      className="w-10 h-10 rounded-full object-cover"
      src={user.photoURL}
      alt={user.displayName || user.email}
      iconClassName="w-5 h-5 opacity-60"
    />
  ) : (
    <span className="text-lg">
      {(user?.displayName || user?.email || "?")[0]}
    </span>
  );

  return (
    <div className="navbar">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          <img src={logo} alt="Sevi logo" />{" "}
          <span className="text-primary">Sevi</span>{" "}
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{navItems()}</ul>
      </div>
      <div className="navbar-end">
        {user?.displayName && (
          <p className="text-primary text-sm mr-2 hidden sm:block">
            Hello ! {user.displayName}
          </p>
        )}
        {user && (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="cursor-pointer">
              <div className="avatar online placeholder">
                <div className="rounded-full w-10">{avatarImage}</div>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-3"
            >
              {/* Mobile only: on small screens the nav links live in this
                  dropdown — there is no separate hamburger menu. */}
              {navItems("lg:hidden")}
              <li className="lg:hidden" aria-hidden="true">
                <hr className="my-1 border-base-300" />
              </li>
              <li>
                <Link to="/profile">My Profile</Link>
              </li>
              <li>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleLogOut}
                >
                  LogOut
                </button>
              </li>
            </ul>
          </div>
        )}
        {/* While Firebase is still resolving the auth state, show a neutral
            placeholder instead of the Login button — otherwise signed-in
            users briefly see a Login flash on every page load. */}
        {loading ? (
          <div
            className="w-10 h-10 rounded-full bg-base-300 animate-pulse"
            aria-hidden="true"
          />
        ) : (
          !user && (
            <>
              {/* Mobile: a single hamburger on the right, with the nav
                  links and Login inside its dropdown. */}
              <div className="dropdown dropdown-end lg:hidden">
                <label
                  tabIndex={0}
                  className="btn btn-ghost btn-circle"
                  aria-label="Open menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-3"
                >
                  {navItems()}
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                </ul>
              </div>
              {/* Desktop: a plain Login button (the menu is already
                  visible in the center). */}
              <Link
                to={"/login"}
                className="btn btn-outline btn-primary hidden lg:inline-flex"
              >
                Login
              </Link>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default NavBar;
