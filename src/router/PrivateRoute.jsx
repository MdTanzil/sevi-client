import { PropTypes } from "prop-types";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (user) {
    return children;
  }
  if (loading) {
     return <span className="loading loading-bars loading-lg"></span>
  }
  return (
    <div>
      <Navigate to={"/login"} state={location.pathname}></Navigate>
    </div>
  );
};
PrivateRoute.propTypes = {
  children: PropTypes.node,
};

export default PrivateRoute;
