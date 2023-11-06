import { useEffect, useState } from "react";
import useAxios from "../hooks/useAxios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddBook = () => {
  const [categories, setCategories] = useState([]);
  const axios = useAxios()
  const navigate = useNavigate()

  useEffect(() => {
    axios.get("/categories").then((response) => {
      setCategories(response.data);
    });
  }, []);

  const handleAddBook = (e) => {
    e.preventDefault();

    // get data from form 
    const name = e.target.bookName.value || "";
    const author = e.target.authorName.value || "";

    const quantity = e.target.bookQuantity.value || "";

    const imageUrl = e.target.bookImageUrl.value || "";

    const category = e.target.bookCategory.value || "";
    if(category=='none'){
        return toast.error('Please select a category')
    }

    const rating = e.target.bookRating.value || "";
    const shortDescription = e.target.bookShortDescription.value || "";

    const book = {
      name,
      author,
      quantity,
      imageUrl,
      category,
      rating,
      shortDescription,
    };
    
    axios.post('/books', book)
    .then(res =>{
        if(res?.data?.insertedId){
            toast.success("Book  successfully inserted")
            navigate("/all-book");
        }
    })
    
  };
  return (
    <div className="mt-5">
      <h1 className="text-4xl text-center font-bold playfair">
        <span className="text-secondary">Add</span> Books
      </h1>
      <div className=" mx-auto">
        <form className="card-body" onSubmit={handleAddBook}>
          <div className="flex flex-col lg:flex-row justify-around gap-8 items-center">
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Book name</span>
              </label>
              <input
                type="text"
                placeholder="Book Name"
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
                className="input input-bordered focus:input-primary"
                name="bookQuantity"
                min={0}
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
                  defaultValue={''}
                  required
                >
                  <option disabled value={''}  >
                    Pick category
                  </option>
                  {categories?.map((d) => (
                    <option value={d.name} key={d._id}>
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
                ></textarea>
              </div>
            </div>
          </div>
          <div className="form-control mt-6 w-1/2 mx-auto">
            <button
              className="btn bg-gray-100 border-primary border-1 hover:btn-primary"
              type="submit"
            >
              Add Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
