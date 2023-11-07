import Categories from "../components/Categories";
import Hero from "../components/Hero";
import OurLibaries from "../components/OurLibaries";
import OurResources from "../components/OurResources";




const Home = () => {
    
    return (
        <div className="mt-10">
            <Hero></Hero>
            <Categories></Categories>
            <OurResources></OurResources>
            <OurLibaries></OurLibaries>
        </div>
    );
};

export default Home;