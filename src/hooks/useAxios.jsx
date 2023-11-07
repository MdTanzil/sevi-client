import axios from "axios";


const useAxios = () => {
    const instance = axios.create({
      baseURL: "https://sevi-server.vercel.app/api/v1",
      //  baseURL: "http://localhost:5000/api/v1",

      withCredentials: true,
    });
    return  instance;
};

export default useAxios;