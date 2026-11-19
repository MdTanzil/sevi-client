import { useParams } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import BookCard from "./BookCard";

const BooksAllCategory = () => {
  const { category } = useParams();
  const axios = useAxios();
  const getBooksByCategory = async () => {
    const res = await axios.get(`/books/${category}`);
    return res.data;
  };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["category-book"],
    queryFn: getBooksByCategory,
  });
  if (isLoading) {
    return (
      <Box className="flex justify-center my-48">
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="my-48 text-center">
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Could not load the books
        </Typography>
        <Button
          variant="contained"
          size="small"
          sx={{ mt: 2 }}
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </Box>
    );
  }
  return (
    <div>
      <Typography
        component="h1"
        className="playfair"
        sx={{
          fontSize: { xs: "1.875rem", sm: "2.25rem" },
          fontWeight: 700,
          textAlign: "center",
          mt: 2.5,
        }}
      >
        <Box component="span" sx={{ color: "secondary.main" }}>
          {category}
        </Box>{" "}
        Books
      </Typography>
      {data.length <= 0 && (
        <Box className="my-48 text-center">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Do not have any Books{" "}
          </Typography>
        </Box>
      )}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.map((d) => (
          <BookCard book={d} key={d._id}></BookCard>
        ))}
      </div>
    </div>
  );
};

export default BooksAllCategory;
