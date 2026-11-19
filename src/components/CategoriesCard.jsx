import { PropTypes } from "prop-types";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import SafeImage from "./SafeImage";

const CategoriesCard = ({ categorie }) => {
  const { name, image } = categorie;

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        overflow: "hidden",
        boxShadow: 6,
        transition: "box-shadow 0.3s",
        "&:hover": { boxShadow: 12 },
      }}
    >
      <Box
        className="h-48 w-full lg:h-auto lg:w-64 shrink-0"
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "grey.800" : "grey.200",
        }}
      >
        <SafeImage
          src={image}
          alt={name}
          className="h-full w-full object-contain"
        />
      </Box>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          flex: 1,
        }}
      >
        <Typography component="h2" variant="h6">
          {name}
        </Typography>

        <div>
          <Button
            component={Link}
            to={`books-category/${name}`}
            variant="contained"
          >
            Show Books
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
CategoriesCard.propTypes = {
  categorie: PropTypes.object,
};

export default CategoriesCard;
