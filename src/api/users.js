import axios from "../configs/axios";

const user = {
  login: (credentials) => axios.post("/users/login", credentials),
  register: (payload) => axios.post("/users/register", payload),
  refresh: (credentials) =>
    axios.post("/refresh-tokens", {
      refresh_token: credentials.refresh_token,
      email: credentials.email,
    }),
  details: () => axios.get("/users"),
};

export default user;
