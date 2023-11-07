import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import BookCard from "./BookCard";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
const AllBooks = () => {
  const axios = useAxios();
  const location = useLocation();
  

  const getAllBooks = async () => {
    const res = await axios.get(`/books`);
    return res.data;
  };
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["allBooks"],
    queryFn: getAllBooks,
  });


  // for display filter purposes
  const [displayData, setDisplayData] = useState(data || []);
  const [filterActive, setFilterActive] = useState(false);
  useEffect(() => {
    // Update displayData whenever data changes (e.g., after refetching)
    setDisplayData(data);
  }, [data]);
  

  // loging data
  if (isLoading) {
    return <span className="loading loading-bars loading-lg"></span>;
  }

  // if  all page routes cll form add page . then refetch
  if (location?.state?.addpage) {
    refetch();
  }
  const handleFilter = () => {
    // Filter the data and update the state
    if (filterActive) {
      // Remove the filter
      setDisplayData(data);
    } else {
      // Apply the filter
      const filteredData = data.filter((item) => item.quantity > 0);
      setDisplayData(filteredData);
    }
    // Toggle the filter status
    setFilterActive(!filterActive);
  }

  return (
    <div>
      <div className="flex justify-center">
        <h1 className="text-4xl text-center font-bold playfair mt-5 flex items-center  ">
          <span className="text-secondary">All</span>{" "}
          <span className="ml-2"> Books </span>
          <span>
            <button
              className="btn btn-sm poppins btn-primary ml-2"
              onClick={handleFilter}
            >
              Filter
            </button>
          </span>
        </h1>
      </div>
      {data.length <= 0 && (
        <div className="h-3.5 my-48 te text-center text-bold text-2xl">
          Do not have any Books{" "}
        </div>
      )}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayData?.map((d) => (
          <BookCard book={d} key={d._id}></BookCard>
        ))}
      </div>
    </div>
  );
};

export default AllBooks;
