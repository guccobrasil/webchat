export function ChatInput({ newMessage, setNewMessage, sendMessage }) {
  return (
    <form
      onSubmit={sendMessage}
      className="flex p-4 border-t border-gray-700 gap-4 bg-gray-900 rounded-b-lg"
    >
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        type="text"
        placeholder="Type a message..."
        className="p-3 flex-1 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Send
      </button>
    </form>
  );
}