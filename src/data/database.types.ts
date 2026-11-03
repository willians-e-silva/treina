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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          body: string
          id: string
          sender: string
          sent_at: string
          trainer_id: string
          user_id: string
        }
        Insert: {
          body: string
          id?: string
          sender: string
          sent_at?: string
          trainer_id: string
          user_id: string
        }
        Update: {
          body?: string
          id?: string
          sender?: string
          sent_at?: string
          trainer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_memberships: {
        Row: {
          joined_at: string
          package_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          package_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          package_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_memberships_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "training_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_layouts: {
        Row: {
          rows: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          rows: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          rows?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_entries: {
        Row: {
          calories: number | null
          category: string
          created_at: string
          date: string
          id: string
          minutes: number | null
          name: string
          planned_exercise_id: string | null
          reps: number | null
          sets: number | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          calories?: number | null
          category: string
          created_at?: string
          date: string
          id?: string
          minutes?: number | null
          name: string
          planned_exercise_id?: string | null
          reps?: number | null
          sets?: number | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          calories?: number | null
          category?: string
          created_at?: string
          date?: string
          id?: string
          minutes?: number | null
          name?: string
          planned_exercise_id?: string | null
          reps?: number | null
          sets?: number | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_entries_planned_exercise_id_user_id_fkey"
            columns: ["planned_exercise_id", "user_id"]
            isOneToOne: false
            referencedRelation: "planned_exercises"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      food_entries: {
        Row: {
          carbs: number
          created_at: string
          date: string
          detail: string | null
          fat: number
          fiber: number | null
          food_id: string
          grams: number
          id: string
          kcal: number
          meal_key: string
          meal_name: string
          name: string
          protein: number
          source: string
          user_id: string
        }
        Insert: {
          carbs: number
          created_at?: string
          date: string
          detail?: string | null
          fat: number
          fiber?: number | null
          food_id: string
          grams: number
          id?: string
          kcal: number
          meal_key: string
          meal_name: string
          name: string
          protein: number
          source: string
          user_id: string
        }
        Update: {
          carbs?: number
          created_at?: string
          date?: string
          detail?: string | null
          fat?: number
          fiber?: number | null
          food_id?: string
          grams?: number
          id?: string
          kcal?: number
          meal_key?: string
          meal_name?: string
          name?: string
          protein?: number
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          created_at: string
          id: string
          key: string
          name: string
          position: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          name: string
          position: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      package_comments: {
        Row: {
          author_name: string
          body: string
          commented_on: string
          created_at: string
          id: string
          package_id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          author_name: string
          body: string
          commented_on?: string
          created_at?: string
          id?: string
          package_id: string
          rating: number
          user_id?: string | null
        }
        Update: {
          author_name?: string
          body?: string
          commented_on?: string
          created_at?: string
          id?: string
          package_id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_comments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "training_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_workouts: {
        Row: {
          created_at: string
          description: string
          exercises: Json
          id: string
          name: string
          package_id: string
          position: number
          summary: string
        }
        Insert: {
          created_at?: string
          description?: string
          exercises?: Json
          id?: string
          name: string
          package_id: string
          position: number
          summary?: string
        }
        Update: {
          created_at?: string
          description?: string
          exercises?: Json
          id?: string
          name?: string
          package_id?: string
          position?: number
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_workouts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "training_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_exercises: {
        Row: {
          category: string
          created_at: string
          id: string
          met: number | null
          minutes: number | null
          name: string
          note: string | null
          position: number
          reps: number | null
          sets: number | null
          user_id: string
          weight_kg: number | null
          workout_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          met?: number | null
          minutes?: number | null
          name: string
          note?: string | null
          position: number
          reps?: number | null
          sets?: number | null
          user_id: string
          weight_kg?: number | null
          workout_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          met?: number | null
          minutes?: number | null
          name?: string
          note?: string | null
          position?: number
          reps?: number | null
          sets?: number | null
          user_id?: string
          weight_kg?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_exercises_workout_id_user_id_fkey"
            columns: ["workout_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          goal_weight_kg: number | null
          height_cm: number | null
          id: string
          name: string
          sex: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          goal_weight_kg?: number | null
          height_cm?: number | null
          id: string
          name?: string
          sex?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          name?: string
          sex?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          created_at: string
          done_dates: string[]
          id: string
          position: number
          task_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done_dates?: string[]
          id?: string
          position: number
          task_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          done_dates?: string[]
          id?: string
          position?: number
          task_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          done_dates: string[]
          id: string
          repeat_interval: number | null
          repeat_kind: string
          repeat_unit: string | null
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done_dates?: string[]
          id?: string
          repeat_interval?: number | null
          repeat_kind?: string
          repeat_unit?: string | null
          start_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          done_dates?: string[]
          id?: string
          repeat_interval?: number | null
          repeat_kind?: string
          repeat_unit?: string | null
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trainers: {
        Row: {
          bio: string
          created_at: string
          followers: number
          id: string
          instagram: string | null
          name: string
          photo_url: string | null
          position: number
          rating: number
          rating_count: number
          slug: string
          specialty: string
          students: number
        }
        Insert: {
          bio?: string
          created_at?: string
          followers?: number
          id?: string
          instagram?: string | null
          name: string
          photo_url?: string | null
          position?: number
          rating?: number
          rating_count?: number
          slug: string
          specialty: string
          students?: number
        }
        Update: {
          bio?: string
          created_at?: string
          followers?: number
          id?: string
          instagram?: string | null
          name?: string
          photo_url?: string | null
          position?: number
          rating?: number
          rating_count?: number
          slug?: string
          specialty?: string
          students?: number
        }
        Relationships: []
      }
      training_packages: {
        Row: {
          created_at: string
          description: string
          id: string
          level: string
          name: string
          position: number
          slug: string
          trainer_id: string
          weeks: number
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          level: string
          name: string
          position?: number
          slug: string
          trainer_id: string
          weeks: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          level?: string
          name?: string
          position?: number
          slug?: string
          trainer_id?: string
          weeks?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_packages_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      weigh_ins: {
        Row: {
          created_at: string
          date: string
          id: string
          kg: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          kg: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          kg?: number
          user_id?: string
        }
        Relationships: []
      }
      workout_completions: {
        Row: {
          created_at: string
          date: string
          duration_seconds: number | null
          feeling: number | null
          id: string
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration_seconds?: number | null
          feeling?: number | null
          id?: string
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_seconds?: number | null
          feeling?: number | null
          id?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_completions_workout_id_user_id_fkey"
            columns: ["workout_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          mode: string
          queue: string[]
          queue_index: number
          updated_at: string
          user_id: string
          weekly: Json
        }
        Insert: {
          mode?: string
          queue?: string[]
          queue_index?: number
          updated_at?: string
          user_id: string
          weekly?: Json
        }
        Update: {
          mode?: string
          queue?: string[]
          queue_index?: number
          updated_at?: string
          user_id?: string
          weekly?: Json
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          source_package_id: string | null
          summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          source_package_id?: string | null
          summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          source_package_id?: string | null
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_source_package_id_fkey"
            columns: ["source_package_id"]
            isOneToOne: false
            referencedRelation: "training_packages"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
