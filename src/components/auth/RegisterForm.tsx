"use client";

import Image from "next/image";
import { useState } from "react";
import { Form, Formik, useField } from "formik";
import * as Yup from "yup";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import { useAuthStore } from "@/store/useAuthStore";

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().min(8, "At least 8 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export function RegisterForm() {
  const setSession = useAuthStore((state) => state.setSession);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const username = values.username;
    const email = values.email;

    setSession({
      user: {
        id: "user-2",
        name: username,
        username,
        email,
      },
      token: "mock-token-register",
    });
    setStatus(`Account created for ${username}`);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a1221] text-white">
      <BackgroundGlow />
      <div className="relative w-full max-w-xl px-4 py-12 sm:px-0">
        <div className="rounded-3xl border border-white/10 bg-[#0f1729]/80 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-center justify-center gap-2 px-6 pb-2 pt-8 text-sm text-blue-200">
            <Image src="/talkify.png" alt="Talkify logo" width={150} height={32} className="rounded" priority />
          </div>

          <div className="px-8 pb-8 pt-2">
            <header className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold">Create an Account</h1>
              <p className="text-sm text-slate-300">
                Enter your details below to create your account and start chatting.
              </p>
            </header>

            <Formik
              initialValues={{ username: "", email: "", password: "", confirmPassword: "" }}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
              validateOnBlur
            >
              <Form className="mt-8 space-y-4">
                <FormInput
                  label="Username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  iconLeft={<FiUser />}
                  autoComplete="username"
                />

                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
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
                  autoComplete="new-password"
                />

                <FormInput
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  iconLeft={<FiLock />}
                  iconRight={<FiEye />}
                  autoComplete="new-password"
                />

                <button
                  type="submit"
                  className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-xl bg-linear-to-r from-[#3b6df6] to-[#2a5be6] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/50 transition hover:brightness-110"
                >
                  Sign Up
                </button>

                <Divider label="OR CONTINUE WITH" />

                {status && <p className="text-center text-xs text-emerald-300">{status}</p>}
              </Form>
            </Formik>

            <div className="mt-8 space-y-6 text-center text-sm text-slate-300">
              <p>
                Already have an account?{" "}
                <a className="font-semibold text-blue-200 hover:text-blue-100" href="/login">
                  Log in
                </a>
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

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">
      <span className="h-px flex-1 bg-slate-700" />
      {label}
      <span className="h-px flex-1 bg-slate-700" />
    </div>
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
