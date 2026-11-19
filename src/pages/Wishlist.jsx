import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import useAxios from "../hooks/useAxios";
import WishlistCard from "../components/WishlistCard";

const Wishlist = () => {
  const axios = useAxios();

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await axios.get("/wishlist");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center my-48">
        <CircularProgress size={56} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-48 text-center">
        <Typography variant="h5" component="p" fontWeight="bold">
          Could not load your wishlist
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className="poppins mt-4"
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <Box component="span" sx={{ color: "secondary.main" }}>
          My
        </Box>{" "}
        Wishlist
      </h1>
      {data.length <= 0 && (
        <div className="my-48 text-center">
          <Typography variant="h5" component="p" fontWeight="bold">
            Your wishlist is empty
          </Typography>
          <Typography className="mt-2 opacity-70">
            Save books you want to read later — when an out-of-stock book
            comes back, you will get a notification.
          </Typography>
          <Button
            component={Link}
            to="/all-book"
            variant="contained"
            color="primary"
            size="small"
            className="poppins mt-4"
          >
            Browse books
          </Button>
        </div>
      )}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.map((entry) => (
          <WishlistCard
            key={entry._id}
            entry={entry}
            refetch={refetch}
          ></WishlistCard>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
