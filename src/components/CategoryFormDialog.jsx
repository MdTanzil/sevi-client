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
import SafeImage from "./SafeImage";

// Add / edit a category. `category` is null when adding. The image is
// optional; an empty image on edit clears it. On success the parent
// refetches categories AND books (a rename changes book categories too).
const CategoryFormDialog = ({ open, onClose, category, onSaved }) => {
  const axios = useAxios();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Prefill when the dialog opens (edit) or reset (add).
  useEffect(() => {
    if (!open) return;
    setName(category?.name || "");
    setImage(category?.image || "");
    setError("");
  }, [open, category]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("A category name is required.");
      return;
    }
    const trimmedImage = image.trim();
    if (trimmedImage !== "") {
      let url = null;
      try {
        url = new URL(trimmedImage);
      } catch {
        url = null;
      }
      if (!url || url.protocol !== "https:") {
        setError("The image must be a valid https URL.");
        return;
      }
    }
    setSaving(true);
    setError("");
    try {
      if (category) {
        await axios.patch(`/admin/categories/${category._id}`, {
          name: trimmedName,
          image: trimmedImage,
        });
        toast.success(`"${trimmedName}" updated`);
      } else {
        await axios.post("/admin/categories", {
          name: trimmedName,
          image: trimmedImage,
        });
        toast.success(`"${trimmedName}" added`);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Could not save the category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {category ? "Edit category" : "Add category"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Image URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          {image.trim() && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SafeImage
                src={image.trim()}
                alt="Category preview"
                className="h-12 w-16 object-cover rounded"
              />
              <Typography variant="caption" color="text.secondary">
                Image preview
              </Typography>
            </Box>
          )}
          {category && (
            <Typography variant="body2" color="text.secondary">
              Renaming a category also updates every book in it.
            </Typography>
          )}
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

CategoryFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object,
  onSaved: PropTypes.func.isRequired,
};

export default CategoryFormDialog;
