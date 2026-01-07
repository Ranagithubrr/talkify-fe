"use client";

import Image from "next/image";
import { useState } from "react";
import { Form, Formik, useField } from "formik";
import * as Yup from "yup";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import api from "@/lib/api";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";

type FormStatus = { type: "success" | "error"; message: string } | undefined;

const LoginSchema = Yup.object().shape({
  email: Yup.string().required("Email or username is required"),
  password: Yup.string().required("Password is required"),
});

export function LoginForm() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  const handleSubmit = async (
    values: { email: string; password: string },
    helpers: { setStatus: (status?: FormStatus) => void; setSubmitting: (submitting: boolean) => void },
  ) => {
    helpers.setStatus(undefined);
    try {
      const response = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });
      const data = response.data || {};
      setSession({
        user: {
          id: data?.user?.id ?? "user-1",
          name: data?.user?.name ?? data?.user?.email ?? "User",
          email: data?.user?.email ?? values.email,
          photo: data?.user?.photo ?? null,
          createdAt: data?.user?.createdAt,
        },
        accessToken: data?.tokens?.accessToken ?? "",
        refreshToken: data?.tokens?.refreshToken ?? "",
      });
      helpers.setStatus({ type: "success", message: "Signed in successfully" });
      router.push("/");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError?.response?.data?.message ||
        axiosError?.message ||
        "Unable to sign in. Please check your credentials and try again.";
      helpers.setStatus({ type: "error", message });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a1221] text-white">
      <BackgroundGlow />
      <div className="relative w-full max-w-xl px-4 py-12 sm:px-0">
        <div className="rounded-3xl border border-white/10 bg-[#0f1729]/80 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-center justify-center gap-2 px-6 pt-4 text-sm text-blue-200">
            <Image src="/talkify.png" alt="Talkify logo" width={150} height={32} className="rounded" priority />
          </div>

          <div className="px-8 pb-8">
            <header className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold">Welcome Back</h1>
              <p className="text-sm text-slate-300">Please enter your details to sign in.</p>
            </header>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
              validateOnBlur
            >
              {({ isSubmitting, status }) => (
                <Form className="mt-8 space-y-4">
                  <FormInput
                    label="Email or Username"
                    name="email"
                    type="email"
                    placeholder="Enter your email or username"
                    iconLeft={<FiMail />}
                    autoComplete="email"
                  />

                  <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    iconLeft={<FiLock />}
                    iconRight={<FiEye />}
                    autoComplete="current-password"
                  />

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-600 bg-[#0f1729] text-blue-500 focus:ring-2 focus:ring-blue-400"
                        defaultChecked
                      />
                      <span>Remember me</span>
                    </label>
                    <button type="button" className="cursor-pointer font-medium text-blue-200 hover:text-blue-100">
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#3b6df6] to-[#2a5be6] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Logging In..." : "Log In"}
                  </button>

                  {status && (
                    <p
                      className={`text-center text-xs font-medium ${
                        status.type === "error" ? "text-amber-300" : "text-emerald-300"
                      }`}
                    >
                      {status.message}
                    </p>
                  )}
                </Form>
              )}
            </Formik>

            <div className="mt-8 space-y-6 text-center text-sm text-slate-300">
              <p>
                Do not have an account yet?{" "}
                <Link className="font-semibold text-blue-200 hover:text-blue-100" href="/register">
                  Sign up
                </Link>
              </p>
              <p className="text-[11px] text-slate-500">© 2024 Talkify. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  iconLeft,
  iconRight,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  autoComplete?: string;
}) {
  const [field, meta] = useField({ name, type });
  const [showPassword, setShowPassword] = useState(false);
  const hasError = Boolean(meta.touched && meta.error);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block space-y-2 text-sm font-medium text-white">
      <span className="text-white/80">{label}</span>
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-white shadow-inner shadow-black/20 transition focus-within:border-blue-400 focus-within:bg-[#0d1a2f] focus-within:shadow-blue-900/30 ${hasError ? "border-red-500 bg-[#1b0b0f]" : "border-slate-700 bg-[#0b1424]"
          }`}
      >
        {iconLeft && <span className="text-slate-400">{iconLeft}</span>}
        <input
          {...field}
          id={name}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="cursor-pointer rounded text-slate-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {showPassword ? <FiEyeOff aria-label="Hide password" /> : <FiEye aria-label="Show password" />}
          </button>
        ) : (
          iconRight && <span className="text-slate-400">{iconRight}</span>
        )}
      </div>
      {hasError && <p className="text-xs font-medium text-red-300">{meta.error}</p>}
    </label>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute right-[-5%] top-20 h-96 w-96 rounded-full bg-blue-900/30 blur-3xl" />
      <div className="absolute bottom-[-10%] left-1/4 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_40%)]" />
    </div>
  );
}
