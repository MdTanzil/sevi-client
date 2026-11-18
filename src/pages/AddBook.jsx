import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import BookForm from "../components/BookForm";

const AddBook = () => {
  const axios = useAxios();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  return (
    <div className="mt-5">
      <h1 className="text-4xl text-center font-bold playfair">
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
