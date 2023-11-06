import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import {  useParams } from "react-router-dom";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
const SingleBook = () => {
  /**
   * TODO:  Single product detail page
   *
   * */
  const axios = useAxios();
  const { id } = useParams();
  const { user } = useAuth();
  
  const books = async () => {
    const res = await axios.get(`/single-book/${id}`);
    return res.data;
  };
  const {
    data: book,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["book"],
    queryFn: books,
  });

  if (isLoading) {
    return <span className="loading loading-bars loading-lg"></span>;
  }
  const {
    _id,
    name,
    author,
    quantity,
    imageUrl,
    category,
    rating,
    shortDescription,
  } = book;
  const getRating = (rating) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Nothing special";
      case 3:
        return "Average";
      case 4:
        return "Very good";
      case 5:
        return "Excellent";
      default:
        return "None";
    }
  };
  const handleBorrow = async () => {
    let retunDate = null;
    const { value: date } = await Swal.fire({
      title: "select return date",
      input: "date",
      didOpen: () => {
        const today = new Date().toISOString();
        Swal.getInput().min = today.split("T")[0];
      },
    });
    if (date) {
      Swal.fire(`Please Return before ${date}`, "successfully borrow");
      retunDate = date;
    }

    const brorowBook = {
      name: user.displayName || "none",
      bookName: name || "",
      bookImage: imageUrl || "",
      bookCategorie: category || "",
      email: user.email || "none",
      bookId: _id,
      retunDate: retunDate,
      borrowedDate: new Date().toISOString().split("T")[0],
      author: author || "none",
      rating: rating || 0,
    };
    if (retunDate) {
      axios.post("/borrow", brorowBook).then((res) => {
        console.log(res);
      });
      axios
        .patch(`/books-quantity-decrease/${_id}`)
        .then((res) => {
          console.log(res);
          refetch();
        });
      // console.log(brorowBook);
    }
  };
  return (
    <div>
      <h1 className="text-4xl text-center font-bold playfair">
        <span className="text-secondary">Book</span> Details
      </h1>
      <div className="mt-5">
        <div className="flex flex-col w-full lg:flex-row items-center">
          <div className="grid  card  rounded-box place-items-center">
            <img
              src={imageUrl}
              className="rounded-lg h-[350px] w-[230px] object-cover"
              alt=""
            />
            <p> {category}</p>
            <div className="flex justify-around w-full">
              <button
                onClick={handleBorrow}
                disabled={quantity < 1}
                className=" btn btn-sm btn-secondary text-black font-normal normal-case"
              >
                Borrow
              </button>
              <button className="btn btn-sm btn-secondary text-black font-normal normal-case">
                Read
              </button>
            </div>
          </div>
          <div className="divider lg:divider-horizontal"></div>
          <div className="grid flex-1   bg-base-100 rounded-box p-1">
            <div className="p-2">
              <h2 className=" text-2xl font-semibold text-center playfair">
                {name}
              </h2>
              <h4 className="text-lg font-medium ">
                Author: <span className="text-primary playfair">{author}</span>{" "}
              </h4>
              <p className="mt-2">
                {" "}
                <span className="text-lg font-medium">
                  Available Copies :
                </span>{" "}
                {quantity}
              </p>
              <p className="mt-2">
                <span className="text-lg font-medium">Category : </span>
                {category}
              </p>
              <div className="my-1">
                <Rating
                  style={{ maxWidth: 120 }}
                  value={rating / 2}
                  readOnly
                  className="ml-0 lg:ml-2"
                />
                <div className="mt-1">{`Review : ${getRating(
                  Math.round(rating / 2)
                )}`}</div>
              </div>
              <h4 className="text-lg font-medium">Short Description :</h4>
              <p className="mt-3"> {shortDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBook;
