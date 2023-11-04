import { Link } from "react-router-dom";


const Login = () => {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content w-full  ">
          <div className="card  w-full max-w-sm shadow-2xl bg-base-100">
            <h1 className="text-4xl playfair font-bold text-center my-4">
              Login now!
            </h1>

            <form className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email"
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="password"
                  className="input input-bordered"
                  required
                />
                <label className="label">
                  <a href="#" className="label-text-alt link link-hover">
                    Forgot password?
                  </a>
                </label>
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary">Login</button>
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
            <div className="card-body"></div>
          </div>
        </div>
      </div>
    );
};

export default Login;