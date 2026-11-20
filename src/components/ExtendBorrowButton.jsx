import { useState } from "react";
import { PropTypes } from "prop-types";
import Button from "@mui/material/Button";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import useAxios from "../hooks/useAxios";
import toast from "react-hot-toast";
import ConfirmDialog from "./ConfirmDialog";
import {
  EXTENSION_DAYS,
  canExtendBorrow,
  extendedReturnDate,
} from "../utils/borrowDates";

// "Extend 5 days" button for a borrow record, shared by the Borrowed
// Books cards and the profile history. Renders nothing when the loan
// cannot be extended (returned, overdue, or already extended once).
// Confirming calls PATCH /borrows/:id/extend and then onExtended
// (usually a refetch) so the new due date shows immediately.
const ExtendBorrowButton = ({ record, onExtended }) => {
  const axios = useAxios();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  if (!canExtendBorrow(record)) return null;

  const newDueDate = extendedReturnDate(record);

  const handleExtend = async () => {
    setDialogOpen(false);
    setIsExtending(true);
    try {
      const res = await axios.patch(`/borrows/${record._id}/extend`);
      toast.success(
        `Extended — please return before ${res.data?.retunDate || newDueDate}`
      );
      onExtended?.();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not extend the loan. Please try again."
      );
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<MoreTimeIcon />}
        onClick={() => setDialogOpen(true)}
        disabled={isExtending}
        sx={{ textTransform: "none", whiteSpace: "nowrap" }}
      >
        {isExtending ? "Extending..." : `Extend ${EXTENSION_DAYS} days`}
      </Button>
      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleExtend}
        title={`Extend "${record.bookName}" by ${EXTENSION_DAYS} days?`}
        message={
          newDueDate
            ? `The return date moves from ${record.retunDate} to ${newDueDate}. You can only extend each loan once.`
            : `You can only extend each loan once.`
        }
        confirmLabel="Extend"
      />
    </>
  );
};

ExtendBorrowButton.propTypes = {
  record: PropTypes.object.isRequired,
  onExtended: PropTypes.func,
};

export default ExtendBorrowButton;
