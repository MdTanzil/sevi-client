import { useState } from "react";
import { PropTypes } from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SafeImage from "./SafeImage";

const currentYear = new Date().getFullYear();

// An ISBN is 10 or 13 digits; hyphens and spaces are ignored.
const extractIsbnDigits = (value) => value.replace(/[\s-]/g, "");
const isIsbn = (digits) => /^\d{10}$/.test(digits) || /^\d{13}$/.test(digits);
const openLibraryCoverUrl = (digits) =>
  `https://covers.openlibrary.org/b/isbn/${digits}-L.jpg`;

const commonLanguages = [
  "English",
  "Bengali",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Chinese",
  "Portuguese",
  "Russian",
];

/**
 * Shared add / update book form. Used by AddBook and UpdateBook so both
 * pages stay visually identical. The five metadata fields (ISBN,
 * publisher, published year, language, pages) are optional; empty ones
 * are left out of the submitted book object.
 */
const BookForm = ({
  initialBook = {},
  categories = [],
  isSubmitting = false,
  submitLabel = "Save Book",
  submittingLabel = "Saving...",
  onSubmit,
}) => {
  // ISBN and cover URL are controlled so the ISBN can auto-fill the
  // cover. The rest of the form stays uncontrolled, as before.
  const [isbn, setIsbn] = useState(initialBook.isbn || "");
  const [imageUrl, setImageUrl] = useState(initialBook.imageUrl || "");

  // Fill the cover from Open Library — but ONLY when the image field is
  // empty, so a URL the user typed (or one already saved) is never
  // overwritten.
  const maybeAutofillCover = (isbnValue, currentImageUrl) => {
    const digits = extractIsbnDigits(isbnValue);
    if (isIsbn(digits) && !currentImageUrl.trim()) {
      setImageUrl(openLibraryCoverUrl(digits));
    }
  };

  const handleIsbnChange = (e) => {
    const value = e.target.value;
    setIsbn(value);
    maybeAutofillCover(value, imageUrl);
  };

  const handleIsbnBlur = () => {
    maybeAutofillCover(isbn, imageUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.target;
    const book = {
      name: form.bookName.value || "",
      author: form.authorName.value || "",
      quantity: form.bookQuantity.value || "",
      imageUrl: form.bookImageUrl.value || "",
      category: form.bookCategory.value || "",
      rating: form.bookRating.value || "",
      shortDescription: form.bookShortDescription.value || "",
    };

    // Optional metadata: only send fields that have a value.
    const isbn = form.bookIsbn.value.trim();
    if (isbn) book.isbn = isbn;
    const publisher = form.bookPublisher.value.trim();
    if (publisher) book.publisher = publisher;
    const publishedYear = form.bookPublishedYear.value;
    if (publishedYear !== "") book.publishedYear = Number(publishedYear);
    const language = form.bookLanguage.value.trim();
    if (language) book.language = language;
    const pages = form.bookPages.value;
    if (pages !== "") book.pages = Number(pages);

    onSubmit(book);
  };

  return (
    <Card sx={{ maxWidth: "56rem", mx: "auto", borderRadius: 4 }} elevation={6}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          p: { xs: 2, sm: 4 },
        }}
      >
        <section>
          <Typography
            component="h3"
            className="playfair"
            sx={{
              fontSize: "1.125rem",
              fontWeight: 600,
              borderBottom: 1,
              borderColor: "divider",
              pb: 1,
              mb: 2,
            }}
          >
            Basic Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              type="text"
              label="Book Name"
              placeholder="Book Name"
              defaultValue={initialBook.name || ""}
              name="bookName"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="text"
              label="Author Name"
              name="authorName"
              placeholder="Author Name"
              defaultValue={initialBook.author || ""}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              SelectProps={{ native: true }}
              label="Select Book Category"
              name="bookCategory"
              defaultValue={initialBook.category || ""}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            >
              <option disabled value="">
                Pick category
              </option>
              {categories?.map((d) => (
                <option value={d.name} key={d._id}>
                  {d.name}
                </option>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Book Rating (0 - 10)"
              name="bookRating"
              inputProps={{ min: 0, max: 10 }}
              defaultValue={initialBook.rating ?? ""}
              placeholder="Book Rating"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>
        </section>

        <section>
          <Typography
            component="h3"
            className="playfair"
            sx={{
              fontSize: "1.125rem",
              fontWeight: 600,
              borderBottom: 1,
              borderColor: "divider",
              pb: 1,
              mb: 2,
            }}
          >
            Publication Details
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              type="text"
              label="ISBN (optional)"
              name="bookIsbn"
              placeholder="e.g. 9780547928227"
              value={isbn}
              onChange={handleIsbnChange}
              onBlur={handleIsbnBlur}
              helperText="Cover image will be filled automatically from Open Library if left empty"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="text"
              label="Publisher (optional)"
              name="bookPublisher"
              placeholder="e.g. Penguin Books"
              defaultValue={initialBook.publisher || ""}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="number"
              label="Published Year (optional)"
              name="bookPublishedYear"
              inputProps={{ min: 1000, max: currentYear }}
              placeholder={`e.g. ${currentYear}`}
              defaultValue={initialBook.publishedYear ?? ""}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <div>
              <TextField
                type="text"
                label="Language (optional)"
                name="bookLanguage"
                inputProps={{ list: "book-languages" }}
                placeholder="e.g. English"
                defaultValue={initialBook.language || ""}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <datalist id="book-languages">
                {commonLanguages.map((lang) => (
                  <option value={lang} key={lang} />
                ))}
              </datalist>
            </div>
            <TextField
              type="number"
              label="Pages (optional)"
              name="bookPages"
              inputProps={{ min: 1 }}
              placeholder="e.g. 366"
              defaultValue={initialBook.pages ?? ""}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>
        </section>

        <section>
          <Typography
            component="h3"
            className="playfair"
            sx={{
              fontSize: "1.125rem",
              fontWeight: 600,
              borderBottom: 1,
              borderColor: "divider",
              pb: 1,
              mb: 2,
            }}
          >
            Cover &amp; Stock
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <TextField
                type="text"
                label="Book Image Url"
                name="bookImageUrl"
                placeholder="Book Image Url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              {imageUrl.trim() && (
                <Box
                  sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <SafeImage
                    src={imageUrl.trim()}
                    alt="Cover preview"
                    className="h-20 w-14 object-cover rounded"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Cover preview
                  </Typography>
                </Box>
              )}
            </div>
            <TextField
              type="number"
              label="Quantity of the book"
              placeholder="Quantity of the book"
              defaultValue={initialBook.quantity ?? ""}
              inputProps={{ min: 0 }}
              name="bookQuantity"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>
        </section>

        <section>
          <Typography
            component="h3"
            className="playfair"
            sx={{
              fontSize: "1.125rem",
              fontWeight: 600,
              borderBottom: 1,
              borderColor: "divider",
              pb: 1,
              mb: 2,
            }}
          >
            Description
          </Typography>
          <TextField
            label="Book Short Description"
            placeholder="Book Short Description"
            name="bookShortDescription"
            defaultValue={initialBook.shortDescription || ""}
            multiline
            rows={4}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </section>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : undefined
          }
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </Box>
    </Card>
  );
};

BookForm.propTypes = {
  initialBook: PropTypes.object,
  categories: PropTypes.array,
  isSubmitting: PropTypes.bool,
  submitLabel: PropTypes.string,
  submittingLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

export default BookForm;
