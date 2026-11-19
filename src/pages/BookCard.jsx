import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { PropTypes } from "prop-types";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import SafeImage from "../components/SafeImage";

const BookCard = ({ book }) => {
  const { _id, name, author, quantity, imageUrl, category, rating } = book;
  const navigate = useNavigate();
  const outOfStock = (quantity ?? 0) < 1;

  const openDetails = () => navigate(`/books-details/${_id}`);

  // Keyboard support for the clickable card.
  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetails();
    }
  };

  return (
    <Card
      component="article"
      onClick={openDetails}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details of ${name}`}
      elevation={4}
      className="group"
      sx={{
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: 3,
        transition: "all 0.2s",
        "&:hover": { boxShadow: 8, transform: "translateY(-4px)" },
      }}
    >
      <Box className="relative h-64 sm:h-72 overflow-hidden">
        <SafeImage
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Chip
          label={category}
          color="secondary"
          size="small"
          sx={{ position: "absolute", top: 12, left: 12, boxShadow: 1 }}
        />
        <Chip
          label={outOfStock ? "Out of stock" : `${quantity} left`}
          color={outOfStock ? "error" : "success"}
          size="small"
          sx={{ position: "absolute", top: 12, right: 12, boxShadow: 1 }}
        />
      </Box>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography
          component="h2"
          title={name}
          sx={{
            fontSize: "1.125rem",
            lineHeight: 1.375,
            fontWeight: 600,
            minHeight: "3.5rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          title={author}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          by {author}
        </Typography>
        <Box className="flex items-center gap-2 mt-1">
          <Rating
            style={{ maxWidth: 100 }}
            value={(rating || 0) / 2}
            readOnly
          />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {rating ? `${rating}/10` : "No rating"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
BookCard.propTypes = {
  book: PropTypes.object,
};

export default BookCard;
