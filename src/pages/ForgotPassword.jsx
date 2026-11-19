import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import app from "../config/firrebase.config";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const auth = getAuth(app);
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
      toast.success("Password reset email sent");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with that email address");
      } else if (error.code === "auth/invalid-email") {
        toast.error("That email address is not valid");
      } else {
        toast.error(error.code || "Could not send the reset email");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "grey.100",
        px: 2,
        py: 4,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 448 }} elevation={6}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            align="center"
            fontWeight="bold"
            className="playfair"
            gutterBottom
          >
            Forgot password?
          </Typography>
          {sent ? (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body1">
                We sent a password reset link to{" "}
                <Box
                  component="span"
                  sx={{ fontWeight: 500, wordBreak: "break-all" }}
                >
                  {email}
                </Box>
                . Check your inbox (and spam folder) and follow the link to
                set a new password.
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
              >
                Back to login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Enter the email address you signed up with and we will send
                you a link to reset your password.
              </Typography>
              <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                required
                fullWidth
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting}
                sx={{ mt: 3 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress
                      size={16}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
              <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                <Link component={RouterLink} to="/login" underline="hover">
                  Back to login
                </Link>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
