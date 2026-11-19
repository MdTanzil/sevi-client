import CategoriesCard from "./CategoriesCard";
import useAxios from './../hooks/useAxios';
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

const Categories = () => {
    const axios = useAxios();
    const getCategories = async()=>{
       const res = await axios.get('/categories')
       return res.data
    }
    const { data: categories, isLoading, isError, refetch } = useQuery({
      queryKey: ["categories"],
      queryFn: getCategories,
    });

    const heading = (
      <Typography
        component="h1"
        className="playfair"
        sx={{
          fontSize: { xs: "1.875rem", sm: "2.25rem" },
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        <Box component="span" sx={{ color: "secondary.main" }}>
          Books
        </Box>{" "}
        Categories
      </Typography>
    );

    if (isLoading){
        return (
          <Box sx={{ display: "flex", justifyContent: "center", my: 12 }}>
            <CircularProgress size={56} />
          </Box>
        );
    }

    if (isError) {
      return (
        <Box sx={{ mt: 5, textAlign: "center" }}>
          {heading}
          <Typography sx={{ mt: 2 }}>Could not load the categories.</Typography>
          <Button
            variant="contained"
            size="small"
            className="poppins"
            sx={{ mt: 2 }}
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 5 }}>
        {heading}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {categories?.map((data) => (
            <CategoriesCard key={data._id} categorie={data}></CategoriesCard>
          ))}
        </div>
      </Box>
    );
};

export default Categories;
