import { useParams } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

const Reading = () => {
  const axios = useAxios();
  const { id } = useParams();
  const books = async () => {
    const res = await axios.get(`/single-book/${id}`);
    return res.data;
  };
  const {
    data: book,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["book"],
    queryFn: books,
  });

  if (isLoading) {
    return (
      <Box className="flex justify-center my-48">
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (isError || !book) {
    return (
      <Box className="my-48 text-center">
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Could not load this book
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
  const {
    name,
    shortDescription,
  } = book;
  return (
    <Box className="px-2">
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
          Read
        </Box>{" "}
        More
      </Typography>
      <Typography
        component="h2"
        className="playfair"
        sx={{
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          fontWeight: 600,
          textAlign: "center",
          mt: 4,
        }}
      >
        {name}
      </Typography>
      <Typography sx={{ mt: 1.5 }}> {shortDescription}</Typography>
    </Box>
  );
};

export default Reading;
