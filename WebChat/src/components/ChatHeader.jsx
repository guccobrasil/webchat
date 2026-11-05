export function ChatHeader({ email, onlineCount, onSignOut }) {
  return (
    <div className="flex justify-between items-center h-20 border-b border-gray-700 px-6 bg-gray-900 rounded-t-lg">
      <div>
        <p className="text-gray-200 font-medium">Signed in as {email}</p>
        <p className="text-gray-400 italic text-sm">
          {onlineCount} user(s) online
        </p>
      </div>
      <button
        onClick={onSignOut}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
      >
        Sign out
      </button>
    </div>
  );
}