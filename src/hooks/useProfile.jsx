import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";
import useAuth from "./useAuth";

// The caller's server profile (auto-created on first access). Role helpers
// are UI-only gating — the server enforces every permission.
const useProfile = () => {
  const axios = useAxios();
  const { user } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile", user?.email],
    queryFn: async () => {
      const res = await axios.get("/profile");
      return res.data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  const role = profile?.role || "member";
  return {
    profile,
    role,
    isLoading,
    isError,
    refetch,
    isAdmin: role === "admin",
    isLibrarian: role === "librarian",
    canManageBooks: role === "admin" || role === "librarian",
  };
};

export default useProfile;
