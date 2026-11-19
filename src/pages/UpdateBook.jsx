import { Link, useNavigate, useParams } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import useProfile from "../hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
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
      <Box className="flex justify-center my-48">
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (isError || !book) {
    return (
      <Box className="my-48 text-center">
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Could not load this book
        </Typography>
        <Button
          variant="contained"
          size="small"
          sx={{ mt: 2 }}
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </Box>
    );
  }

  if (profileLoading) {
    return (
      <Box className="flex justify-center my-48">
        <CircularProgress size={56} />
      </Box>
    );
  }

  // UI-only gating — the server enforces who can update books.
  if (!canManageBooks) {
    return (
      <Box className="my-48 text-center">
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Librarians and admins only
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Only librarians and admins can update books in the library.
        </Typography>
        <Button
          component={Link}
          to="/all-book"
          variant="contained"
          size="small"
          sx={{ mt: 2 }}
        >
          Browse books
        </Button>
      </Box>
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
      <Typography
        component="h1"
        className="playfair"
        sx={{
          fontSize: { xs: "1.875rem", sm: "2.25rem" },
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        <Box component="span" sx={{ color: "secondary.main" }}>
          Update
        </Box>{" "}
        Books
      </Typography>
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
