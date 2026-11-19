import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";

const STEPS = [
  "Find a book",
  "Borrow it (up to 5 days)",
  "Read it",
  "Return it on time",
];

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography
        variant="h3"
        component="h1"
        align="center"
        fontWeight="bold"
        className="playfair"
        sx={{ fontSize: { xs: "1.875rem", sm: "2.25rem" } }}
      >
        <Box component="span" sx={{ color: "secondary.main" }}>
          About
        </Box>{" "}
        Sevi
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        sx={{ mt: 2, maxWidth: 672, mx: "auto" }}
      >
        Sevi is a library management system for readers, librarians, and
        small community libraries — browse the catalogue, borrow books, and
        keep track of your reading in one place.
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <Card elevation={4}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Browse the catalogue
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explore books by category or search by title, author, or
              category — with live availability on every book.
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={4}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Borrow in seconds
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pick a book, choose a return date within 5 days, and it is
              yours. Members can borrow up to 3 books at a time.
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={4} className="sm:col-span-2 lg:col-span-1">
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Your membership card
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Every member gets a virtual library card with their borrow
              history — what you borrowed, when it is due, and when you
              returned it.
            </Typography>
          </CardContent>
        </Card>
      </div>

      <Card elevation={4} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            How borrowing works
          </Typography>
          <Box sx={{ mt: 2 }} className="sm:hidden">
            <Stepper orientation="vertical" activeStep={STEPS.length}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Box sx={{ mt: 2 }} className="hidden sm:block">
            <Stepper alternativeLabel activeStep={STEPS.length}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Books are due within 5 days of borrowing. Your profile page
            shows a warning when a book is due soon, and highlights overdue
            books in red so nothing slips past you.
          </Typography>
        </CardContent>
      </Card>

      <Card elevation={4} sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Who runs the library?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sevi has three roles. <strong>Members</strong> browse, borrow,
            and return books. <strong>Librarians</strong> also add and update
            books in the catalogue. <strong>Admins</strong> manage members
            and their roles. New members start as members — an admin can
            promote you to librarian from the Users page.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
            <Button
              component={RouterLink}
              to="/all-book"
              variant="contained"
              color="primary"
            >
              Browse books
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              color="primary"
            >
              Create an account
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default About;
