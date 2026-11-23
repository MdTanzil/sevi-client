import { useState } from "react";
import PropTypes from "prop-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";
import ConfirmDialog from "./ConfirmDialog";

// Must match the server's MAX_REVIEW_TEXT_LENGTH (reviews.controller.js).
const MAX_REVIEW_TEXT_LENGTH = 1000;

// Member reviews for one book: the average rating, the list of reviews,
// and the signed-in user's own review form (one review per user — the
// form switches to edit mode once they have reviewed). The server never
// exposes reviewer emails; ownership comes from the `isMine` flag.
const BookReviews = ({ bookId }) => {
  const axios = useAxios();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["book-reviews", bookId],
    queryFn: async () => {
      const res = await axios.get(`/books/${bookId}/reviews`);
      return res.data;
    },
  });
  const reviews = data?.reviews || [];
  const average = data?.average ?? null;
  const count = data?.count ?? 0;
  const myReview = reviews.find((review) => review.isMine);

  const resetForm = () => {
    setRating(0);
    setText("");
    setEditing(false);
  };

  const startEditing = () => {
    setRating(myReview.rating);
    setText(myReview.text || "");
    setEditing(true);
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Pick a star rating first");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`/books/${bookId}/reviews/${myReview._id}`, {
          rating,
          text: text.trim(),
        });
        toast.success("Your review was updated");
      } else {
        await axios.post(`/books/${bookId}/reviews`, {
          rating,
          text: text.trim(),
          reviewerName: user?.displayName || user?.email || "",
        });
        toast.success("Thanks for your review");
      }
      queryClient.invalidateQueries({ queryKey: ["book-reviews", bookId] });
      resetForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Could not save your review"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/books/${bookId}/reviews/${myReview._id}`);
      toast.success("Your review was deleted");
      queryClient.invalidateQueries({ queryKey: ["book-reviews", bookId] });
      resetForm();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Could not delete your review"
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Box sx={{ mt: 5 }}>
      <Typography
        component="h2"
        variant="h5"
        className="playfair"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        Member reviews
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography sx={{ opacity: 0.7 }}>
          Could not load the reviews.
        </Typography>
      ) : (
        <>
          {count > 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Rating
                style={{ maxWidth: 120 }}
                value={average}
                readOnly
              />
              <Typography>
                {average} out of 5 · {count}{" "}
                {count === 1 ? "review" : "reviews"}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ mb: 2, opacity: 0.7 }}>
              No reviews yet — be the first to share what you thought.
            </Typography>
          )}

          {reviews.map((review) => (
            <Box
              key={review._id}
              sx={{
                borderTop: 1,
                borderColor: "divider",
                py: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography fontWeight="bold">
                  {review.reviewerName}
                </Typography>
                {review.isMine && (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      aria-label="Edit your review"
                      onClick={startEditing}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Delete your review"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Rating
                  style={{ maxWidth: 90 }}
                  value={review.rating}
                  readOnly
                />
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {formatDate(review.createdAt)}
                  {review.updatedAt ? " · edited" : ""}
                </Typography>
              </Box>
              {review.text && (
                <Typography sx={{ mt: 0.5 }}>{review.text}</Typography>
              )}
            </Box>
          ))}

          {user ? (
            !myReview || editing ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {editing ? "Edit your review" : "Leave a review"}
                </Typography>
                {/* The star picker can return fractional values; the
                    server only accepts whole stars, so round on change. */}
                <Rating
                  style={{ maxWidth: 180 }}
                  value={rating}
                  onChange={(value) => setRating(Math.round(value))}
                />
                <TextField
                  label="What did you think of this book? (optional)"
                  multiline
                  rows={3}
                  fullWidth
                  value={text}
                  onChange={(event) =>
                    setText(event.target.value.slice(0, MAX_REVIEW_TEXT_LENGTH))
                  }
                  helperText={`${text.length}/${MAX_REVIEW_TEXT_LENGTH}`}
                  sx={{ mt: 1.5 }}
                />
                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    startIcon={
                      saving ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : undefined
                    }
                  >
                    {editing ? "Update review" : "Post review"}
                  </Button>
                  {editing && (
                    <Button variant="outlined" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            ) : null
          ) : (
            <Typography sx={{ mt: 3 }}>
              <Link to="/login">Sign in</Link> to leave a review.
            </Typography>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete your review?"
        message="Your review will be removed from this book."
        confirmLabel="Delete"
        confirmColor="error"
        busy={deleting}
        busyLabel="Deleting..."
      />
    </Box>
  );
};

BookReviews.propTypes = {
  bookId: PropTypes.string.isRequired,
};

export default BookReviews;
