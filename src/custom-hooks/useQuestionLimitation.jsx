import { useEffect, useState, useCallback } from "react";
import { useBeforeUnload } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTHENTICATION_COOKIE_KEY } from "../utils/constants/app-constants";
import { API_URL } from "../utils/constants/app-constants";

function useQuestionLimitation() {
    const cookies = Cookies.get()
    const [, loggedInUserLogin] = Object.entries(cookies).find(([key]) =>
        key.includes(AUTHENTICATION_COOKIE_KEY)
    ) || [undefined, undefined];
    const userName = decodeURI(loggedInUserLogin);
    console.log("userName")
    console.log(typeof userName)
    console.log("userName")
    const [limitation, setLimitation] = useState(30);

    const fetchQuestionLimitation = useCallback(async () => {
        try {
            if(!userName || userName == "undefined") throw new Error("No access code found");

            await axios.post(
                `${API_URL}update-limitation/`, {'name': userName}
            ).then(res => {
                setLimitation(res.data.limitation);
            })
            .catch(error => {
                console.error(error)
            });
            
        } catch (error) {
            console.log("Error in user");
            setLimitation(-1)
        }
    });

    useBeforeUnload(
        useCallback(() => {
            Cookies.remove(AUTHENTICATION_COOKIE_KEY);
            localStorage.setItem("test", "cleared");
        }, [])
    );

    useEffect(() => {
        fetchQuestionLimitation();
    }, [fetchQuestionLimitation]);

    return {
        limitation,
        setLimitation
    }
}

export default useQuestionLimitation;
