import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import useAxios from "../hooks/useAxios";
import toast from "react-hot-toast";
import {
  addDays,
  daysUntilDue,
  minReturnDate,
  parseDateOnly,
  toDateOnly,
} from "../utils/borrowDates";

// How far out a librarian/admin may push a return date (the member
// borrow rule is 5 days; the admin override window is 30).
const ADMIN_MAX_RETURN_DAYS = 30;

// Change an active borrow's return date. The picker offers today ..
// today + 30 days; the server enforces the same window.
const EditReturnDateDialog = ({ open, onClose, record, onSaved }) => {
  const axios = useAxios();
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const maxDate = toDateOnly(addDays(new Date(), ADMIN_MAX_RETURN_DAYS));

  useEffect(() => {
    if (!open) return;
    setReturnDate(record?.retunDate || "");
    setError("");
  }, [open, record]);

  const handleSave = async () => {
    if (!parseDateOnly(returnDate)) {
      setError("Please pick a return date.");
      return;
    }
    const days = daysUntilDue(returnDate);
    if (days === null || days < 0) {
      setError("The return date cannot be in the past.");
      return;
    }
    if (days > ADMIN_MAX_RETURN_DAYS) {
      setError(
        `The return date can be at most ${ADMIN_MAX_RETURN_DAYS} days out.`
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      await axios.patch(`/admin/borrows/${record._id}`, {
        retunDate: returnDate,
      });
      toast.success("Return date updated");
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Could not update the return date. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit return date</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {record?.bookName} — borrowed by {record?.email}
          </Typography>
          <TextField
            type="date"
            label="Return date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            inputProps={{ min: minReturnDate(), max: maxDate }}
            helperText={`Up to ${ADMIN_MAX_RETURN_DAYS} days from today.`}
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
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditReturnDateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  record: PropTypes.object,
  onSaved: PropTypes.func.isRequired,
};

export default EditReturnDateDialog;
