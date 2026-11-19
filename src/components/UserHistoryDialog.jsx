import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import useAxios from "../hooks/useAxios";
import { getDueStatus } from "../utils/borrowDates";

// Status badge for a borrow history record: returned is green, overdue
// red, due-soon amber, anything else blue. Returned books never count as
// overdue (getDueStatus handles that).
const HistoryBadge = ({ record }) => {
  const status = getDueStatus(record);
  if (status === "returned") {
    return <Chip label="Returned" color="success" size="small" />;
  }
  if (status === "overdue") {
    return <Chip label="Overdue" color="error" size="small" />;
  }
  if (status === "due-soon") {
    return <Chip label="Due soon" color="warning" size="small" />;
  }
  return <Chip label="Borrowed" color="info" size="small" />;
};

HistoryBadge.propTypes = {
  record: PropTypes.object,
};

// A user's full borrow history (active + returned), newest first.
const UserHistoryDialog = ({ open, onClose, user }) => {
  const axios = useAxios();

  const {
    data: history = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["userBorrows", user?.email],
    queryFn: async () => {
      const res = await axios.get(
        `/admin/users/${encodeURIComponent(user.email)}/borrows`
      );
      return res.data;
    },
    enabled: open && !!user?.email,
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Borrow history — {user?.name || user?.email}
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : isError ? (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <p>Could not load the borrow history.</p>
            <Button
              variant="contained"
              size="small"
              onClick={() => refetch()}
              sx={{ mt: 2 }}
            >
              Try again
            </Button>
          </Box>
        ) : history.length === 0 ? (
          <p className="text-center my-8 opacity-70">
            No borrow history yet.
          </p>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell>Borrowed</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell>Returned</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {record.bookName || "—"}
                    </TableCell>
                    <TableCell>{record.borrowedDate || "—"}</TableCell>
                    <TableCell>{record.retunDate || "—"}</TableCell>
                    <TableCell>{record.returnedDate || "—"}</TableCell>
                    <TableCell>
                      <HistoryBadge record={record} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

UserHistoryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default UserHistoryDialog;
