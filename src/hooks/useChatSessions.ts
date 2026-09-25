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

// Local storage key helpers
function getSessionStorageKeys(wsId: string, userId?: string | null): string[] {
  const keys = [`bizzmitra.localSessions.${wsId}`];
  if (userId) {
    keys.unshift(`bizzmitra.userSessions.${userId}.${wsId}`);
    keys.unshift(`bizzmitra.chatSessions.${userId}.${wsId}`);
  }
  return keys;
}

function getActiveChatStorageKey(wsId: string, userId?: string | null): string {
  if (userId) {
    return `bizzmitra.userActiveChat.${userId}.${wsId}`;
  }
  return `bizzmitra.activeChatSession.${wsId}`;
}

function readCachedSessions(wsId: string, userId?: string | null): ChatSession[] {
  if (typeof window === "undefined") return [];
  const keys = getSessionStorageKeys(wsId, userId);
  for (const k of keys) {
    try {
      const raw = window.localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }
  return [];
}

function saveCachedSessions(wsId: string, sessions: ChatSession[], userId?: string | null) {
  if (typeof window === "undefined" || !wsId) return;
  try {
    const raw = JSON.stringify(sessions);
    window.localStorage.setItem(`bizzmitra.localSessions.${wsId}`, raw);
    if (userId) {
      window.localStorage.setItem(`bizzmitra.userSessions.${userId}.${wsId}`, raw);
      window.localStorage.setItem(`bizzmitra.chatSessions.${userId}.${wsId}`, raw);
    }
  } catch {}
}

function readCachedMessages(sessionId: string): CopilotMessage[] {
  if (typeof window === "undefined" || !sessionId) return [];
  try {
    const raw1 = window.localStorage.getItem(`bizzmitra.localMsgs.${sessionId}`);
    if (raw1) {
      const parsed = JSON.parse(raw1);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const raw2 = window.localStorage.getItem(`bizzmitra.chatMsgs.${sessionId}`);
    if (raw2) {
      const parsed = JSON.parse(raw2);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

function saveCachedMessages(sessionId: string, messages: CopilotMessage[]) {
  if (typeof window === "undefined" || !sessionId) return;
  try {
    // Only cache if we have actual messages (more than just default welcome)
    const isOnlyDefault = messages.length === 1 && messages[0]?.id === "welcome";
    const raw = JSON.stringify(messages);
    window.localStorage.setItem(`bizzmitra.localMsgs.${sessionId}`, raw);
    window.localStorage.setItem(`bizzmitra.chatMsgs.${sessionId}`, raw);
  } catch {}
}

export function useChatSessions(workspaceId?: string | null, userId?: string | null) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (!workspaceId) return [];
    return readCachedSessions(workspaceId, userId);
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (!workspaceId || typeof window === "undefined") return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlChatId = params.get("chat");
      if (urlChatId) return urlChatId;

      const userKey = getActiveChatStorageKey(workspaceId, userId);
      const savedUser = window.localStorage.getItem(userKey);
      if (savedUser) return savedUser;

      const savedGlobal = window.localStorage.getItem(`bizzmitra.activeChatSession.${workspaceId}`);
      if (savedGlobal) return savedGlobal;

      const cached = readCachedSessions(workspaceId, userId);
      return cached.length > 0 ? cached[0]!.id : null;
    } catch {
      return null;
    }
  });

  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    if (!activeSessionId) return [DEFAULT_WELCOME_MSG];
    const cached = readCachedMessages(activeSessionId);
    return cached.length > 0 ? cached : [DEFAULT_WELCOME_MSG];
  });

  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const initialUrlChecked = useRef(false);

  // Helper to get active auth token
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const storedDemo = typeof window !== "undefined" ? window.localStorage.getItem("bizzmitra.demoSession") : null;
      if (storedDemo) {
        return {
          "Content-Type": "application/json",
          Authorization: "Bearer demo-token-bypass",
        };
      }

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

  // Determine initial active session ID from URL or storage
  const getInitialActiveSessionId = useCallback((wsId: string, uId?: string | null): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlChatId = params.get("chat");
      if (urlChatId) return urlChatId;

      const key = getActiveChatStorageKey(wsId, uId);
      const saved = window.localStorage.getItem(key);
      if (saved) return saved;

      return window.localStorage.getItem(`bizzmitra.activeChatSession.${wsId}`);
    } catch {
      return null;
    }
  }, []);

  // Persist active session ID to URL and storage
  const persistActiveSessionId = useCallback((wsId: string, sId: string | null, uId?: string | null) => {
    if (typeof window === "undefined") return;
    try {
      const primaryKey = getActiveChatStorageKey(wsId, uId);
      const globalKey = `bizzmitra.activeChatSession.${wsId}`;

      if (sId) {
        window.localStorage.setItem(primaryKey, sId);
        window.localStorage.setItem(globalKey, sId);
        const url = new URL(window.location.href);
        if (url.searchParams.get("chat") !== sId) {
          url.searchParams.set("chat", sId);
          window.history.replaceState({}, "", url.toString());
        }
      } else {
        window.localStorage.removeItem(primaryKey);
        window.localStorage.removeItem(globalKey);
        const url = new URL(window.location.href);
        if (url.searchParams.has("chat")) {
          url.searchParams.delete("chat");
          window.history.replaceState({}, "", url.toString());
        }
      }
    } catch {}
  }, []);

  // Fetch Sessions List & Merge with Local Storage
  const fetchSessions = useCallback(async () => {
    if (!workspaceId) {
      setSessions([]);
      setActiveSessionId(null);
      return;
    }

    // 1. Instantly hydrate from local storage
    const cached = readCachedSessions(workspaceId, userId);
    if (cached.length > 0) {
      setSessions(cached);
      if (!activeSessionId) {
        const targetId = getInitialActiveSessionId(workspaceId, userId) || cached[0]!.id;
        setActiveSessionId(targetId);
        persistActiveSessionId(workspaceId, targetId, userId);
      }
    }

    setIsLoadingSessions(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/chat/sessions?workspaceId=${encodeURIComponent(workspaceId)}`, {
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        const serverSessions: ChatSession[] = json.sessions || [];

        // Merge server sessions with local sessions so no offline/local threads are lost
        const mergedMap = new Map<string, ChatSession>();
        serverSessions.forEach((s) => mergedMap.set(s.id, s));
        cached.forEach((s) => {
          if (!mergedMap.has(s.id)) {
            mergedMap.set(s.id, s);
          }
        });

        const mergedList = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
        );

        if (mergedList.length > 0) {
          setSessions(mergedList);
          saveCachedSessions(workspaceId, mergedList, userId);

          let targetId = activeSessionId;
          if (!initialUrlChecked.current) {
            targetId = getInitialActiveSessionId(workspaceId, userId);
            initialUrlChecked.current = true;
          }

          const exists = mergedList.some((s) => s.id === targetId);
          if (!exists || !targetId) {
            targetId = mergedList[0]!.id;
          }

          if (targetId && targetId !== activeSessionId) {
            setActiveSessionId(targetId);
            persistActiveSessionId(workspaceId, targetId, userId);
          }
        } else {
          // Zero sessions in both server & cache: Auto-create initial session
          void createSession("New chat");
        }
      } else {
        // Fallback: If cache is empty, create initial session
        if (cached.length === 0) {
          void createSession("New chat");
        }
      }
    } catch (err) {
      console.warn("[useChatSessions] Server fetch error, using local sessions:", err);
      if (cached.length === 0) {
        void createSession("New chat");
      }
    } finally {
      setIsLoadingSessions(false);
    }
  }, [workspaceId, userId, activeSessionId, getInitialActiveSessionId, persistActiveSessionId]);

  // Fetch Messages for Active Session (Instant cache load + Background sync)
  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      setMessages([DEFAULT_WELCOME_MSG]);
      return;
    }

    // 1. Immediately load cached messages from localStorage for instant response
    const cachedMsgs = readCachedMessages(sessionId);
    if (cachedMsgs.length > 0) {
      setMessages(cachedMsgs);
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
          saveCachedMessages(sessionId, formatted);
        } else if (cachedMsgs.length > 0) {
          // If server returned 0 messages but we had local messages, keep local messages
          setMessages(cachedMsgs);
        }
      }
    } catch (err) {
      console.warn("[useChatSessions] Messages fetch error, preserving cached messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Save current messages to local cache whenever messages change for active session
  useEffect(() => {
    if (activeSessionId && messages.length > 0) {
      saveCachedMessages(activeSessionId, messages);
    }
  }, [messages, activeSessionId]);

  // Auto-fetch sessions when workspaceId or userId changes
  useEffect(() => {
    initialUrlChecked.current = false;
    if (workspaceId) {
      // Synchronously hydrate cached sessions for the new workspace
      const cached = readCachedSessions(workspaceId, userId);
      if (cached.length > 0) {
        setSessions(cached);
        const initId = getInitialActiveSessionId(workspaceId, userId) || cached[0]!.id;
        setActiveSessionId(initId);
        const cachedMsgs = readCachedMessages(initId);
        if (cachedMsgs.length > 0) {
          setMessages(cachedMsgs);
        }
      }
      void fetchSessions();
    } else {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([DEFAULT_WELCOME_MSG]);
    }
  }, [workspaceId, userId]);

  // Auto-fetch messages when activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      void fetchMessages(activeSessionId);
      if (workspaceId) {
        persistActiveSessionId(workspaceId, activeSessionId, userId);
      }
    } else {
      setMessages([DEFAULT_WELCOME_MSG]);
    }
  }, [activeSessionId, workspaceId, userId, fetchMessages, persistActiveSessionId]);

  // Create Session
  const createSession = async (title: string = "New chat"): Promise<ChatSession | null> => {
    if (!workspaceId) return null;

    let newSess: ChatSession | null = null;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers,
        body: JSON.stringify({ workspaceId, title }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.session) {
          newSess = json.session;
        }
      }
    } catch (err) {
      console.warn("[useChatSessions] createSession server error, falling back locally:", err);
    }

    if (!newSess) {
      newSess = {
        id: `local-sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        workspace_id: workspaceId,
        user_id: userId || "local-user",
        title,
        is_pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    setSessions((prev) => {
      const next = [newSess!, ...prev.filter((s) => s.id !== newSess!.id)];
      saveCachedSessions(workspaceId, next, userId);
      return next;
    });

    setActiveSessionId(newSess.id);
    persistActiveSessionId(workspaceId, newSess.id, userId);
    setMessages([DEFAULT_WELCOME_MSG]);
    saveCachedMessages(newSess.id, [DEFAULT_WELCOME_MSG]);

    return newSess;
  };

  // Rename Session
  const renameSession = async (id: string, newTitle: string): Promise<boolean> => {
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return false;

    // Optimistic update
    setSessions((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, title: cleanTitle, updated_at: new Date().toISOString() } : s
      );
      if (workspaceId) {
        saveCachedSessions(workspaceId, next, userId);
      }
      return next;
    });

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

  // Delete Session
  const deleteSession = async (id: string): Promise<boolean> => {
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (workspaceId) {
      saveCachedSessions(workspaceId, remaining, userId);
    }

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(`bizzmitra.localMsgs.${id}`);
        window.localStorage.removeItem(`bizzmitra.chatMsgs.${id}`);
      } catch {}
    }

    if (activeSessionId === id) {
      if (remaining.length > 0) {
        const nextId = remaining[0]!.id;
        setActiveSessionId(nextId);
        if (workspaceId) persistActiveSessionId(workspaceId, nextId, userId);
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

  // Switch Session
  const switchSession = (id: string) => {
    if (id === activeSessionId) return;

    const cached = readCachedMessages(id);
    if (cached.length > 0) {
      setMessages(cached);
    } else {
      setMessages([DEFAULT_WELCOME_MSG]);
    }

    setActiveSessionId(id);
    if (workspaceId) {
      persistActiveSessionId(workspaceId, id, userId);
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
