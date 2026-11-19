import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import useProfile from "../hooks/useProfile";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import BookForm from "../components/BookForm";

const AddBook = () => {
  const axios = useAxios();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canManageBooks, isLoading: profileLoading } = useProfile();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get("/categories");
      return response.data;
    },
  });

  const handleAddBook = (book) => {
    setIsSubmitting(true);
    axios
      .post("/books", book)
      .then((res) => {
        if (res?.data?.insertedId) {
          toast.success("Book successfully inserted");

          navigate("/all-book", { state: { addpage: true } });
        } else {
          toast.error("Could not add the book. Please try again.");
          setIsSubmitting(false);
        }
      })
      .catch(() => {
        toast.error("Could not add the book. Please try again.");
        setIsSubmitting(false);
      });
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  // UI-only gating — the server enforces who can add books.
  if (!canManageBooks) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Librarians and admins only</p>
        <p className="mt-2">
          Only librarians and admins can add books to the library.
        </p>
        <Link to="/all-book" className="btn btn-sm btn-primary poppins mt-4">
          Browse books
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <span className="text-secondary">Add</span> Books
      </h1>
      <div className="mt-6">
        <BookForm
          categories={categories}
          isSubmitting={isSubmitting}
          submitLabel="Add Book"
          submittingLabel="Adding..."
          onSubmit={handleAddBook}
        />
      </div>
    </div>
  );
};

export default AddBook;
