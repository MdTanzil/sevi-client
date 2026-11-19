import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import authors from "../assets/authors.png";
import librarian from "../assets/librarian.png";
import societies from "../assets/societies.png";
import researchers from "../assets/researchers.png";

const resources = [
  {
    image: researchers,
    alt: "Researchers",
    title: "Researchers",
    text: "Search the catalogue, discover new arrivals, and keep track of your reading list.",
  },
  {
    image: librarian,
    alt: "Librarian",
    title: "Librarian",
    text: "Manage the catalogue, track loans and returns, and support members.",
  },
  {
    image: societies,
    alt: "Societies",
    title: "Societies",
    text: "Reading circles and book clubs — share recommendations with fellow members.",
  },
  {
    image: authors,
    alt: "Authors",
    title: "Authors!",
    text: "Browse featured authors and their works in the Sevi catalogue.",
  },
];

const OurResources = () => {
    return (
      <Box sx={{ mx: { xs: 1, sm: 5 }, my: { xs: 4, sm: 5 } }}>
        <Typography
          component="h1"
          className="playfair"
          sx={{
            fontSize: { xs: "1.875rem", sm: "2.25rem" },
            fontWeight: 700,
            textAlign: "center",
            mt: 2.5,
          }}
        >
          <Box component="span" sx={{ color: "secondary.main" }}>
            Our{" "}
          </Box>
          resources
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 ">
          {resources.map((resource) => (
            <Card key={resource.title}>
              <Box sx={{ px: 5, pt: 5 }}>
                <img
                  src={resource.image}
                  alt={resource.alt}
                  className="rounded-xl"
                  // Reserve the icon's box before it loads (all four
                  // icons are ~108x113) — otherwise the card text jumps
                  // down once the image arrives.
                  width={108}
                  height={113}
                />
              </Box>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  component="h2"
                  sx={{ fontSize: "1.125rem", fontWeight: 600 }}
                >
                  {resource.title}
                </Typography>
                <Typography sx={{ fontWeight: 300 }}>
                  {resource.text}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </Box>
    );
};

export default OurResources;
