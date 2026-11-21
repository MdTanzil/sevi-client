import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import useAxios from "../hooks/useAxios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// Public demo accounts so visitors can try Sevi without signing up.
// Both exist in Firebase Auth and have server profiles (the admin one
// was promoted to role "admin" via the API). Keep the passwords in sync
// with the accounts if they ever change.
const DEMO_ACCOUNTS = [
  {
    label: "Demo Admin",
    description:
      "Manage books, categories, borrows and users from the dashboard",
    email: "admin@sevi-demo.com",
    password: "Demo1234!",
  },
  {
    label: "Demo Member",
    description: "Borrow books, keep a wishlist, and track your history",
    email: "member@sevi-demo.com",
    password: "Demo1234!",
  },
];

const Login = () => {
    const { signUpWithGoogle, login ,setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation()
    const axios = useAxios()
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Shared by the form and the one-click demo buttons.
    const signInWithCredentials = (email, password) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        login(email, password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            setUser(user)
            axios.post('/jwt',{email : email}).then(() => {})


            toast.success(user?.email + " Log in success");
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

    const handleLogin = (event)=>{
        event.preventDefault();
        const email = event.target.email.value || ''
        const password = event.target.password.value ||''
        signInWithCredentials(email, password);
    }





    //google login
    const googleClickHandler = () => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      signUpWithGoogle()
        .then((res) => {
          const email = { email: res.user.email }
          axios.post("/jwt", email).then(() => {})
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
          backgroundColor: "background.default",
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
              Login now!
            </Typography>

            <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
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
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  underline="hover"
                  variant="body2"
                >
                  Forgot password?
                </Link>
              </Box>
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
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </Box>
            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              {" "}
              Do not Have an account yet?{" "}
              <Link component={RouterLink} to={"/register"} underline="hover">
                {" "}
                create account
              </Link>
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={googleClickHandler}
              disabled={isSubmitting}
              startIcon={<FcGoogle />}
              sx={{ mt: 3 }}
            >
              Sign in with Google
            </Button>

            {/* Public demo accounts — one click signs in, no sign-up
                needed. The credentials are shown so visitors can also
                type them into the form above. */}
            <Divider sx={{ mt: 3 }}>Try the demo</Divider>
            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 1.5, opacity: 0.7 }}
            >
              No sign-up needed — explore Sevi with a demo account.
            </Typography>
            {DEMO_ACCOUNTS.map((account) => (
              <Box
                key={account.email}
                sx={{
                  mt: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {account.label}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {account.description}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, fontFamily: "monospace", fontSize: "0.85rem" }}
                >
                  {account.email} · {account.password}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() =>
                    signInWithCredentials(account.email, account.password)
                  }
                  disabled={isSubmitting}
                  sx={{ mt: 1.5 }}
                >
                  Sign in as {account.label}
                </Button>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
};

export default Login;
