import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login({ onAuthChange }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [requireOTP, setRequireOTP] = useState(false);
  const [formValues, setFormValues] = useState({ email: "", password: "", otp: "" });

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email);
  const isPasswordValid = formValues.password.length >= 6;
  const isOtpValid = !requireOTP || /^\d{6}$/.test(formValues.otp);
  const isFormValid = requireOTP ? isOtpValid : isEmailValid && isPasswordValid;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid) {
      setMessage("Please enter valid credentials");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const { data } = await axios.post(
        "/api/auth/login",
        {
          email: formValues.email,
          password: formValues.password,
          twoFactorCode: requireOTP ? formValues.otp : undefined,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      onAuthChange?.(data);
      setMessage("Login successful");
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      if (err.response?.data?.requires2FA || err.response?.data?.message === "2FA required") {
        setRequireOTP(true);
        setMessage("Enter the 6 digit code from your authenticator app");
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-76px)] place-items-center bg-fog px-4 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <section className="w-full max-w-md rounded-3xl bg-white p-5 shadow-soft ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-clay">Welcome back</p>
        <h1 className="mt-2 font-display text-4xl leading-tight">Login to Draken</h1>

        <div className="mt-5 grid gap-3">
          {message && <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200">{message}</div>}
          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold">Email</span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              disabled={loading || requireOTP}
              placeholder="you@example.com"
              className="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:ring-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold">Password</span>
            <div className="flex rounded-full border border-zinc-200 bg-white focus-within:ring-2 focus-within:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-within:ring-white">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formValues.password}
                onChange={handleChange}
                disabled={loading || requireOTP}
                className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-3 text-sm text-zinc-950 outline-none disabled:opacity-60 dark:text-white"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="grid w-12 place-items-center text-zinc-500 dark:text-zinc-300" aria-label="Toggle password visibility">
                <i className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
              </button>
            </div>
          </label>

          {requireOTP && (
            <label className="grid gap-2">
              <span className="text-sm font-bold">2FA OTP</span>
              <input
                type="text"
                name="otp"
                value={formValues.otp}
                onChange={(event) => setFormValues((current) => ({ ...current, otp: event.target.value.replace(/\D/g, "") }))}
                maxLength={6}
                inputMode="numeric"
                placeholder="Enter 6 digit OTP"
                className="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:ring-white"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-950" />}
            {loading ? "Verifying..." : requireOTP ? "Verify OTP" : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-300">
          New user? <Link className="font-bold text-clay no-underline" to="/signup">Create account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
