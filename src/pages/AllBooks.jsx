import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import BookCard from "./BookCard";


const AllBooks = () => {
  const axios = useAxios();
  const getAllBooks = async () => {
    const res = await axios.get(`/books`);
    return res.data;
  };
  const { data, isLoading } = useQuery({
    queryKey: ["allBooks"],
    queryFn: getAllBooks,
  });
  if (isLoading) {
    return <span className="loading loading-bars loading-lg"></span>;
  }
  
  
    return (
      <div>
        <h1 className="text-4xl text-center font-bold playfair mt-5">
          <span className="text-secondary">All</span> Books
        </h1>
        
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {data?.map((d) => (
            <BookCard book={d} key={d._id}></BookCard>
          ))}
        </div>
      </div>
    );
};

export default AllBooks;