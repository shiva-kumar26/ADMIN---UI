import axios from "axios";

export const emailApi = axios.create({
  baseURL: "http://10.16.7.91:8899", // your FastAPI host
});
