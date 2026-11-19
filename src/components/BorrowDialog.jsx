import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import {
  MAX_BORROW_DAYS,
  maxReturnDate,
  minReturnDate,
  validateReturnDate,
} from "../utils/borrowDates";

// Pick a return date for a new borrow. The picker offers today ..
// today + 5 days, and the validator guards against a manually typed
// out-of-range date.
const BorrowDialog = ({ open, onClose, bookName, onConfirm }) => {
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setReturnDate("");
    setError("");
  }, [open]);

  const handleConfirm = () => {
    const check = validateReturnDate(returnDate);
    if (!check.valid) {
      setError(check.message);
      return;
    }
    onConfirm(returnDate);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select return date</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {bookName} — books can be borrowed for up to {MAX_BORROW_DAYS}{" "}
            days.
          </Typography>
          <TextField
            type="date"
            label="Return date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            inputProps={{ min: minReturnDate(), max: maxReturnDate() }}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Borrow
        </Button>
      </DialogActions>
    </Dialog>
  );
};

BorrowDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookName: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
};

export default BorrowDialog;
