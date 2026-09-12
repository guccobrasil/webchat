import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../supabaseCliente";

function App() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [usersOnline, setUsersOnline] = useState([]);

  const chatContainerRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("Erro ao buscar sessão:", error.message);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Erro na autenticação:", error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Erro ao sair:", error.message);
  };

  useEffect(() => {
    if (!session?.user) {
      setUsersOnline([]);
      return;
    }

    const userId = session.user.id;
    const userName =
      session.user.user_metadata?.full_name || session.user.email;

    const roomOne = supabase.channel("room_one", {
      config: {
        broadcast: { self: true },
        presence: { key: userId },
      },
    });

    channelRef.current = roomOne;

    // Listener para mensagens normais do chat
    roomOne.on("broadcast", { event: "message" }, (payload) => {
      setMessages((prev) => [...prev, payload.payload]);
    });

    // Listener de Presença: Sincronização e Sessões Duplicadas
    roomOne.on("presence", { event: "sync" }, () => {
      const state = roomOne.presenceState();

      let userConnectionCount = 0;
      Object.values(state).forEach((presences) => {
        presences.forEach((presence) => {
          if (presence.id === userId) userConnectionCount++;
        });
      });

      if (userConnectionCount > 1) {
        alert("Sua conta foi conectada em outro local/aba. Desconectando...");
        signOut();
        return;
      }

      setUsersOnline(Object.keys(state));
    });

    // Listener de Presença: Quando um novo usuário entra na sala
    roomOne.on("presence", { event: "join" }, ({ newPresences }) => {
      newPresences.forEach((presence) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: `sys-join-${presence.id}-${Date.now()}`,
            isSystem: true,
            message: `${presence.user_name || "Um usuário"} entrou na sala`,
            timestamp: new Date().toISOString(),
          },
        ]);
      });
    });

    // Subscrição do canal
    roomOne.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await roomOne.track({
          id: userId,
          user_name: userName,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      roomOne.unsubscribe();
      channelRef.current = null;
    };
  }, [session?.user?.id]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !channelRef.current) return;

    const payload = {
      id: `${session.user.id}-${Date.now()}`,
      message: trimmedMessage,
      user_email: session.user.email,
      user_name:
        session.user.user_metadata?.full_name || session.user.email,
      avatar: session.user.user_metadata?.avatar_url,
      timestamp: new Date().toISOString(),
    };

    await channelRef.current.send({
      type: "broadcast",
      event: "message",
      payload,
    });

    setNewMessage("");
  };

  const formatTime = useCallback((isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  if (!session) {
    return (
      <div className="w-full flex h-screen justify-center items-center">
        <button
          onClick={signIn}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign in with Google to chat
        </button>
      </div>
    );
  }

  const currentUserEmail = session.user.email;

  return (
    <div className="w-full flex h-screen justify-center items-center p-4">
      <div className="border-[1px] border-gray-700 max-w-6xl w-full min-h-[600px] rounded-lg flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-center h-20 border-b-[1px] border-gray-700 px-4">
          <div>
            <p className="text-gray-300">Signed in as {currentUserEmail}</p>
            <p className="text-gray-400 italic text-sm">
              {usersOnline.length} user(s) online
            </p>
          </div>
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Main Chat */}
        <div
          ref={chatContainerRef}
          className="p-4 flex flex-col overflow-y-auto h-[500px]"
        >
          {messages.map((msg) => {
            // Renderização de mensagem do sistema (Entrada na sala)
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="my-2 flex justify-center w-full">
                  <span className="text-xs italic text-gray-400 bg-gray-800/60 px-3 py-1 rounded-full border border-gray-700">
                    {msg.message}
                  </span>
                </div>
              );
            }

            // Renderização normal das mensagens de usuários
            const isMyMessage = msg.user_email === currentUserEmail;

            return (
              <div
                key={msg.id}
                className={`my-2 flex w-full items-start ${
                  isMyMessage ? "justify-end" : "justify-start"
                }`}
              >
                {!isMyMessage && (
                  <img
                    src={msg.avatar || "https://via.placeholder.com/40"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-2"
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
                  <span
                    className={`text-[10px] text-gray-400 mt-1 ${
                      isMyMessage ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {isMyMessage && (
                  <img
                    src={msg.avatar || "https://via.placeholder.com/40"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full ml-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Input */}
        <form
          onSubmit={sendMessage}
          className="flex p-4 border-t-[1px] border-gray-700 gap-4"
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            type="text"
            placeholder="Type a message..."
            className="p-3 flex-1 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;