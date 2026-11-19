import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import useAxios from "../hooks/useAxios";
import toast from "react-hot-toast";
import {
  maxReturnDate,
  minReturnDate,
  validateReturnDate,
} from "../utils/borrowDates";

// Lend a book to a user on their behalf (walk-in members). Same 5-day
// return rule as the member flow; the server enforces stock and the
// 3-book limit, and those messages surface in the error toast.
const LendBookDialog = ({ open, onClose, users, books, onSaved }) => {
  const axios = useAxios();
  const [userEmail, setUserEmail] = useState("");
  const [book, setBook] = useState(null);
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Only books with copies on the shelf can be lent.
  const inStockBooks = useMemo(
    () => books.filter((b) => Number(b.quantity) > 0),
    [books]
  );

  useEffect(() => {
    if (!open) return;
    setUserEmail("");
    setBook(null);
    setReturnDate("");
    setError("");
  }, [open]);

  const handleSave = async () => {
    if (!userEmail) {
      setError("Please choose a user.");
      return;
    }
    if (!book) {
      setError("Please choose a book.");
      return;
    }
    const check = validateReturnDate(returnDate);
    if (!check.valid) {
      setError(check.message);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await axios.post("/admin/borrows", {
        userEmail,
        bookId: book._id,
        returnDate,
      });
      toast.success(`"${book.name}" lent to ${userEmail}`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          "Could not lend the book. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Lend a book</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            select
            label="User"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem disabled value="">
              Choose a user
            </MenuItem>
            {users.map((u) => (
              <MenuItem key={u.email} value={u.email}>
                {u.name ? `${u.name} — ${u.email}` : u.email}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            options={inStockBooks}
            getOptionLabel={(option) =>
              `${option.name} — ${option.author} (${Number(option.quantity) || 0} available)`
            }
            isOptionEqualToValue={(option, value) =>
              option._id === value._id
            }
            value={book}
            onChange={(_event, next) => setBook(next)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Book"
                placeholder="Search books by title"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <TextField
            type="date"
            label="Return date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            inputProps={{ min: minReturnDate(), max: maxReturnDate() }}
            helperText="Books can be borrowed for up to 5 days."
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={18} color="inherit" /> : undefined
          }
        >
          {saving ? "Lending..." : "Lend book"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

LendBookDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  books: PropTypes.array.isRequired,
  onSaved: PropTypes.func.isRequired,
};

export default LendBookDialog;
