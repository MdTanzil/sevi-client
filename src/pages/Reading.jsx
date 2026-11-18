import { useParams } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";


const Reading = () => {
    const axios = useAxios();
    const { id } = useParams();
      const books = async () => {
        const res = await axios.get(`/single-book/${id}`);
        return res.data;
      };
      const {
        data: book,
        isLoading,
        isError,
        refetch,
      } = useQuery({
        queryKey: ["book"],
        queryFn: books,
      });

      if (isLoading) {
        return (
          <div className="flex justify-center my-48">
            <span className="loading loading-bars loading-lg"></span>
          </div>
        );
      }

      if (isError || !book) {
        return (
          <div className="my-48 text-center">
            <p className="text-2xl font-bold">Could not load this book</p>
            <button
              className="btn btn-sm btn-primary poppins mt-4"
              onClick={() => refetch()}
            >
              Try again
            </button>
          </div>
        );
      }
      const {
       
        name,
       
        shortDescription,
      } = book;
    return (
      <div>
        <h1 className="text-4xl text-center font-bold playfair">
          <span className="text-secondary">Read</span> More
        </h1>
        <h2 className=" text-2xl font-semibold text-center playfair mt-8">{name}</h2>
        <p className="mt-3"> {shortDescription}</p>
      </div>
    );
};

export default Reading;