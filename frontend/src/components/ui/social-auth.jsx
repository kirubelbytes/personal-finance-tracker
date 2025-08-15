import {
    GithubAuthProvider,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import React, {useEffect, useState} from "react";
import {useAuthState, useSendSignInLinkToEmail} from "react-firebase-hooks/auth"
import {FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import {toast} from "sonner"
import api from "../../libs/apiCall.js"
import  {auth} from "../../libs/firebaseConfig.js";
import useStore from "../../store/index.js";
import { Button } from "./button.jsx";


export const SocialAuth =({isLoading, setLoading } ) => {
    const user = useStore(state => state.user);
    const [selectProvider , setSelectProvider ] = useState("google");
    // const { setCredentials } = useStore((state) => state )
    const setCredentials = useStore(state => state.setCredential);
    const navigate = useNavigate()

    const signInWithGoogle = async() => {
        const provider = new GoogleAuthProvider();
        setSelectProvider("google");
        try {
            const res = await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signin with google", error)
        }
    };

    const signInWithGithub = async() => {
        const provider = new GithubAuthProvider();
        setSelectProvider('github');
        try {
            const res = await signInWithPopup(auth, provider);
            console.log(res);
        } catch (error) {
            console.error("Error signin with github", error)
        }
    };

    useEffect(() => {
        const saveUserToDb = async() => {
            try {
                const userData = {
                    name : user.displayName,
                    email : user.email,
                    provider : selectProvider,
                    uid : user.uid
                }
                setLoading(true);
                const { data : res} = await api.post("/auth/sign-in", userData);
                console.log(res);
                if(res?.user) {
                    toast.success(res?.message);
                    const userInfo = {...res?.user, token : res?.token};
                    localStorage.setItem("user", JSON.stringify(userInfo));
                    setCredentials(userInfo);
                    setTimeout(() => {
                        navigate('/overview')
                    }, 1500);
                }
            } catch(error) {
                console.error("Something went wrong", error);
                toast.error(error?.response?.data?.message || error.message);
            } finally {
                setLoading(false)
            }
        };

        if(user) {
            saveUserToDb();
        }
    }, [user?.uid])

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={signInWithGoogle}
                disabled={isLoading}
                variant="outline"
                className="w-full text-sm font-normal dark:bg-transparent dark:border-gray-800 dark:text-gray-400"
                type="button"
            >
                <FcGoogle className="mr-2 size-5" />
                Continue with Google
            </Button>
            {/* <Button
                onClick={signInWithGithub}
                disabled={isLoading}
                variant="outline"
                className="w-full text-sm font-normal dark:bg-transparent dark:border-gray-800 dark:text-gray-400"
                type="button"
            >
                <FaGithub className="mr-2 size-5" />
                Github
            </Button> */}

        </div>
    );
};

