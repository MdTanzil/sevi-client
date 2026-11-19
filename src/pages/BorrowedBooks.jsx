import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import BorrowCard from "../components/BorrowCard";


const BorrowedBooks = () => {
  const axios = useAxios();

  const borrowBooks = async () => {
    const res = await axios.get("/borrows");
    return res.data;
  };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["borrowbooks"],
    queryFn: borrowBooks,
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
        <p className="text-2xl font-bold">Could not load your borrowed books</p>
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
      {" "}
      <h1 className="text-3xl sm:text-4xl text-center font-bold playfair">
        <span className="text-secondary">Borrowed</span> Books
      </h1>
      {data.length <= 0 && (
        <div className="my-48 text-center text-2xl font-bold">
          Do not have any Books{" "}
        </div>
      )}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.map((d) => (
          <BorrowCard key={d._id} data={d} refetch={refetch}></BorrowCard>
        ))}
      </div>
    </div>
  );
};

export default BorrowedBooks;
