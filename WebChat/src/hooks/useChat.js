import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../services/supabaseCliente";

export function useChat() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [usersOnline, setUsersOnline] = useState([]);

  const channelRef = useRef(null);

  // 1. Gerenciamento de Sessão de Usuário
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("Erro ao buscar sessão:", error.message);
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    //log

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // 2. Busca o histórico inicial (Limitado a 25 mensagens para o novo usuário)
  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false }) // Pega do mais recente para o mais antigo
      .limit(25); // Traz apenas o contexto recente (25 mensagens)

    if (error) {
      console.error("Erro ao buscar histórico de mensagens:", error);
    } else if (data) {
      // Inverte o array para exibir cronologicamente na tela (mais antigas no topo)
      const formattedMessages = data.reverse().map((msg) => ({
        id: msg.id,
        message: msg.content,
        user_email: msg.user_email,
        user_name: msg.user_name,
        avatar: msg.avatar,
        timestamp: msg.created_at,
        isSystem: false,
      }));
      setMessages(formattedMessages);
    }
  };

  // 3. Canal de Comunicação, Presença e Escuta em Tempo Real do Banco
  useEffect(() => {
    if (!session?.user) {
      setUsersOnline([]);
      setMessages([]);
      return;
    }

    // Carrega o histórico das últimas 25 mensagens
    fetchHistory();

    const userId = session.user.id;
    const userName = session.user.user_metadata?.full_name || session.user.email;

    const roomOne = supabase.channel("room_one", {
      config: {
        presence: { key: userId },
      },
    });

    channelRef.current = roomOne;

    // Listener do Postgres Realtime (Quando outra pessoa insere uma nova mensagem)
    roomOne.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const newMsg = payload.new;

        setMessages((prev) => {
          // Evita duplicar na tela se a mensagem já foi adicionada pela atualização otimista
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [
            ...prev,
            {
              id: newMsg.id,
              message: newMsg.content,
              user_email: newMsg.user_email,
              user_name: newMsg.user_name,
              avatar: newMsg.avatar,
              timestamp: newMsg.created_at,
              isSystem: false,
            },
          ];
        });
      }
    );

    // Listener de Presença (Detecção de múltiplos logins)
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

    // Listener de Presença (Notificação de entrada de usuários)
    roomOne.on("presence", { event: "join" }, ({ newPresences }) => {
      newPresences.forEach((presence) => {
        if (presence.id === userId) return; // Ignora aviso de si mesmo

        setMessages((prev) => [
          ...prev,
          {
            id: `sys-join-${presence.id}-${Date.now()}`,
            isSystem: true,
            message: `${presence.user_name || "Um usuário"} entrou na sala`,
            timestamp: new Date().toISOString(),
          },
        ]);
      });
    });

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

  // 4. Envio de Mensagem (Com Atualização Otimista)
  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();

    if (!trimmedMessage || !session) return;

    const messageData = {
      content: trimmedMessage,
      user_email: session.user.email,
      user_name: session.user.user_metadata?.full_name || session.user.email,
      avatar: session.user.user_metadata?.avatar_url || null,
    };

    // Insere no banco e retorna a linha recém-criada (.select())
    const { data, error } = await supabase.from("messages").insert([messageData]).select();

    if (error) {
      console.error("Erro ao enviar mensagem:", error.message);
    } else {
      setNewMessage(""); // Limpa o input

      // Atualização otimista imediata na tela do remetente
      if (data && data.length > 0) {
        const createdMsg = data[0];
        setMessages((prev) => {
          if (prev.some((m) => m.id === createdMsg.id)) return prev;
          return [
            ...prev,
            {
              id: createdMsg.id,
              message: createdMsg.content,
              user_email: createdMsg.user_email,
              user_name: createdMsg.user_name,
              avatar: createdMsg.avatar,
              timestamp: createdMsg.created_at,
              isSystem: false,
            },
          ];
        });
      }
    }
  };

  const formatTime = useCallback((isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return {
    session,
    messages,
    newMessage,
    setNewMessage,
    usersOnline,
    signIn,
    signOut,
    sendMessage,
    formatTime,
  };
}