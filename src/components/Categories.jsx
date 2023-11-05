import CategoriesCard from "./CategoriesCard";
import useAxios from './../hooks/useAxios';
import { useQuery } from "@tanstack/react-query";

const Categories = () => {
    const axios = useAxios();
    const getCategories = async()=>{
       const res = await axios.get('/categories')
       return res.data
    }
    const { data: categories, isLoading } = useQuery({
      queryKey: ["categories"],
      queryFn: getCategories,
    });
    if (isLoading){
        return <span className="loading loading-bars loading-lg"></span>
    }
    
    return (
      <div className="mt-10">
        <h1 className="text-4xl text-center font-bold playfair">
          <span className="text-secondary">Books</span> Categories
        </h1>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categories?.map((data) => (
            <CategoriesCard key={data._id} categorie={data}></CategoriesCard>
          ))}
        </div>
      </div>
    );
};

export default Categories;