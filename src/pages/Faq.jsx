import { Link as RouterLink } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const FAQS = [
  {
    question: "How do I borrow a book?",
    answer:
      "Open any book, press Borrow, and pick a return date. The book appears on your Borrowed Books page, and your profile keeps the full history.",
  },
  {
    question: "How long can I keep a borrowed book?",
    answer:
      "Books can be borrowed for up to 5 days. When you borrow, the return date picker only lets you pick a date within the next 5 days.",
  },
  {
    question: "How many books can I borrow at once?",
    answer:
      "Up to 3 books at a time. Once you have 3 active borrows, the Borrow button is disabled until you return one.",
  },
  {
    question: "What happens if I return a book late?",
    answer:
      "Your profile history highlights overdue books in red, and books due today or tomorrow in amber. There are no fines in Sevi — just return the book as soon as you can so others can borrow it.",
  },
  {
    question: "How do I return a book?",
    answer:
      "Go to Borrowed Books and press Return on the book. The record stays in your borrow history with the date you returned it.",
  },
  {
    question: "What is the virtual membership card?",
    answer:
      "Every member has a card on their profile page showing their name, role, member-since date, and how many books they currently have borrowed (out of 3).",
  },
  {
    question: "What are the member, librarian, and admin roles?",
    answer:
      "Members browse, borrow, and return books. Librarians can also add and update books in the catalogue. Admins manage members and their roles. An admin can change your role from the Users page.",
  },
  {
    question: "How do I change my password or email?",
    answer:
      "If you signed up with email and password, you can change both from your profile page. If you signed in with Google, your password and email are managed by Google instead.",
  },
  {
    question: "I forgot my password. What do I do?",
    answer:
      "Use the Forgot password link on the login page. We will email you a link to set a new password.",
  },
  {
    question: "How do I become a member?",
    answer:
      "Create a free account from the Register page — with an email and password, or with Google. Your membership card is created automatically.",
  },
];

const Faq = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography
        variant="h3"
        component="h1"
        align="center"
        fontWeight="bold"
        className="playfair"
        sx={{ fontSize: { xs: "1.875rem", sm: "2.25rem" } }}
      >
        <Box component="span" sx={{ color: "secondary.main" }}>
          Frequently Asked
        </Box>{" "}
        Questions
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        Everything about borrowing, returning, and your membership. Still
        stuck?{" "}
        <Link component={RouterLink} to="/contact" underline="hover">
          Contact us
        </Link>
        .
      </Typography>
      <Box sx={{ mt: 4, mb: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {FAQS.map((faq) => (
          <Accordion key={faq.question} elevation={4}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
              >
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};

export default Faq;
