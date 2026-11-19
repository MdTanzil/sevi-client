import { PropTypes } from "prop-types";
import { Link } from "react-router-dom";

// Short, plain-language legal pages for this small library app. Each
// route (/terms, /privacy, /cookies) shows one section, with links to
// the other two.
const SECTIONS = {
  terms: {
    title: "Terms of use",
    body: (
      <>
        <p>
          Sevi is a library management system. By creating an account and
          using the site, you agree to use it fairly: borrow books you
          intend to read, return them by the due date (within 5 days), and
          do not misuse other members&apos; accounts or the catalogue.
        </p>
        <p>
          Members may borrow up to 3 books at a time. Librarians and admins
          manage the catalogue and member roles. Accounts that abuse the
          service may have their roles changed or their access removed by an
          admin.
        </p>
        <p>
          The catalogue data (book details, covers, and availability) is
          provided as-is for the library&apos;s own members. Sevi is a
          small community project and may change or stop at any time.
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy policy",
    body: (
      <>
        <p>
          Sevi stores the details you give us: your name, email address,
          phone number, and address (if you add them), plus your borrow
          history — which books you borrowed, when they were due, and when
          you returned them. This data runs the library: it is how we know
          who has which book.
        </p>
        <p>
          Sign-in is handled by Firebase Authentication (Google). Your
          password is never stored by Sevi — Firebase manages it, or Google
          does if you sign in with Google.
        </p>
        <p>
          We do not sell your data, share it with advertisers, or use it
          for anything other than running this library. Librarians and
          admins can see member names, emails, and roles so they can run
          the library. You can update your name, phone, and address from
          your profile page at any time.
        </p>
      </>
    ),
  },
  cookies: {
    title: "Cookie policy",
    body: (
      <>
        <p>
          Sevi uses one essential cookie: a session cookie that keeps you
          signed in while you browse the library. It is set when you log in
          and cleared when you log out. Without it, the site cannot tell
          that you are signed in.
        </p>
        <p>
          Firebase Authentication may also store sign-in state in your
          browser so you stay signed in between visits. Sevi does not use
          advertising cookies or third-party tracking cookies.
        </p>
        <p>
          You can clear cookies in your browser settings at any time — you
          will simply need to sign in again.
        </p>
      </>
    ),
  },
};

const Legal = ({ section = "terms" }) => {
  const current = SECTIONS[section] || SECTIONS.terms;
  return (
    <div className="mt-5 max-w-3xl mx-auto">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <span className="text-secondary">Sevi</span> {current.title}
      </h1>
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {Object.entries(SECTIONS).map(([key, value]) => (
          <Link
            key={key}
            to={`/${key === "terms" ? "terms" : key}`}
            className={`btn btn-sm ${
              key === section ? "btn-primary" : "btn-outline btn-primary"
            }`}
          >
            {value.title}
          </Link>
        ))}
      </div>
      <div className="card bg-base-100 shadow-xl mt-6 mb-6">
        <div className="card-body p-4 sm:p-8 space-y-4">{current.body}</div>
      </div>
    </div>
  );
};

Legal.propTypes = {
  section: PropTypes.oneOf(["terms", "privacy", "cookies"]),
};

export default Legal;
