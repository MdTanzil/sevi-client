/* eslint-disable no-unused-vars */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import useAxios from "../hooks/useAxios";

const Login = () => {
    const { signUpWithGoogle, login ,setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation()
    const axios = useAxios()

    const handleLogin = (event)=>{
        event.preventDefault();
        const email = event.target.email.value || ''
        const password = event.target.password.value ||''
        login(email, password)
          .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            setUser(user)
            axios.post('/jwt',{email : email}).then(res =>{
              console.log('cookie set');
            })


            toast.success(user?.email + " Log in success");
            navigate(location?.state ? location.state : "/");
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            toast.error(errorCode);
            // ..
          });


    }





    //google login
    const googleClickHandler = () => {
      signUpWithGoogle()
        .then((res) => {
          const email = { email: res.user.email }
          axios.post("/jwt", email).then((res) => {
            console.log("cookie set");
          })
          toast.success("Login successful");
          navigate(location?.state ? location.state : "/");
        })
        .catch((error) => {
          toast.error(error.code);
        });
    };
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content w-full  ">
          <div className="card  w-full max-w-sm shadow-2xl bg-base-100">
            <h1 className="text-4xl playfair font-bold text-center my-4">
              Login now!
            </h1>

            <form className="card-body" onSubmit={handleLogin}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email"
                  className="input input-bordered focus:input-primary"
                  name="email"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  className="input input-bordered focus:input-primary"
                  required
                />
                <label className="label">
                  <a href="#" className="label-text-alt link link-hover">
                    Forgot password?
                  </a>
                </label>
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary" type="submit">
                  Login
                </button>
              </div>
            </form>
            <p className="px-4">
              {" "}
              Do not Have an account yet?{" "}
              <Link to={"/register"} className="link link-primary">
                {" "}
                create account
              </Link>
            </p>
            <div className="card-body">
              <button
                className="btn hover:btn-primary"
                onClick={googleClickHandler}
              >
                Sign in with Google
                <FcGoogle></FcGoogle>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Login;