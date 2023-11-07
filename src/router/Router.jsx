import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AddBook from "../pages/AddBook";
import AllBooks from "../pages/AllBooks";
import BorrowedBooks from "../pages/BorrowedBooks";
import PrivateRoute from "./PrivateRoute";
import BooksAllCategory from "../pages/BooksAllCategory";
import SingleBook from "../pages/SingleBook";
import UpdateBook from "../pages/UpdateBook";
import Error from "../pages/Error";
import Reading from "../pages/Reading";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    errorElement:<Error></Error>,
    children: [
      {
        index: true,
        element: <Home></Home>,
      },
      {
        path: "add-book",
        element: (
          <PrivateRoute>
            <AddBook></AddBook>
          </PrivateRoute>
        ),
      },

      {
        path: "all-book",
        element: (
          <PrivateRoute>
            <AllBooks></AllBooks>,
          </PrivateRoute>
        ),
      },
      {
        path: "borrowed-book",
        element: (
          <PrivateRoute>
            <BorrowedBooks></BorrowedBooks>,
          </PrivateRoute>
        ),
      },
      {
        path: "books-category/:category",
        element: (
          <PrivateRoute>
            <BooksAllCategory></BooksAllCategory>
          </PrivateRoute>
        ),
      },
      {
        path: "books-details/:id",
        element: (
          <PrivateRoute>
            <SingleBook></SingleBook>
          </PrivateRoute>
        ),
      },
      {
        path: "books-update/:id",
        element: (
          <PrivateRoute>
            <UpdateBook></UpdateBook>
          </PrivateRoute>
        ),
      },
      {
        path: '/reading/:id',
        element: <PrivateRoute>
          <Reading></Reading>
        </PrivateRoute>
      }
    ],
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
  {
    path: "/register",
    element: <Register></Register>,
  },
]);

export default router;
