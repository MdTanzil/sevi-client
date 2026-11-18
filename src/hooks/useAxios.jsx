import axios from "axios";


const useAxios = () => {
    const instance = axios.create({
      // Production API by default. For local development, set VITE_API_URL
      // (see .env.example), e.g. http://localhost:5000/api/v1
      baseURL: import.meta.env.VITE_API_URL || "https://sevi-server.vercel.app/api/v1",

      withCredentials: true,
    });
    return  instance;
};

export default useAxios;