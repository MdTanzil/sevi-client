import { useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import app from "../config/firrebase.config";
import toast from "react-hot-toast";

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
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content w-full px-4">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <h1 className="text-3xl sm:text-4xl playfair font-bold text-center my-4">
            Forgot password?
          </h1>
          {sent ? (
            <div className="card-body text-center">
              <p>
                We sent a password reset link to{" "}
                <span className="font-medium break-all">{email}</span>.
                Check your inbox (and spam folder) and follow the link to
                set a new password.
              </p>
              <Link to="/login" className="btn btn-primary mt-6">
                Back to login
              </Link>
            </div>
          ) : (
            <form className="card-body" onSubmit={handleSubmit}>
              <p className="text-sm opacity-70">
                Enter the email address you signed up with and we will send
                you a link to reset your password.
              </p>
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="input input-bordered focus:input-primary"
                  required
                />
              </div>
              <div className="form-control mt-6">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </div>
              <p className="text-center mt-4">
                <Link to="/login" className="link link-primary">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
