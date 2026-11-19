import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
import DashboardLayout from "../components/DashboardLayout";
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
      <Card elevation={4} className="max-w-4xl mx-auto mt-6 mb-6">
        <CardContent
          sx={{
            p: { xs: 2, sm: 4 },
            "&:last-child": { pb: { xs: 2, sm: 4 } },
          }}
        >
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
                      className="rounded-lg border border-gray-300 p-3"
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
                    </div>
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
                    </TableRow>
                  </TableHead>
                  <TableBody
                    sx={{
                      "& .MuiTableRow-root:nth-of-type(odd)": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {users.map((member) => {
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
    </DashboardLayout>
  );
};

export default UsersAdmin;
