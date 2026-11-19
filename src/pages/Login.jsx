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
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const Login = () => {
    const { signUpWithGoogle, login ,setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation()
    const axios = useAxios()
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = (event)=>{
        event.preventDefault();
        if (isSubmitting) return;
        const email = event.target.email.value || ''
        const password = event.target.password.value ||''
        setIsSubmitting(true);
        login(email, password)
          .then((userCredential) => {
            // Signed up
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
          </CardContent>
        </Card>
      </Box>
    );
};

export default Login;
