import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import BookCard from "./BookCard";
import { useLocation, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { filterBooks } from "../utils/searchBooks";
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

  const isFiltering = searchTerm.trim() !== "" || filterActive;

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
      {isFiltering && data.length > 0 && (
        <Typography sx={{ textAlign: "center", mt: 1.5 }}>
          Showing {displayData.length} of {data.length} books
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
        {displayData?.map((d) => (
          <BookCard book={d} key={d._id}></BookCard>
        ))}
      </div>
    </div>
  );
};

export default AllBooks;
