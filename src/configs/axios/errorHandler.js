import { toast } from "react-toastify";
import UserAPI from "../../api/user";

import axios, { setAuthorizationHeader } from "./index";

export default function errorHandler(error) {
  if (error) {
    let message;
    if (error.response) {
      const originalRequest = error.config;
      if (error.response.status === 500)
        message = "Something went terribly wrong";
      else if (error.response.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        const session = localStorage["MICOURSE:token"]
          ? JSON.parse(localStorage["MICOURSE:token"])
          : null;
        return UserAPI.refresh({
          refresh_token: session.refresh_token,
          email: session.email,
        }).then((res) => {
          if (res.data) {
            setAuthorizationHeader(res.data.token);
            localStorage.setItem(
              "MICOURSE:token",
              JSON.stringify({
                ...session,
                token: res.data.token,
              })
            );

            originalRequest.headers.authorization = res.data.token;

            return axios(originalRequest);
          } else {
            window.location.href = "/login";
            localStorage.removeItem("MICOURSE:token");
          }
        });
      } else message = error.response.data.message;

      if (typeof message === "string") toast.error(message);

      return Promise.reject(error);
    }
  }
}
