import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router/Router";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./provider/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// Create a client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router}></RouterProvider>
        <Toaster
          toastOptions={{
            success: {
              iconTheme: {
                primary: "green",
                secondary: "black",
              },
              style: {
                background: "#723182",
                color: "white",
              },
            },
            error: {
              style: {
                background: "#F87272",
              },
            },
          }}
        ></Toaster>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false}></ReactQueryDevtools>
    </QueryClientProvider>
  </React.StrictMode>
);
