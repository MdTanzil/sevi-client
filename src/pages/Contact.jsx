import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// Sevi has no support mailbox yet, so messages go to the project's public
// issue tracker — a real channel the maintainer actually reads.
const ISSUES_URL = "https://github.com/MdTanzil/sevi-client/issues/new";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = `Contact: ${name || "Sevi member"}`;
    const body = `**From:** ${name}\n**Email:** ${email}\n\n${message}`;
    const url = `${ISSUES_URL}?title=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Your message is ready to send — press Submit on GitHub.");
  };

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
          Contact
        </Box>{" "}
        us
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        sx={{ mt: 2, maxWidth: 672, mx: "auto" }}
      >
        Questions about your membership, a book, or a problem with the site?
        Send us a message — most questions are already answered on the{" "}
        <Link component={RouterLink} to="/faq" underline="hover">
          FAQ page
        </Link>
        .
      </Typography>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 mb-6">
        <Card elevation={4}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Send a message
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                type="text"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                fullWidth
                margin="normal"
              />
              <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                fullWidth
                margin="normal"
              />
              <TextField
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                multiline
                rows={4}
                required
                fullWidth
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
              >
                Send message
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Sending opens the Sevi issue tracker with your message
                filled in — press Submit there to deliver it.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card elevation={4}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Members
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Borrowing questions, overdue books, or role requests are
                fastest through your librarian — or check your profile page
                for your current loans and due dates.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/profile"
                  variant="outlined"
                  color="primary"
                  size="small"
                >
                  My Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={4}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Report a problem
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Found a bug or a book with wrong details? You can also open
                an issue directly on the Sevi GitHub repository.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  component="a"
                  href="https://github.com/MdTanzil/sevi-client/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="primary"
                  size="small"
                >
                  Open GitHub issues
                </Button>
              </Box>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Contact;
