import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
import DashboardLayout from "../components/DashboardLayout";
import AddUserDialog from "../components/AddUserDialog";
import EditUserDialog from "../components/EditUserDialog";
import UserHistoryDialog from "../components/UserHistoryDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";

const ROLES = ["member", "librarian", "admin"];

// Rows per page in the users table.
const PAGE_SIZE = 10;

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const UsersAdmin = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isAdmin, isLoading: profileLoading } = useProfile();
  const [userSearch, setUserSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  // Edit-profile dialog: { open, user }.
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  // Borrow-history dialog: { open, user }.
  const [historyDialog, setHistoryDialog] = useState({
    open: false,
    user: null,
  });
  const [deletingEmail, setDeletingEmail] = useState(null);
  // The user awaiting confirmation in the delete dialog.
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("/users");
      return res.data;
    },
    enabled: isAdmin,
  });

  // Search by name or email, then paginate. The page clamps when the
  // list shrinks under it (e.g. a user is deleted on the last page).
  const displayUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (member) =>
        member.name?.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term)
    );
  }, [users, userSearch]);
  const totalPages = Math.max(
    1,
    Math.ceil(displayUsers.length / PAGE_SIZE)
  );
  const currentPage = Math.min(usersPage, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = displayUsers.slice(pageStart, pageStart + PAGE_SIZE);
  const rangeStart = displayUsers.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + PAGE_SIZE, displayUsers.length);

  const handleRoleChange = async (email, role) => {
    try {
      await axios.put(`/users/${encodeURIComponent(email)}/role`, { role });
      toast.success(`Role updated to ${role}`);
      refetch();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Could not update the role"
      );
    }
  };

  // Delete a user (admin only). The server refuses with a 409 while the
  // user has an active borrow, and that message is shown in the error
  // toast. The button is hidden for the signed-in user.
  const handleDeleteUser = async (member) => {
    setPendingDeleteUser(null);
    setDeletingEmail(member.email);
    // Optimistic: drop the row from the table immediately. The table
    // updates in one step instead of sitting unchanged through the
    // request and then jumping when the refetch lands.
    queryClient.setQueryData(["users"], (old) =>
      Array.isArray(old)
        ? old.filter((u) => u.email !== member.email)
        : old
    );
    try {
      await axios.delete(`/admin/users/${encodeURIComponent(member.email)}`);
      toast.success(`"${member.name || member.email}" deleted`);
      refetch();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Could not delete the user. Please try again."
      );
      refetch();
    } finally {
      setDeletingEmail(null);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center my-48">
        <CircularProgress size={48} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Admins only</p>
        <p className="mt-2">
          Only admins can manage users and their roles.
        </p>
        <Button
          component={Link}
          to="/all-book"
          variant="contained"
          size="small"
          sx={{ mt: 2 }}
        >
          Browse books
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center my-48">
        <CircularProgress size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Could not load users</p>
        <Button
          variant="contained"
          size="small"
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout active="users">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <Box component="span" sx={{ color: "secondary.main" }}>
          Manage
        </Box>{" "}
        Users
      </h1>
      <div className="max-w-4xl mx-auto mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TextField
            type="text"
            size="small"
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setUsersPage(1);
            }}
            placeholder="Search by name or email"
            sx={{ width: "100%", maxWidth: "24rem" }}
          />
          {userSearch && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setUserSearch("");
                setUsersPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>
        <Button
          variant="contained"
          size="small"
          onClick={() => setAddDialogOpen(true)}
        >
          Add User
        </Button>
      </div>
      {users.length > 0 && (
        <p className="max-w-4xl mx-auto mt-3 poppins">
          Showing {rangeStart}–{rangeEnd} of {displayUsers.length} users
          {userSearch.trim() !== "" && ` (${users.length} total)`}
        </p>
      )}
      <Card elevation={4} className="max-w-4xl mx-auto mt-4 mb-6">
        <CardContent
          sx={{
            p: { xs: 2, sm: 4 },
            "&:last-child": { pb: { xs: 2, sm: 4 } },
          }}
        >
          {users.length === 0 ? (
            <p className="text-center my-8 opacity-70">No users yet.</p>
          ) : displayUsers.length === 0 ? (
            <div className="text-center my-8">
              <p className="text-xl font-bold">No users match your search</p>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setUserSearch("");
                  setUsersPage(1);
                }}
                sx={{ mt: 2 }}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile: stacked cards (a 5-column table does not fit). */}
              <div className="md:hidden space-y-3">
                {pageUsers.map((member) => {
                  const isSelf =
                    member.email?.toLowerCase() ===
                    user?.email?.toLowerCase();
                  return (
                    <Box
                      key={member.email}
                      sx={{
                        borderRadius: 2,
                        border: 1,
                        borderColor: "divider",
                        p: 1.5,
                      }}
                    >
                      <p className="font-medium">
                        {member.name || "—"}
                        {isSelf && (
                          <Chip label="You" size="small" sx={{ ml: 1 }} />
                        )}
                      </p>
                      <p className="text-sm opacity-70 break-all">
                        {member.email}
                      </p>
                      <p className="text-sm opacity-70 mt-1">
                        Member since: {formatDate(member.createdAt)}
                      </p>
                      <Select
                        size="small"
                        value={member.role}
                        disabled={isSelf}
                        title={
                          isSelf
                            ? "You cannot change your own role"
                            : "Change role"
                        }
                        onChange={(e) =>
                          handleRoleChange(member.email, e.target.value)
                        }
                        sx={{
                          width: "100%",
                          mt: 1.5,
                          textTransform: "capitalize",
                        }}
                      >
                        {ROLES.map((role) => (
                          <MenuItem
                            key={role}
                            value={role}
                            sx={{ textTransform: "capitalize" }}
                          >
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            setEditDialog({ open: true, user: member })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<HistoryIcon />}
                          onClick={() =>
                            setHistoryDialog({ open: true, user: member })
                          }
                        >
                          History
                        </Button>
                        {!isSelf && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => setPendingDeleteUser(member)}
                            disabled={deletingEmail === member.email}
                          >
                            {deletingEmail === member.email
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        )}
                      </div>
                    </Box>
                  );
                })}
              </div>
              {/* Desktop: the full table. */}
              <TableContainer className="hidden md:block">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Member since</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  {/* No zebra striping: positional stripes flip for every
                      row below a deleted one, so the whole table flashes
                      on every delete. The row dividers separate the rows. */}
                  <TableBody>
                    {pageUsers.map((member) => {
                      const isSelf =
                        member.email?.toLowerCase() ===
                        user?.email?.toLowerCase();
                      return (
                        <TableRow key={member.email}>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {member.name || "—"}
                            {isSelf && (
                              <Chip label="You" size="small" sx={{ ml: 1 }} />
                            )}
                          </TableCell>
                          <TableCell className="break-all">
                            {member.email}
                          </TableCell>
                          <TableCell>
                            {formatDate(member.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={member.role}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "You cannot change your own role"
                                  : "Change role"
                              }
                              onChange={(e) =>
                                handleRoleChange(member.email, e.target.value)
                              }
                              sx={{ textTransform: "capitalize" }}
                            >
                              {ROLES.map((role) => (
                                <MenuItem
                                  key={role}
                                  value={role}
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {role}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() =>
                                  setEditDialog({ open: true, user: member })
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<HistoryIcon />}
                                onClick={() =>
                                  setHistoryDialog({
                                    open: true,
                                    user: member,
                                  })
                                }
                              >
                                History
                              </Button>
                              {!isSelf && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => setPendingDeleteUser(member)}
                                  disabled={deletingEmail === member.email}
                                >
                                  {deletingEmail === member.email
                                    ? "Deleting..."
                                    : "Delete"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <Box
          sx={{ display: "flex", justifyContent: "center", my: 3 }}
          className="max-w-4xl mx-auto"
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_event, page) => setUsersPage(page)}
            color="primary"
            aria-label="Users pages"
          />
        </Box>
      )}

      {/* Dialogs. */}
      <AddUserDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSaved={() => refetch()}
      />
      <EditUserDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, user: null })}
        user={editDialog.user}
        onSaved={() => refetch()}
      />
      <UserHistoryDialog
        open={historyDialog.open}
        onClose={() => setHistoryDialog({ open: false, user: null })}
        user={historyDialog.user}
      />
      <ConfirmDialog
        open={Boolean(pendingDeleteUser)}
        onClose={() => setPendingDeleteUser(null)}
        onConfirm={() => handleDeleteUser(pendingDeleteUser)}
        title={`Delete "${
          pendingDeleteUser?.name || pendingDeleteUser?.email
        }"?`}
        message="This permanently removes the user, their wishlist and their notifications. Their borrow history stays as library records."
        confirmLabel="Delete"
        confirmColor="error"
      />
    </DashboardLayout>
  );
};

export default UsersAdmin;
