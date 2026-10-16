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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deleted_reason: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      distribution_operations: {
        Row: {
          created_at: string
          id: string
          route_ids: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          route_ids: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          route_ids?: string[]
          user_id?: string
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          completed_at: string | null
          created_at: string
          filename: string
          id: string
          invalid_rows: number
          status: Database["public"]["Enums"]["import_status"]
          total_rows: number
          user_id: string
          valid_rows: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          filename: string
          id?: string
          invalid_rows?: number
          status?: Database["public"]["Enums"]["import_status"]
          total_rows?: number
          user_id: string
          valid_rows?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          filename?: string
          id?: string
          invalid_rows?: number
          status?: Database["public"]["Enums"]["import_status"]
          total_rows?: number
          user_id?: string
          valid_rows?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      motorcycles: {
        Row: {
          brand: string | null
          chassis: string | null
          client_id: string | null
          color: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deleted_reason: string | null
          id: string
          model: string | null
          plate: string
          updated_at: string
          year: number | null
        }
        Insert: {
          brand?: string | null
          chassis?: string | null
          client_id?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          id?: string
          model?: string | null
          plate: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          brand?: string | null
          chassis?: string | null
          client_id?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          id?: string
          model?: string | null
          plate?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "motorcycles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          data: Json
          entity_id: string | null
          entity_type: string | null
          event_key: string
          id: string
          push_attempts: number
          push_status: string
          pushed_at: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          data?: Json
          entity_id?: string | null
          entity_type?: string | null
          event_key: string
          id?: string
          push_attempts?: number
          push_status?: string
          pushed_at?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          data?: Json
          entity_id?: string | null
          entity_type?: string | null
          event_key?: string
          id?: string
          push_attempts?: number
          push_status?: string
          pushed_at?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrence_events: {
        Row: {
          actor_id: string | null
          created_at: string
          details: Json
          event_type: string
          from_status: Database["public"]["Enums"]["occurrence_status"] | null
          id: string
          occurrence_id: string
          route_id: string | null
          to_status: Database["public"]["Enums"]["occurrence_status"] | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          event_type: string
          from_status?: Database["public"]["Enums"]["occurrence_status"] | null
          id?: string
          occurrence_id: string
          route_id?: string | null
          to_status?: Database["public"]["Enums"]["occurrence_status"] | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          event_type?: string
          from_status?: Database["public"]["Enums"]["occurrence_status"] | null
          id?: string
          occurrence_id?: string
          route_id?: string | null
          to_status?: Database["public"]["Enums"]["occurrence_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_events_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_events_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrences: {
        Row: {
          address: string | null
          city: string | null
          client_id: string | null
          code: number
          created_at: string
          created_by: string | null
          current_route_id: string | null
          debt_amount: number | null
          deleted_at: string | null
          deleted_by: string | null
          deleted_reason: string | null
          id: string
          import_batch_id: string | null
          latitude: number | null
          longitude: number | null
          motorcycle_id: string | null
          notes: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          state: string | null
          status: Database["public"]["Enums"]["occurrence_status"]
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_id?: string | null
          code?: never
          created_at?: string
          created_by?: string | null
          current_route_id?: string | null
          debt_amount?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          id?: string
          import_batch_id?: string | null
          latitude?: number | null
          longitude?: number | null
          motorcycle_id?: string | null
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          state?: string | null
          status?: Database["public"]["Enums"]["occurrence_status"]
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_id?: string | null
          code?: never
          created_at?: string
          created_by?: string | null
          current_route_id?: string | null
          debt_amount?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          id?: string
          import_batch_id?: string | null
          latitude?: number | null
          longitude?: number | null
          motorcycle_id?: string | null
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          state?: string | null
          status?: Database["public"]["Enums"]["occurrence_status"]
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "occurrences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_current_route_fk"
            columns: ["current_route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_motorcycle_id_fkey"
            columns: ["motorcycle_id"]
            isOneToOne: false
            referencedRelation: "motorcycles"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deleted_reason: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operators_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          failure_count: number
          id: string
          last_seen_at: string
          last_success_at: string | null
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          failure_count?: number
          id?: string
          last_seen_at?: string
          last_success_at?: string | null
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          failure_count?: number
          id?: string
          last_seen_at?: string
          last_success_at?: string | null
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      route_services: {
        Row: {
          created_at: string
          created_by: string | null
          route_id: string
          service_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          route_id: string
          service_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          route_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_services_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stop_evidence: {
        Row: {
          captured_at: string | null
          created_at: string
          height: number | null
          id: string
          kind: string
          mime_type: string
          occurrence_id: string | null
          route_stop_id: string
          sequence: number
          size_bytes: number
          storage_path: string
          uploaded_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          captured_at?: string | null
          created_at?: string
          height?: number | null
          id?: string
          kind?: string
          mime_type: string
          occurrence_id?: string | null
          route_stop_id: string
          sequence: number
          size_bytes: number
          storage_path: string
          uploaded_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          captured_at?: string | null
          created_at?: string
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string
          occurrence_id?: string | null
          route_stop_id?: string
          sequence?: number
          size_bytes?: number
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stop_evidence_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stop_evidence_route_stop_id_fkey"
            columns: ["route_stop_id"]
            isOneToOne: false
            referencedRelation: "route_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          capture_accuracy: number | null
          capture_latitude: number | null
          capture_location_timestamp: string | null
          capture_longitude: number | null
          capture_operator_id: string | null
          capture_server_received_at: string | null
          capture_without_gps: boolean
          capture_without_gps_reason: string | null
          completed_at: string | null
          completed_by: string | null
          completion_key: string | null
          created_at: string
          id: string
          notes: string | null
          occurrence_id: string
          result: Database["public"]["Enums"]["occurrence_status"] | null
          route_id: string
          sequence: number
          skip_reason: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["route_stop_status"]
          updated_at: string
        }
        Insert: {
          capture_accuracy?: number | null
          capture_latitude?: number | null
          capture_location_timestamp?: string | null
          capture_longitude?: number | null
          capture_operator_id?: string | null
          capture_server_received_at?: string | null
          capture_without_gps?: boolean
          capture_without_gps_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_key?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          occurrence_id: string
          result?: Database["public"]["Enums"]["occurrence_status"] | null
          route_id: string
          sequence: number
          skip_reason?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["route_stop_status"]
          updated_at?: string
        }
        Update: {
          capture_accuracy?: number | null
          capture_latitude?: number | null
          capture_location_timestamp?: string | null
          capture_longitude?: number | null
          capture_operator_id?: string | null
          capture_server_received_at?: string | null
          capture_without_gps?: boolean
          capture_without_gps_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_key?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          occurrence_id?: string
          result?: Database["public"]["Enums"]["occurrence_status"] | null
          route_id?: string
          sequence?: number
          skip_reason?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["route_stop_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_capture_operator_id_fkey"
            columns: ["capture_operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_tracking_current: {
        Row: {
          accuracy: number | null
          altitude: number | null
          captured_at: string
          device_id: string | null
          heading: number | null
          latitude: number
          longitude: number
          operator_id: string
          received_at: string
          route_id: string
          sequence_number: number
          speed: number | null
          tracking_session_id: string
          updated_at: string
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          captured_at: string
          device_id?: string | null
          heading?: number | null
          latitude: number
          longitude: number
          operator_id: string
          received_at?: string
          route_id: string
          sequence_number: number
          speed?: number | null
          tracking_session_id: string
          updated_at?: string
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          captured_at?: string
          device_id?: string | null
          heading?: number | null
          latitude?: number
          longitude?: number
          operator_id?: string
          received_at?: string
          route_id?: string
          sequence_number?: number
          speed?: number | null
          tracking_session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_tracking_current_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_tracking_current_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_tracking_current_tracking_session_id_fkey"
            columns: ["tracking_session_id"]
            isOneToOne: true
            referencedRelation: "route_tracking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      route_tracking_events: {
        Row: {
          created_at: string
          details: Json
          event: string
          id: number
          route_id: string | null
          tracking_session_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json
          event: string
          id?: never
          route_id?: string | null
          tracking_session_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json
          event?: string
          id?: never
          route_id?: string | null
          tracking_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_tracking_events_tracking_session_id_fkey"
            columns: ["tracking_session_id"]
            isOneToOne: false
            referencedRelation: "route_tracking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      route_tracking_points: {
        Row: {
          accuracy: number | null
          altitude: number | null
          captured_at: string
          heading: number | null
          id: number
          latitude: number
          longitude: number
          operator_id: string
          received_at: string
          route_id: string
          sequence_number: number
          speed: number | null
          tracking_session_id: string
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          captured_at: string
          heading?: number | null
          id?: never
          latitude: number
          longitude: number
          operator_id: string
          received_at?: string
          route_id: string
          sequence_number: number
          speed?: number | null
          tracking_session_id: string
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          captured_at?: string
          heading?: number | null
          id?: never
          latitude?: number
          longitude?: number
          operator_id?: string
          received_at?: string
          route_id?: string
          sequence_number?: number
          speed?: number | null
          tracking_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_tracking_points_tracking_session_id_fkey"
            columns: ["tracking_session_id"]
            isOneToOne: false
            referencedRelation: "route_tracking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      route_tracking_sessions: {
        Row: {
          background_capable: boolean | null
          created_at: string
          device_state: string | null
          device_state_at: string | null
          ended_at: string | null
          ended_reason: string | null
          id: string
          last_heartbeat_at: string | null
          last_location_at: string | null
          last_seen_at: string | null
          last_sequence: number
          operator_id: string
          platform: string | null
          presence: string
          route_id: string
          started_at: string
          status: string
        }
        Insert: {
          background_capable?: boolean | null
          created_at?: string
          device_state?: string | null
          device_state_at?: string | null
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          last_heartbeat_at?: string | null
          last_location_at?: string | null
          last_seen_at?: string | null
          last_sequence?: number
          operator_id: string
          platform?: string | null
          presence?: string
          route_id: string
          started_at?: string
          status?: string
        }
        Update: {
          background_capable?: boolean | null
          created_at?: string
          device_state?: string | null
          device_state_at?: string | null
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          last_heartbeat_at?: string | null
          last_location_at?: string | null
          last_seen_at?: string | null
          last_sequence?: number
          operator_id?: string
          platform?: string | null
          presence?: string
          route_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_tracking_sessions_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_tracking_sessions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          code: string
          created_at: string
          created_by: string | null
          distribution_operation_id: string | null
          finished_at: string | null
          finished_by: string | null
          id: string
          operator_id: string | null
          paused_at: string | null
          route_date: string
          started_at: string | null
          status: Database["public"]["Enums"]["route_status"]
          updated_at: string
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          distribution_operation_id?: string | null
          finished_at?: string | null
          finished_by?: string | null
          id?: string
          operator_id?: string | null
          paused_at?: string | null
          route_date: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["route_status"]
          updated_at?: string
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          distribution_operation_id?: string | null
          finished_at?: string | null
          finished_by?: string | null
          id?: string
          operator_id?: string | null
          paused_at?: string | null
          route_date?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["route_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_distribution_operation_id_fkey"
            columns: ["distribution_operation_id"]
            isOneToOne: false
            referencedRelation: "distribution_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      service_catalog: {
        Row: {
          aguia_description: string | null
          billing_description: string | null
          billing_value: number | null
          code: string
          created_at: string
          field_rules: Json
          id: string
          is_active: boolean
          name: string
          pricing_type: string
          requires_identity: boolean
          sort_order: number
          unit_value: number | null
          updated_at: string
        }
        Insert: {
          aguia_description?: string | null
          billing_description?: string | null
          billing_value?: number | null
          code: string
          created_at?: string
          field_rules: Json
          id?: string
          is_active?: boolean
          name: string
          pricing_type: string
          requires_identity?: boolean
          sort_order?: number
          unit_value?: number | null
          updated_at?: string
        }
        Update: {
          aguia_description?: string | null
          billing_description?: string | null
          billing_value?: number | null
          code?: string
          created_at?: string
          field_rules?: Json
          id?: string
          is_active?: boolean
          name?: string
          pricing_type?: string
          requires_identity?: boolean
          sort_order?: number
          unit_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_catalog_pricing_fk"
            columns: ["pricing_type"]
            isOneToOne: false
            referencedRelation: "service_pricing_models"
            referencedColumns: ["code"]
          },
        ]
      }
      service_execution_evidence: {
        Row: {
          created_at: string
          execution_id: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          execution_id: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          execution_id?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_execution_evidence_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "service_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      service_executions: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_name: string | null
          created_at: string
          extra_description: string | null
          id: string
          notes: string | null
          operator_id: string
          origin: string
          performed_at: string
          performed_by: string
          phone: string | null
          plate: string | null
          pricing_type_snapshot: string
          quantity: number
          registered_by: string | null
          route_id: string | null
          route_stop_id: string | null
          rule_snapshot: Json | null
          service_id: string
          service_name_snapshot: string
          settlement_id: string | null
          status: Database["public"]["Enums"]["execution_status"]
          total_value: number | null
          unit_value_snapshot: number | null
          value_defined_at: string | null
          value_defined_by: string | null
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_name?: string | null
          created_at?: string
          extra_description?: string | null
          id: string
          notes?: string | null
          operator_id: string
          origin?: string
          performed_at?: string
          performed_by: string
          phone?: string | null
          plate?: string | null
          pricing_type_snapshot: string
          quantity?: number
          registered_by?: string | null
          route_id?: string | null
          route_stop_id?: string | null
          rule_snapshot?: Json | null
          service_id: string
          service_name_snapshot: string
          settlement_id?: string | null
          status: Database["public"]["Enums"]["execution_status"]
          total_value?: number | null
          unit_value_snapshot?: number | null
          value_defined_at?: string | null
          value_defined_by?: string | null
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_name?: string | null
          created_at?: string
          extra_description?: string | null
          id?: string
          notes?: string | null
          operator_id?: string
          origin?: string
          performed_at?: string
          performed_by?: string
          phone?: string | null
          plate?: string | null
          pricing_type_snapshot?: string
          quantity?: number
          registered_by?: string | null
          route_id?: string | null
          route_stop_id?: string | null
          rule_snapshot?: Json | null
          service_id?: string
          service_name_snapshot?: string
          settlement_id?: string | null
          status?: Database["public"]["Enums"]["execution_status"]
          total_value?: number | null
          unit_value_snapshot?: number | null
          value_defined_at?: string | null
          value_defined_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_executions_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_executions_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_executions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_executions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_executions_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "weekly_settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      service_price_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_value: number | null
          old_value: number | null
          service_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_value?: number | null
          old_value?: number | null
          service_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_value?: number | null
          old_value?: number | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_price_history_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pricing_models: {
        Row: {
          awaits_admin_value: boolean
          code: string
          description: string
          is_active: boolean
          label: string
          sort_order: number
          uses_quantity_rules: boolean
          uses_unit_value: boolean
        }
        Insert: {
          awaits_admin_value?: boolean
          code: string
          description: string
          is_active?: boolean
          label: string
          sort_order?: number
          uses_quantity_rules?: boolean
          uses_unit_value?: boolean
        }
        Update: {
          awaits_admin_value?: boolean
          code?: string
          description?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          uses_quantity_rules?: boolean
          uses_unit_value?: boolean
        }
        Relationships: []
      }
      service_quantity_rules: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          max_qty: number | null
          min_qty: number
          per_unit: boolean
          service_id: string
          value: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_qty?: number | null
          min_qty: number
          per_unit?: boolean
          service_id: string
          value: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_qty?: number | null
          min_qty?: number
          per_unit?: boolean
          service_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_quantity_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_settings: {
        Row: {
          id: boolean
          max_accuracy_m: number
          max_age_h: number
          max_future_skew_s: number
          max_speed_mps: number
          presence_ttl_seconds: number
          retention_days: number
        }
        Insert: {
          id?: boolean
          max_accuracy_m?: number
          max_age_h?: number
          max_future_skew_s?: number
          max_speed_mps?: number
          presence_ttl_seconds?: number
          retention_days?: number
        }
        Update: {
          id?: boolean
          max_accuracy_m?: number
          max_age_h?: number
          max_future_skew_s?: number
          max_speed_mps?: number
          presence_ttl_seconds?: number
          retention_days?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_settlements: {
        Row: {
          closed_at: string
          closed_by: string
          executions_count: number
          id: string
          operator_id: string
          reopened_at: string | null
          reopened_by: string | null
          reopened_reason: string | null
          status: string
          total_value: number
          week_end: string
          week_start: string
        }
        Insert: {
          closed_at?: string
          closed_by: string
          executions_count: number
          id?: string
          operator_id: string
          reopened_at?: string | null
          reopened_by?: string | null
          reopened_reason?: string | null
          status?: string
          total_value: number
          week_end: string
          week_start: string
        }
        Update: {
          closed_at?: string
          closed_by?: string
          executions_count?: number
          id?: string
          operator_id?: string
          reopened_at?: string | null
          reopened_by?: string | null
          reopened_reason?: string | null
          status?: string
          total_value?: number
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_settlements_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _aguia_can_view_client: {
        Args: { p_client_id: string }
        Returns: boolean
      }
      _aguia_can_view_motorcycle: {
        Args: { p_motorcycle_id: string }
        Returns: boolean
      }
      _audit: {
        Args: {
          _action: string
          _details?: Json
          _entity: string
          _entity_id: string
        }
        Returns: undefined
      }
      _audit_full: {
        Args: {
          _action: string
          _after: Json
          _before: Json
          _details?: Json
          _entity: string
          _entity_id: string
        }
        Returns: undefined
      }
      _can_operate_route: { Args: { _route: string }; Returns: boolean }
      _can_read_stop_evidence: { Args: { p_name: string }; Returns: boolean }
      _can_upload_stop_evidence: { Args: { p_name: string }; Returns: boolean }
      _can_view_stop: { Args: { p_stop: string }; Returns: boolean }
      _cancel_route_executions: {
        Args: {
          p_keep: string[]
          p_reason: string
          p_route: string
          p_where_stop: string
        }
        Returns: undefined
      }
      _compact_sequence: { Args: { _route: string }; Returns: undefined }
      _compute_price: {
        Args: {
          _qty: number
          _s: Database["public"]["Tables"]["service_catalog"]["Row"]
        }
        Returns: Json
      }
      _field_rules_default: {
        Args: { _pricing: string; _requires_identity: boolean }
        Returns: Json
      }
      _finance_admin: { Args: never; Returns: boolean }
      _is_route_operator: { Args: { _route: string }; Returns: boolean }
      _local_date: { Args: { _t: string }; Returns: string }
      _lock_route: {
        Args: { p_route_id: string }
        Returns: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          code: string
          created_at: string
          created_by: string | null
          distribution_operation_id: string | null
          finished_at: string | null
          finished_by: string | null
          id: string
          operator_id: string | null
          paused_at: string | null
          route_date: string
          started_at: string | null
          status: Database["public"]["Enums"]["route_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "routes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _norm_plate: { Args: { _p: string }; Returns: string }
      _notify: {
        Args: {
          _body: string
          _category?: string
          _data: Json
          _entity_id?: string
          _entity_type?: string
          _event_key: string
          _title: string
          _type: string
          _user: string
        }
        Returns: undefined
      }
      _ntf_stop_event: {
        Args: { _route: string; _stop: string; _type: string }
        Returns: undefined
      }
      _occ_event: {
        Args: {
          _details?: Json
          _from: Database["public"]["Enums"]["occurrence_status"]
          _occ: string
          _route: string
          _to: Database["public"]["Enums"]["occurrence_status"]
          _type: string
        }
        Returns: undefined
      }
      _operator_is_assignable: {
        Args: { p_operator_id: string }
        Returns: boolean
      }
      _operator_user: { Args: { _operator: string }; Returns: string }
      _plannable: {
        Args: { _s: Database["public"]["Enums"]["occurrence_status"] }
        Returns: boolean
      }
      _push_secret_ok: { Args: { p_secret: string }; Returns: boolean }
      _refresh_settlement: {
        Args: { p_settlement: string }
        Returns: undefined
      }
      _require: { Args: { _permission: string }; Returns: undefined }
      _rpc_on: { Args: never; Returns: undefined }
      _rule_overlaps: {
        Args: { _except: string; _max: number; _min: number; _service: string }
        Returns: boolean
      }
      _sync_stop_services: { Args: { p_stop_id: string }; Returns: number }
      _tracking_end: {
        Args: { _reason: string; _route: string }
        Returns: undefined
      }
      _tracking_start: {
        Args: { _operator: string; _route: string }
        Returns: undefined
      }
      _valid_field_rules: { Args: { _f: Json }; Returns: boolean }
      _valid_plate: { Args: { _p: string }; Returns: boolean }
      _visible_route_status: {
        Args: { _s: Database["public"]["Enums"]["route_status"] }
        Returns: boolean
      }
      _week_start: { Args: { _d: string }; Returns: string }
      add_occurrence_to_route: {
        Args: { p_occurrence_id: string; p_route_id: string }
        Returns: Json
      }
      admin_create_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_password: string
          p_roles: Database["public"]["Enums"]["app_role"][]
        }
        Returns: string
      }
      admin_delete_user: { Args: { p_user_id: string }; Returns: undefined }
      admin_quote_service: {
        Args: { p_quantity?: number; p_service_id: string }
        Returns: Json
      }
      admin_register_service_execution: {
        Args: {
          p_client_name: string
          p_description: string
          p_extra_value?: number
          p_id: string
          p_notes: string
          p_operator_id: string
          p_performed_at: string
          p_phone: string
          p_plate: string
          p_quantity: number
          p_service_id: string
        }
        Returns: Json
      }
      admin_update_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_password: string
          p_user_id: string
        }
        Returns: undefined
      }
      assignable_operator_ids: { Args: never; Returns: string[] }
      cancel_execution: {
        Args: { p_id: string; p_reason?: string }
        Returns: undefined
      }
      cancel_route: {
        Args: { p_reason: string; p_route_id: string }
        Returns: Json
      }
      claim_push_batch: {
        Args: { p_limit?: number; p_secret: string }
        Returns: Json
      }
      close_week: { Args: { p_week_start: string }; Returns: Json }
      complete_push_batch: {
        Args: {
          p_gone: string[]
          p_ok: string[]
          p_results: Json
          p_secret: string
        }
        Returns: undefined
      }
      complete_stop: {
        Args: {
          p_capture: Json
          p_evidence: Json
          p_idempotency_key: string
          p_notes: string
          p_result: Database["public"]["Enums"]["occurrence_status"]
          p_stop_id: string
        }
        Returns: Json
      }
      correct_stop_result: {
        Args: {
          p_reason: string
          p_result: Database["public"]["Enums"]["occurrence_status"]
          p_stop_id: string
        }
        Returns: undefined
      }
      create_route: {
        Args: {
          p_operator_id: string
          p_route_date: string
          p_service_ids?: string[]
        }
        Returns: Json
      }
      dashboard_summary: { Args: { p_date?: string }; Returns: Json }
      deactivate_quantity_rule: { Args: { p_id: string }; Returns: undefined }
      delete_client: {
        Args: { p_id: string; p_reason?: string }
        Returns: Json
      }
      delete_execution: { Args: { p_id: string }; Returns: Json }
      delete_import_batch: {
        Args: { p_id: string; p_with_occurrences?: boolean }
        Returns: Json
      }
      delete_motorcycle: {
        Args: { p_id: string; p_reason?: string }
        Returns: Json
      }
      delete_occurrence: {
        Args: { p_id: string; p_reason?: string }
        Returns: Json
      }
      delete_operator: {
        Args: { p_id: string; p_reason?: string }
        Returns: Json
      }
      delete_quantity_rule: { Args: { p_id: string }; Returns: Json }
      delete_route: { Args: { p_route_id: string }; Returns: Json }
      delete_service: { Args: { p_id: string }; Returns: Json }
      distribute_occurrences: {
        Args: {
          p_occurrence_ids: string[]
          p_operation_id: string
          p_operator_ids: string[]
          p_route_date: string
          p_service_ids?: string[]
        }
        Returns: Json
      }
      finish_route: { Args: { p_route_id: string }; Returns: Json }
      get_active_tracking_sessions: {
        Args: never
        Returns: {
          accuracy: number
          captured_at: string
          device_state: string
          device_state_at: string
          heading: number
          last_heartbeat_at: string
          last_location_at: string
          last_seen_at: string
          latitude: number
          longitude: number
          operator_id: string
          operator_name: string
          platform: string
          presence: string
          presence_ttl_seconds: number
          route_code: string
          route_id: string
          route_status: Database["public"]["Enums"]["route_status"]
          sequence_number: number
          server_received_at: string
          session_id: string
          speed: number
          started_at: string
        }[]
      }
      get_my_tracking_session: { Args: never; Returns: Json }
      has_permission: { Args: { _permission: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      heartbeat_route_tracking: {
        Args: { p_details?: Json; p_event?: string; p_session_id: string }
        Returns: Json
      }
      import_occurrences: {
        Args: { p_filename: string; p_rows: Json }
        Returns: Json
      }
      import_occurrences_text: {
        Args: { p_rows: Json; p_source: string }
        Returns: Json
      }
      link_operator_user: {
        Args: { p_operator_id: string; p_profile_id: string }
        Returns: undefined
      }
      log_export: {
        Args: { p_filters: Json; p_report: string; p_rows: number }
        Returns: undefined
      }
      mark_notifications_read: { Args: { p_ids?: string[] }; Returns: number }
      move_occurrence: {
        Args: {
          p_from_route_id: string
          p_occurrence_id: string
          p_to_route_id: string
        }
        Returns: Json
      }
      my_earnings: { Args: { p_from: string; p_to: string }; Returns: Json }
      my_operator_id: { Args: never; Returns: string }
      my_permissions: {
        Args: never
        Returns: {
          permission: string
        }[]
      }
      my_roles: {
        Args: never
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      my_route_services: { Args: never; Returns: Json }
      pause_route: {
        Args: { p_reason?: string; p_route_id: string }
        Returns: undefined
      }
      purge_route_tracking_points: { Args: never; Returns: number }
      push_public_key: { Args: never; Returns: string }
      quote_service: {
        Args: { p_quantity?: number; p_service_id: string }
        Returns: Json
      }
      register_push_subscription: {
        Args: {
          p_auth: string
          p_endpoint: string
          p_p256dh: string
          p_user_agent: string
        }
        Returns: undefined
      }
      register_service_execution: {
        Args: {
          p_client_name: string
          p_description: string
          p_evidence: Json
          p_id: string
          p_notes: string
          p_phone: string
          p_plate: string
          p_quantity: number
          p_route_id: string
          p_service_id: string
        }
        Returns: Json
      }
      release_occurrence: {
        Args: { p_occurrence_id: string; p_reason?: string }
        Returns: undefined
      }
      reopen_route: {
        Args: { p_reason: string; p_route_id: string }
        Returns: Json
      }
      reopen_settlement: {
        Args: { p_id: string; p_reason: string }
        Returns: undefined
      }
      reorder_route_stops: {
        Args: { p_route_id: string; p_stops: Json }
        Returns: undefined
      }
      reorder_services: { Args: { p_ids: string[] }; Returns: undefined }
      report_summary: { Args: { p_from: string; p_to: string }; Returns: Json }
      resume_route: { Args: { p_route_id: string }; Returns: undefined }
      route_services_overview: { Args: { p_route_id: string }; Returns: Json }
      send_operator_message: {
        Args: {
          p_body: string
          p_operator_id: string
          p_request_id: string
          p_title: string
        }
        Returns: undefined
      }
      service_catalog_overview: { Args: never; Returns: Json }
      service_history: {
        Args: { p_limit?: number; p_service_id: string }
        Returns: Json
      }
      services_summary: {
        Args: { p_from: string; p_group: string; p_to: string }
        Returns: Json
      }
      set_execution_value: {
        Args: { p_id: string; p_reason?: string; p_value: number }
        Returns: undefined
      }
      set_operator_active: {
        Args: { p_active: boolean; p_id: string }
        Returns: undefined
      }
      set_quantity_rule_active: {
        Args: { p_active: boolean; p_id: string }
        Returns: undefined
      }
      set_route_services: {
        Args: { p_route_id: string; p_service_ids: string[] }
        Returns: Json
      }
      set_service_descriptions: {
        Args: {
          p_aguia_description: string
          p_billing_description: string
          p_billing_value: number
          p_id: string
        }
        Returns: undefined
      }
      set_user_active: {
        Args: { p_active: boolean; p_user_id: string }
        Returns: undefined
      }
      set_user_roles: {
        Args: {
          p_roles: Database["public"]["Enums"]["app_role"][]
          p_user_id: string
        }
        Returns: undefined
      }
      settlement_preview: { Args: { p_week_start: string }; Returns: Json }
      start_route: { Args: { p_route_id: string }; Returns: undefined }
      start_stop: { Args: { p_stop_id: string }; Returns: undefined }
      unregister_push_subscription: {
        Args: { p_endpoint: string }
        Returns: undefined
      }
      update_execution: {
        Args: {
          p_client_name: string
          p_description: string
          p_id: string
          p_notes: string
          p_performed_at: string
          p_phone: string
          p_plate: string
          p_quantity: number
          p_total_value: number
        }
        Returns: Json
      }
      update_route: {
        Args: {
          p_operator_id: string
          p_route_date: string
          p_route_id: string
        }
        Returns: Json
      }
      update_route_location: {
        Args: { p_device_id: string; p_points: Json; p_session_id: string }
        Returns: Json
      }
      update_user_profile: {
        Args: { p_full_name: string; p_user_id: string }
        Returns: undefined
      }
      upsert_quantity_rule: {
        Args: {
          p_id: string
          p_max: number
          p_min: number
          p_per_unit: boolean
          p_service_id: string
          p_value: number
        }
        Returns: string
      }
      upsert_service: {
        Args: {
          p_field_rules?: Json
          p_id: string
          p_is_active: boolean
          p_name: string
          p_pricing_type: string
          p_requires_identity: boolean
          p_unit_value: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "operator"
        | "financial"
        | "viewer"
        | "driver"
      execution_status: "awaiting_value" | "approved" | "settled" | "cancelled"
      import_status:
        | "draft"
        | "validated"
        | "committed"
        | "failed"
        | "cancelled"
      occurrence_status:
        | "pending"
        | "available"
        | "assigned"
        | "in_route"
        | "located"
        | "recovered"
        | "not_located"
        | "wrong_address"
        | "rescheduled"
        | "cancelled"
        | "finished"
      priority_level: "low" | "normal" | "high" | "urgent"
      route_status:
        | "draft"
        | "planned"
        | "assigned"
        | "in_progress"
        | "paused"
        | "finished"
        | "cancelled"
      route_stop_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "skipped"
        | "cancelled"
      service_pricing_type: "fixed" | "quantity" | "extra"
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
    Enums: {
      app_role: [
        "admin",
        "manager",
        "operator",
        "financial",
        "viewer",
        "driver",
      ],
      execution_status: ["awaiting_value", "approved", "settled", "cancelled"],
      import_status: ["draft", "validated", "committed", "failed", "cancelled"],
      occurrence_status: [
        "pending",
        "available",
        "assigned",
        "in_route",
        "located",
        "recovered",
        "not_located",
        "wrong_address",
        "rescheduled",
        "cancelled",
        "finished",
      ],
      priority_level: ["low", "normal", "high", "urgent"],
      route_status: [
        "draft",
        "planned",
        "assigned",
        "in_progress",
        "paused",
        "finished",
        "cancelled",
      ],
      route_stop_status: [
        "pending",
        "in_progress",
        "completed",
        "skipped",
        "cancelled",
      ],
      service_pricing_type: ["fixed", "quantity", "extra"],
    },
  },
} as const
