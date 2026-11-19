import { useState } from "react";
import { PropTypes } from "prop-types";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import useAxios from "../hooks/useAxios";
import toast from "react-hot-toast";
import SafeImage from "./SafeImage";

const WishlistCard = ({ entry, refetch }) => {
  const axios = useAxios();
  const [isRemoving, setIsRemoving] = useState(false);

  const { book, bookId } = entry;
  const { _id, name, author, quantity, imageUrl, category, rating } = book;
  // Quantities can arrive as strings (the book form sends them that
  // way), so compare numerically.
  const outOfStock = Number(quantity ?? 0) < 1;

  const handleRemove = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await axios.delete(`/wishlist/${bookId}`);
      toast.success("Removed from your wishlist");
      refetch();
    } catch (error) {
      toast.error("Could not remove the book. Please try again.");
      setIsRemoving(false);
    }
  };

  return (
    <Card
      sx={{
        p: 0.5,
        m: 0.5,
        border: 2,
        borderColor: "transparent",
        boxShadow: 3,
        "&:hover": { boxShadow: 6 },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", position: "relative" }}>
        <SafeImage
          src={imageUrl}
          alt={name}
          className="h-56 w-full object-cover rounded-t-lg"
        />
        <Chip
          label={outOfStock ? "Out of stock" : `${quantity} left`}
          color={outOfStock ? "error" : "success"}
          size="small"
          sx={{ position: "absolute", top: 12, right: 12, boxShadow: 1 }}
        />
      </Box>
      <CardContent sx={{ px: 1, pb: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          align="center"
          noWrap
          title={name}
          sx={{ color: "primary.main", mt: 1, fontWeight: 500 }}
        >
          {name}
        </Typography>
        <Typography align="center" className="playfair" fontWeight={500}>
          by {author}
        </Typography>
        <Rating
          style={{ maxWidth: 120 }}
          value={(rating || 0) / 2}
          readOnly
          className="mx-auto"
        />
        <Typography align="center" fontWeight={500}>
          <span className=""> Categories : {category}</span>{" "}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "center" }}>
        <Button
          component={Link}
          to={`/books-details/${_id}`}
          variant="contained"
          color="secondary"
          size="small"
          sx={{ color: "black", textTransform: "none", m: 0.5 }}
        >
          View Details
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          sx={{ textTransform: "none", m: 0.5 }}
          onClick={handleRemove}
          disabled={isRemoving}
        >
          {isRemoving ? "Removing..." : "Remove"}
        </Button>
      </CardActions>
    </Card>
  );
};

WishlistCard.propTypes = {
  entry: PropTypes.object,
  refetch: PropTypes.func,
};

export default WishlistCard;
