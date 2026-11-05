export function LoginScreen({ onSignIn }) {
  return (
    <div className="w-full flex h-screen justify-center items-center bg-gray-900">
      <button
        onClick={onSignIn}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
      >
        Sign in with Google to chat
      </button>
    </div>
  );
}