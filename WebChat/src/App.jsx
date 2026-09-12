// import { useEffect, useState, useRef } from "react";
// import { supabase } from "../supabaseCliente";


// function App() {
//   const [session, setSession] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [usersOnline, setUsersOnline] = useState([]);

//   const chatContainerRef = useRef(null);
//   const scroll = useRef();

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   console.log(session);

//   // sign in
//   const signIn = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: "google",
//     });
//   };

//   // sign out
//   const signOut = async () => {
//     const { error } = await supabase.auth.signOut();
//   };

//   useEffect(() => {
//     if (!session?.user) {
//       setUsersOnline([]);
//       return;
//     }
//     const roomOne = supabase.channel("room_one", {
//       config: {
//         broadcast: { self: true },
//         presence: {
//           key: session?.user?.id,
//         },
//       },
//     });

//     roomOne.on("broadcast", { event: "message" }, (payload) => {
//       setMessages((prevMessages) => [...prevMessages, payload.payload]);
//       // console.log(messages);
//     });

//     // handle user presence
//     roomOne.on("presence", { event: "sync" }, () => {
//       const state = roomOne.presenceState();
//       setUsersOnline(Object.keys(state));
//     });

//     // track user presence subscribe!
//     roomOne.subscribe(async (status) => {
//       if (status === "SUBSCRIBED") {
//         await roomOne.track({
//           id: session?.user?.id,
//         });
//       }
//     });

//     return () => {
//       roomOne.unsubscribe();
//     };
//   }, [session]);

//   // send message
//   const sendMessage = async (e) => {
//     e.preventDefault();

//     supabase.channel("room_one").send({
//       type: "broadcast",
//       event: "message",
//       payload: {
//         message: newMessage,
//         user_name: session?.user?.user_metadata?.email,
//         avatar: session?.user?.user_metadata?.avatar_url,
//         timestamp: new Date().toISOString(),
//       },
//     });
//     setNewMessage("");
//   };

//   const formatTime = (isoString) => {
//     return new Date(isoString).toLocaleTimeString("en-us", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   useEffect(() => {
//     setTimeout(() => {
//       if (chatContainerRef.current) {
//         chatContainerRef.current.scrollTop =
//           chatContainerRef.current.scrollHeight;
//       }
//     }, [100]);
//   }, [messages]);

//   if (!session) {
//     return (
//       <div className="w-full flex h-screen justify-center items-center">
//         <button onClick={signIn}>Sign in with Google to chat</button>
//       </div>
//     );
//   } else {
//     return (
//       <div className="w-full flex h-screen justify-center items-center p-4">
//         <div className="border-[1px] border-gray-700 max-w-6xl w-full min-h-[600px] rounded-lg">
//           {/* Header */}
//           <div className="flex justify-between h-20 border-b-[1px] border-gray-700">
//             <div className="p-4">
//               <p className="text-gray-300">
//                 Signed in as {session?.user?.user_metadata?.email}
//               </p>
//               <p className="text-gray-300 italic text-sm">
//                 {usersOnline.length} users online
//               </p>
//             </div>
//             <button onClick={signOut} className="m-2 sm:mr-4">
//               Sign out
//             </button>
//           </div>
//           {/* main chat */}
//           <div
//             ref={chatContainerRef}
//             className="p-4 flex flex-col overflow-y-auto h-[500px]"
//           >
//             {messages.map((msg, idx) => {
//               const isMyMessage = msg?.user_name === session?.user?.user_metadata?.email;

//               return (
//                 <div
//                   key={idx}
//                   className={`my-2 flex w-full items-start ${isMyMessage ? "justify-end" : "justify-start"
//                     }`}
//                 >
//                   {!isMyMessage && (
//                     <img
//                       src={msg?.avatar}
//                       alt="/"
//                       className="w-10 h-10 rounded-full mr-2"
//                     />
//                   )}

//                   <div className="flex flex-col w-full">
//                     <div
//                       className={`p-1 max-w-[70%] rounded-xl ${isMyMessage
//                           ? "bg-gray-700 text-white ml-auto"
//                           : "bg-gray-500 text-white mr-auto"
//                         }`}
//                     >
//                       <p>{msg.message}</p>
//                     </div>
//                     <div
//                       className={`text-xs opacity-75 pt-1 ${isMyMessage ? "text-right mr-2" : "text-left ml-2"
//                         }`}
//                     >
//                       {formatTime(msg?.timestamp)}
//                     </div>
//                   </div>

//                   {isMyMessage && (
//                     <img
//                       src={msg?.avatar}
//                       alt="/"
//                       className="w-10 h-10 rounded-full ml-2"
//                     />
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//           {/* message input */}
//           <form
//             onSubmit={sendMessage}
//             className="flex flex-col sm:flex-row p-4 border-t-[1px] border-gray-700"
//           >
//             <input
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               type="text"
//               placeholder="Type a message..."
//               className="p-2 w-full bg-[#00000040] rounded-lg"
//             />
//             <button className="mt-4 sm:mt-0 sm:ml-8 text-white max-h-12">
//               Send
//             </button>
//             <span ref={scroll}></span>
//           </form>
//         </div>
//       </div>
//     );
//   }
// }

