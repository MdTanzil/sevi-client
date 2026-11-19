import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Sevi has no support mailbox yet, so messages go to the project's public
// issue tracker — a real channel the maintainer actually reads.
const ISSUES_URL = "https://github.com/MdTanzil/sevi-client/issues/new";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = `Contact: ${name || "Sevi member"}`;
    const body = `**From:** ${name}\n**Email:** ${email}\n\n${message}`;
    const url = `${ISSUES_URL}?title=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Your message is ready to send — press Submit on GitHub.");
  };

  return (
    <div className="mt-5 max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <span className="text-secondary">Contact</span> us
      </h1>
      <p className="text-center mt-4 opacity-80 max-w-2xl mx-auto">
        Questions about your membership, a book, or a problem with the site?
        Send us a message — most questions are already answered on the{" "}
        <Link to="/faq" className="link link-primary">
          FAQ page
        </Link>
        .
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 mb-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4 sm:p-8">
            <h2 className="card-title">Send a message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="input input-bordered focus:input-primary"
                  required
                />
              </div>
              <div className="form-control mt-3">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="input input-bordered focus:input-primary"
                  required
                />
              </div>
              <div className="form-control mt-3">
                <label className="label">
                  <span className="label-text">Message</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  className="textarea textarea-bordered focus:textarea-primary h-32"
                  required
                ></textarea>
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary" type="submit">
                  Send message
                </button>
              </div>
              <p className="text-sm opacity-70 mt-3">
                Sending opens the Sevi issue tracker with your message
                filled in — press Submit there to deliver it.
              </p>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Members</h2>
              <p>
                Borrowing questions, overdue books, or role requests are
                fastest through your librarian — or check your profile page
                for your current loans and due dates.
              </p>
              <div className="card-actions mt-2">
                <Link to="/profile" className="btn btn-sm btn-outline btn-primary">
                  My Profile
                </Link>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Report a problem</h2>
              <p>
                Found a bug or a book with wrong details? You can also open
                an issue directly on the Sevi GitHub repository.
              </p>
              <div className="card-actions mt-2">
                <a
                  href="https://github.com/MdTanzil/sevi-client/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline btn-primary"
                >
                  Open GitHub issues
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
