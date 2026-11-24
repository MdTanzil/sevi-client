import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import BookCard from "./BookCard";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { filterBooks } from "../utils/searchBooks";
import { SORT_OPTIONS, sortBooks } from "../utils/sortBooks";

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
  // sort order for the list below ("default" = the server's order)
  const [sortBy, setSortBy] = useState("default");

  // apply the search query, the available-only filter and the sort
  // together — filter first, then sort, then pagination slices below
  const displayData = useMemo(
    () => sortBooks(filterBooks(data, searchTerm, filterActive), sortBy),
    [data, searchTerm, filterActive, sortBy]
  );

  // Pagination applies AFTER the search/filter/sort, across all matching
  // books. The page resets to 1 whenever the search, filter or sort
  // changes.
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterActive, sortBy]);
  // Coming back from the Add Book page (location.state.addpage) means a
  // new book may exist — refetch once. This must live in an effect: a
  // refetch during render fires again on every re-render.
  const cameFromAddPage = location?.state?.addpage;
  useEffect(() => {
    if (cameFromAddPage) refetch();
  }, [cameFromAddPage, refetch]);
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

  const handleFilter = () => {
    // Toggle the available-only filter
    setFilterActive(!filterActive);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilterActive(false);
    setSortBy("default");
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
        <FormControl size="small" sx={{ minWidth: "12rem" }}>
          <InputLabel id="sort-by-label">Sort by</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            label="Sort by"
            onChange={(event) => setSortBy(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {isLoading ? (
        // Skeleton cards in the exact grid the books will fill — the page
        // keeps its shape while loading instead of jumping from a lone
        // spinner to a full grid (which also popped the scrollbar in).
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <Box
              key={index}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "background.paper",
                boxShadow: 4,
              }}
            >
              <Skeleton
                variant="rectangular"
                sx={{ height: { xs: 256, sm: 288 } }}
              />
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" sx={{ fontSize: "1.125rem" }} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
          ))}
        </div>
      ) : (
        <>
          {displayData.length > 0 && (
            <Typography sx={{ textAlign: "center", mt: 1.5 }}>
              Showing {rangeStart}–{rangeEnd} of {displayData.length} books
              {displayData.length !== data.length &&
                ` (${data.length} total)`}
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
        </>
      )}
    </div>
  );
};

export default AllBooks;
