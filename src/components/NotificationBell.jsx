import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import toast from "react-hot-toast";

// Bell icon in the navbar: shows the unread notification count and a
// dropdown with the latest notifications (currently: restock alerts for
// wishlisted books). Clicking a notification marks it read and opens the
// book's details page.
const NotificationBell = () => {
  const axios = useAxios();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axios.get("/notifications");
      return res.data;
    },
    enabled: !!user,
    // Keep the badge fresh without a manual refresh.
    refetchInterval: 60 * 1000,
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const handleOpen = async (notification) => {
    if (!notification.read) {
      try {
        await axios.patch(`/notifications/${notification._id}/read`);
        refresh();
      } catch (error) {
        // The notification still opens — marking it read is secondary.
      }
    }
    // Move focus away so the dropdown closes before navigating.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    navigate(`/books-details/${notification.bookId}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch("/notifications/read-all");
      refresh();
    } catch (error) {
      toast.error("Could not mark notifications as read.");
    }
  };

  if (!user) return null;

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-circle"
        aria-label="Notifications"
      >
        <div className="indicator">
          <FaBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="badge badge-secondary badge-sm indicator-item">
              {unreadCount}
            </span>
          )}
        </div>
      </label>
      <div
        tabIndex={0}
        className="dropdown-content z-[1] card card-compact w-80 max-w-[calc(100vw-2rem)] p-2 shadow bg-base-100 mt-3"
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="btn btn-ghost btn-xs"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm opacity-70 py-2">
              No notifications yet. When a wishlisted book is back in
              stock, you will see it here.
            </p>
          ) : (
            <ul className="menu p-0 max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification._id}>
                  <button
                    onClick={() => handleOpen(notification)}
                    className={`text-left ${
                      notification.read ? "opacity-60" : "font-medium"
                    }`}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span>{notification.message}</span>
                      <span className="text-xs opacity-70">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </span>
                    {!notification.read && (
                      <span className="badge badge-secondary badge-xs ml-auto">
                        New
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
