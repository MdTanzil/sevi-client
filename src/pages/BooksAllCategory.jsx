import { useParams } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import BookCard from "./BookCard";

const BooksAllCategory = () => {
  const { category } = useParams();
  const axios = useAxios();
  const getBooksByCategory = async () => {
    const res = await axios.get(`/books/${category}`);
    return res.data;
  };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["category-book"],
    queryFn: getBooksByCategory,
  });
  if (isLoading) {
    return (
      <div className="flex justify-center my-48">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-48 text-center">
        <p className="text-2xl font-bold">Could not load the books</p>
        <button
          className="btn btn-sm btn-primary poppins mt-4"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair mt-5">
        <span className="text-secondary">{category}</span> Books
      </h1>
      {data.length <= 0 && (
        <div className="my-48 text-center text-2xl font-bold">
          Do not have any Books{" "}
        </div>
      )}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.map((d) => (
          <BookCard book={d} key={d._id}></BookCard>
        ))}
      </div>
    </div>
  );
};

export default BooksAllCategory;
