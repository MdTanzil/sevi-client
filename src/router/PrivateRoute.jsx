import { PropTypes } from "prop-types";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (user) {
    return children;
  }
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 12 }}>
        <CircularProgress size={56} />
      </Box>
    );
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