// export default App;

import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseCliente";

function App() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [usersOnline, setUsersOnline] = useState([]);

  const chatContainerRef = useRef(null);
  const channelRef = useRef(null); // Ref para reaproveitar a conexão do canal

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login com Google
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (!session?.user) {
      setUsersOnline([]);
      return;
    }

    // Configura o canal com `broadcast: { self: true }`
    const roomOne = supabase.channel("room_one", {
      config: {
        broadcast: { self: true }, // <-- IMPORTANTE: faz o remetente receber a própria mensagem
        presence: {
          key: session?.user?.id,
        },
      },
    });

    // Guardamos o canal na ref para usar na função sendMessage
    channelRef.current = roomOne;

    // Listener para receber mensagens
    roomOne.on("broadcast", { event: "message" }, (payload) => {
      setMessages((prevMessages) => [...prevMessages, payload.payload]);
    });

    // Listener do Presence (usuários online)
    roomOne.on("presence", { event: "sync" }, () => {
      const state = roomOne.presenceState();
      const userId = session?.user?.id;
      let mySessions = 0;
      Object.values(state).forEach((presences) => {
        presences.forEach((p) => {
          if (p.id === userId) mySessions++;
        });
      });
      //Se houver mais de uma conexão para o mesmo ID
      if(mySession > 1) {
        alert("Identificamos que você abriu este chat em outra aba ou dispositivo.");
        supabase.auth.signOut();
      }
      setUsersOnline(Object.keys(state));
    });

    // Inscrição no canal
    roomOne.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await roomOne.track({
          id: session?.user?.id,
        });
      }
    });

    return () => {
      roomOne.unsubscribe();
    };
  }, [session]);

  // Função para enviar mensagem usando a referência do canal ativo
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!newMessage.trim() || !channelRef.current) return;

    await channelRef.current.send({
      type: "broadcast",
      event: "message",
      payload: {
        message: newMessage,
        user_name: session?.user?.user_metadata?.email,
        avatar: session?.user?.user_metadata?.avatar_url,
        timestamp: new Date().toISOString(),
      },
    });

    setNewMessage("");
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString("en-us", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Autoscroll para o final da conversa
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!session) {
    return (
      <div className="w-full flex h-screen justify-center items-center">
        <button onClick={signIn}>Sign in with Google to chat</button>
      </div>
    );
  }

  return (
    <div className="w-full flex h-screen justify-center items-center p-4">
      <div className="border-[1px] border-gray-700 max-w-6xl w-full min-h-[600px] rounded-lg">
        {/* Header */}
        <div className="flex justify-between h-20 border-b-[1px] border-gray-700">
          <div className="p-4">
            <p className="text-gray-300">
              Signed in as {session?.user?.user_metadata?.email}
            </p>
            <p className="text-gray-300 italic text-sm">
              {usersOnline.length} users online
            </p>
          </div>
          <button onClick={signOut} className="m-2 sm:mr-4">
            Sign out
          </button>
        </div>

        {/* Main Chat */}
        <div
          ref={chatContainerRef}
          className="p-4 flex flex-col overflow-y-auto h-[500px]"
        >
          {messages.map((msg, idx) => {
            // Verifica se a mensagem foi enviada pelo usuário atual
            const isMyMessage =
              msg?.user_name === session?.user?.user_metadata?.email;

            return (
              <div
                key={idx}
                className={`my-2 flex w-full items-start ${isMyMessage ? "justify-end" : "justify-start"
                  }`}
              >
                {/* Foto no lado esquerdo (outros usuários) */}
                {!isMyMessage && (
                  <img
                    src={msg?.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-2"
                  />
                )}

                <div className="flex flex-col w-full">
                  <div
                    className={`p-2 max-w-[70%] rounded-xl ${isMyMessage
                      ? "bg-gray-700 text-white ml-auto"
                      : "bg-gray-500 text-white mr-auto"
                      }`}
                  >
                    <p>{msg.message}</p>
                  </div>
                  {/* Horário */}
                  <div
                    className={`text-xs opacity-75 pt-1 ${isMyMessage ? "text-right mr-2" : "text-left ml-2"
                      }`}
                  >
                    {formatTime(msg?.timestamp)}
                  </div>
                </div>

                {/* Foto no lado direito (minhas mensagens) */}
                {isMyMessage && (
                  <img
                    src={msg?.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full ml-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Formulário de Input */}
        <form
          onSubmit={sendMessage}
          className="flex flex-col sm:flex-row p-4 border-t-[1px] border-gray-700"
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            type="text"
            placeholder="Type a message..."
            className="p-2 w-full bg-[#00000040] rounded-lg text-white"
          />
          <button className="mt-4 sm:mt-0 sm:ml-8 text-white max-h-12">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;