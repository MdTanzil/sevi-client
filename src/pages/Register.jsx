import { Link, useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const { register, updateUserData, signUpWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value || "";
    const email = form.email.value || "";
    const photo = form.photo.value || "";
    const password = form.password.value || "";
    // const user ={
    //     name: name,
    //     email: email,
    //     photo: photo,
    //     password:password
    // }

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
    register(email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.log(user);
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
        const errorMessage = error.message;
        console.warn(errorMessage, errorCode);
        toast.error(errorCode);
        // ..
      });
  };

  const googleClickHangler = () => {
    signUpWithGoogle()
      .then(() => {
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
          <h1 className="text-4xl playfair font-bold text-center my-4 text-primary">
            Register now!
          </h1>

          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="name"
                name="name"
                className="input input-bordered focus:input-primary"
                
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Photo Url</span>
              </label>
              <input
                type="text"
                placeholder="photo url"
                className="input input-bordered focus:input-primary"
                name="photo"
                
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                name="email"
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text ">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                name="password"
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit">
                Register
              </button>
            </div>
          </form>
          <p className="px-7  pt-4">
            {" "}
            Already Have an account ?{" "}
            <Link className="link link-primary" to={"/login"}>
              {" "}
              log in
            </Link>
          </p>
          <div className="card-body py-5">
            <button
              className="btn hover:btn-primary"
              onClick={googleClickHangler}
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

export default Register;
