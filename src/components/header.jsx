import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header({
  userInfo,
  cartCount = 0,
  onCartClick,
  onAuthChange,
  searchValue = "",
  onSearchChange,
  theme = "light",
  onThemeToggle,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStorefront = location.pathname === "/";

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    onAuthChange?.(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-fog/95 px-3 py-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-5 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 lg:flex-nowrap">
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center gap-2 text-base font-black text-zinc-950 no-underline dark:text-white"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-950 font-display text-lg text-white dark:bg-white dark:text-zinc-950">
            D
          </span>
          <span className="truncate">Draken</span>
        </Link>

        {isStorefront ? (
          <label className="order-3 flex w-full items-center gap-3 rounded-full bg-white px-4 py-2.5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:order-none sm:mx-auto sm:max-w-xl">
            <i className="fa-solid fa-magnifying-glass text-sm text-zinc-500 dark:text-zinc-400" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search bags, tech, home..."
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
            />
          </label>
        ) : (
          <nav className="ml-auto hidden items-center gap-5 md:flex">
            <Link className="text-sm font-bold text-zinc-500 no-underline hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white" to="/">
              Shop
            </Link>
            {userInfo && (
              <Link className="text-sm font-bold text-zinc-500 no-underline hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white" to="/profile">
                Account
              </Link>
            )}
          </nav>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onThemeToggle}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:ring-zinc-800 dark:hover:bg-zinc-800"
            aria-label="Toggle dark mode"
          >
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} />
          </button>

          {onCartClick && (
            <button
              type="button"
              onClick={onCartClick}
              className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:ring-zinc-800 dark:hover:bg-zinc-800"
              aria-label="Open cart"
            >
              <i className="fa-solid fa-bag-shopping" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {userInfo ? (
            <div className="hidden items-center gap-2 rounded-full bg-white py-1 pl-3 pr-1 text-sm font-bold shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:flex">
              <Link to="/profile" className="max-w-28 truncate text-zinc-950 no-underline dark:text-white">
                {userInfo.username}
              </Link>
              <button type="button" onClick={logoutHandler} className="rounded-full px-3 py-2 text-xs text-clay hover:bg-clay/10">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden rounded-full px-3 py-2 text-sm font-bold text-zinc-600 no-underline hover:bg-white hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white sm:inline-flex"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-clay dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
