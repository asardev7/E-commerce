import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Signup({ onAuthChange }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    termsAccepted: false,
  });

  const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(formValues.username);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email);
  const isPasswordValid = formValues.password.length >= 6 && formValues.password.length <= 30;
  const isConfirmValid = formValues.confirmpassword === formValues.password && formValues.confirmpassword !== "";
  const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isConfirmValid && formValues.termsAccepted;

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value.trim(),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid) {
      setMessage("Please complete the form correctly");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const { data } = await axios.post(
        "/api/auth/signup",
        {
          username: formValues.username,
          email: formValues.email.toLowerCase(),
          password: formValues.password,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      onAuthChange?.(data);
      setMessage("Account created successfully");
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-76px)] place-items-center bg-fog px-4 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <section className="w-full max-w-md rounded-3xl bg-white p-5 shadow-soft ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-clay">Create account</p>
        <h1 className="mt-2 font-display text-4xl leading-tight">Join Draken</h1>

        <div className="mt-5 grid gap-3">
          {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">{message}</div>}
          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold">Username</span>
            <input
              type="text"
              name="username"
              value={formValues.username}
              onChange={handleChange}
              maxLength={20}
              placeholder="Choose a username"
              className="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:ring-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold">Email</span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:ring-white"
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
                className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-3 text-sm text-zinc-950 outline-none dark:text-white"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="grid w-12 place-items-center text-zinc-500 dark:text-zinc-300" aria-label="Toggle password visibility">
                <i className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
              </button>
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold">Confirm password</span>
            <input
              type="password"
              name="confirmpassword"
              value={formValues.confirmpassword}
              onChange={handleChange}
              className="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:ring-white"
            />
          </label>

          <label className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formValues.termsAccepted}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-950"
            />
            <span>I agree to the terms and conditions</span>
          </label>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-950" />}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-300">
          Already have an account? <Link className="font-bold text-clay no-underline" to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Signup;
