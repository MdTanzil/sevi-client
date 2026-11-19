import { PropTypes } from "prop-types";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

// Short, plain-language legal pages for this small library app. Each
// route (/terms, /privacy, /cookies) shows one section, with links to
// the other two.
const SECTIONS = {
  terms: {
    title: "Terms of use",
    body: (
      <>
        <p>
          Sevi is a library management system. By creating an account and
          using the site, you agree to use it fairly: borrow books you
          intend to read, return them by the due date (within 5 days), and
          do not misuse other members&apos; accounts or the catalogue.
        </p>
        <p>
          Members may borrow up to 3 books at a time. Librarians and admins
          manage the catalogue and member roles. Accounts that abuse the
          service may have their roles changed or their access removed by an
          admin.
        </p>
        <p>
          The catalogue data (book details, covers, and availability) is
          provided as-is for the library&apos;s own members. Sevi is a
          small community project and may change or stop at any time.
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy policy",
    body: (
      <>
        <p>
          Sevi stores the details you give us: your name, email address,
          phone number, and address (if you add them), plus your borrow
          history — which books you borrowed, when they were due, and when
          you returned them. This data runs the library: it is how we know
          who has which book.
        </p>
        <p>
          Sign-in is handled by Firebase Authentication (Google). Your
          password is never stored by Sevi — Firebase manages it, or Google
          does if you sign in with Google.
        </p>
        <p>
          We do not sell your data, share it with advertisers, or use it
          for anything other than running this library. Librarians and
          admins can see member names, emails, and roles so they can run
          the library. You can update your name, phone, and address from
          your profile page at any time.
        </p>
      </>
    ),
  },
  cookies: {
    title: "Cookie policy",
    body: (
      <>
        <p>
          Sevi uses one essential cookie: a session cookie that keeps you
          signed in while you browse the library. It is set when you log in
          and cleared when you log out. Without it, the site cannot tell
          that you are signed in.
        </p>
        <p>
          Firebase Authentication may also store sign-in state in your
          browser so you stay signed in between visits. Sevi does not use
          advertising cookies or third-party tracking cookies.
        </p>
        <p>
          You can clear cookies in your browser settings at any time — you
          will simply need to sign in again.
        </p>
      </>
    ),
  },
};

const Legal = ({ section = "terms" }) => {
  const current = SECTIONS[section] || SECTIONS.terms;
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
          Sevi
        </Box>{" "}
        {current.title}
      </Typography>
      <Box
        sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1, mt: 3 }}
      >
        {Object.entries(SECTIONS).map(([key, value]) => (
          <Button
            key={key}
            component={RouterLink}
            to={`/${key === "terms" ? "terms" : key}`}
            size="small"
            variant={key === section ? "contained" : "outlined"}
            color="primary"
          >
            {value.title}
          </Button>
        ))}
      </Box>
      <Card elevation={4} sx={{ mt: 3, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box className="space-y-4">{current.body}</Box>
        </CardContent>
      </Card>
    </Container>
  );
};

Legal.propTypes = {
  section: PropTypes.oneOf(["terms", "privacy", "cookies"]),
};

export default Legal;
