import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookIcon from "@mui/icons-material/Book";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import useProfile from "../hooks/useProfile";

const DRAWER_WIDTH = 240;

// Dashboard sections. Users is a separate route (/admin/users); the rest
// are sections of /dashboard selected with the ?section= query param.
const SECTION_ITEMS = [
  { key: "overview", label: "Overview", icon: <DashboardIcon /> },
  { key: "books", label: "Books", icon: <BookIcon /> },
  { key: "borrows", label: "Borrowed Books", icon: <BookmarkIcon /> },
  { key: "categories", label: "Categories", icon: <CategoryIcon /> },
];

// Shared layout for the admin area: a left sidebar (permanent on md+,
// a temporary drawer behind a menu button on smaller screens) plus the
// page content. `active` is the highlighted item: a dashboard section
// key, or "users" on the user-management page. When `onSectionChange`
// is provided (the dashboard itself), section clicks switch in place;
// otherwise they link to /dashboard?section=<key>.
const DashboardLayout = ({ active, onSectionChange, children }) => {
  const { isAdmin } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((open) => !open);
  const handleDrawerClose = () => setMobileOpen(false);

  const handleSectionClick = (key) => {
    handleDrawerClose();
    if (onSectionChange) onSectionChange(key);
  };

  const sidebar = (
    <Box>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        {SECTION_ITEMS.map((item) => {
          const selected = active === item.key;
          const button = (
            <ListItemButton
              selected={selected}
              onClick={() => handleSectionClick(item.key)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { backgroundColor: "primary.dark" },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
          return (
            <ListItem key={item.key} disablePadding>
              {onSectionChange ? (
                button
              ) : (
                <Box
                  component={Link}
                  to={`/dashboard?section=${item.key}`}
                  onClick={handleDrawerClose}
                  sx={{
                    width: "100%",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {button}
                </Box>
              )}
            </ListItem>
          );
        })}
        {isAdmin && (
          <ListItem disablePadding>
            <Box
              component={Link}
              to="/admin/users"
              onClick={handleDrawerClose}
              sx={{ width: "100%", textDecoration: "none", color: "inherit" }}
            >
              <ListItemButton
                selected={active === "users"}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { backgroundColor: "primary.dark" },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            </Box>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", mt: 2, mb: 6 }}>
      {/* Desktop: permanent sidebar in the page flow. */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            position: "relative",
            height: "100%",
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        {sidebar}
      </Drawer>
      {/* Mobile: temporary drawer opened by the menu button below. */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {sidebar}
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 1, sm: 2 }, minWidth: 0 }}
      >
        <Box sx={{ display: { md: "none" }, mb: 1 }}>
          <IconButton
            onClick={handleDrawerToggle}
            aria-label="Open dashboard menu"
          >
            <MenuIcon />
          </IconButton>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

DashboardLayout.propTypes = {
  active: PropTypes.oneOf([
    "overview",
    "books",
    "borrows",
    "categories",
    "users",
  ]).isRequired,
  onSectionChange: PropTypes.func,
  children: PropTypes.node,
};

export default DashboardLayout;
