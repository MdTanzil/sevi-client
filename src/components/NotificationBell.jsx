import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import toast from "react-hot-toast";

// Bell icon in the navbar: shows the unread notification count and a
// dropdown with the latest notifications (restock alerts for wishlisted
// books, and reservation alerts when a reserved book is back).
// Clicking a notification marks it read and opens the book's details
// page.
const NotificationBell = () => {
  const axios = useAxios();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = async (notification) => {
    if (!notification.read) {
      try {
        await axios.patch(`/notifications/${notification._id}/read`);
        refresh();
      } catch (error) {
        // The notification still opens — marking it read is secondary.
      }
    }
    // Close the menu before navigating.
    handleMenuClose();
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
    <>
      <IconButton
        color="inherit"
        aria-label="Notifications"
        onClick={handleMenuOpen}
        aria-controls={menuOpen ? "notifications-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : undefined}
      >
        <Badge badgeContent={unreadCount} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxWidth: "calc(100vw - 2rem)",
              mt: 1.5,
              p: 1,
            },
          },
          list: {
            sx: { maxHeight: 320, overflowY: "auto", p: 0 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
            pb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 1 }}>
            No notifications yet. When a wishlisted book is back in
            stock, you will see it here.
          </Typography>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleOpen(notification)}
              sx={{
                alignItems: "flex-start",
                whiteSpace: "normal",
                opacity: notification.read ? 0.6 : 1,
                fontWeight: notification.read ? 400 : 500,
              }}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
              >
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {!notification.read && (
                <Chip
                  label="New"
                  color="secondary"
                  size="small"
                  sx={{ ml: "auto" }}
                />
              )}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
