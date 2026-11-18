import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import BookCard from "./BookCard";
import { useLocation, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { filterBooks } from "../utils/searchBooks";
const AllBooks = () => {
  const axios = useAxios();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const getAllBooks = async () => {
    const res = await axios.get(`/books`);
    return res.data;
  };
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["allBooks"],
    queryFn: getAllBooks,
  });

  // search term, pre-filled from the home page search box (?search=...)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  // for display filter purposes
  const [filterActive, setFilterActive] = useState(false);

  // apply the search query and the available-only filter together
  const displayData = useMemo(
    () => filterBooks(data, searchTerm, filterActive),
    [data, searchTerm, filterActive]
  );

  // loging data
  if (isLoading) {
    return <span className="loading loading-bars loading-lg"></span>;
  }

  // if  all page routes cll form add page . then refetch
  if (location?.state?.addpage) {
    refetch();
  }
  const handleFilter = () => {
    // Toggle the available-only filter
    setFilterActive(!filterActive);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilterActive(false);
  };

  const isFiltering = searchTerm.trim() !== "" || filterActive;

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
              {filterActive ? "Show All" : "Filter"}
            </button>
          </span>
        </h1>
      </div>
      <div className="flex justify-center items-center mt-5 gap-2 px-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, author or category"
          className="input input-bordered input-primary w-full max-w-md placeholder:text-primary"
        />
        {searchTerm && (
          <button
            className="btn btn-sm btn-outline btn-primary poppins"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </button>
        )}
      </div>
      {isFiltering && data.length > 0 && (
        <p className="text-center mt-3 poppins">
          Showing {displayData.length} of {data.length} books
        </p>
      )}
      {data.length <= 0 && (
        <div className="h-3.5 my-48 te text-center text-bold text-2xl">
          Do not have any Books{" "}
        </div>
      )}
      {data.length > 0 && displayData.length <= 0 && (
        <div className="my-48 text-center">
          <p className="text-2xl font-bold">No books match your search</p>
          <p className="mt-2 poppins">
            Try a different title, author or category.
          </p>
          <button
            className="btn btn-sm btn-primary poppins mt-4"
            onClick={handleClearSearch}
          >
            Clear Search
          </button>
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
