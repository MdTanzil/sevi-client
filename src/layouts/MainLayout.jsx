import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const MainLayout = () => {
    return (
      <div className="poppins">
        <NavBar></NavBar>
        <div className="container mx-auto">
          <Outlet></Outlet>
        </div>
        <Footer></Footer>
      </div>
    );
};

export default MainLayout;