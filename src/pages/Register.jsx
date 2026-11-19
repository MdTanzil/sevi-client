import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const Register = () => {
  const { register, updateUserData, signUpWithGoogle } = useAuth();
  const axios = useAxios();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    const form = event.target;
    const name = form.name.value || "";
    const email = form.email.value || "";
    const photo = form.photo.value || "";
    const password = form.password.value || "";

    //Password Requarment check

    if (!/^.{6,20}$/.test(password)) {
      toast.error("Password should be contain 6 characters ");

      return;
    } else if (!/^.*[A-Z].*/.test(password)) {
      toast.error("Password should have a capital letter ");
      return;
    } else if (!/^.*[^A-Za-z0-9].*/.test(password)) {
      toast.error("Password should have a special character ");
      return;
    }
    setIsSubmitting(true);
    register(email, password)
      .then(() => {
        // Signed up — obtain the server JWT cookie right away, like Login
        // does, so the new user is logged in immediately instead of
        // hitting 401s on protected pages.
        axios.post("/jwt", { email: email }).then(() => {});
        event.target.reset();
        toast.success("Registrations Successful !");
        if (name && photo) {
          updateUserData(name, photo);
        } else if (name) {
          updateUserData(name, "");
        } else if (photo) {
          updateUserData("", photo);
        }
        navigate(location?.state ? location.state : "/");

        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        toast.error(errorCode);
        setIsSubmitting(false);
        // ..
      });
  };

  const googleClickHangler = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    signUpWithGoogle()
      .then((res) => {
        axios.post("/jwt", { email: res.user.email }).then(() => {});
        toast.success("Login successful");
        navigate(location?.state ? location.state : "/");
      })
      .catch((error) => {
        toast.error(error.code);
        setIsSubmitting(false);
      });
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
            color="primary"
            className="playfair"
            gutterBottom
          >
            Register now!
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              type="text"
              label="Name"
              placeholder="name"
              name="name"
              fullWidth
              margin="normal"
            />
            <TextField
              type="text"
              label="Photo Url"
              placeholder="photo url"
              name="photo"
              fullWidth
              margin="normal"
            />
            <TextField
              type="email"
              label="Email"
              placeholder="email"
              name="email"
              required
              fullWidth
              margin="normal"
            />
            <TextField
              type="password"
              label="Password"
              placeholder="password"
              name="password"
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
                  <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </Box>
          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            {" "}
            Already Have an account ?{" "}
            <Link component={RouterLink} to={"/login"} underline="hover">
              {" "}
              log in
            </Link>
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={googleClickHangler}
            disabled={isSubmitting}
            startIcon={<FcGoogle />}
            sx={{ mt: 3 }}
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
