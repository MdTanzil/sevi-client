import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import libraries from '../assets/libraries.png';

const OurLibaries = () => {
    return (
      <Box sx={{ mt: 5 }}>

        <Box className="flex flex-col lg:flex-row px-4 items-center">
          <img
            src={libraries}
            alt="Sevi libraries"
            className="w-full max-w-[300px] sm:max-w-sm lg:max-w-xl rounded-lg shadow-lg flex-1 object-cover"
          />
          <Box className="flex-1 text-center lg:text-left">
            <Typography
              component="h1"
              className="playfair"
              sx={{
                fontSize: { xs: "1.875rem", sm: "2.25rem" },
                fontWeight: 700,
                mt: 2.5,
              }}
            >
              <Box component="span" sx={{ color: "secondary.main" }}>
                Our{" "}
              </Box>
              libraries
            </Typography>
            <Typography sx={{ py: 3 }}>
              Your reading list is a good place to start, but you will be
              expected to read more widely too. Use Sevi to search for
              information on your topic, and to find books, journal articles
              and other materials in the Library.
            </Typography>
            <Button component={Link} to="/about" variant="contained">
              Learn More
            </Button>
          </Box>
        </Box>
      </Box>
    );
};

export default OurLibaries;
