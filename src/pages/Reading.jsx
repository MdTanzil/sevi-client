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
      } = useQuery({
        queryKey: ["book"],
        queryFn: books,
      });

      if (isLoading) {
        return <span className="loading loading-bars loading-lg"></span>;
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