import axios, { AxiosInstance } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL_ANGOLA;

export const angolaApi: AxiosInstance = axios.create({
  baseURL,
});

export default angolaApi;

