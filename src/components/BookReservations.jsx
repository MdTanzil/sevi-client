import { useState } from "react";
import PropTypes from "prop-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";
import ConfirmDialog from "./ConfirmDialog";

// The hold queue for one book: who is waiting, and the signed-in user's
// own reservation. Members reserve a book only while it is out of
// stock; when copies come back, the first people in the queue are
// notified, and borrowing the book cancels the borrower's reservation.
// The server never exposes reserver emails; ownership comes from the
// `isMine` flag. The section stays hidden when the book is in stock and
// nobody is waiting.
const BookReservations = ({ bookId, quantity }) => {
  const axios = useAxios();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["book-reservations", bookId],
    queryFn: async () => {
      const res = await axios.get(`/books/${bookId}/reservations`);
      return res.data;
    },
  });
  const reservations = data?.reservations || [];
  const count = data?.count ?? 0;
  const myReservation = reservations.find(
    (reservation) => reservation.isMine
  );
  const outOfStock = Number(quantity) < 1;

  // Hooks above must run on every render; the early return below only
  // hides the section when there is nothing to show.
  if (!isLoading && !isError && count === 0 && !outOfStock) return null;

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["book-reservations", bookId],
    });

  const handleReserve = async () => {
    setBusy(true);
    try {
      const res = await axios.post(`/books/${bookId}/reservations`, {
        reserverName: user?.displayName || user?.email || "",
      });
      toast.success(
        `Reserved — you are #${res.data.position} in the queue`
      );
      invalidate();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Could not reserve this book"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await axios.delete(
        `/books/${bookId}/reservations/${myReservation._id}`
      );
      toast.success("Your reservation was cancelled");
      invalidate();
      setCancelDialogOpen(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Could not cancel the reservation"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography
        component="h2"
        variant="h5"
        className="playfair"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        Reservations
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography sx={{ opacity: 0.7 }}>
          Could not load the reservations.
        </Typography>
      ) : (
        <>
          {count > 0 ? (
            <>
              <Typography sx={{ mb: 1 }}>
                {count} {count === 1 ? "person is" : "people are"} waiting
                for this book.
              </Typography>
              {reservations.map((reservation) => (
                <Box
                  key={reservation._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    py: 0.5,
                  }}
                >
                  <Chip label={`#${reservation.position}`} size="small" />
                  <Typography>{reservation.reserverName}</Typography>
                  {reservation.isMine && (
                    <Chip label="You" color="primary" size="small" />
                  )}
                </Box>
              ))}
            </>
          ) : (
            <Typography sx={{ mb: 2, opacity: 0.7 }}>
              No one is waiting for this book.
            </Typography>
          )}

          {user ? (
            myReservation ? (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1 }}>
                  You are #{myReservation.position} in the queue — we will
                  notify you when the book is back.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={busy}
                >
                  Cancel reservation
                </Button>
              </Box>
            ) : outOfStock ? (
              <Button
                variant="contained"
                onClick={handleReserve}
                disabled={busy}
                startIcon={
                  busy ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : undefined
                }
                sx={{ mt: 2 }}
              >
                Reserve this book
              </Button>
            ) : null
          ) : (
            outOfStock && (
              <Typography sx={{ mt: 2 }}>
                <Link to="/login">Sign in</Link> to reserve this book.
              </Typography>
            )
          )}
        </>
      )}

      <ConfirmDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancel}
        title="Cancel your reservation?"
        message="Your place in the queue for this book will be removed."
        confirmLabel="Cancel reservation"
        confirmColor="error"
        busy={busy}
        busyLabel="Cancelling..."
      />
    </Box>
  );
};

BookReservations.propTypes = {
  bookId: PropTypes.string.isRequired,
  quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default BookReservations;
