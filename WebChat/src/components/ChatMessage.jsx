export function ChatMessage({ msg, currentUserEmail, formatTime }) {
  if (msg.isSystem) {
    return (
      <div className="my-2 flex justify-center w-full">
        <span className="text-xs italic text-gray-400 bg-gray-800/60 px-3 py-1 rounded-full border border-gray-700">
          {msg.message}
        </span>
      </div>
    );
  }

  const isMyMessage = msg.user_email === currentUserEmail;

  return (
    <div className={`my-2 flex w-full items-start ${isMyMessage ? "justify-end" : "justify-start"}`}>
      {!isMyMessage && (
        <img
          src={msg.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          className="w-10 h-10 rounded-full mr-2 object-cover"
        />
      )}

      <div className="flex flex-col max-w-[70%]">
        <div
          className={`p-3 rounded-xl break-words ${
            isMyMessage
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-700 text-white rounded-bl-none"
          }`}
        >
          {!isMyMessage && (
            <span className="text-xs font-bold text-gray-300 block mb-1">
              {msg.user_name}
            </span>
          )}
          <p>{msg.message}</p>
        </div>
        <span className={`text-[10px] text-gray-400 mt-1 ${isMyMessage ? "text-right" : "text-left"}`}>
          {formatTime(msg.timestamp)}
        </span>
      </div>

      {isMyMessage && (
        <img
          src={msg.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          className="w-10 h-10 rounded-full ml-2 object-cover"
        />
      )}
    </div>
  );
}