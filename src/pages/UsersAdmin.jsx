import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
import toast from "react-hot-toast";

const ROLES = ["member", "librarian", "admin"];

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
  const { user } = useAuth();
  const { isAdmin, isLoading: profileLoading } = useProfile();

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

  if (profileLoading) {
    return (
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
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
        <Link to="/all-book" className="btn btn-sm btn-primary poppins mt-4">
          Browse books
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Could not load users</p>
        <button
          className="btn btn-sm btn-primary poppins mt-4"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <span className="text-secondary">Manage</span> Users
      </h1>
      <div className="card bg-base-100 shadow-xl max-w-4xl mx-auto mt-6 mb-6">
        <div className="card-body p-4 sm:p-8">
          {users.length === 0 ? (
            <p className="text-center my-8 opacity-70">No users yet.</p>
          ) : (
            <>
              {/* Mobile: stacked cards (a 4-column table does not fit). */}
              <div className="md:hidden space-y-3">
                {users.map((member) => {
                  const isSelf =
                    member.email?.toLowerCase() ===
                    user?.email?.toLowerCase();
                  return (
                    <div
                      key={member.email}
                      className="rounded-lg border border-base-300 p-3"
                    >
                      <p className="font-medium">
                        {member.name || "—"}
                        {isSelf && (
                          <span className="badge badge-ghost ml-2">You</span>
                        )}
                      </p>
                      <p className="text-sm opacity-70 break-all">
                        {member.email}
                      </p>
                      <p className="text-sm opacity-70 mt-1">
                        Member since: {formatDate(member.createdAt)}
                      </p>
                      <select
                        className="select select-bordered select-sm capitalize w-full mt-3"
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
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
              {/* Desktop: the full table. */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Member since</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((member) => {
                      const isSelf =
                        member.email?.toLowerCase() ===
                        user?.email?.toLowerCase();
                      return (
                        <tr key={member.email}>
                          <td className="font-medium">
                            {member.name || "—"}
                            {isSelf && (
                              <span className="badge badge-ghost ml-2">You</span>
                            )}
                          </td>
                          <td className="break-all">{member.email}</td>
                          <td>{formatDate(member.createdAt)}</td>
                          <td>
                            <select
                              className="select select-bordered select-sm capitalize"
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
                            >
                              {ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersAdmin;
