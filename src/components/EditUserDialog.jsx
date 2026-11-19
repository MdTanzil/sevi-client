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

// Edit a user's name, phone and address (admin only). Role stays in the
// table's selector and the email is never edited here.
const EditUserDialog = ({ open, onClose, user, onSaved }) => {
  const axios = useAxios();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setAddress(user?.address || "");
    setError("");
  }, [open, user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.put(
        `/admin/users/${encodeURIComponent(user.email)}`,
        {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }
      );
      toast.success(`Profile updated for ${user.email}`);
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Could not update the profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit profile</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Address"
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
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onSaved: PropTypes.func.isRequired,
};

export default EditUserDialog;
