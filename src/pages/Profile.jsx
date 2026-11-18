import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
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

  // Password changes and email changes go through Firebase, so they only
  // work for accounts that signed up with email and password. Google
  // accounts manage both in their Google account instead.
  const providers = user?.providerData?.map((p) => p.providerId) || [];
  const hasPasswordProvider = providers.includes("password");

  if (isLoading) {
    return (
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Could not load your profile</p>
        <button
          className="btn btn-sm btn-primary poppins mt-4"
          onClick={() => refetch()}
        >
          Try again
        </button>
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
      <h1 className="text-4xl text-center font-bold playfair">
        <span className="text-secondary">My</span> Profile
      </h1>

      {/* Virtual membership card */}
      <div className="card bg-gradient-to-r from-primary to-secondary text-white shadow-xl max-w-2xl mx-auto mt-6">
        <div className="card-body">
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
            <span className="badge bg-white/20 border-white/40 text-white capitalize shrink-0">
              {profile.role}
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-2 mt-4 text-sm">
            <span>Member since: {formatDate(profile.createdAt)}</span>
            <span>
              Borrowed: {activeBorrows.length}/{MAX_ACTIVE_BORROWS} books
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
        {/* Edit profile */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Edit profile</h2>
            <form key={profile.email} onSubmit={handleUpdateProfile}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={profile.name || ""}
                  placeholder="Your name"
                  className="input input-bordered focus:input-primary"
                />
              </div>
              <div className="form-control mt-3">
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={profile.phone || ""}
                  placeholder="Your phone number"
                  className="input input-bordered focus:input-primary"
                />
              </div>
              <div className="form-control mt-3">
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                <textarea
                  name="address"
                  defaultValue={profile.address || ""}
                  placeholder="Your address"
                  className="textarea textarea-bordered focus:textarea-primary h-24"
                ></textarea>
              </div>
              <div className="form-control mt-6">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account security: password + email */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Change password</h2>
            {hasPasswordProvider ? (
              <form onSubmit={handleChangePassword}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Current password</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Current password"
                    className="input input-bordered focus:input-primary"
                    required
                  />
                </div>
                <div className="form-control mt-3">
                  <label className="label">
                    <span className="label-text">New password</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New password"
                    className="input input-bordered focus:input-primary"
                    required
                  />
                </div>
                <div className="form-control mt-3">
                  <label className="label">
                    <span className="label-text">Confirm new password</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    className="input input-bordered focus:input-primary"
                    required
                  />
                </div>
                <div className="form-control mt-6">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Changing...
                      </>
                    ) : (
                      "Change password"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm opacity-70">
                You signed in with Google, so your password is managed by
                Google and cannot be changed here.
              </p>
            )}

            <div className="divider"></div>

            <h2 className="card-title">Change email</h2>
            {hasPasswordProvider ? (
              <form onSubmit={handleChangeEmail}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">New email</span>
                  </label>
                  <input
                    type="email"
                    name="newEmail"
                    placeholder="New email address"
                    className="input input-bordered focus:input-primary"
                    required
                  />
                </div>
                <div className="form-control mt-3">
                  <label className="label">
                    <span className="label-text">Current password</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Current password"
                    className="input input-bordered focus:input-primary"
                    required
                  />
                </div>
                <p className="text-sm opacity-70 mt-3">
                  A verification email will be sent to the new address. You
                  will be logged out and need to log in with the new email
                  after verifying it.
                </p>
                <div className="form-control mt-6">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isChangingEmail}
                  >
                    {isChangingEmail ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Changing...
                      </>
                    ) : (
                      "Change email"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm opacity-70">
                You signed in with Google, so your email address is managed
                by Google and cannot be changed here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Borrow history */}
      <div className="card bg-base-100 shadow-xl max-w-4xl mx-auto mt-6 mb-6">
        <div className="card-body">
          <h2 className="card-title">Borrow history</h2>
          {isHistoryLoading ? (
            <div className="flex justify-center my-8">
              <span className="loading loading-bars loading-lg"></span>
            </div>
          ) : isHistoryError ? (
            <div className="text-center my-8">
              <p className="font-bold">Could not load your borrow history</p>
              <button
                className="btn btn-sm btn-primary poppins mt-4"
                onClick={() => refetchHistory()}
              >
                Try again
              </button>
            </div>
          ) : history.length === 0 ? (
            <p className="text-center my-8 opacity-70">
              You have not borrowed any books yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Borrowed</th>
                    <th>Due</th>
                    <th>Returned</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <div className="font-medium">{record.bookName}</div>
                        <div className="text-sm opacity-70">
                          by {record.author}
                        </div>
                      </td>
                      <td>{record.borrowedDate || "—"}</td>
                      <td>{record.retunDate || "—"}</td>
                      <td>{record.returnedDate || "Not returned"}</td>
                      <td>
                        {record.status === "returned" ? (
                          <span className="badge badge-success">Returned</span>
                        ) : (
                          <span className="badge badge-warning">Borrowed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
