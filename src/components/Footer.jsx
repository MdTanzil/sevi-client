import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        p: { xs: 3, sm: 5 },
        mt: 5,
        bgcolor: "grey.200",
        color: "text.primary",
      }}
    >
      <Box component="aside" sx={{ minWidth: 200 }}>
        <img src={logo} alt="Sevi logo" />
        <Typography sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
          Sevi
        </Typography>
        <Typography>
          Your community library — browse, borrow,
          <br />
          and keep track of your reading.
        </Typography>
      </Box>
      <Box
        component="nav"
        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            opacity: 0.6,
          }}
        >
          Library
        </Typography>
        <Link component={RouterLink} to="/all-book" color="inherit" underline="hover">
          All Books
        </Link>
        <Link component={RouterLink} to="/" color="inherit" underline="hover">
          Categories
        </Link>
        <Link component={RouterLink} to="/borrowed-book" color="inherit" underline="hover">
          Borrowed Books
        </Link>
        <Link component={RouterLink} to="/profile" color="inherit" underline="hover">
          My Profile
        </Link>
      </Box>
      <Box
        component="nav"
        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            opacity: 0.6,
          }}
        >
          Sevi
        </Typography>
        <Link component={RouterLink} to="/about" color="inherit" underline="hover">
          About us
        </Link>
        <Link component={RouterLink} to="/contact" color="inherit" underline="hover">
          Contact
        </Link>
        <Link component={RouterLink} to="/faq" color="inherit" underline="hover">
          FAQ
        </Link>
      </Box>
      <Box
        component="nav"
        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            opacity: 0.6,
          }}
        >
          Legal
        </Typography>
        <Link component={RouterLink} to="/terms" color="inherit" underline="hover">
          Terms of use
        </Link>
        <Link component={RouterLink} to="/privacy" color="inherit" underline="hover">
          Privacy policy
        </Link>
        <Link component={RouterLink} to="/cookies" color="inherit" underline="hover">
          Cookie policy
        </Link>
      </Box>
    </Box>
  );
};
export default Footer;
