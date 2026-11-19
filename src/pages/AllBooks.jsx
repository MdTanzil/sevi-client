import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import BookCard from "./BookCard";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { filterBooks } from "../utils/searchBooks";

const PAGE_SIZE = 12;
const AllBooks = () => {
  const axios = useAxios();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const getAllBooks = async () => {
    const res = await axios.get(`/books`);
    return res.data;
  };
  const { data, isLoading, isError, refetch } = useQuery({
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

  // Pagination applies AFTER the search/filter, across all matching
  // books. The page resets to 1 whenever the search or filter changes.
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterActive]);
  const totalPages = Math.max(1, Math.ceil(displayData.length / PAGE_SIZE));
  // Clamp: the list can shrink under the current page (e.g. a book is
  // deleted while viewing the last page).
  const currentPage = Math.min(page, totalPages);
  const pageBooks = useMemo(
    () =>
      displayData.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      ),
    [displayData, currentPage]
  );
  const rangeStart = displayData.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, displayData.length);

  // loging data
  if (isLoading) {
    return (
      <Box className="flex justify-center my-48">
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="my-48 text-center">
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Could not load the books
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

  return (
    <div>
      <div className="flex justify-center">
        <Typography
          component="h1"
          className="playfair"
          sx={{
            fontSize: { xs: "1.875rem", sm: "2.25rem" },
            fontWeight: 700,
            textAlign: "center",
            mt: 2.5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box component="span" sx={{ color: "secondary.main" }}>
            All
          </Box>{" "}
          <Box component="span" sx={{ ml: 1 }}>
            Books
          </Box>{" "}
          <Button
            variant="contained"
            size="small"
            sx={{ ml: 1 }}
            onClick={handleFilter}
          >
            {filterActive ? "Show All" : "Filter"}
          </Button>
        </Typography>
      </div>
      <Box className="flex flex-wrap justify-center items-center mt-5 gap-2 px-2">
        <TextField
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, author or category"
          fullWidth
          sx={{
            maxWidth: "28rem",
            "& .MuiInputBase-input::placeholder": {
              color: "primary.main",
              opacity: 1,
            },
          }}
        />
        {searchTerm && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </Button>
        )}
      </Box>
      {displayData.length > 0 && (
        <Typography sx={{ textAlign: "center", mt: 1.5 }}>
          Showing {rangeStart}–{rangeEnd} of {displayData.length} books
          {displayData.length !== data.length && ` (${data.length} total)`}
        </Typography>
      )}
      {data.length <= 0 && (
        <Box className="my-48 text-center">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Do not have any Books{" "}
          </Typography>
        </Box>
      )}
      {data.length > 0 && displayData.length <= 0 && (
        <Box className="my-48 text-center">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            No books match your search
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Try a different title, author or category.
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 2 }}
            onClick={handleClearSearch}
          >
            Clear Search
          </Button>
        </Box>
      )}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pageBooks?.map((d) => (
          <BookCard book={d} key={d._id}></BookCard>
        ))}
      </div>
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setPage(value)}
            color="primary"
            aria-label="Books pages"
          />
        </Box>
      )}
    </div>
  );
};

export default AllBooks;
