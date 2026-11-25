import { useState } from "react";
import { PropTypes } from "prop-types";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
import { canExtendBorrow, getDueStatus } from "../utils/borrowDates";
import ConfirmDialog from "../components/ConfirmDialog";
import ExtendBorrowButton from "../components/ExtendBorrowButton";
import toast from "react-hot-toast";

const MAX_ACTIVE_BORROWS = 3;

// Friendly messages for Firebase auth errors (fall back to the raw code).
const friendlyAuthError = (code) => {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Current password is incorrect";
    case "auth/requires-recent-login":
      return "Please log out and log in again, then try once more";
    case "auth/weak-password":
      return "The new password is too weak";
    case "auth/email-already-in-use":
      return "That email is already used by another account";
    case "auth/invalid-email":
      return "That email address is not valid";
    default:
      return code || "Something went wrong. Please try again.";
  }
};

// Server errors carry { error }, Firebase errors carry a code.
const getErrorMessage = (error) =>
  error?.response?.data?.error ||
  friendlyAuthError(error?.code) ||
  "Something went wrong. Please try again.";

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Status badge for a history record: overdue books (active and past
// their due date) show red, books due today or tomorrow show amber,
// returned books show green. Returned books are never overdue.
const DueBadge = ({ record }) => {
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

DueBadge.propTypes = {
  record: PropTypes.object,
};

const Profile = () => {
  const axios = useAxios();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, isLoading, isError, refetch } = useProfile();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Current (active) borrows, for the x/3 counter on the card.
  const { data: activeBorrows = [] } = useQuery({
    queryKey: ["borrowbooks"],
    queryFn: async () => {
      const res = await axios.get("/borrows");
      return res.data;
    },
  });

  // Full borrow history (borrowed + returned), newest first.
  const {
    data: history = [],
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["borrow-history"],
    queryFn: async () => {
      const res = await axios.get("/borrows/history");
      return res.data;
    },
  });

  // The caller's reservations (hold queue), newest first — each entry
  // carries the book's current details and the queue position.
  const {
    data: myReservations = [],
    isLoading: isReservationsLoading,
    isError: isReservationsError,
    refetch: refetchReservations,
  } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: async () => {
      const res = await axios.get("/reservations");
      return res.data;
    },
  });
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelReservation = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await axios.delete(
        `/books/${cancelTarget.bookId}/reservations/${cancelTarget._id}`
      );
      toast.success("Your reservation was cancelled");
      refetchReservations();
      setCancelTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsCancelling(false);
    }
  };

  // Password changes and email changes go through Firebase, so they only
  // work for accounts that signed up with email and password. Google
  // accounts manage both in their Google account instead.
  const providers = user?.providerData?.map((p) => p.providerId) || [];
  const hasPasswordProvider = providers.includes("password");

  if (isLoading) {
    return (
      <div className="flex justify-center my-48">
        <CircularProgress size={48} />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Could not load your profile</p>
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

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    axios
      .put("/profile", {
        name: e.target.name.value,
        phone: e.target.phone.value,
        address: e.target.address.value,
      })
      .then(() => {
        toast.success("Profile updated");
        refetch();
      })
      .catch(() => {
        toast.error("Could not update your profile. Please try again.");
      })
      .finally(() => {
        setIsSavingProfile(false);
      });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (isChangingPassword) return;
    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    // Same password rules as registration.
    if (!/^.{6,20}$/.test(newPassword)) {
      toast.error("Password should be contain 6 characters ");
      return;
    } else if (!/^.*[A-Z].*/.test(newPassword)) {
      toast.error("Password should have a capital letter ");
      return;
    } else if (!/^.*[^A-Za-z0-9].*/.test(newPassword)) {
      toast.error("Password should have a special character ");
      return;
    }
    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Password changed successfully");
      e.target.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (isChangingEmail) return;
    const newEmail = e.target.newEmail.value.trim();
    const currentPassword = e.target.currentPassword.value;
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      toast.error("Enter a different email address");
      return;
    }
    setIsChangingEmail(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      // Sends a verification email to the new address; Firebase only
      // switches the email once the user clicks the link.
      await verifyBeforeUpdateEmail(user, newEmail);
      // Move the server profile and borrow history to the new email.
      await axios.put("/profile/email", { newEmail });
      toast.success(
        `Verification email sent to ${newEmail}. Please verify it, then log in with your new email.`
      );
      await logout();
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <div className="mt-5">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <Box component="span" sx={{ color: "secondary.main" }}>
          My
        </Box>{" "}
        Profile
      </h1>

      {/* Virtual membership card */}
      <Card
        elevation={4}
        className="max-w-2xl mx-auto mt-6"
        sx={{
          color: "white",
          background: (theme) =>
            `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, sm: 4 },
            "&:last-child": { pb: { xs: 2.5, sm: 4 } },
          }}
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] opacity-80">
                SEVI LIBRARY
              </p>
              <h2 className="text-2xl font-bold mt-1">
                {profile.name || user.displayName || "Member"}
              </h2>
              <p className="opacity-90 break-all">{profile.email}</p>
            </div>
            <Chip
              label={profile.role}
              size="small"
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "white",
                textTransform: "capitalize",
                flexShrink: 0,
              }}
            />
          </div>
          <div className="flex flex-wrap justify-between gap-2 mt-4 text-sm">
            <span>Member since: {formatDate(profile.createdAt)}</span>
            <span>
              Borrowed: {activeBorrows.length}/{MAX_ACTIVE_BORROWS} books
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
        {/* Edit profile */}
        <Card elevation={4}>
          <CardContent
            sx={{
              p: { xs: 2, sm: 4 },
              "&:last-child": { pb: { xs: 2, sm: 4 } },
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Edit profile
            </Typography>
            <form key={profile.email} onSubmit={handleUpdateProfile}>
              <TextField
                fullWidth
                label="Name"
                type="text"
                name="name"
                defaultValue={profile.name || ""}
                placeholder="Your name"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Phone"
                type="tel"
                name="phone"
                defaultValue={profile.phone || ""}
                placeholder="Your phone number"
                margin="normal"
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Address"
                name="address"
                defaultValue={profile.address || ""}
                placeholder="Your address"
                margin="normal"
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={isSavingProfile}
                sx={{ mt: 3 }}
              >
                {isSavingProfile ? (
                  <>
                    <CircularProgress
                      size={16}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account security: password + email */}
        <Card elevation={4}>
          <CardContent
            sx={{
              p: { xs: 2, sm: 4 },
              "&:last-child": { pb: { xs: 2, sm: 4 } },
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Change password
            </Typography>
            {hasPasswordProvider ? (
              <form onSubmit={handleChangePassword}>
                <TextField
                  fullWidth
                  label="Current password"
                  type="password"
                  name="currentPassword"
                  placeholder="Current password"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="New password"
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm new password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  margin="normal"
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={isChangingPassword}
                  sx={{ mt: 3 }}
                >
                  {isChangingPassword ? (
                    <>
                      <CircularProgress
                        size={16}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      Changing...
                    </>
                  ) : (
                    "Change password"
                  )}
                </Button>
              </form>
            ) : (
              <p className="text-sm opacity-70">
                You signed in with Google, so your password is managed by
                Google and cannot be changed here.
              </p>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" component="h2" gutterBottom>
              Change email
            </Typography>
            {hasPasswordProvider ? (
              <form onSubmit={handleChangeEmail}>
                <TextField
                  fullWidth
                  label="New email"
                  type="email"
                  name="newEmail"
                  placeholder="New email address"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Current password"
                  type="password"
                  name="currentPassword"
                  placeholder="Current password"
                  margin="normal"
                  required
                />
                <p className="text-sm opacity-70 mt-3">
                  A verification email will be sent to the new address. You
                  will be logged out and need to log in with the new email
                  after verifying it.
                </p>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={isChangingEmail}
                  sx={{ mt: 3 }}
                >
                  {isChangingEmail ? (
                    <>
                      <CircularProgress
                        size={16}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      Changing...
                    </>
                  ) : (
                    "Change email"
                  )}
                </Button>
              </form>
            ) : (
              <p className="text-sm opacity-70">
                You signed in with Google, so your email address is managed
                by Google and cannot be changed here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Borrow history */}
      <Card elevation={4} className="max-w-4xl mx-auto mt-6 mb-6">
        <CardContent
          sx={{
            p: { xs: 2, sm: 4 },
            "&:last-child": { pb: { xs: 2, sm: 4 } },
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Borrow history
          </Typography>
          {isHistoryLoading ? (
            <div className="flex justify-center my-8">
              <CircularProgress size={48} />
            </div>
          ) : isHistoryError ? (
            <div className="text-center my-8">
              <p className="font-bold">Could not load your borrow history</p>
              <Button
                variant="contained"
                size="small"
                onClick={() => refetchHistory()}
                sx={{ mt: 2 }}
              >
                Try again
              </Button>
            </div>
          ) : history.length === 0 ? (
            <p className="text-center my-8 opacity-70">
              You have not borrowed any books yet.
            </p>
          ) : (
            <>
              {/* Mobile: stacked cards (a 5-column table does not fit). */}
              <div className="md:hidden space-y-3">
                {history.map((record) => {
                  const status = getDueStatus(record);
                  const borderColor =
                    status === "overdue"
                      ? "error.main"
                      : status === "due-soon"
                      ? "warning.main"
                      : status === "returned"
                      ? "success.main"
                      : "divider";
                  return (
                    <Box
                      key={record._id}
                      sx={{
                        borderRadius: 2,
                        border: 1,
                        borderLeft: 4,
                        borderColor,
                        p: 1.5,
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-medium">{record.bookName}</div>
                        <DueBadge record={record} />
                      </div>
                      <div className="text-sm opacity-70">
                        by {record.author}
                      </div>
                      <div className="text-sm mt-2 space-y-0.5">
                        <p>Borrowed: {record.borrowedDate || "—"}</p>
                        <p>Due: {record.retunDate || "—"}</p>
                        <p>
                          Returned: {record.returnedDate || "Not returned"}
                        </p>
                      </div>
                      {record.extended && (
                        <Box sx={{ mt: 1.5 }}>
                          <Chip
                            label="Extended once"
                            color="info"
                            size="small"
                          />
                        </Box>
                      )}
                      {canExtendBorrow(record) && (
                        <Box sx={{ mt: 1.5 }}>
                          <ExtendBorrowButton
                            record={record}
                            onExtended={refetchHistory}
                          />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </div>
              {/* Desktop: the full table. Overdue rows are red,
                  due-soon rows are amber. */}
              <TableContainer className="hidden md:block">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Book</TableCell>
                      <TableCell>Borrowed</TableCell>
                      <TableCell>Due</TableCell>
                      <TableCell>Returned</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((record) => {
                      const status = getDueStatus(record);
                      // Theme-aware row tint: a soft red/amber wash that
                      // reads in both light and dark mode.
                      const rowBg =
                        status === "overdue"
                          ? (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(244, 67, 54, 0.25)"
                                : "rgba(244, 67, 54, 0.06)"
                          : status === "due-soon"
                          ? (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255, 152, 0, 0.25)"
                                : "rgba(255, 152, 0, 0.08)"
                          : undefined;
                      return (
                        <TableRow
                          key={record._id}
                          sx={{ backgroundColor: rowBg }}
                        >
                          <TableCell>
                            <div className="font-medium">
                              {record.bookName}
                            </div>
                            <div className="text-sm opacity-70">
                              by {record.author}
                            </div>
                          </TableCell>
                          <TableCell>{record.borrowedDate || "—"}</TableCell>
                          <TableCell>{record.retunDate || "—"}</TableCell>
                          <TableCell>
                            {record.returnedDate || "Not returned"}
                          </TableCell>
                          <TableCell>
                            <DueBadge record={record} />
                          </TableCell>
                          <TableCell>
                            {record.extended ? (
                              <Chip
                                label="Extended once"
                                color="info"
                                size="small"
                              />
                            ) : (
                              <ExtendBorrowButton
                                record={record}
                                onExtended={refetchHistory}
                              />
                            )}
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

      {/* My reservations */}
      <Card elevation={4} className="max-w-4xl mx-auto mt-6 mb-6">
        <CardContent
          sx={{
            p: { xs: 2, sm: 4 },
            "&:last-child": { pb: { xs: 2, sm: 4 } },
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            My reservations
          </Typography>
          {isReservationsLoading ? (
            <div className="flex justify-center my-8">
              <CircularProgress size={48} />
            </div>
          ) : isReservationsError ? (
            <div className="text-center my-8">
              <p className="font-bold">Could not load your reservations</p>
              <Button
                variant="contained"
                size="small"
                onClick={() => refetchReservations()}
                sx={{ mt: 2 }}
              >
                Try again
              </Button>
            </div>
          ) : myReservations.length === 0 ? (
            <p className="text-center my-8 opacity-70">
              You have no reservations. When a book is out of stock,
              reserve it from its details page to join the queue.
            </p>
          ) : (
            <div className="space-y-3">
              {myReservations.map((reservation) => (
                <Box
                  key={reservation._id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 1.5,
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <div className="font-medium">
                      {reservation.book.name}
                    </div>
                    <div className="text-sm opacity-70">
                      by {reservation.book.author}
                    </div>
                    <div className="text-sm mt-1">
                      Reserved {formatDate(reservation.createdAt)}
                    </div>
                  </Box>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Chip
                      label={`#${reservation.position} in the queue`}
                      color="primary"
                      size="small"
                    />
                    {Number(reservation.book.quantity) >= 1 && (
                      <Chip
                        label="Available now"
                        color="success"
                        size="small"
                      />
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        navigate(`/books-details/${reservation.bookId}`)
                      }
                    >
                      View book
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => setCancelTarget(reservation)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelReservation}
        title="Cancel your reservation?"
        message={
          cancelTarget
            ? `Your place in the queue for "${cancelTarget.book.name}" will be removed.`
            : ""
        }
        confirmLabel="Cancel reservation"
        confirmColor="error"
        busy={isCancelling}
        busyLabel="Cancelling..."
      />
    </div>
  );
};

export default Profile;
