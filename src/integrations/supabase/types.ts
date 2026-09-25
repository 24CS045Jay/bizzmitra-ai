export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      artifacts: {
        Row: {
          content: Json
          created_at: string
          id: string
          module_type: string
          version: number
          workspace_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          module_type: string
          version?: number
          workspace_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          module_type?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      chat_sessions: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          title: string
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          title?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          title?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          workspace_id: string
          user_id: string
          sender: "user" | "assistant"
          text: string
          badge: string | null
          bullets: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          workspace_id: string
          user_id: string
          sender: "user" | "assistant"
          text: string
          badge?: string | null
          bullets?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          workspace_id?: string
          user_id?: string
          sender?: "user" | "assistant"
          text?: string
          badge?: string | null
          bullets?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          plan: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          plan?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          plan?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          maturity_score: number
          name: string
          owner_id: string
          problem_statement: string | null
          industry: string | null
          goals: string | null
          constraints_text: string | null
          intake_mode: string | null
          intake_method: string | null
          language_code: string | null
          workspace_context: Record<string, unknown> | null
          status: string
          ai_readiness_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          maturity_score?: number
          name: string
          owner_id: string
          problem_statement?: string | null
          industry?: string | null
          goals?: string | null
          constraints_text?: string | null
          intake_mode?: string | null
          intake_method?: string | null
          language_code?: string | null
          workspace_context?: Record<string, unknown> | null
          status?: string
          ai_readiness_score?: number
        }
        Update: {
          created_at?: string
          id?: string
          maturity_score?: number
          name?: string
          owner_id?: string
          problem_statement?: string | null
          industry?: string | null
          goals?: string | null
          constraints_text?: string | null
          intake_mode?: string | null
          intake_method?: string | null
          language_code?: string | null
          workspace_context?: Record<string, unknown> | null
          status?: string
          ai_readiness_score?: number
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: string
          invited_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: string
          invited_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: string
          invited_at?: string
        }
        Relationships: []
      }
      uploaded_documents: {
        Row: {
          id: string
          workspace_id: string
          file_name: string
          storage_path: string
          file_type: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          file_name: string
          storage_path: string
          file_type: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          file_name?: string
          storage_path?: string
          file_type?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      blueprint_scenarios: {
        Row: {
          id: string
          parent_blueprint_id: string
          user_id: string
          name: string
          created_at: string
          data: Json
        }
        Insert: {
          id?: string
          parent_blueprint_id: string
          user_id: string
          name: string
          created_at?: string
          data?: Json
        }
        Update: {
          id?: string
          parent_blueprint_id?: string
          user_id?: string
          name?: string
          created_at?: string
          data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_scenarios_parent_blueprint_id_fkey"
            columns: ["parent_blueprint_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_scenarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprint_shares: {
        Row: {
          id: string
          blueprint_id: string
          token: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          blueprint_id: string
          token: string
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          blueprint_id?: string
          token?: string
          created_at?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_shares_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
