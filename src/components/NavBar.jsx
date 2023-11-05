/* eslint-disable no-unused-vars */
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const NavBar = () => {
  const { user, logout, setUser } = useAuth();
  const navList = (
    <>
      <li>
        <NavLink
          to={"/"}
          className={({ isActive, isPending }) =>
            isPending ? "pending" : isActive ? "bg-[#723182] text-white" : ""
          }
        >
          Home
        </NavLink>
      </li>

      <li>
        <NavLink
          to={"/add-book"}
          className={({ isActive, isPending }) =>
            isPending ? "pending" : isActive ? "bg-[#723182] text-white" : ""
          }
        >
          Add Book
        </NavLink>
      </li>
      <li>
        <NavLink
          to={"/all-book"}
          className={({ isActive, isPending }) =>
            isPending ? "pending" : isActive ? "bg-[#723182] text-white" : ""
          }
        >
          All Book
        </NavLink>
      </li>
      <li>
        <NavLink
          to={"/borrowed-book"}
          className={({ isActive, isPending }) =>
            isPending ? "pending" : isActive ? "bg-[#723182] text-white" : ""
          }
        >
          Borrowed Book
        </NavLink>
      </li>
    </>
  );

  const handleLogOut = () => {
    logout()
      .then(() => {
        // Sign-out successful.
        toast.success("Log-out successful");
        setUser(null);
      })
      .catch((error) => {
        toast.success("Log-out unsuccessful");
      });
  };
  return (
    <div className="navbar ">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
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
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {navList}
          </ul>
        </div>
        <a className="btn btn-ghost normal-case text-xl">
          <img src={logo} alt="" /> <span className="text-primary">Sevi</span>{" "}
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{navList}</ul>
      </div>
      <div className="navbar-end ">
        <div>
          {user?.displayName && (
            <>
              <p className="text-primary text-sm mr-2">
                {" "}
                Hello ! {user?.displayName}
              </p>
            </>
          )}
        </div>
        {user && (
          <>
            {user?.photoURL ? (
              <div className="dropdown dropdown-bottom">
                <label tabIndex={0} className="">
                  <div className="avatar online placeholder ">
                    <div className="rounded-full w-10">
                      <img className=" " src={user.photoURL} alt="img" />
                    </div>
                  </div>
                </label>

                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu -left-16 shadow rounded-box "
                >
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
            ) : user?.displayName ? (
              <div className="dropdown dropdown-bottom">
                <label tabIndex={0} className="m-1">
                  <div className="avatar online placeholder">
                    <div className="w-10 rounded-full">
                      <span className="text-lg">{user?.displayName[0]}</span>
                    </div>
                  </div>
                </label>

                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu -left-8 shadow rounded-box "
                >
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
            ) : (
              <div className="dropdown dropdown-bottom">
                <label tabIndex={0} className="m-1">
                  <div className="avatar online ml-3">
                    <div className="w-10 rounded-full">
                      <span>{user?.email[0]}</span>
                    </div>
                  </div>
                </label>

                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu -left-8 shadow rounded-box "
                >
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
          </>
        )}
        {!user && (
          <Link
            to={"/login"}
            className="btn bg-white border-primary border-1 hover:btn-primary"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavBar;
