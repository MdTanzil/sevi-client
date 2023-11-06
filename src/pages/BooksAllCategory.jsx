import { useParams } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import BookCard from "./BookCard";

const BooksAllCategory = () => {
  const { category } = useParams();
  const axios = useAxios();
  // const [data, setData] = useState([]);
  // useEffect(() => {
  //     axios.get(`/books/${category}`)
  //     .then((response) =>{
  //         setData(response.data);
  //     })
  // }, []);
  // console.log(data);
  const getBooksByCategory = async () => {
    const res = await axios.get(`/books/${category}`);
    return res.data;
  };
  const { data, isLoading } = useQuery({
    queryKey: ["category-book"],
    queryFn: getBooksByCategory,
  });
  if (isLoading) {
    return <span className="loading loading-bars loading-lg"></span>;
  }
  return (
    <div>
      <h1 className="text-4xl text-center font-bold playfair mt-5">
        <span className="text-secondary">{category}</span> Books
      </h1>
      {data.length <=0 && <div className="h-3.5 my-48 te text-center text-bold text-2xl">Do not have any Books </div>}
      <div className="mt-5 grid grid-cols-4 gap-3">
        {data?.map((d) => (
          <BookCard book={d} key={d._id}></BookCard>
        ))}
      </div>
    </div>
  );
};

export default BooksAllCategory;
