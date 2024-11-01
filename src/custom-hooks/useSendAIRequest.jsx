import axios from "axios";

import apiService from '../services/api.js'
import React, {useState, useEffect, useRef} from "react"
import Cookies from "js-cookie";
import { API_URL } from "../utils/constants/app-constants";
import { AUTHENTICATION_COOKIE_KEY } from "../utils/constants/app-constants";

const useSendAIRequest = ({ai_endpoint}, limitation, setLimitation)=>{

  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [loading , setLoading] = useState(false)
  const cookies = Cookies.get();
  const [, loggedInUserLogin] = Object.entries(cookies).find(([key]) =>
    key.includes(AUTHENTICATION_COOKIE_KEY)
  ) || [undefined, undefined];
  const userlogin = decodeURI(loggedInUserLogin);

  const userName = `userlogin=${userlogin}`/*decodeURI(loggedInUserLogin)*/;

  const sendRequest = async(text)=>{
    setError('')
    setResponse('')
    setLoading(true)
    setLimitation(limitation - 1)
    try {
      console.log(API_URL+encodeURIComponent(String(ai_endpoint)+encodeURIComponent(text)+encodeURIComponent(userlogin)))
      const response = await fetch(API_URL+encodeURIComponent(String(ai_endpoint)+encodeURIComponent(text)+encodeURIComponent(userName)));
      if (!response.ok || !response.body) {
        throw response.statusText;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        setLoading(false)
        const decodedChunk = decoder.decode(value, { stream: true });
        setResponse(prevValue => `${prevValue}${decodedChunk}`);
      }
    } catch (errorr) {
        setError(errorr)
      // Handle other errors
    }
  }
  return [response, sendRequest, error, loading]
}

export default useSendAIRequest;