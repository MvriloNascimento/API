//Axios, se usa para manipular requisições HTTP`
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3333",
});


