/* eslint-disable react/prop-types */
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import useAxios from "../hooks/useAxios";
import Swal from "sweetalert2";

const BorrowCard = ({ data, refetch }) => {
  const axios = useAxios();

  const {
    _id,
    name,
    bookName,
    bookImage,
    bookCategorie,
    email,
    bookId,
    retunDate,
    borrowedDate,
    author,
    rating,
  } = data;

  const handleReturn = () => {
    const url = `borrows/${_id}`;
    //
    axios.delete(url).then((res) => {
        Swal.fire("Successfully return");
     refetch()
    });
    axios
      .patch(`/books-quantity-increase/${bookId}`)
      .then((res) => {
        console.log(res);
        
      });
  };
  return (
    <div className="p-1 shadow-lg bg-base-100 m-1 rounded-lg   ">
      <figure className="mx-auto w-3/4  flex justify-center ">
        <img src={bookImage} className=" h-56 object-cover" alt="Shoes" />
      </figure>
      <div className="">
        <h2 className="text-lg font-medium text-center mt-2 text-primary">
          {bookName.slice(0, 25)}
        </h2>
        <p className="text-center playfair  font-medium">by {author}</p>
        <Rating
          style={{ maxWidth: 120 }}
          value={rating / 2}
          readOnly
          className="mx-auto"
        />
        <p className="text-center font-medium ">
          <span className=""> Categories : {bookCategorie}</span>{" "}
        </p>

        <p className="text-center font-medium ">
          <span className=""> Borrow Date : {borrowedDate}</span>{" "}
        </p>
        <p className="text-center font-medium ">
          <span className=""> Return Date : {retunDate}</span>{" "}
        </p>

        <div className="flex justify-center gap-2 ">
          <button
            className="p-2 m-1 bg-secondary rounded-md text-sm"
            onClick={handleReturn}
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default BorrowCard;
