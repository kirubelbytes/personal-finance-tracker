import React, { useEffect, useState } from 'react'
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import  useStore  from '../../store/index.js';
import { useForm } from "react-hook-form"
import { useNavigate } from 'react-router-dom';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "../../components/ui/card"
import { SocialAuth } from '../../components/ui/social-auth.jsx';
import Separetor from '../../components/ui/separetor.jsx';
import Input from "../../components/ui/input.jsx"
import { BiLoader } from "react-icons/bi"
import { Button } from '../../components/ui/button.jsx';
import { Link } from "react-router-dom"
import api from '../../libs/apiCall.js';
import { toast } from 'sonner';

const LogInSchema = z.object({
  email : z 
    .string({required_error : "Email is required"})
    .email({message : "Invalid email address"}),
  password: z 
    .string({required_error : "Password is required"})
    .min(8, "Password is required"),
});


const SignIn = () => {
  const { user, setCredential } = useStore(state => state);
  const {
    register,
    handleSubmit,
    formState : {errors}
  } = useForm({
    resolver: zodResolver(LogInSchema),
  })
  const navigate = useNavigate();
  const [loading , setLoading] = useState();

  useEffect(() => {
    user && navigate("/")
  },[user])

  const onSubmit = async(data) => {
    try {
      setLoading(true);
      const {data : res} = await api.post("/auth/sign-in", data);
      if(res?.user) {
        toast.success(res?.message);
        const userInfo = {...res?.user, token : res.token};
        localStorage.setItem("user", JSON.stringify(userInfo));
        setCredential(userInfo);

        setTimeout(() => {
          navigate("/overview")
        }, 1500);
      }
    } catch (error) {
      console.log(error);
      toast.error(errors?.response?.data?.message || error.message);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center w-full min-h-screen py-10'>
       <Card className="w-[400px] bg-white dark:bg-black/20 shadow-md overflow-hidden">
          <div className='p-6 md:-8'>
            <CardHeader className="py-0">
              <CardTitle className="mb-8 text-center dark:text-white">
                Sign In
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='mb-8 space-y-8'>
                 <SocialAuth isloading={loading} setLoading={setLoading}/>
                 <Separetor />

                 <Input 
                  disabled={loading}
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors?.email?.message}
                  {...register("email")}
                  className="text-sm border dark:border-gray-800 dark:bg-transparent dark:placeholder:text-text-gray700 dark:text-gray-400 dark:outline-none"
                 />
                 <Input 
                  disabled={loading}
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Your Password"
                  error={errors?.password?.message}
                  {...register("password")}
                  className="text-sm border dark:border-gray-800 dark:bg-transparent dark:placeholder:text-text-gray700 dark:text-gray-400 dark:outline-none"
                 />
                 <Button
                  type="submit"
                  className="w-full bg-violet-800"
                  disabled={loading}
                 >
                  {loading ? (<BiLoader className='text-2xl text-white animate-spin' />) : "Sign in"}
                 </Button>
                </div>
              </form>
            </CardContent>
          </div>
          <CardFooter className="justify-center gap-2">
            <p className='text-sm text-grey-600'> Don't have an account</p>
            <Link to="/sign-up" className="text-sm font-semibold text-violet-600 hover:underline">
              Sign up
            </Link>
          </CardFooter>
       </Card>
    </div>
  )
}


export default SignIn;

