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

// Create a member record for a walk-in visitor who has no online account
// yet (admin only), so the librarian can lend to them and track their
// borrows. When the person later signs up online with the same email,
// this profile — history and role included — is returned instead of a
// fresh one.
const AddUserDialog = ({ open, onClose, onSaved }) => {
  const axios = useAxios();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setError("");
  }, [open]);

  const handleSave = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("A name is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("A valid email is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await axios.post("/admin/users", {
        email: trimmedEmail,
        name: trimmedName,
        phone: phone.trim(),
        address: address.trim(),
      });
      toast.success(`"${trimmedName}" added as a member`);
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Could not add the user. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add user</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            For a walk-in visitor with no online account. They can sign up
            later with this email and keep this record.
          </Typography>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            multiline
            rows={2}
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
          {saving ? "Adding..." : "Add user"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

export default AddUserDialog;
