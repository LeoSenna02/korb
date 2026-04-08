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
      appointments: {
        Row: {
          attended_at: string | null
          baby_id: string
          created_at: string
          doctor_name: string
          follow_up_instructions: string | null
          follow_up_interval_days: number | null
          id: string
          linked_growth_id: string | null
          linked_vaccine_ids: string[]
          location: string
          post_visit_notes: string | null
          pre_visit_notes: string | null
          reason: string
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          attended_at?: string | null
          baby_id: string
          created_at?: string
          doctor_name: string
          follow_up_instructions?: string | null
          follow_up_interval_days?: number | null
          id: string
          linked_growth_id?: string | null
          linked_vaccine_ids?: string[]
          location: string
          post_visit_notes?: string | null
          pre_visit_notes?: string | null
          reason: string
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          attended_at?: string | null
          baby_id?: string
          created_at?: string
          doctor_name?: string
          follow_up_instructions?: string | null
          follow_up_interval_days?: number | null
          id?: string
          linked_growth_id?: string | null
          linked_vaccine_ids?: string[]
          location?: string
          post_visit_notes?: string | null
          pre_visit_notes?: string | null
          reason?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_linked_growth_id_fkey"
            columns: ["linked_growth_id"]
            isOneToOne: false
            referencedRelation: "growth"
            referencedColumns: ["id"]
          },
        ]
      }
      babies: {
        Row: {
          birth_date: string
          birth_time: string | null
          blood_type: string | null
          created_at: string
          family_name: string
          gender: string
          id: string
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          birth_date: string
          birth_time?: string | null
          blood_type?: string | null
          created_at?: string
          family_name: string
          gender: string
          id: string
          name: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string
          birth_time?: string | null
          blood_type?: string | null
          created_at?: string
          family_name?: string
          gender?: string
          id?: string
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      baby_caregivers: {
        Row: {
          baby_id: string
          invited_by: string | null
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          baby_id: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          baby_id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "baby_caregivers_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      diapers: {
        Row: {
          baby_id: string
          changed_at: string
          color: string
          consistency: string
          created_at: string
          id: string
          notes: string | null
          type: string
        }
        Insert: {
          baby_id: string
          changed_at: string
          color: string
          consistency: string
          created_at?: string
          id: string
          notes?: string | null
          type: string
        }
        Update: {
          baby_id?: string
          changed_at?: string
          color?: string
          consistency?: string
          created_at?: string
          id?: string
          notes?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "diapers_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      feedings: {
        Row: {
          baby_id: string
          created_at: string
          duration_seconds: number | null
          id: string
          left_seconds: number | null
          notes: string | null
          right_seconds: number | null
          started_at: string
          type: string
          volume_ml: number | null
        }
        Insert: {
          baby_id: string
          created_at?: string
          duration_seconds?: number | null
          id: string
          left_seconds?: number | null
          notes?: string | null
          right_seconds?: number | null
          started_at: string
          type: string
          volume_ml?: number | null
        }
        Update: {
          baby_id?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          left_seconds?: number | null
          notes?: string | null
          right_seconds?: number | null
          started_at?: string
          type?: string
          volume_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedings_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      growth: {
        Row: {
          baby_id: string
          cephalic_cm: number | null
          created_at: string
          height_cm: number | null
          id: string
          measured_at: string
          notes: string | null
          weight_kg: number | null
        }
        Insert: {
          baby_id: string
          cephalic_cm?: number | null
          created_at?: string
          height_cm?: number | null
          id: string
          measured_at: string
          notes?: string | null
          weight_kg?: number | null
        }
        Update: {
          baby_id?: string
          cephalic_cm?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          baby_id: string
          code: string
          created_at: string
          created_by: string
          expires_at: string | null
          role: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          baby_id: string
          code: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          role?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          baby_id?: string
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          role?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_codes_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          actual_date: string | null
          baby_id: string
          category: string
          created_at: string
          description: string
          expected_age_months_max: number
          expected_age_months_min: number
          id: string
          is_custom: boolean
          milestone_id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          actual_date?: string | null
          baby_id: string
          category: string
          created_at?: string
          description: string
          expected_age_months_max: number
          expected_age_months_min: number
          id: string
          is_custom?: boolean
          milestone_id: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          actual_date?: string | null
          baby_id?: string
          category?: string
          created_at?: string
          description?: string
          expected_age_months_max?: number
          expected_age_months_min?: number
          id?: string
          is_custom?: boolean
          milestone_id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      sleeps: {
        Row: {
          baby_id: string
          created_at: string
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string
          type: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          ended_at?: string | null
          id: string
          notes?: string | null
          started_at: string
          type: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleeps_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_sessions: {
        Row: {
          baby_id: string
          created_at: string
          is_paused: boolean
          pause_started_at: string | null
          paused_total_ms: number
          started_at: string
          started_by: string
          type: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          is_paused?: boolean
          pause_started_at?: string | null
          paused_total_ms?: number
          started_at: string
          started_by: string
          type: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          is_paused?: boolean
          pause_started_at?: string | null
          paused_total_ms?: number
          started_at?: string
          started_by?: string
          type?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_sessions_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: true
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_episodes: {
        Row: {
          baby_id: string
          created_at: string
          id: string
          medication: string | null
          notes: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          started_at: string
          status: string
          symptoms: string[]
          temperature_c: number | null
          updated_at: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          id: string
          medication?: string | null
          notes?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity: string
          started_at: string
          status: string
          symptoms?: string[]
          temperature_c?: number | null
          updated_at?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          id?: string
          medication?: string | null
          notes?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          symptoms?: string[]
          temperature_c?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_episodes_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccines: {
        Row: {
          applied_date: string | null
          applied_location: string | null
          baby_id: string
          created_at: string
          dose_label: string | null
          id: string
          is_custom: boolean
          name: string
          notes: string | null
          scheduled_month: number
          updated_at: string
          vaccine_id: string
        }
        Insert: {
          applied_date?: string | null
          applied_location?: string | null
          baby_id: string
          created_at?: string
          dose_label?: string | null
          id: string
          is_custom?: boolean
          name: string
          notes?: string | null
          scheduled_month: number
          updated_at?: string
          vaccine_id: string
        }
        Update: {
          applied_date?: string | null
          applied_location?: string | null
          baby_id?: string
          created_at?: string
          dose_label?: string | null
          id?: string
          is_custom?: boolean
          name?: string
          notes?: string | null
          scheduled_month?: number
          updated_at?: string
          vaccine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccines_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_baby_with_owner: {
        Args: {
          p_birth_date: string
          p_birth_time: string
          p_blood_type: string
          p_family_name: string
          p_gender: string
          p_id: string
          p_name: string
          p_photo_url: string
        }
        Returns: undefined
      }
      generate_invite_code: { Args: never; Returns: string }
      is_baby_owner: { Args: { p_baby_id: string }; Returns: boolean }
      is_caregiver: { Args: { p_baby_id: string }; Returns: boolean }
      join_family_with_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      start_sleep_session: {
        Args: { p_baby_id: string; p_type: string }
        Returns: Json
      }
      pause_sleep_session: {
        Args: { p_baby_id: string }
        Returns: Json
      }
      resume_sleep_session: {
        Args: { p_baby_id: string }
        Returns: Json
      }
      cancel_sleep_session: {
        Args: { p_baby_id: string }
        Returns: Json
      }
      complete_sleep_session: {
        Args: { p_baby_id: string; p_notes?: string | null }
        Returns: Json
      }
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
