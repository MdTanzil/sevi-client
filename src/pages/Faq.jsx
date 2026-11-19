import { Link } from "react-router-dom";

const FAQS = [
  {
    question: "How do I borrow a book?",
    answer:
      "Open any book, press Borrow, and pick a return date. The book appears on your Borrowed Books page, and your profile keeps the full history.",
  },
  {
    question: "How long can I keep a borrowed book?",
    answer:
      "Books can be borrowed for up to 5 days. When you borrow, the return date picker only lets you pick a date within the next 5 days.",
  },
  {
    question: "How many books can I borrow at once?",
    answer:
      "Up to 3 books at a time. Once you have 3 active borrows, the Borrow button is disabled until you return one.",
  },
  {
    question: "What happens if I return a book late?",
    answer:
      "Your profile history highlights overdue books in red, and books due today or tomorrow in amber. There are no fines in Sevi — just return the book as soon as you can so others can borrow it.",
  },
  {
    question: "How do I return a book?",
    answer:
      "Go to Borrowed Books and press Return on the book. The record stays in your borrow history with the date you returned it.",
  },
  {
    question: "What is the virtual membership card?",
    answer:
      "Every member has a card on their profile page showing their name, role, member-since date, and how many books they currently have borrowed (out of 3).",
  },
  {
    question: "What are the member, librarian, and admin roles?",
    answer:
      "Members browse, borrow, and return books. Librarians can also add and update books in the catalogue. Admins manage members and their roles. An admin can change your role from the Users page.",
  },
  {
    question: "How do I change my password or email?",
    answer:
      "If you signed up with email and password, you can change both from your profile page. If you signed in with Google, your password and email are managed by Google instead.",
  },
  {
    question: "I forgot my password. What do I do?",
    answer:
      "Use the Forgot password link on the login page. We will email you a link to set a new password.",
  },
  {
    question: "How do I become a member?",
    answer:
      "Create a free account from the Register page — with an email and password, or with Google. Your membership card is created automatically.",
  },
];

const Faq = () => {
  return (
    <div className="mt-5 max-w-3xl mx-auto">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <span className="text-secondary">Frequently Asked</span> Questions
      </h1>
      <p className="text-center mt-4 opacity-80">
        Everything about borrowing, returning, and your membership. Still
        stuck?{" "}
        <Link to="/contact" className="link link-primary">
          Contact us
        </Link>
        .
      </p>
      <div className="mt-8 mb-6 space-y-3">
        {FAQS.map((faq) => (
          <div
            key={faq.question}
            className="collapse collapse-arrow bg-base-100 shadow-xl"
          >
            <input type="checkbox" />
            <div className="collapse-title text-base sm:text-lg font-medium">
              {faq.question}
            </div>
            <div className="collapse-content">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
