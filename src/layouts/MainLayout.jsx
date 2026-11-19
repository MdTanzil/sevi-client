import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const MainLayout = () => {
    return (
      // Flex column with min-height 100vh: the content grows to fill the
      // viewport, so the footer stays at the bottom on short pages and
      // sits below the content on long pages.
      <Box
        className="poppins"
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <NavBar></NavBar>
        <Box
          component="div"
          className="container mx-auto px-4 sm:px-6"
          sx={{ flex: 1 }}
        >
          <Outlet></Outlet>
        </Box>
        <Footer></Footer>
      </Box>
    );
};

export default MainLayout;