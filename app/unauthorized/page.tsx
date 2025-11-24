// app/unauthorized/page.tsx
export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">⛔ Unauthorized</h1>
        <p className="text-xl mb-8">
          You don't have permission to access this page.
        </p>
        <a
          href="/"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
