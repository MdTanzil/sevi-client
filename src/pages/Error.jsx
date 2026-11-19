/* eslint-disable react/no-unescaped-entities */
import { Link as RouterLink } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const Error = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
      }}
    >
      <div className="container flex flex-col md:flex-row items-center justify-between px-5">
        <div className="w-full lg:w-1/2 mx-2 sm:mx-8">
          <Typography
            variant="h1"
            component="div"
            color="primary"
            fontWeight={800}
            sx={{ fontSize: { xs: "3.75rem", sm: "4.5rem" }, mb: 4 }}
          >
            {" "}
            404
          </Typography>
          <Typography
            variant="h5"
            component="p"
            fontWeight={300}
            sx={{ fontSize: { xs: "1.5rem", md: "1.875rem" }, lineHeight: 1.4, mb: 4 }}
          >
            Sorry we couldn't find the page you're looking for
          </Typography>
          <Button component={RouterLink} to={"/"} variant="contained" color="primary">
            back to homepage
          </Button>
        </div>
        <div className="w-full lg:flex lg:justify-end lg:w-1/2 mx-2 sm:mx-5 my-8 sm:my-12">
          <SafeImage
            src="https://user-images.githubusercontent.com/43953425/166269493-acd08ccb-4df3-4474-95c7-ad1034d3c070.svg"
            className="w-full max-w-md"
            alt="Page not found"
          />
        </div>
      </div>
    </Box>
  );
};

export default Error;
