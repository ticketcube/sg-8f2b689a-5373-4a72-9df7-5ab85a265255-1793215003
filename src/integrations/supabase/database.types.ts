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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      artist_demo_requests: {
        Row: {
          created_at: string | null
          email: string | null
          event_date: string | null
          event_type: string | null
          expected_attendees: string | null
          id: number
          message: string | null
          name: string
          status: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          event_date?: string | null
          event_type?: string | null
          expected_attendees?: string | null
          id?: number
          message?: string | null
          name: string
          status?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          event_date?: string | null
          event_type?: string | null
          expected_attendees?: string | null
          id?: number
          message?: string | null
          name?: string
          status?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      artists: {
        Row: {
          artist_id: string
          artist_image: string | null
          artist_name: string
          artist_videolink: string | null
          created_at: string | null
          genre: string | null
          top_list: string | null
          updated_at: string | null
        }
        Insert: {
          artist_id?: string
          artist_image?: string | null
          artist_name: string
          artist_videolink?: string | null
          created_at?: string | null
          genre?: string | null
          top_list?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          artist_image?: string | null
          artist_name?: string
          artist_videolink?: string | null
          created_at?: string | null
          genre?: string | null
          top_list?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          metadata: Json | null
          status: string
          title: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          metadata?: Json | null
          status?: string
          title?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          metadata?: Json | null
          status?: string
          title?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cube_faces: {
        Row: {
          action_type: string | null
          action_type_video_title: string | null
          action_url: string | null
          background_color: string | null
          content_text: string | null
          content_type: string
          created_at: string | null
          face_id: string
          face_number: number
          face_title: string | null
          image_url: string | null
          is_current: boolean | null
          is_editable: boolean
          parent_face_id: string | null
          text_color: string | null
          ticketcube_id: string
          updated_at: string | null
          user_id: string
          version_number: number | null
        }
        Insert: {
          action_type?: string | null
          action_type_video_title?: string | null
          action_url?: string | null
          background_color?: string | null
          content_text?: string | null
          content_type: string
          created_at?: string | null
          face_id?: string
          face_number: number
          face_title?: string | null
          image_url?: string | null
          is_current?: boolean | null
          is_editable?: boolean
          parent_face_id?: string | null
          text_color?: string | null
          ticketcube_id: string
          updated_at?: string | null
          user_id: string
          version_number?: number | null
        }
        Update: {
          action_type?: string | null
          action_type_video_title?: string | null
          action_url?: string | null
          background_color?: string | null
          content_text?: string | null
          content_type?: string
          created_at?: string | null
          face_id?: string
          face_number?: number
          face_title?: string | null
          image_url?: string | null
          is_current?: boolean | null
          is_editable?: boolean
          parent_face_id?: string | null
          text_color?: string | null
          ticketcube_id?: string
          updated_at?: string | null
          user_id?: string
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cube_faces_parent_face_id_fkey"
            columns: ["parent_face_id"]
            isOneToOne: false
            referencedRelation: "cube_faces"
            referencedColumns: ["face_id"]
          },
          {
            foreignKeyName: "cube_faces_ticketcube_id_fkey"
            columns: ["ticketcube_id"]
            isOneToOne: false
            referencedRelation: "ticketcubes"
            referencedColumns: ["cube_id"]
          },
        ]
      }
      cube_update_notifications: {
        Row: {
          applied_at: string | null
          artist_user_id: string
          created_at: string | null
          holder_cube_id: string
          holder_user_id: string
          is_applied: boolean | null
          is_dismissed: boolean
          is_viewed: boolean | null
          notification_id: string
          template_id: string
          update_mode: string
        }
        Insert: {
          applied_at?: string | null
          artist_user_id: string
          created_at?: string | null
          holder_cube_id: string
          holder_user_id: string
          is_applied?: boolean | null
          is_dismissed?: boolean
          is_viewed?: boolean | null
          notification_id?: string
          template_id: string
          update_mode: string
        }
        Update: {
          applied_at?: string | null
          artist_user_id?: string
          created_at?: string | null
          holder_cube_id?: string
          holder_user_id?: string
          is_applied?: boolean | null
          is_dismissed?: boolean
          is_viewed?: boolean | null
          notification_id?: string
          template_id?: string
          update_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "cube_update_notifications_holder_cube_id_fkey"
            columns: ["holder_cube_id"]
            isOneToOne: false
            referencedRelation: "ticketcubes"
            referencedColumns: ["cube_id"]
          },
          {
            foreignKeyName: "cube_update_notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ticketcubes"
            referencedColumns: ["cube_id"]
          },
        ]
      }
      cube_update_payments: {
        Row: {
          amount_cents: number
          completed_at: string | null
          created_at: string | null
          notification_id: string
          payment_id: string
          payment_type: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          completed_at?: string | null
          created_at?: string | null
          notification_id: string
          payment_id?: string
          payment_type: string
          status: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          completed_at?: string | null
          created_at?: string | null
          notification_id?: string
          payment_id?: string
          payment_type?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cube_update_payments_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "cube_update_notifications"
            referencedColumns: ["notification_id"]
          },
        ]
      }
      fandragon_waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          primary_interest: string | null
          social_handle: string | null
          user_type: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          primary_interest?: string | null
          social_handle?: string | null
          user_type: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          primary_interest?: string | null
          social_handle?: string | null
          user_type?: string
        }
        Relationships: []
      }
      minting_price_configs: {
        Row: {
          config_id: string
          created_at: string | null
          custom_features: Json | null
          is_active: boolean
          price_cents: number
          price_type: string
          standard_features: Json | null
          stripe_price_id: string | null
          ticketcube_id: string
          updated_at: string | null
        }
        Insert: {
          config_id?: string
          created_at?: string | null
          custom_features?: Json | null
          is_active?: boolean
          price_cents?: number
          price_type: string
          standard_features?: Json | null
          stripe_price_id?: string | null
          ticketcube_id: string
          updated_at?: string | null
        }
        Update: {
          config_id?: string
          created_at?: string | null
          custom_features?: Json | null
          is_active?: boolean
          price_cents?: number
          price_type?: string
          standard_features?: Json | null
          stripe_price_id?: string | null
          ticketcube_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "minting_price_configs_ticketcube_id_fkey"
            columns: ["ticketcube_id"]
            isOneToOne: false
            referencedRelation: "ticketcubes"
            referencedColumns: ["cube_id"]
          },
        ]
      }
      minting_transactions: {
        Row: {
          artist_revenue_cents: number
          artist_user_id: string
          buyer_user_id: string
          cloned_cube_id: string | null
          completed_at: string | null
          created_at: string | null
          platform_fee_cents: number
          price_cents: number
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          template_id: string
          transaction_id: string
        }
        Insert: {
          artist_revenue_cents?: number
          artist_user_id: string
          buyer_user_id: string
          cloned_cube_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          platform_fee_cents?: number
          price_cents: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          template_id: string
          transaction_id?: string
        }
        Update: {
          artist_revenue_cents?: number
          artist_user_id?: string
          buyer_user_id?: string
          cloned_cube_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          platform_fee_cents?: number
          price_cents?: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          template_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "minting_transactions_artist_user_id_fkey"
            columns: ["artist_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "minting_transactions_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "minting_transactions_cloned_cube_id_fkey"
            columns: ["cloned_cube_id"]
            isOneToOne: false
            referencedRelation: "ticketcubes"
            referencedColumns: ["cube_id"]
          },
          {
            foreignKeyName: "minting_transactions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ticketcubes"
            referencedColumns: ["cube_id"]
          },
        ]
      }
      pending_artist_templates: {
        Row: {
          artist_name: string
          artist_payment_method: string
          artist_upfront_per_cube: number
          clone_price_fan: number
          completed_at: string | null
          created_at: string | null
          custom_features: Json | null
          description: string | null
          event_date: string | null
          event_name: string
          expires_at: string | null
          faces: Json
          fan_fee_model: string
          max_mint_count: number
          metadata: Json | null
          payment_status: string
          pending_id: string
          slug: string
          stripe_price_id: string | null
          stripe_session_id: string | null
          temp_cube_id: string
          update_notification_cost: number
          user_id: string
          venue: string | null
        }
        Insert: {
          artist_name: string
          artist_payment_method: string
          artist_upfront_per_cube?: number
          clone_price_fan?: number
          completed_at?: string | null
          created_at?: string | null
          custom_features?: Json | null
          description?: string | null
          event_date?: string | null
          event_name: string
          expires_at?: string | null
          faces?: Json
          fan_fee_model: string
          max_mint_count: number
          metadata?: Json | null
          payment_status?: string
          pending_id?: string
          slug: string
          stripe_price_id?: string | null
          stripe_session_id?: string | null
          temp_cube_id: string
          update_notification_cost?: number
          user_id: string
          venue?: string | null
        }
        Update: {
          artist_name?: string
          artist_payment_method?: string
          artist_upfront_per_cube?: number
          clone_price_fan?: number
          completed_at?: string | null
          created_at?: string | null
          custom_features?: Json | null
          description?: string | null
          event_date?: string | null
          event_name?: string
          expires_at?: string | null
          faces?: Json
          fan_fee_model?: string
          max_mint_count?: number
          metadata?: Json | null
          payment_status?: string
          pending_id?: string
          slug?: string
          stripe_price_id?: string | null
          stripe_session_id?: string | null
          temp_cube_id?: string
          update_notification_cost?: number
          user_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      platform_config: {
        Row: {
          config_key: string
          config_value: string
          description: string | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          description?: string | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticketcubes: {
        Row: {
          artist_id: string | null
          artist_name: string | null
          artist_payment_method: string | null
          artist_tier: string | null
          artist_upfront_per_cube: number | null
          clone_price_fan: number | null
          created_at: string | null
          cube_id: string
          cube_type: string
          current_mint_count: number | null
          description: string | null
          event_date: string | null
          event_name: string | null
          fan_fee_model: string | null
          glb_url: string | null
          is_active: boolean | null
          is_minting_enabled: boolean | null
          is_secured: boolean | null
          is_template: boolean | null
          max_free_refreshes: number
          max_mint_count: number | null
          mint_price_artist: number | null
          parent_cube_id: string | null
          payment_model: string | null
          platform_revenue_share: number | null
          premium_features: Json | null
          refresh_count: number
          revenue_recovered: number | null
          revenue_recovered_cents: number | null
          revenue_recovery_target_cents: number | null
          slug: string | null
          stripe_payment_intent_id: string | null
          stripeurl_face: string | null
          tcube_contract_address: string | null
          theme_config: Json | null
          tier: string | null
          title: string
          update_notification_cost: number | null
          updated_at: string | null
          upfront_fee_paid: boolean | null
          upfront_payment_amount_cents: number | null
          upfront_payment_bypassed: boolean | null
          upfront_payment_completed: boolean | null
          upfront_stripe_payment_intent_id: string | null
          user_id: string
          uses_revenue_recovery: boolean | null
          venue: string | null
        }
        Insert: {
          artist_id?: string | null
          artist_name?: string | null
          artist_payment_method?: string | null
          artist_tier?: string | null
          artist_upfront_per_cube?: number | null
          clone_price_fan?: number | null
          created_at?: string | null
          cube_id?: string
          cube_type: string
          current_mint_count?: number | null
          description?: string | null
          event_date?: string | null
          event_name?: string | null
          fan_fee_model?: string | null
          glb_url?: string | null
          is_active?: boolean | null
          is_minting_enabled?: boolean | null
          is_secured?: boolean | null
          is_template?: boolean | null
          max_free_refreshes?: number
          max_mint_count?: number | null
          mint_price_artist?: number | null
          parent_cube_id?: string | null
          payment_model?: string | null
          platform_revenue_share?: number | null
          premium_features?: Json | null
          refresh_count?: number
          revenue_recovered?: number | null
          revenue_recovered_cents?: number | null
          revenue_recovery_target_cents?: number | null
          slug?: string | null
          stripe_payment_intent_id?: string | null
          stripeurl_face?: string | null
          tcube_contract_address?: string | null
          theme_config?: Json | null
          tier?: string | null
          title: string
          update_notification_cost?: number | null
          updated_at?: string | null
          upfront_fee_paid?: boolean | null
          upfront_payment_amount_cents?: number | null
          upfront_payment_bypassed?: boolean | null
          upfront_payment_completed?: boolean | null
          upfront_stripe_payment_intent_id?: string | null
          user_id: string
          uses_revenue_recovery?: boolean | null
          venue?: string | null
        }
        Update: {
          artist_id?: string | null
          artist_name?: string | null
          artist_payment_method?: string | null
          artist_tier?: string | null
          artist_upfront_per_cube?: number | null
          clone_price_fan?: number | null
          created_at?: string | null
          cube_id?: string
          cube_type?: string
          current_mint_count?: number | null
          description?: string | null
          event_date?: string | null
          event_name?: string | null
          fan_fee_model?: string | null
          glb_url?: string | null
          is_active?: boolean | null
          is_minting_enabled?: boolean | null
          is_secured?: boolean | null
          is_template?: boolean | null
          max_free_refreshes?: number
          max_mint_count?: number | null
          mint_price_artist?: number | null
          parent_cube_id?: string | null
          payment_model?: string | null
          platform_revenue_share?: number | null
          premium_features?: Json | null
          refresh_count?: number
          revenue_recovered?: number | null
          revenue_recovered_cents?: number | null
          revenue_recovery_target_cents?: number | null
          slug?: string | null
          stripe_payment_intent_id?: string | null
          stripeurl_face?: string | null
          tcube_contract_address?: string | null
          theme_config?: Json | null
          tier?: string | null
          title?: string
          update_notification_cost?: number | null
          updated_at?: string | null
          upfront_fee_paid?: boolean | null
          upfront_payment_amount_cents?: number | null
          upfront_payment_bypassed?: boolean | null
          upfront_payment_completed?: boolean | null
          upfront_stripe_payment_intent_id?: string | null
          user_id?: string
          uses_revenue_recovery?: boolean | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticketcubes_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "ticketcubes_parent_cube_id_fkey"
            columns: ["parent_cube_id"]
            isOneToOne: false
            referencedRelation: "ticketcubes"
            referencedColumns: ["cube_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          is_admin: boolean
          role: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_status: string | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          is_admin?: boolean
          role?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          is_admin?: boolean
          role?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          updated_at?: string
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
      calculate_artist_revenue_split: {
        Args: { p_fan_payment_amount: number; p_template_id: string }
        Returns: {
          artist_share: number
          platform_share: number
          revenue_recovered: number
        }[]
      }
      cleanup_expired_pending_templates: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_old_conversations: { Args: never; Returns: undefined }
      decrement_mint_count: {
        Args: { template_cube_id: string }
        Returns: boolean
      }
      generate_api_key: { Args: never; Returns: string }
      generate_api_secret: { Args: never; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
