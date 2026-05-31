import ThemeContextProvider from "../context/theme-context";
import ThemeSwitcher from "./ThemeSwitcher";

export default function NotFound() {
  return (
    <ThemeContextProvider>
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-medium sm:text-4xl">Page not found</h1>
        <p className="mt-4 max-w-md text-gray-700 dark:text-gray-300">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have been
          moved.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-gray-900 px-7 py-3 text-white transition hover:scale-110 hover:bg-gray-950 active:scale-105 focus-ring dark:bg-white dark:bg-opacity-10"
        >
          Back home
        </a>
      </main>
      <ThemeSwitcher />
    </ThemeContextProvider>
  );
}
