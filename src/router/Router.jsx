import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AddBook from "../pages/AddBook";
import AllBooks from "../pages/AllBooks";
import BorrowedBooks from "../pages/BorrowedBooks";

    const router = createBrowserRouter([
      {
        path: "/",
        element: <MainLayout></MainLayout>,
        children:[
          {
            index:true,
            element:<Home></Home>
          },
          {
            path:'add-book',
            element: <AddBook></AddBook>
          },
          
          {
            path:'all-book',
            element: <AllBooks></AllBooks>
          },
          {
            path:'borrowed-book',
            element: <BorrowedBooks></BorrowedBooks>
          }
        ]

      },
      {
        path:'/login',
        element: <Login></Login>
      },
      {
        path:'/register',
        element: <Register></Register>
      }
    ]);

export default router;