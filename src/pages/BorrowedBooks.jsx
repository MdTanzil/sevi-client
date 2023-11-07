import { useQuery } from "@tanstack/react-query";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import BorrowCard from "../components/BorrowCard";


const BorrowedBooks = () => {
  const { user } = useAuth();
  const axios = useAxios();

  const borrowBooks = async () => {
    const res = await axios.get(`/borrows?email=${user.email}`);
    return res.data;
  };
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["borrowbooks"],
    queryFn: borrowBooks,
  });
  if (isLoading) {
    return <span className="loading loading-bars loading-lg"></span>;
  }

  return (
    <div>
      {" "}
      <h1 className="text-4xl text-center font-bold playfair">
        <span className="text-secondary">Borrowed</span> Books
      </h1>
      {data.length <= 0 && (
        <div className="h-3.5 my-48 te text-center text-bold text-2xl">
          Do not have any Books{" "}
        </div>
      )}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {data?.map((d) => (
          <BorrowCard key={d._id} data={d} refetch={refetch}></BorrowCard>
        ))}
      </div>
    </div>
  );
};

export default BorrowedBooks;
