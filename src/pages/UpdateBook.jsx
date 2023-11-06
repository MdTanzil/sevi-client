import { useNavigate, useParams } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


const UpdateBook = () => {
     const axios = useAxios();
     const [categories, setCategories] = useState([]);
     
   
     const navigate = useNavigate();

     useEffect(() => {
       axios.get("/categories").then((response) => {
         setCategories(response.data);
       });
     }, []);
     const { id } = useParams();
     const books = async () => {
       const res = await axios.get(`/single-book/${id}`);
       return res.data;
     };
     const { data: book, isLoading, } = useQuery({
       queryKey: ["single-book"],
       queryFn: books,
     });

     if (isLoading) {
        
       return <span className="loading loading-bars loading-lg"></span>;
     }
    const bookCat = book.category;
   
     
    
     const handleUpdate= (e)=>{
        e.preventDefault()
        // get all data 

        const name = e.target.bookName.value || "";
        const author = e.target.authorName.value || "";

        const quantity = e.target.bookQuantity.value || "";

        const imageUrl = e.target.bookImageUrl.value || "";

        const category = e.target.bookCategory.value || "";
        if (category == "none") {
          return toast.error("Please select a category");
        }
        const rating = e.target.bookRating.value || "";
        const shortDescription = e.target.bookShortDescription.value || "";
        const updatedBook = {
          name,
          author,
          quantity,
          imageUrl,
          category,
          rating,
          shortDescription,
        };
        
        axios.put(`/books/${id}`,updatedBook)
        .then(response =>{
            if (response.data.modifiedCount){
                navigate(`/books-details/${id}`);
            }
        })
     }
    return (
      <div className="mt-5">
        <h1 className="text-4xl text-center font-bold playfair">
          <span className="text-secondary">Update</span> Books
        </h1>
        <div className=" mx-auto">
          <form className="card-body" onSubmit={handleUpdate}>
            <div className="flex flex-col lg:flex-row justify-around gap-8 items-center">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Book name</span>
                </label>
                <input
                  type="text"
                  placeholder="Book Name"
                  defaultValue={book.name}
                  className="input input-bordered focus:input-primary"
                  name="bookName"
                  required
                />
              </div>
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Author Name</span>
                </label>
                <input
                  type="text"
                  name="authorName"
                  placeholder="Author Name"
                  defaultValue={book.author}
                  className="input input-bordered focus:input-primary"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row mt-3  justify-around gap-8 items-center">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text"> Quantity of the book</span>
                </label>
                <input
                  type="number"
                  placeholder="Quantity of the book"
                  defaultValue={book.quantity}
                  min={0}
                  className="input input-bordered focus:input-primary"
                  name="bookQuantity"
                  required
                />
              </div>
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Book Image Url</span>
                </label>
                <input
                  type="text"
                  name="bookImageUrl"
                  placeholder="Book Image Url"
                  defaultValue={book.imageUrl}
                  className="input input-bordered focus:input-primary"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row mt-4 justify-around gap-8 items-center">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Select Book Category</span>
                </label>
                <div className="input-group">
                  <select
                    className="select select-bordered"
                    name="bookCategory"
                    
                    required
                  >
                    <option disabled value="none">
                      Pick category
                    </option>
                    {categories?.map((d) => (
                      <option
                        value={d.name}
                        selected={d.name == bookCat}
                        key={d._id}
                      >
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Book Rating ( 0 - 10)</span>
                </label>
                <input
                  type="number"
                  name="bookRating"
                  min={0}
                  max={10}
                  defaultValue={book.rating}
                  placeholder="Book Rating"
                  className="input input-bordered w-50 focus:input-primary"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="form-control  w-full mx-auto">
                <label className="label">
                  <span className="label-text">Book Short Description</span>
                </label>
                <div className="input-group">
                  <textarea
                    className="textarea textarea-primary w-full h-48"
                    placeholder="Book Short Description"
                    name="bookShortDescription"
                    defaultValue={book.shortDescription}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="form-control mt-6 w-1/2 mx-auto">
              <button
                className="btn bg-gray-100 border-primary border-1 hover:btn-primary"
                type="submit"
              >
                Update Book
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};

export default UpdateBook;