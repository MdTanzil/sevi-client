import { Link, useNavigate, useParams } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import useProfile from "../hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import BookForm from "../components/BookForm";

const UpdateBook = () => {
  const axios = useAxios();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canManageBooks, isLoading: profileLoading } = useProfile();

  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get("/categories");
      return response.data;
    },
  });
  const { id } = useParams();
  const books = async () => {
    const res = await axios.get(`/single-book/${id}`);
    return res.data;
  };
  const { data: book, isLoading, isError, refetch } = useQuery({
    queryKey: ["single-book"],
    queryFn: books,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Could not load this book</p>
        <button
          className="btn btn-sm btn-primary poppins mt-4"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  // UI-only gating — the server enforces who can update books.
  if (!canManageBooks) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Librarians and admins only</p>
        <p className="mt-2">
          Only librarians and admins can update books in the library.
        </p>
        <Link to="/all-book" className="btn btn-sm btn-primary poppins mt-4">
          Browse books
        </Link>
      </div>
    );
  }

  const handleUpdate = (updatedBook) => {
    setIsSubmitting(true);
    axios
      .put(`/books/${id}`, updatedBook)
      .then((response) => {
        if (response.data.modifiedCount) {
          toast.success("Book updated successfully");
        } else {
          toast.success("No changes to save");
        }
        navigate(`/books-details/${id}`);
      })
      .catch(() => {
        toast.error("Could not update the book. Please try again.");
        setIsSubmitting(false);
      });
  };
  return (
    <div className="mt-5">
      <h1 className="text-4xl text-center font-bold playfair">
        <span className="text-secondary">Update</span> Books
      </h1>
      <div className="mt-6">
        <BookForm
          key={id}
          initialBook={book}
          categories={categories}
          isSubmitting={isSubmitting}
          submitLabel="Update Book"
          submittingLabel="Updating..."
          onSubmit={handleUpdate}
        />
      </div>
    </div>
  );
};

export default UpdateBook;
