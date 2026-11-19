import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import useProfile from "../hooks/useProfile";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
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
      <Box className="flex justify-center my-48">
        <CircularProgress size={56} />
      </Box>
    );
  }

  // UI-only gating — the server enforces who can add books.
  if (!canManageBooks) {
    return (
      <Box className="my-48 text-center">
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Librarians and admins only
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Only librarians and admins can add books to the library.
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
          Add
        </Box>{" "}
        Books
      </Typography>
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
