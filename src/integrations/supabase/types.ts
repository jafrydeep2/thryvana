export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_metrics: {
        Row: {
          deleted_check_ins: number
          deleted_goals: number
          deleted_users: number
          id: string
          last_updated: string
        }
        Insert: {
          deleted_check_ins?: number
          deleted_goals?: number
          deleted_users?: number
          id?: string
          last_updated?: string
        }
        Update: {
          deleted_check_ins?: number
          deleted_goals?: number
          deleted_users?: number
          id?: string
          last_updated?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          check_in_id: string
          check_in_time: string | null
          content: string | null
          goal_id: string
          media_url: string | null
          photo_url: string | null
          tribe_id: string
          user_id: string
        }
        Insert: {
          check_in_id?: string
          check_in_time?: string | null
          content?: string | null
          goal_id: string
          media_url?: string | null
          photo_url?: string | null
          tribe_id: string
          user_id: string
        }
        Update: {
          check_in_id?: string
          check_in_time?: string | null
          content?: string | null
          goal_id?: string
          media_url?: string | null
          photo_url?: string | null
          tribe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "check_ins_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["tribe_id"]
          },
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      goals: {
        Row: {
          celebration_plan: string | null
          check_in_count: number
          check_in_type: string
          completed_at: string | null
          created_at: string | null
          description: string
          duration: number | null
          frequency: Database["public"]["Enums"]["frequency_type"]
          goal_id: string
          is_active: boolean | null
          last_check_in: string | null
          motivator: string | null
          progress: number
          time_frame: string | null
          title: string
          user_id: string
        }
        Insert: {
          celebration_plan?: string | null
          check_in_count?: number
          check_in_type?: string
          completed_at?: string | null
          created_at?: string | null
          description: string
          duration?: number | null
          frequency: Database["public"]["Enums"]["frequency_type"]
          goal_id?: string
          is_active?: boolean | null
          last_check_in?: string | null
          motivator?: string | null
          progress?: number
          time_frame?: string | null
          title?: string
          user_id: string
        }
        Update: {
          celebration_plan?: string | null
          check_in_count?: number
          check_in_type?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string
          duration?: number | null
          frequency?: Database["public"]["Enums"]["frequency_type"]
          goal_id?: string
          is_active?: boolean | null
          last_check_in?: string | null
          motivator?: string | null
          progress?: number
          time_frame?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reactions: {
        Row: {
          check_in_id: string
          created_at: string | null
          reaction_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          check_in_id: string
          created_at?: string | null
          reaction_id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          check_in_id?: string
          created_at?: string | null
          reaction_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["check_in_id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tribes: {
        Row: {
          created_at: string | null
          frequency: Database["public"]["Enums"]["frequency_type"]
          tribe_id: string
        }
        Insert: {
          created_at?: string | null
          frequency: Database["public"]["Enums"]["frequency_type"]
          tribe_id?: string
        }
        Update: {
          created_at?: string | null
          frequency?: Database["public"]["Enums"]["frequency_type"]
          tribe_id?: string
        }
        Relationships: []
      }
      user_tribes: {
        Row: {
          joined_at: string | null
          tribe_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          tribe_id: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          tribe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tribes_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["tribe_id"]
          },
          {
            foreignKeyName: "user_tribes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          is_admin: boolean | null
          last_login_at: string | null
          profile_details: Json | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          is_admin?: boolean | null
          last_login_at?: string | null
          profile_details?: Json | null
          user_id: string
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          is_admin?: boolean | null
          last_login_at?: string | null
          profile_details?: Json | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_to_tribe_by_frequency: {
        Args: { user_id_param: string; frequency_param: string }
        Returns: string
      }
      increment_check_in: {
        Args: { goal_id_param: string }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      frequency_type: "daily" | "weekly" | "monthly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      frequency_type: ["daily", "weekly", "monthly"],
    },
  },
} as const
