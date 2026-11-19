import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logo.png";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
import toast from "react-hot-toast";
import SafeImage from "./SafeImage";
import NotificationBell from "./NotificationBell";

const NavBar = () => {
  const { user, logout, setUser, loading } = useAuth();
  const { canManageBooks, isAdmin } = useProfile();
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

  // Single source of truth for the nav links — rendered in the desktop
  // menu, in the avatar dropdown on mobile, and in the logged-out mobile
  // hamburger menu.
  const links = [
    { to: "/", label: "Home", show: true },
    { to: "/all-book", label: "All Book", show: true },
    { to: "/about", label: "About", show: true },
    { to: "/faq", label: "FAQ", show: true },
  ].filter((link) => link.show);

  // Logged-in-only links — these live in the avatar dropdown, not in the
  // main menu.
  const accountLinks = [
    { to: "/dashboard", label: "Dashboard", show: canManageBooks },
    { to: "/borrowed-book", label: "Borrowed Book", show: true },
    { to: "/wishlist", label: "Wishlist", show: true },
  ].filter((link) => link.show);

  const navLinkClass = ({ isActive, isPending }) =>
    isPending
      ? "pending px-3 py-2 rounded-md"
      : `px-3 py-2 rounded-md ${isActive ? "bg-[#723182] text-white" : ""}`;

  // Active-route highlight for links rendered inside MUI menus — NavLink
  // resolves the style function; MUI passes it through to the anchor.
  const menuLinkStyle = ({ isActive }) =>
    isActive ? { backgroundColor: "#723182", color: "#fff" } : undefined;

  // The same links as menu items; `mobileOnly` hides them on desktop
  // (the avatar dropdown) — the logged-out hamburger menu is itself
  // mobile-only, so its copies stay visible.
  const navMenuItems = (closeMenu, mobileOnly) =>
    links.map((link) => (
      <MenuItem
        key={link.to}
        component={NavLink}
        to={link.to}
        onClick={closeMenu}
        style={menuLinkStyle}
        sx={mobileOnly ? { display: { lg: "none" } } : undefined}
      >
        {link.label}
      </MenuItem>
    ));

  const handleAvatarOpen = (event) => setAvatarAnchorEl(event.currentTarget);
  const handleAvatarClose = () => setAvatarAnchorEl(null);
  const handleMobileOpen = (event) => setMobileAnchorEl(event.currentTarget);
  const handleMobileClose = () => setMobileAnchorEl(null);

  const handleLogOut = () => {
    logout()
      .then(() => {
        // Sign-out successful.
        toast.success("Log-out successful");
        setUser(null);
      })
      .catch(() => {
        toast.error("Log-out unsuccessful");
      });
  };

  // Avatar image: photo when the account has one, otherwise the first
  // letter of the display name (or email).
  const avatarImage = user?.photoURL ? (
    <SafeImage
      className="w-10 h-10 rounded-full object-cover"
      src={user.photoURL}
      alt={user.displayName || user.email}
      iconClassName="w-5 h-5 opacity-60"
    />
  ) : (
    <span className="text-lg">
      {(user?.displayName || user?.email || "?")[0]}
    </span>
  );

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{ bgcolor: "background.paper", color: "text.primary" }}
    >
      <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
            }}
          >
            <img src={logo} alt="Sevi logo" />{" "}
            <Typography
              component="span"
              sx={{
                color: "primary.main",
                fontSize: "1.25rem",
                fontWeight: 500,
              }}
            >
              Sevi
            </Typography>{" "}
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            gap: 0.5,
            alignItems: "center",
          }}
        >
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          {user?.displayName && (
            <Typography
              component="p"
              sx={{
                color: "primary.main",
                fontSize: "0.875rem",
                mr: 1,
                display: { xs: "none", sm: "block" },
              }}
            >
              Hello ! {user.displayName}
            </Typography>
          )}
          {user && <NotificationBell />}
          {user && (
            <>
              <IconButton
                onClick={handleAvatarOpen}
                sx={{ p: 0 }}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={Boolean(avatarAnchorEl)}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                  color="success"
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "grey.200",
                    }}
                  >
                    {avatarImage}
                  </Box>
                </Badge>
              </IconButton>
              <Menu
                anchorEl={avatarAnchorEl}
                open={Boolean(avatarAnchorEl)}
                onClose={handleAvatarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {/* Mobile only: on small screens the nav links live in this
                    dropdown — there is no separate hamburger menu. */}
                {navMenuItems(handleAvatarClose, true)}
                <Divider sx={{ display: { lg: "none" }, my: 0.5 }} />
                {/* Account links live in this dropdown, not in the main
                    menu. */}
                {accountLinks.map((link) => (
                  <MenuItem
                    key={link.to}
                    component={NavLink}
                    to={link.to}
                    onClick={handleAvatarClose}
                    style={menuLinkStyle}
                  >
                    {link.label}
                  </MenuItem>
                ))}
                {/* Admin only: user management lives in this dropdown, not
                    in the main menu. */}
                {isAdmin && (
                  <MenuItem
                    component={Link}
                    to="/admin/users"
                    onClick={handleAvatarClose}
                  >
                    Users
                  </MenuItem>
                )}
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleAvatarClose}
                >
                  My Profile
                </MenuItem>
                <MenuItem onClick={handleAvatarClose}>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    fullWidth
                    onClick={handleLogOut}
                  >
                    LogOut
                  </Button>
                </MenuItem>
              </Menu>
            </>
          )}
          {/* While Firebase is still resolving the auth state, show a neutral
              placeholder instead of the Login button — otherwise signed-in
              users briefly see a Login flash on every page load. */}
          {loading ? (
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              aria-hidden="true"
            />
          ) : (
            !user && (
              <>
                {/* Mobile: a single hamburger on the right, with the nav
                    links and Login inside its dropdown. */}
                <IconButton
                  onClick={handleMobileOpen}
                  aria-label="Open menu"
                  aria-haspopup="menu"
                  aria-expanded={Boolean(mobileAnchorEl)}
                  sx={{ display: { lg: "none" } }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={mobileAnchorEl}
                  open={Boolean(mobileAnchorEl)}
                  onClose={handleMobileClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {navMenuItems(handleMobileClose, false)}
                  <MenuItem
                    component={Link}
                    to="/login"
                    onClick={handleMobileClose}
                  >
                    Login
                  </MenuItem>
                </Menu>
                {/* Desktop: a plain Login button (the menu is already
                    visible in the center). */}
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  color="primary"
                  sx={{ display: { xs: "none", lg: "inline-flex" } }}
                >
                  Login
                </Button>
              </>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
