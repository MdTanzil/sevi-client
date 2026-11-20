import { useState } from "react";
import { PropTypes } from "prop-types";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
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
import ExtendBorrowButton from "./ExtendBorrowButton";
import { getDueStatus } from "../utils/borrowDates";

const BorrowCard = ({ data, refetch }) => {
  const axios = useAxios();
  const [isReturning, setIsReturning] = useState(false);

  const {
    _id,
    bookName,
    bookImage,
    bookCategorie,
    bookId,
    retunDate,
    borrowedDate,
    author,
    rating,
  } = data;

  // Active borrows only reach this card, so the status is overdue,
  // due-soon, or ok (the helper also handles returned/unknown safely).
  const dueStatus = getDueStatus(data);

  const handleReturn = async () => {
    if (isReturning) return;
    setIsReturning(true);
    try {
      // Return first (marks the borrow as returned, keeping the history),
      // and only then restore the stock — a failed return must not change
      // the quantity.
      await axios.patch(`/borrows/${_id}/return`);
      await axios.patch(`/books-quantity-increase/${bookId}`);
      toast.success("Book returned successfully");
      refetch();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not return the book. Please try again."
      );
      setIsReturning(false);
    }
  };
  return (
    <Card
      sx={{
        p: 0.5,
        m: 0.5,
        border: 2,
        borderColor:
          dueStatus === "overdue"
            ? "error.main"
            : dueStatus === "due-soon"
            ? "warning.main"
            : "transparent",
        boxShadow: 3,
        "&:hover": { boxShadow: 6 },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", position: "relative" }}>
        <SafeImage
          src={bookImage}
          alt={bookName}
          className="h-56 w-full object-cover rounded-t-lg"
        />
        {dueStatus === "overdue" && (
          <Chip
            label="Overdue"
            color="error"
            size="small"
            sx={{ position: "absolute", top: 12, right: 12, boxShadow: 1 }}
          />
        )}
        {dueStatus === "due-soon" && (
          <Chip
            label="Due soon"
            color="warning"
            size="small"
            sx={{ position: "absolute", top: 12, right: 12, boxShadow: 1 }}
          />
        )}
      </Box>
      <CardContent sx={{ px: 1, pb: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          align="center"
          noWrap
          title={bookName}
          sx={{ color: "primary.main", mt: 1, fontWeight: 500 }}
        >
          {bookName}
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
          <span className=""> Categories : {bookCategorie}</span>{" "}
        </Typography>

        <Typography align="center" fontWeight={500}>
          <span className=""> Borrow Date : {borrowedDate}</span>{" "}
        </Typography>
        <Typography align="center" fontWeight={500}>
          <span className=""> Return Date : {retunDate}</span>{" "}
        </Typography>
        {data.extended && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Chip label="Extended once" color="info" size="small" />
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "center", gap: 1 }}>
        <ExtendBorrowButton record={data} onExtended={refetch} />
        <Button
          variant="contained"
          color="secondary"
          size="small"
          sx={{ color: "black", textTransform: "none", m: 0.5 }}
          onClick={handleReturn}
          disabled={isReturning}
        >
          {isReturning ? "Returning..." : "Return"}
        </Button>
      </CardActions>
    </Card>
  );
};

BorrowCard.propTypes = {
  data: PropTypes.object,
  refetch: PropTypes.func,
};

export default BorrowCard;
