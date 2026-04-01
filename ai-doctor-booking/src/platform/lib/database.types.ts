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
      bookings: {
        Row: {
          appointment_time: string
          channel: string
          created_at: string | null
          doctor_user_id: string
          duration_minutes: number
          id: number
          patient_user_id: string
          specialty_id: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          appointment_time: string
          channel?: string
          created_at?: string | null
          doctor_user_id: string
          duration_minutes?: number
          id?: number
          patient_user_id: string
          specialty_id?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          appointment_time?: string
          channel?: string
          created_at?: string | null
          doctor_user_id?: string
          duration_minutes?: number
          id?: number
          patient_user_id?: string
          specialty_id?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_doctor_user_id_fkey"
            columns: ["doctor_user_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_patient_user_id_fkey"
            columns: ["patient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_credentials: {
        Row: {
          created_at: string | null
          doctor_user_id: string
          document_urls: string[] | null
          expiry_date: string | null
          id: number
          license_number: string
          status: string
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_user_id: string
          document_urls?: string[] | null
          expiry_date?: string | null
          id?: number
          license_number: string
          status?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_user_id?: string
          document_urls?: string[] | null
          expiry_date?: string | null
          id?: number
          license_number?: string
          status?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_credentials_doctor_user_id_fkey"
            columns: ["doctor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          doctor_user_id: string
          end_time: string
          id: number
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          doctor_user_id: string
          end_time: string
          id?: number
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          doctor_user_id?: string
          end_time?: string
          id?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_user_id_fkey"
            columns: ["doctor_user_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["user_id"]
          },
        ]
      }
      doctors: {
        Row: {
          approval_status: boolean | null
          consultation_fee: number | null
          created_at: string | null
          experience_years: number | null
          is_accepting_new_patients: boolean | null
          location: string | null
          rating: number | null
          specialty_id: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_status?: boolean | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          is_accepting_new_patients?: boolean | null
          location?: string | null
          rating?: number | null
          specialty_id?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_status?: boolean | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          is_accepting_new_patients?: boolean | null
          location?: string | null
          rating?: number | null
          specialty_id?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          doctor_user_id: string
          id: number
          status: string
          wompi_reference: string | null
          wompi_transaction_id: string | null
          subscription_id: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          doctor_user_id: string
          id?: number
          status: string
          wompi_reference?: string | null
          wompi_transaction_id?: string | null
          subscription_id?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          doctor_user_id?: string
          id?: number
          status?: string
          wompi_reference?: string | null
          wompi_transaction_id?: string | null
          subscription_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_doctor_user_id_fkey"
            columns: ["doctor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          gender: string | null
          phone_number: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          gender?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          gender?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          doctor_user_id: string
          end_date: string | null
          failed_payment_attempts: number | null
          id: number
          monthly_fee: number
          next_payment_date: string | null
          payment_status: string
          plan_type: string
          start_date: string
          status: string
          wompi_payment_source_id: string | null
          wompi_customer_email: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_user_id: string
          end_date?: string | null
          failed_payment_attempts?: number | null
          id?: number
          monthly_fee?: number
          next_payment_date?: string | null
          payment_status?: string
          plan_type?: string
          start_date?: string
          status?: string
          wompi_payment_source_id?: string | null
          wompi_customer_email?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_user_id?: string
          end_date?: string | null
          failed_payment_attempts?: number | null
          id?: number
          monthly_fee?: number
          next_payment_date?: string | null
          payment_status?: string
          plan_type?: string
          start_date?: string
          status?: string
          wompi_payment_source_id?: string | null
          wompi_customer_email?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_doctor_user_id_fkey"
            columns: ["doctor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
