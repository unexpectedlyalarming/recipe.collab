import React, { useState } from "react";
import axios from "axios";
import SERVER_URL from "../vars/server_url";

/*
    This hook is used to make API calls to the server.
    By default, it uses the GET method, but you can pass
    a different method in the options object.

    Example usage:
    const { data, setData, request, loading, success } = useApi({
        url: "/api/users",
        method: "get",

        options: {
            params: {
                id: 1
            }
        }
        body: {

        }
    });

    For more advanced data manipulation, I recommend using
    TanStack Query.

*/

axios.defaults.withCredentials = true;

export default function useApi({
  url,
  options = {},
  method = "get",
  body = null,
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [success, setSuccess] = useState(false);

  async function request(optionalData = null) {
    try {
      setLoading(true);
      const response = await axios[method](
        SERVER_URL + url,
        optionalData ? optionalData : body,
        {
          withCredentials: true,
          ...options,
        }
      );
      if (response.data) {
        setData(response.data);
        setSuccess(true);
        return response.data;
      } else if (response.data === false) {
        setData(false);
        return false;
      } else {
        const error = new Error(response.data);
        setData(error.message);
        return error;
      }
    } catch (err) {
      setData(err.response.data.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return { data, setData, request, loading, success };
}
