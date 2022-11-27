import { useState } from "react";
import { FormField, SubmitBtn } from "subcomponents";
import { useForm } from "react-hook-form"
import { getRegisterConfig } from "utils/functions";
import axios from "axios";
import { toast } from "react-toastify";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";

const isValidEmail = email =>
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );

export default function Auth() {
  const [activeTab, setActiveTab] = useState(loginTab);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async data => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/auth/${activeTab}`, data);

      if (res.data.token) {
        await axios.put(`${process.env.NEXT_PUBLIC_URL}/api/update/${res.data.email}`, {
          last_login: new Date()
        }, {
          headers: {
            Authorization: `Bearer ${res.data.token}`
          }
        });
        setCookie("token", res.data.token);
        setCookie("email", res.data.email)
        toast.success(activeTab === loginTab ? "Successfully Logged in" : "Successfully created!");
        router.push("/");
      }
    } catch (ex) {
      console.error(ex);
      toast.error(ex?.response?.data?.message || "Server Error!")
    }
    setLoading(false);
  }

  return (
    <div className="custom-container flex justify-center items-center min-h-screen pb-20">
      <div className="w-[500px] bg-purple-100 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between divide-x-2 divide-purple-500 text-[20px] font-medium">
          <button onClick={() => setActiveTab(loginTab)} className={`w-1/2 py-2.5 border-b-2 border-b-purple-500 duration-300 ${activeTab === loginTab ? "bg-purple-300 text-purple-100" : ""}`}>Login</button>
          <button onClick={() => setActiveTab(signUpTab)} className={`w-1/2 py-2.5 border-b-2 border-b-purple-500 duration-300 ${activeTab === signUpTab ? "bg-purple-300 text-purple-100" : ""}`}>Sign up</button>
        </div>
        <form
          onSubmit={handleSubmit(submit)}
          className="px-10 pt-5 pb-10 w-[90%] mx-auto flex flex-col gap-2"
        >
          {activeTab === loginTab ? (
            <>
              <FormField
                type="text"
                label="Email"
                placeholder="yourmail@mail.com"
                registers={register("email", {
                  ...getRegisterConfig(true, 3, 100),
                  validate: {
                    isValidEmail: email => isValidEmail(email) ? null : "Invalid Email!"
                  }
                })}
                error={errors.email?.message}
              />
              <FormField
                type="password"
                label="Password"
                placeholder="xxxxxx"
                registers={register("password", getRegisterConfig(true, 0, 1000))}
                error={errors.password?.message}
              />
            </>
          ) : (
            <>
              <FormField
                type="text"
                label="Name"
                placeholder="Jimmy"
                registers={register("name", getRegisterConfig(true, 2, 100))}
                error={errors.login?.message}
              />
              <FormField
                type="text"
                label="Email"
                placeholder="yourmail@mail.com"
                registers={register("email", {
                  ...getRegisterConfig(true, 3, 100),
                  validate: {
                    isValidEmail: email => isValidEmail(email) ? null : "Invalid Email!"
                  }
                })}
                error={errors.email?.message}
              />
              <FormField
                type="password"
                label="Password"
                placeholder="xxxxxx"
                registers={register("password", getRegisterConfig(true, 0, 1000))}
                error={errors.password?.message}
              />
            </>
          )}
          <SubmitBtn
            text="Sign up"
            loadingText="Signing up"
            disabled={Object.keys(errors).length !== 0}
            loading={loading}
            className="mt-3"
          />
        </form>
      </div>
    </div>
  )
}

const loginTab = "login";
const signUpTab = "register"
