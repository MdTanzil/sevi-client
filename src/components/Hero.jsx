/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import hero from "../assets/hero.png";

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/all-book?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/all-book");
    }
  };

  return (
    <Box
      sx={{
        display: "grid",
        // Single column capped at the container width — the equivalent of
        // Tailwind's grid-cols-1 (minmax(0,1fr)). Without it the hero can
        // overflow horizontally on small screens.
        gridTemplateColumns: "minmax(0, 1fr)",
        minHeight: { xs: "85vh", lg: "100vh" },
        placeItems: "center",
      }}
    >
      <Box className="flex flex-col gap-0 lg:gap-10 lg:flex-row-reverse px-4 max-w-full">
        <img
          src={hero}
          alt="Library research illustration"
          className="w-full max-w-[260px] sm:max-w-xs lg:max-w-lg rounded-lg shadow-sm lg:shadow-2xl object-cover"
          // Reserve the image's box before it loads (hero.png is
          // 1048x1119) — otherwise the text below jumps down once the
          // image arrives.
          style={{ aspectRatio: "1048 / 1119" }}
        />
        <Box className="text-center lg:text-left min-w-0 w-full max-w-full">
          <Typography
            component="h1"
            variant="h1"
            className="playfair"
            sx={{
              fontSize: { xs: "1.5rem", sm: "3rem" },
              fontWeight: 700,
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            Today's research, <br className="hidden sm:block" /> tomorrow's
            innovation
          </Typography>
          <Typography sx={{ py: { xs: 2, sm: 3 } }}>
            Accelerating research discovery to shape a better future
          </Typography>
          <Box
            component="form"
            onSubmit={handleSearch}
            className="flex items-center gap-2 w-full max-w-lg mx-auto lg:mx-0"
          >
            <TextField
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books, articles, keywords "
              size="small"
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiInputBase-input::placeholder": {
                  color: "primary.main",
                  opacity: 1,
                },
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              aria-label="Search"
              sx={{ ml: 0.5 }}
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Hero;
