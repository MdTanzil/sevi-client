import Box from "@mui/material/Box";
import Categories from "../components/Categories";
import Hero from "../components/Hero";
import OurLibaries from "../components/OurLibaries";
import OurResources from "../components/OurResources";




const Home = () => {

    return (
        <Box sx={{ mt: 5 }}>
            <Hero></Hero>
            <Categories></Categories>
            <OurResources></OurResources>
            <OurLibaries></OurLibaries>
        </Box>
    );
};

export default Home;
