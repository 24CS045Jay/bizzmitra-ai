import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChatSession {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CopilotMessage {
  id: string;
  session_id?: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  badge?: string;
  bullets?: string[];
  actionLabel?: string;
}

const DEFAULT_WELCOME_MSG: CopilotMessage = {
  id: "welcome",
  sender: "assistant",
  text: "Hello! I am your BizzMitra Blueprint Copilot. How can I help with your transformation workspace today?",
  timestamp: "Just now",
};

export function useChatSessions(workspaceId?: string | null) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([DEFAULT_WELCOME_MSG]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const initialUrlChecked = useRef(false);

  // Helper to get active auth token
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        };
      }
    } catch {}
    return { "Content-Type": "application/json" };
  };

  // 1. Determine Initial Active Session from URL or LocalStorage
  const getInitialActiveSessionId = useCallback((wsId: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlChatId = params.get("chat");
      if (urlChatId) return urlChatId;

      return window.localStorage.getItem(`bizzmitra.activeChatSession.${wsId}`);
    } catch {
      return null;
    }
  }, []);

  // Update URL and LocalStorage when active session changes
  const persistActiveSessionId = useCallback((wsId: string, sId: string | null) => {
    if (typeof window === "undefined") return;
    try {
      if (sId) {
        window.localStorage.setItem(`bizzmitra.activeChatSession.${wsId}`, sId);
        const url = new URL(window.location.href);
        if (url.searchParams.get("chat") !== sId) {
          url.searchParams.set("chat", sId);
          window.history.replaceState({}, "", url.toString());
        }
      } else {
        window.localStorage.removeItem(`bizzmitra.activeChatSession.${wsId}`);
        const url = new URL(window.location.href);
        if (url.searchParams.has("chat")) {
          url.searchParams.delete("chat");
          window.history.replaceState({}, "", url.toString());
        }
      }
    } catch {}
  }, []);

  // 2. Fetch Sessions List
  const fetchSessions = useCallback(async () => {
    if (!workspaceId) {
      setSessions([]);
      setActiveSessionId(null);
      return;
    }

    setIsLoadingSessions(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/chat/sessions?workspaceId=${encodeURIComponent(workspaceId)}`, {
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        const loaded: ChatSession[] = json.sessions || [];
        setSessions(loaded);

        // Determine which session to activate
        let targetId = activeSessionId;
        if (!initialUrlChecked.current) {
          targetId = getInitialActiveSessionId(workspaceId);
          initialUrlChecked.current = true;
        }

        const exists = loaded.some((s) => s.id === targetId);
        if (!exists && loaded.length > 0) {
          targetId = loaded[0]!.id;
        }

        if (targetId && targetId !== activeSessionId) {
          setActiveSessionId(targetId);
          persistActiveSessionId(workspaceId, targetId);
        } else if (loaded.length === 0) {
          // If user has zero sessions in this workspace, auto-create the initial "New chat"
          void createSession("New chat");
        }
      } else {
        // Fallback to local storage cache if offline / unauthenticated
        loadLocalSessions(workspaceId);
      }
    } catch (err) {
      console.warn("[useChatSessions] Server fetch error, using local fallback:", err);
      loadLocalSessions(workspaceId);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [workspaceId, activeSessionId, getInitialActiveSessionId, persistActiveSessionId]);

  // Local storage session fallback for mock/offline testing
  const loadLocalSessions = (wsId: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`bizzmitra.localSessions.${wsId}`);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        setSessions(parsed);
        if (parsed.length > 0 && (!activeSessionId || !parsed.some((s) => s.id === activeSessionId))) {
          setActiveSessionId(parsed[0]!.id);
        }
      } else {
        const fallbackSession: ChatSession = {
          id: `local-sess-${Date.now()}`,
          workspace_id: wsId,
          user_id: "local-user",
          title: "New chat",
          is_pinned: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setSessions([fallbackSession]);
        setActiveSessionId(fallbackSession.id);
        window.localStorage.setItem(`bizzmitra.localSessions.${wsId}`, JSON.stringify([fallbackSession]));
      }
    } catch {}
  };

  // 3. Fetch Messages for Active Session (Loads cache instantly, then syncs with server)
  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      setMessages([DEFAULT_WELCOME_MSG]);
      return;
    }

    // 1. Immediately load cached messages from localStorage for instant UI response
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(`bizzmitra.localMsgs.${sessionId}`);
        if (raw) {
          const parsed: CopilotMessage[] = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch {}
    }

    // 2. Fetch fresh history from server in background
    setIsLoadingMessages(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        const dbMsgs = json.messages || [];
        if (dbMsgs.length > 0) {
          const formatted: CopilotMessage[] = dbMsgs.map((m: any) => ({
            id: m.id,
            session_id: m.session_id,
            sender: m.sender,
            text: m.text,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            badge: m.badge || undefined,
            bullets: Array.isArray(m.bullets) && m.bullets.length > 0 ? m.bullets : undefined,
          }));
          setMessages(formatted);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(`bizzmitra.localMsgs.${sessionId}`, JSON.stringify(formatted));
          }
        }
      }
    } catch (err) {
      console.warn("[useChatSessions] Messages fetch error:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Save current messages to local cache whenever messages change for active session
  useEffect(() => {
    if (activeSessionId && messages.length > 0 && typeof window !== "undefined") {
      try {
        // Do not overwrite existing cache if it's just the default welcome message and cache has more
        const isOnlyDefaultWelcome = messages.length === 1 && messages[0]?.id === "welcome";
        if (!isOnlyDefaultWelcome) {
          window.localStorage.setItem(`bizzmitra.localMsgs.${activeSessionId}`, JSON.stringify(messages));
        }
      } catch {}
    }
  }, [messages, activeSessionId]);

  // Auto-fetch sessions when workspaceId changes
  useEffect(() => {
    initialUrlChecked.current = false;
    void fetchSessions();
  }, [workspaceId]);

  // Auto-fetch messages when activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      void fetchMessages(activeSessionId);
      if (workspaceId) {
        persistActiveSessionId(workspaceId, activeSessionId);
      }
    } else {
      setMessages([DEFAULT_WELCOME_MSG]);
    }
  }, [activeSessionId, workspaceId, fetchMessages, persistActiveSessionId]);

  // 4. Create Session
  const createSession = async (title: string = "New chat"): Promise<ChatSession | null> => {
    if (!workspaceId) return null;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers,
        body: JSON.stringify({ workspaceId, title }),
      });

      if (res.ok) {
        const json = await res.json();
        const newSess: ChatSession = json.session;
        setSessions((prev) => [newSess, ...prev.filter((s) => s.id !== newSess.id)]);
        setActiveSessionId(newSess.id);
        persistActiveSessionId(workspaceId, newSess.id);
        setMessages([DEFAULT_WELCOME_MSG]);
        return newSess;
      }
    } catch (err) {
      console.warn("[useChatSessions] createSession error, falling back locally:", err);
    }

    // Local fallback creation
    const localSess: ChatSession = {
      id: `local-sess-${Date.now()}`,
      workspace_id: workspaceId,
      user_id: "local-user",
      title,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSessions((prev) => [localSess, ...prev]);
    setActiveSessionId(localSess.id);
    persistActiveSessionId(workspaceId, localSess.id);
    setMessages([DEFAULT_WELCOME_MSG]);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`bizzmitra.localSessions.${workspaceId}`, JSON.stringify([localSess, ...sessions]));
    }
    return localSess;
  };

  // 5. Rename Session
  const renameSession = async (id: string, newTitle: string): Promise<boolean> => {
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return false;

    // Optimistic update
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: cleanTitle, updated_at: new Date().toISOString() } : s)),
    );

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/chat/sessions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ title: cleanTitle }),
      });
      return res.ok;
    } catch {
      return true;
    }
  };

  // 6. Delete Session
  const deleteSession = async (id: string): Promise<boolean> => {
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);

    // If deleted session was active, switch to next available or create a fresh one
    if (activeSessionId === id) {
      if (remaining.length > 0) {
        const nextId = remaining[0]!.id;
        setActiveSessionId(nextId);
        if (workspaceId) persistActiveSessionId(workspaceId, nextId);
      } else if (workspaceId) {
        void createSession("New chat");
      }
    }

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/chat/sessions/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers,
      });
      return res.ok;
    } catch {
      return true;
    }
  };

  // 7. Switch Session (Instantly switches view and loads cached conversation)
  const switchSession = (id: string) => {
    if (id === activeSessionId) return;

    if (typeof window !== "undefined") {
      try {
        const cached = window.localStorage.getItem(`bizzmitra.localMsgs.${id}`);
        if (cached) {
          const parsed: CopilotMessage[] = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          } else {
            setMessages([DEFAULT_WELCOME_MSG]);
          }
        } else {
          setMessages([DEFAULT_WELCOME_MSG]);
        }
      } catch {
        setMessages([DEFAULT_WELCOME_MSG]);
      }
    }

    setActiveSessionId(id);
    if (workspaceId) {
      persistActiveSessionId(workspaceId, id);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSessionId,
    activeSession,
    messages,
    setMessages,
    isLoadingSessions,
    isLoadingMessages,
    createSession,
    renameSession,
    deleteSession,
    switchSession,
    refreshSessions: fetchSessions,
    refreshMessages: () => (activeSessionId ? fetchMessages(activeSessionId) : Promise.resolve()),
  };
}
