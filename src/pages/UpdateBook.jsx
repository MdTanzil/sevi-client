import { useNavigate, useParams } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

const UpdateBook = () => {
  const axios = useAxios();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const bookCat = book.category;

  const handleUpdate = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    // get all data

    const name = e.target.bookName.value || "";
    const author = e.target.authorName.value || "";

    const quantity = e.target.bookQuantity.value || "";

    const imageUrl = e.target.bookImageUrl.value || "";

    const category = e.target.bookCategory.value || "";
    const rating = e.target.bookRating.value || "";
    const shortDescription = e.target.bookShortDescription.value || "";
    const updatedBook = {
      name,
      author,
      quantity,
      imageUrl,
      category,
      rating,
      shortDescription,
    };

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
      <div className=" mx-auto">
        <form className="card-body" onSubmit={handleUpdate}>
          <div className="flex flex-col lg:flex-row justify-around gap-8 items-center">
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Book name</span>
              </label>
              <input
                type="text"
                placeholder="Book Name"
                defaultValue={book.name}
                className="input input-bordered focus:input-primary"
                name="bookName"
                required
              />
            </div>
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Author Name</span>
              </label>
              <input
                type="text"
                name="authorName"
                placeholder="Author Name"
                defaultValue={book.author}
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row mt-3  justify-around gap-8 items-center">
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text"> Quantity of the book</span>
              </label>
              <input
                type="number"
                placeholder="Quantity of the book"
                defaultValue={book.quantity}
                min={0}
                className="input input-bordered focus:input-primary"
                name="bookQuantity"
                required
              />
            </div>
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Book Image Url</span>
              </label>
              <input
                type="text"
                name="bookImageUrl"
                placeholder="Book Image Url"
                defaultValue={book.imageUrl}
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row mt-4 justify-around gap-8 items-center">
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Select Book Category</span>
              </label>
              <div className="input-group">
                <select
                  className="select select-bordered w-full"
                  name="bookCategory"
                  defaultValue={bookCat}
                  required
                >
                  <option disabled value="">
                    Pick category
                  </option>
                  {categories?.map((d) => (
                    <option value={d.name} key={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Book Rating ( 0 - 10)</span>
              </label>
              <input
                type="number"
                name="bookRating"
                min={0}
                max={10}
                defaultValue={book.rating}
                placeholder="Book Rating"
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="form-control  w-full mx-auto">
              <label className="label">
                <span className="label-text">Book Short Description</span>
              </label>
              <div className="input-group">
                <textarea
                  className="textarea textarea-primary w-full h-48"
                  placeholder="Book Short Description"
                  name="bookShortDescription"
                  defaultValue={book.shortDescription}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="form-control mt-6 w-1/2 mx-auto">
            <button
              className="btn btn-outline btn-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                "Update Book"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBook;
