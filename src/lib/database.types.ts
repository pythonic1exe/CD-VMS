export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      departments: {
        Row: {
          created_at: string;
          floor_label: string | null;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          floor_label?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          floor_label?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      entrances: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          badge_printing_enabled: boolean;
          created_at: string;
          default_entrance_id: string | null;
          host_daily_digest_enabled: boolean;
          id: number;
          log_retention_days: number;
          security_email_alerts: boolean;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          badge_printing_enabled?: boolean;
          created_at?: string;
          default_entrance_id?: string | null;
          host_daily_digest_enabled?: boolean;
          id?: number;
          log_retention_days?: number;
          security_email_alerts?: boolean;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          badge_printing_enabled?: boolean;
          created_at?: string;
          default_entrance_id?: string | null;
          host_daily_digest_enabled?: boolean;
          id?: number;
          log_retention_days?: number;
          security_email_alerts?: boolean;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "site_settings_default_entrance_id_fkey";
            columns: ["default_entrance_id"];
            isOneToOne: false;
            referencedRelation: "entrances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      staff_profiles: {
        Row: {
          account_status: string;
          availability_status: string;
          can_host_visits: boolean;
          created_at: string;
          department_id: string | null;
          desk_location: string | null;
          full_name: string;
          id: string;
          job_title: string | null;
          notify_daily_digest: boolean;
          notify_email_arrivals: boolean;
          notify_sms_escalations: boolean;
          permission_role: string;
          reception_notes: string | null;
          updated_at: string;
          work_email: string;
        };
        Insert: {
          account_status?: string;
          availability_status?: string;
          can_host_visits?: boolean;
          created_at?: string;
          department_id?: string | null;
          desk_location?: string | null;
          full_name: string;
          id: string;
          job_title?: string | null;
          notify_daily_digest?: boolean;
          notify_email_arrivals?: boolean;
          notify_sms_escalations?: boolean;
          permission_role: string;
          reception_notes?: string | null;
          updated_at?: string;
          work_email: string;
        };
        Update: {
          account_status?: string;
          availability_status?: string;
          can_host_visits?: boolean;
          created_at?: string;
          department_id?: string | null;
          desk_location?: string | null;
          full_name?: string;
          id?: string;
          job_title?: string | null;
          notify_daily_digest?: boolean;
          notify_email_arrivals?: boolean;
          notify_sms_escalations?: boolean;
          permission_role?: string;
          reception_notes?: string | null;
          updated_at?: string;
          work_email?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_profiles_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          }
        ];
      };
      visit_events: {
        Row: {
          actor_label: string | null;
          actor_user_id: string | null;
          detail: string | null;
          event_type: string;
          id: string;
          is_internal: boolean;
          occurred_at: string;
          title: string;
          visit_id: string;
        };
        Insert: {
          actor_label?: string | null;
          actor_user_id?: string | null;
          detail?: string | null;
          event_type: string;
          id?: string;
          is_internal?: boolean;
          occurred_at?: string;
          title: string;
          visit_id: string;
        };
        Update: {
          actor_label?: string | null;
          actor_user_id?: string | null;
          detail?: string | null;
          event_type?: string;
          id?: string;
          is_internal?: boolean;
          occurred_at?: string;
          title?: string;
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visit_events_actor_user_id_fkey";
            columns: ["actor_user_id"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visit_events_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "visits";
            referencedColumns: ["id"];
          }
        ];
      };
      visit_passes: {
        Row: {
          expires_at: string;
          id: string;
          issued_at: string;
          revocation_reason: string | null;
          revoked_at: string | null;
          revoked_by: string | null;
          status: string;
          token: string;
          visit_id: string;
        };
        Insert: {
          expires_at: string;
          id?: string;
          issued_at?: string;
          revocation_reason?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          status?: string;
          token?: string;
          visit_id: string;
        };
        Update: {
          expires_at?: string;
          id?: string;
          issued_at?: string;
          revocation_reason?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          status?: string;
          token?: string;
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visit_passes_revoked_by_fkey";
            columns: ["revoked_by"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visit_passes_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "visits";
            referencedColumns: ["id"];
          }
        ];
      };
      visitors: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          phone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          phone: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          phone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      visits: {
        Row: {
          check_in_at: string | null;
          check_out_at: string | null;
          created_at: string;
          decision_at: string | null;
          decision_by: string | null;
          department_id: string;
          entrance_id: string | null;
          host_staff_id: string;
          id: string;
          notes: string | null;
          privacy_consent_accepted_at: string;
          purpose: string;
          reference_code: string;
          risk_level: string;
          scheduled_for: string;
          status: string;
          updated_at: string;
          visitor_id: string;
          visitor_organization: string;
        };
        Insert: {
          check_in_at?: string | null;
          check_out_at?: string | null;
          created_at?: string;
          decision_at?: string | null;
          decision_by?: string | null;
          department_id: string;
          entrance_id?: string | null;
          host_staff_id: string;
          id?: string;
          notes?: string | null;
          privacy_consent_accepted_at: string;
          purpose: string;
          reference_code?: string;
          risk_level?: string;
          scheduled_for: string;
          status?: string;
          updated_at?: string;
          visitor_id: string;
          visitor_organization: string;
        };
        Update: {
          check_in_at?: string | null;
          check_out_at?: string | null;
          created_at?: string;
          decision_at?: string | null;
          decision_by?: string | null;
          department_id?: string;
          entrance_id?: string | null;
          host_staff_id?: string;
          id?: string;
          notes?: string | null;
          privacy_consent_accepted_at?: string;
          purpose?: string;
          reference_code?: string;
          risk_level?: string;
          scheduled_for?: string;
          status?: string;
          updated_at?: string;
          visitor_id?: string;
          visitor_organization?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visits_decision_by_fkey";
            columns: ["decision_by"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visits_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visits_entrance_id_fkey";
            columns: ["entrance_id"];
            isOneToOne: false;
            referencedRelation: "entrances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visits_host_staff_id_fkey";
            columns: ["host_staff_id"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visits_visitor_id_fkey";
            columns: ["visitor_id"];
            isOneToOne: false;
            referencedRelation: "visitors";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_in_visit: {
        Args: { p_visit_id: string };
        Returns: { pass_token: string; visit_status: string }[];
      };
      check_out_visit: {
        Args: { p_visit_id: string };
        Returns: { visit_status: string }[];
      };
      decide_visit_request: {
        Args: { p_approved: boolean; p_reason?: string; p_visit_id: string };
        Returns: { pass_token: string; visit_status: string }[];
      };
      generate_visit_reference_code: { Args: never; Returns: string };
      get_admin_report_summary: {
        Args: never;
        Returns: {
          approval_rate: number;
          approved_or_active_count: number;
          checked_in_or_out_count: number;
          elevated_risk_count: number;
          entrance_distribution: Json;
          exception_rate: number;
          pending_count: number;
          rejected_count: number;
          total_visits: number;
        }[];
      };
      get_host_dashboard_summary: {
        Args: never;
        Returns: {
          active_passes: number;
          checked_in_today: number;
          completed_history: number;
          expected_today: number;
          overdue_visits: number;
          pending_approvals: number;
        }[];
      };
      get_public_pass: {
        Args: { p_token: string };
        Returns: {
          department_name: string;
          entrance_name: string;
          expires_at: string;
          host_name: string;
          pass_status: string;
          pass_token: string;
          reference_code: string;
          scheduled_for: string;
          visit_status: string;
          visitor_name: string;
          visitor_organization: string;
        }[];
      };
      get_visit_detail: {
        Args: { p_visit_id: string };
        Returns: {
          check_in_at: string;
          check_out_at: string;
          department_id: string;
          department_name: string;
          entrance_name: string;
          events: Json;
          host_email: string;
          host_id: string;
          host_name: string;
          id: string;
          notes: string;
          pass_expires_at: string;
          pass_status: string;
          pass_token: string;
          purpose: string;
          reference_code: string;
          risk_level: string;
          scheduled_for: string;
          status: string;
          visitor_email: string;
          visitor_id: string;
          visitor_name: string;
          visitor_organization: string;
          visitor_phone: string;
        }[];
      };
      issue_visit_pass: { Args: { p_visit_id: string }; Returns: string };
      jwt_permission_role: { Args: never; Returns: string };
      list_admin_visitor_logs: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_query?: string;
          p_status?: string;
        };
        Returns: {
          check_in_at: string;
          check_out_at: string;
          department_id: string;
          department_name: string;
          entrance_name: string;
          host_email: string;
          host_id: string;
          host_name: string;
          id: string;
          notes: string;
          pass_expires_at: string;
          pass_token: string;
          purpose: string;
          reference_code: string;
          risk_level: string;
          scheduled_for: string;
          status: string;
          total_count: number;
          visitor_email: string;
          visitor_id: string;
          visitor_name: string;
          visitor_organization: string;
          visitor_phone: string;
        }[];
      };
      list_department_coverage: {
        Args: never;
        Returns: {
          active_hosts: number;
          floor_label: string;
          id: string;
          name: string;
          pending_visits: number;
          total_assigned_visits: number;
        }[];
      };
      list_host_visits: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
          p_status_group?: string;
        };
        Returns: {
          check_in_at: string;
          check_out_at: string;
          department_id: string;
          department_name: string;
          entrance_name: string;
          host_email: string;
          host_id: string;
          host_name: string;
          id: string;
          notes: string;
          pass_expires_at: string;
          pass_token: string;
          purpose: string;
          reference_code: string;
          risk_level: string;
          scheduled_for: string;
          status: string;
          total_count: number;
          visitor_email: string;
          visitor_id: string;
          visitor_name: string;
          visitor_organization: string;
          visitor_phone: string;
        }[];
      };
      list_public_hosts: {
        Args: never;
        Returns: {
          availability_status: string;
          department_id: string;
          department_name: string;
          desk_location: string;
          floor_label: string;
          full_name: string;
          id: string;
          job_title: string;
          work_email: string;
        }[];
      };
      list_recent_visit_activity: {
        Args: { p_limit?: number };
        Returns: {
          department_name: string;
          detail: string;
          event_type: string;
          id: string;
          occurred_at: string;
          title: string;
          visitor_name: string;
        }[];
      };
      list_staff_directory: {
        Args: never;
        Returns: {
          account_status: string;
          assigned_visit_count: number;
          department_name: string;
          full_name: string;
          id: string;
          job_title: string;
          permission_role: string;
          work_email: string;
        }[];
      };
      revoke_active_visit_pass: {
        Args: { p_reason?: string; p_visit_id: string };
        Returns: undefined;
      };
      submit_visit_request: {
        Args: {
          p_department_id: string;
          p_email: string;
          p_full_name: string;
          p_host_staff_id: string;
          p_notes?: string;
          p_organization: string;
          p_phone: string;
          p_purpose: string;
          p_scheduled_for: string;
        };
        Returns: {
          reference_code: string;
          status: string;
          visit_id: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer Row }
    ? Row
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer Row }
      ? Row
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer Insert }
    ? Insert
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer Insert }
      ? Insert
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer Update }
    ? Update
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer Update }
      ? Update
      : never
    : never;
