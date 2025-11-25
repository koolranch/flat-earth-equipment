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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          meta: Json | null
          org_id: string | null
          target: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          org_id?: string | null
          target?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          org_id?: string | null
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          ip: string | null
          meta: Json
          ua: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          meta?: Json
          ua?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          meta?: Json
          ua?: string | null
        }
        Relationships: []
      }
      bobcat_module_dictionary: {
        Row: {
          created_at: string | null
          engine: string | null
          likely_model: string | null
          module_code: string
          notes: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          engine?: string | null
          likely_model?: string | null
          module_code: string
          notes?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          engine?: string | null
          likely_model?: string | null
          module_code?: string
          notes?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      bobcat_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      bobcat_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model: string
          notes: string | null
          serial_end: string
          serial_start: string
          source_url: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          model: string
          notes?: string | null
          serial_end: string
          serial_start: string
          source_url?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: number
          model?: string
          notes?: string | null
          serial_end?: string
          serial_start?: string
          source_url?: string | null
          year?: number
        }
        Relationships: []
      }
      brand_overrides: {
        Row: {
          brand_slug: string
          canonical_fault_url: string | null
          canonical_guide_url: string | null
          canonical_serial_url: string | null
          fault_codes_url: string | null
          guide_url: string | null
          id: number
          notes: string | null
          serial_tool_url: string
        }
        Insert: {
          brand_slug: string
          canonical_fault_url?: string | null
          canonical_guide_url?: string | null
          canonical_serial_url?: string | null
          fault_codes_url?: string | null
          guide_url?: string | null
          id?: number
          notes?: string | null
          serial_tool_url: string
        }
        Update: {
          brand_slug?: string
          canonical_fault_url?: string | null
          canonical_guide_url?: string | null
          canonical_serial_url?: string | null
          fault_codes_url?: string | null
          guide_url?: string | null
          id?: number
          notes?: string | null
          serial_tool_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_overrides_brand_slug_fkey"
            columns: ["brand_slug"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["slug"]
          },
        ]
      }
      brands: {
        Row: {
          blurb: string | null
          created_at: string | null
          id: number
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          blurb?: string | null
          created_at?: string | null
          id?: number
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          blurb?: string | null
          created_at?: string | null
          id?: number
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      case_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      case_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      case_series_examples: {
        Row: {
          code: string
          example_note: string
        }
        Insert: {
          code: string
          example_note: string
        }
        Update: {
          code?: string
          example_note?: string
        }
        Relationships: []
      }
      case_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      cat_model_prefixes: {
        Row: {
          created_at: string | null
          example_models: string | null
          family: string
          notes: string | null
          prefix: string
        }
        Insert: {
          created_at?: string | null
          example_models?: string | null
          family: string
          notes?: string | null
          prefix: string
        }
        Update: {
          created_at?: string | null
          example_models?: string | null
          family?: string
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      cat_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      cat_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      certificates: {
        Row: {
          apple_wallet_url: string | null
          course_id: string
          created_at: string
          enrollment_id: string | null
          eval_pdf_url: string | null
          google_wallet_url: string | null
          id: string
          issue_date: string
          issued_at: string | null
          learner_id: string
          module_ids: Json | null
          pdf_url: string | null
          practical_eval_on_file: boolean | null
          practical_id: string | null
          revoked_at: string | null
          revoked_reason: string | null
          score: number
          signature: string | null
          signed_payload: Json | null
          trainee_signature_url: string | null
          trainer_signature_url: string | null
          user_id: string | null
          verification_code: string | null
          verifier_code: string
          verify_code: string
          wallet_pdf_url: string | null
        }
        Insert: {
          apple_wallet_url?: string | null
          course_id: string
          created_at?: string
          enrollment_id?: string | null
          eval_pdf_url?: string | null
          google_wallet_url?: string | null
          id?: string
          issue_date?: string
          issued_at?: string | null
          learner_id: string
          module_ids?: Json | null
          pdf_url?: string | null
          practical_eval_on_file?: boolean | null
          practical_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          score: number
          signature?: string | null
          signed_payload?: Json | null
          trainee_signature_url?: string | null
          trainer_signature_url?: string | null
          user_id?: string | null
          verification_code?: string | null
          verifier_code: string
          verify_code?: string
          wallet_pdf_url?: string | null
        }
        Update: {
          apple_wallet_url?: string | null
          course_id?: string
          created_at?: string
          enrollment_id?: string | null
          eval_pdf_url?: string | null
          google_wallet_url?: string | null
          id?: string
          issue_date?: string
          issued_at?: string | null
          learner_id?: string
          module_ids?: Json | null
          pdf_url?: string | null
          practical_eval_on_file?: boolean | null
          practical_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          score?: number
          signature?: string | null
          signed_payload?: Json | null
          trainee_signature_url?: string | null
          trainer_signature_url?: string | null
          user_id?: string | null
          verification_code?: string | null
          verifier_code?: string
          verify_code?: string
          wallet_pdf_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_enrollment_fk"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_practical_id_fkey"
            columns: ["practical_id"]
            isOneToOne: false
            referencedRelation: "practical_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      clark_legacy_month_map: {
        Row: {
          code: string
          month: number
        }
        Insert: {
          code: string
          month: number
        }
        Update: {
          code?: string
          month?: number
        }
        Relationships: []
      }
      clark_legacy_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      clark_model_prefixes: {
        Row: {
          created_at: string | null
          example_models: string | null
          family: string
          notes: string | null
          prefix: string
        }
        Insert: {
          created_at?: string | null
          example_models?: string | null
          family: string
          notes?: string | null
          prefix: string
        }
        Update: {
          created_at?: string | null
          example_models?: string | null
          family?: string
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      clark_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      clark_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      company_seats: {
        Row: {
          company_id: string | null
          enrollment_id: string | null
          id: string
        }
        Insert: {
          company_id?: string | null
          enrollment_id?: string | null
          id?: string
        }
        Update: {
          company_id?: string | null
          enrollment_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_seats_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_recert: boolean
          price_cents: number
          recert_parent_slug: string | null
          slug: string
          stripe_price: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_recert?: boolean
          price_cents: number
          recert_parent_slug?: string | null
          slug: string
          stripe_price?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_recert?: boolean
          price_cents?: number
          recert_parent_slug?: string | null
          slug?: string
          stripe_price?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      crown_model_prefixes: {
        Row: {
          created_at: string | null
          example_models: string | null
          family: string
          notes: string | null
          prefix: string
        }
        Insert: {
          created_at?: string | null
          example_models?: string | null
          family: string
          notes?: string | null
          prefix: string
        }
        Update: {
          created_at?: string | null
          example_models?: string | null
          family?: string
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      crown_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      crown_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      doosan_capacity_map: {
        Row: {
          approx_capacity: string
          code: string
        }
        Insert: {
          approx_capacity: string
          code: string
        }
        Update: {
          approx_capacity?: string
          code?: string
        }
        Relationships: []
      }
      doosan_model_prefixes: {
        Row: {
          created_at: string | null
          example_models: string | null
          family: string
          notes: string | null
          prefix: string
        }
        Insert: {
          created_at?: string | null
          example_models?: string | null
          family: string
          notes?: string | null
          prefix: string
        }
        Update: {
          created_at?: string | null
          example_models?: string | null
          family?: string
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      doosan_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      doosan_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      employer_evaluations: {
        Row: {
          checklist: Json | null
          competencies: Json | null
          created_at: string
          created_by: string | null
          enrollment_id: string
          evaluation_date: string
          evaluator_name: string
          evaluator_signature: string | null
          evaluator_signature_url: string | null
          evaluator_title: string | null
          id: string
          notes: string | null
          practical_pass: boolean
          signature_url: string | null
          site_location: string | null
          trainee_signature_url: string | null
          trainee_user_id: string | null
          truck_type: string | null
          verified_by_admin: boolean
        }
        Insert: {
          checklist?: Json | null
          competencies?: Json | null
          created_at?: string
          created_by?: string | null
          enrollment_id: string
          evaluation_date: string
          evaluator_name: string
          evaluator_signature?: string | null
          evaluator_signature_url?: string | null
          evaluator_title?: string | null
          id?: string
          notes?: string | null
          practical_pass: boolean
          signature_url?: string | null
          site_location?: string | null
          trainee_signature_url?: string | null
          trainee_user_id?: string | null
          truck_type?: string | null
          verified_by_admin?: boolean
        }
        Update: {
          checklist?: Json | null
          competencies?: Json | null
          created_at?: string
          created_by?: string | null
          enrollment_id?: string
          evaluation_date?: string
          evaluator_name?: string
          evaluator_signature?: string | null
          evaluator_signature_url?: string | null
          evaluator_title?: string | null
          id?: string
          notes?: string | null
          practical_pass?: boolean
          signature_url?: string | null
          site_location?: string | null
          trainee_signature_url?: string | null
          trainee_user_id?: string | null
          truck_type?: string | null
          verified_by_admin?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "employer_evaluations_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          cert_url: string | null
          course_id: string | null
          course_slug: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          learner_email: string | null
          org_id: string | null
          passed: boolean | null
          progress_pct: number | null
          resume_state: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cert_url?: string | null
          course_id?: string | null
          course_slug?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          learner_email?: string | null
          org_id?: string | null
          passed?: boolean | null
          progress_pct?: number | null
          resume_state?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cert_url?: string | null
          course_id?: string | null
          course_slug?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          learner_email?: string | null
          org_id?: string | null
          passed?: boolean | null
          progress_pct?: number | null
          resume_state?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_profiles_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ep_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      ep_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      ep_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string | null
          id: number
          message: string | null
          meta: Json | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          message?: string | null
          meta?: Json | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          message?: string | null
          meta?: Json | null
          source?: string | null
        }
        Relationships: []
      }
      eval_submissions: {
        Row: {
          certificate_id: string | null
          checks_json: Json | null
          created_at: string | null
          equipment_type: string | null
          id: string
          signature_url: string | null
          supervisor_email: string
        }
        Insert: {
          certificate_id?: string | null
          checks_json?: Json | null
          created_at?: string | null
          equipment_type?: string | null
          id?: string
          signature_url?: string | null
          supervisor_email: string
        }
        Update: {
          certificate_id?: string | null
          checks_json?: Json | null
          created_at?: string | null
          equipment_type?: string | null
          id?: string
          signature_url?: string | null
          supervisor_email?: string
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json
          created_at: string
          detail: Json | null
          duration_seconds: number | null
          enrollment_id: string | null
          exam_slug: string
          id: string
          items_correct: number | null
          items_total: number | null
          paper_id: string | null
          passed: boolean
          score_pct: number
          selected_ids: Json
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          detail?: Json | null
          duration_seconds?: number | null
          enrollment_id?: string | null
          exam_slug: string
          id?: string
          items_correct?: number | null
          items_total?: number | null
          paper_id?: string | null
          passed: boolean
          score_pct: number
          selected_ids: Json
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          detail?: Json | null
          duration_seconds?: number | null
          enrollment_id?: string | null
          exam_slug?: string
          id?: string
          items_correct?: number | null
          items_total?: number | null
          paper_id?: string | null
          passed?: boolean
          score_pct?: number
          selected_ids?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_blueprints: {
        Row: {
          active: boolean
          count: number
          course_slug: string
          created_at: string | null
          difficulty_weights: Json
          id: string
          locale: string
          tag_targets: Json
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          count?: number
          course_slug?: string
          created_at?: string | null
          difficulty_weights?: Json
          id?: string
          locale?: string
          tag_targets?: Json
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          count?: number
          course_slug?: string
          created_at?: string | null
          difficulty_weights?: Json
          id?: string
          locale?: string
          tag_targets?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      exam_papers: {
        Row: {
          correct_indices: number[]
          course_id: string | null
          created_at: string | null
          id: string
          item_ids: string[]
          locale: string
          ttl_at: string
          user_id: string
        }
        Insert: {
          correct_indices: number[]
          course_id?: string | null
          created_at?: string | null
          id?: string
          item_ids: string[]
          locale: string
          ttl_at: string
          user_id: string
        }
        Update: {
          correct_indices?: number[]
          course_id?: string | null
          created_at?: string | null
          id?: string
          item_ids?: string[]
          locale?: string
          ttl_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_sessions: {
        Row: {
          answers: number[]
          created_at: string | null
          id: string
          paper_id: string
          remaining_sec: number
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers: number[]
          created_at?: string | null
          id?: string
          paper_id: string
          remaining_sec: number
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: number[]
          created_at?: string | null
          id?: string
          paper_id?: string
          remaining_sec?: number
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_sessions_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "exam_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_settings: {
        Row: {
          id: number
          pass_score: number
          time_limit_min: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          pass_score?: number
          time_limit_min?: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          pass_score?: number
          time_limit_min?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      factorycat_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      factorycat_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      factorycat_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      factorycat_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      factorycat_user_submissions: {
        Row: {
          family: string | null
          id: number
          model_input: string | null
          serial_input: string | null
          submitted_at: string | null
          user_notes: string | null
        }
        Insert: {
          family?: string | null
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Update: {
          family?: string | null
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Relationships: []
      }
      failed_emails: {
        Row: {
          created_at: string
          error: string | null
          id: string
          password: string
          resolved_at: string | null
          user_email: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          password: string
          resolved_at?: string | null
          user_email: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          password?: string
          resolved_at?: string | null
          user_email?: string
        }
        Relationships: []
      }
      gehl_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      gehl_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      gehl_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      gehl_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      genie_model_prefixes: {
        Row: {
          created_at: string | null
          example_models: string | null
          family: string | null
          notes: string | null
          prefix: string
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          example_models?: string | null
          family?: string | null
          notes?: string | null
          prefix: string
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          example_models?: string | null
          family?: string | null
          notes?: string | null
          prefix?: string
          source_url?: string | null
        }
        Relationships: []
      }
      genie_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      genie_serial_breaks: {
        Row: {
          created_at: string | null
          id: number
          model: string
          note: string | null
          serial_note: string
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          model: string
          note?: string | null
          serial_note: string
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          model?: string
          note?: string | null
          serial_note?: string
          source_url?: string | null
        }
        Relationships: []
      }
      haulotte_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      haulotte_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      haulotte_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      haulotte_user_submissions: {
        Row: {
          family: string | null
          id: number
          model_input: string | null
          serial_input: string | null
          submitted_at: string | null
          user_notes: string | null
        }
        Insert: {
          family?: string | null
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Update: {
          family?: string | null
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Relationships: []
      }
      hc_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      hc_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      hc_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      hc_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      hy_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      hy_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      hy_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      hy_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      hyster_model_prefixes: {
        Row: {
          marketed_model: string | null
          notes: string | null
          prefix: string
          series: string | null
        }
        Insert: {
          marketed_model?: string | null
          notes?: string | null
          prefix: string
          series?: string | null
        }
        Update: {
          marketed_model?: string | null
          notes?: string | null
          prefix?: string
          series?: string | null
        }
        Relationships: []
      }
      hyster_plants: {
        Row: {
          city: string | null
          code: string
          country: string | null
          name: string | null
          notes: string | null
          state_province: string | null
        }
        Insert: {
          city?: string | null
          code: string
          country?: string | null
          name?: string | null
          notes?: string | null
          state_province?: string | null
        }
        Update: {
          city?: string | null
          code?: string
          country?: string | null
          name?: string | null
          notes?: string | null
          state_province?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          org_id: string
          role?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      jcb_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      jcb_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      jcb_series_examples: {
        Row: {
          code: string
          example_note: string
        }
        Insert: {
          code: string
          example_note: string
        }
        Update: {
          code?: string
          example_note?: string
        }
        Relationships: []
      }
      jcb_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      jh_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      jh_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      jh_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      jlg_es_country_prefix: {
        Row: {
          country: string
          notes: string | null
          prefix: string
        }
        Insert: {
          country: string
          notes?: string | null
          prefix: string
        }
        Update: {
          country?: string
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      jlg_model_prefixes: {
        Row: {
          created_at: string | null
          example_models: string | null
          family: string
          notes: string | null
          prefix: string
        }
        Insert: {
          created_at?: string | null
          example_models?: string | null
          family: string
          notes?: string | null
          prefix: string
        }
        Update: {
          created_at?: string | null
          example_models?: string | null
          family?: string
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      jlg_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      jlg_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      karcher_models: {
        Row: {
          common_names: string | null
          created_at: string | null
          family: string
          id: number
          model_code: string
          notes: string | null
        }
        Insert: {
          common_names?: string | null
          created_at?: string | null
          family: string
          id?: number
          model_code: string
          notes?: string | null
        }
        Update: {
          common_names?: string | null
          created_at?: string | null
          family?: string
          id?: number
          model_code?: string
          notes?: string | null
        }
        Relationships: []
      }
      karcher_plate_locations: {
        Row: {
          confidence: string | null
          created_at: string | null
          id: number
          location_text: string
          model_pattern: string
          source_quote: string | null
          source_url: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          id?: number
          location_text: string
          model_pattern: string
          source_quote?: string | null
          source_url?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          id?: number
          location_text?: string
          model_pattern?: string
          source_quote?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      karcher_serial_patterns: {
        Row: {
          created_at: string | null
          example_sn: string | null
          id: number
          interpretation_note: string | null
          pattern_label: string
          source_quote: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          example_sn?: string | null
          id?: number
          interpretation_note?: string | null
          pattern_label: string
          source_quote?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          example_sn?: string | null
          id?: number
          interpretation_note?: string | null
          pattern_label?: string
          source_quote?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      komatsu_ic_model_code_key: {
        Row: {
          code: string
          meaning: string
          position: number
        }
        Insert: {
          code: string
          meaning: string
          position: number
        }
        Update: {
          code?: string
          meaning?: string
          position?: number
        }
        Relationships: []
      }
      komatsu_model_prefixes: {
        Row: {
          created_at: string | null
          example_models: string | null
          family: string
          notes: string | null
          prefix: string
        }
        Insert: {
          created_at?: string | null
          example_models?: string | null
          family: string
          notes?: string | null
          prefix: string
        }
        Update: {
          created_at?: string | null
          example_models?: string | null
          family?: string
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      komatsu_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      komatsu_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      kubota_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      kubota_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      kubota_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      linde_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      linde_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      linde_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      lull_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      lull_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      lull_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      lull_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      lull_user_submissions: {
        Row: {
          claimed_year: number | null
          id: number
          model_input: string | null
          serial_input: string | null
          submitted_at: string | null
          user_notes: string | null
        }
        Insert: {
          claimed_year?: number | null
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Update: {
          claimed_year?: number | null
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Relationships: []
      }
      manitou_model_aliases: {
        Row: {
          alias: string
          family: string
          id: number
          normalized: string
        }
        Insert: {
          alias: string
          family: string
          id?: number
          normalized: string
        }
        Update: {
          alias?: string
          family?: string
          id?: number
          normalized?: string
        }
        Relationships: []
      }
      manitou_plate_locations: {
        Row: {
          component: string
          created_at: string | null
          family: string
          id: number
          location_note: string
        }
        Insert: {
          component: string
          created_at?: string | null
          family: string
          id?: number
          location_note: string
        }
        Update: {
          component?: string
          created_at?: string | null
          family?: string
          id?: number
          location_note?: string
        }
        Relationships: []
      }
      manitou_serial_lookup: {
        Row: {
          created_at: string | null
          disclaimer: string | null
          family: string
          id: number
          model_code: string | null
          rule_type: string | null
          serial_rule: string | null
          source_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          disclaimer?: string | null
          family: string
          id?: number
          model_code?: string | null
          rule_type?: string | null
          serial_rule?: string | null
          source_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          disclaimer?: string | null
          family?: string
          id?: number
          model_code?: string | null
          rule_type?: string | null
          serial_rule?: string | null
          source_ids?: string[] | null
        }
        Relationships: []
      }
      manitou_user_submissions: {
        Row: {
          claimed_year: number | null
          family: string
          id: number
          model_input: string | null
          serial_input: string | null
          submitted_at: string | null
          user_notes: string | null
        }
        Insert: {
          claimed_year?: number | null
          family: string
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Update: {
          claimed_year?: number | null
          family?: string
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Relationships: []
      }
      micro_quest_attempts: {
        Row: {
          completed_at: string | null
          id: string
          pass: boolean | null
          progress: Json
          quest_id: string
          score: number | null
          started_at: string
          step_count: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          pass?: boolean | null
          progress?: Json
          quest_id: string
          score?: number | null
          started_at?: string
          step_count?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          pass?: boolean | null
          progress?: Json
          quest_id?: string
          score?: number | null
          started_at?: string
          step_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "micro_quest_attempts_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "micro_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_quests: {
        Row: {
          active: boolean
          config: Json
          created_at: string | null
          id: string
          locale: string
          order_index: number
          pass_criteria: Json
          required: boolean
          slug: string
          tag: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          config?: Json
          created_at?: string | null
          id?: string
          locale?: string
          order_index?: number
          pass_criteria?: Json
          required?: boolean
          slug: string
          tag: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          config?: Json
          created_at?: string | null
          id?: string
          locale?: string
          order_index?: number
          pass_criteria?: Json
          required?: boolean
          slug?: string
          tag?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mitsu_capacity_map: {
        Row: {
          approx_capacity: string
          code: string
        }
        Insert: {
          approx_capacity: string
          code: string
        }
        Update: {
          approx_capacity?: string
          code?: string
        }
        Relationships: []
      }
      mitsu_model_prefixes: {
        Row: {
          created_at: string | null
          example_models: string | null
          family: string
          notes: string | null
          prefix: string
        }
        Insert: {
          created_at?: string | null
          example_models?: string | null
          family: string
          notes?: string | null
          prefix: string
        }
        Update: {
          created_at?: string | null
          example_models?: string | null
          family?: string
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      mitsu_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      mitsu_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      module_progress: {
        Row: {
          course_slug: string
          module_slug: string
          passed: boolean
          passed_at: string | null
          user_id: string
        }
        Insert: {
          course_slug: string
          module_slug: string
          passed?: boolean
          passed_at?: string | null
          user_id: string
        }
        Update: {
          course_slug?: string
          module_slug?: string
          passed?: boolean
          passed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          content_slug: string | null
          course_id: string | null
          created_at: string | null
          game_asset_key: string | null
          id: string
          intro_url: string | null
          order: number | null
          quiz_json: Json | null
          title: string
          type: string | null
          video_url: string | null
        }
        Insert: {
          content_slug?: string | null
          course_id?: string | null
          created_at?: string | null
          game_asset_key?: string | null
          id?: string
          intro_url?: string | null
          order?: number | null
          quiz_json?: Json | null
          title: string
          type?: string | null
          video_url?: string | null
        }
        Update: {
          content_slug?: string | null
          course_id?: string | null
          created_at?: string | null
          game_asset_key?: string | null
          id?: string
          intro_url?: string | null
          order?: number | null
          quiz_json?: Json | null
          title?: string
          type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      nh_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      nh_prefix_patterns: {
        Row: {
          created_at: string | null
          id: number
          model: string
          notes: string | null
          prefix: string
          source_url: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          model: string
          notes?: string | null
          prefix: string
          source_url?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: number
          model?: string
          notes?: string | null
          prefix?: string
          source_url?: string | null
          year?: number
        }
        Relationships: []
      }
      nh_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model: string
          notes: string | null
          serial_end: string
          serial_start: string
          source_url: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          model: string
          notes?: string | null
          serial_end: string
          serial_start: string
          source_url?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: number
          model?: string
          notes?: string | null
          serial_end?: string
          serial_start?: string
          source_url?: string | null
          year?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_cents: number | null
          course_id: string | null
          course_slug: string | null
          created_at: string | null
          id: string
          seats: number | null
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          course_id?: string | null
          course_slug?: string | null
          created_at?: string | null
          id?: string
          seats?: number | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          course_id?: string | null
          course_slug?: string | null
          created_at?: string | null
          id?: string
          seats?: number | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      org_seats: {
        Row: {
          allocated_seats: number
          course_id: string
          created_at: string
          id: string
          org_id: string
          total_seats: number
        }
        Insert: {
          allocated_seats?: number
          course_id: string
          created_at?: string
          id?: string
          org_id: string
          total_seats: number
        }
        Update: {
          allocated_seats?: number
          course_id?: string
          created_at?: string
          id?: string
          org_id?: string
          total_seats?: number
        }
        Relationships: [
          {
            foreignKeyName: "org_seats_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_seats_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      part_variants: {
        Row: {
          core_charge: number
          created_at: string | null
          cross_refs: Json | null
          firmware_version: string
          has_core_charge: boolean
          id: string
          part_id: string
          price: number
          price_cents: number
          sku: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          core_charge?: number
          created_at?: string | null
          cross_refs?: Json | null
          firmware_version: string
          has_core_charge?: boolean
          id?: string
          part_id: string
          price: number
          price_cents: number
          sku: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          core_charge?: number
          created_at?: string | null
          cross_refs?: Json | null
          firmware_version?: string
          has_core_charge?: boolean
          id?: string
          part_id?: string
          price?: number
          price_cents?: number
          sku?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_variants_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "green_chargers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_variants_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          amperage: number | null
          brand: string
          brand_logo_url: string | null
          category: string
          category_slug: string | null
          core_charge: number | null
          created_at: string | null
          description: string
          featured: boolean | null
          has_core_charge: boolean | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          phase: string | null
          price: number
          price_cents: number | null
          sku: string
          slug: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
          vendor_sku: string | null
          voltage: number | null
        }
        Insert: {
          amperage?: number | null
          brand: string
          brand_logo_url?: string | null
          category: string
          category_slug?: string | null
          core_charge?: number | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          has_core_charge?: boolean | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          phase?: string | null
          price: number
          price_cents?: number | null
          sku: string
          slug: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
          vendor_sku?: string | null
          voltage?: number | null
        }
        Update: {
          amperage?: number | null
          brand?: string
          brand_logo_url?: string | null
          category?: string
          category_slug?: string | null
          core_charge?: number | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          has_core_charge?: boolean | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          phase?: string | null
          price?: number
          price_cents?: number | null
          sku?: string
          slug?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
          vendor_sku?: string | null
          voltage?: number | null
        }
        Relationships: []
      }
      practical_attempts: {
        Row: {
          checklist: Json | null
          checklist_state: Json | null
          course_slug: string
          finished_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          status: string
          trainee_signature_url: string | null
          trainee_user_id: string
          trainer_signature_url: string | null
          trainer_user_id: string
        }
        Insert: {
          checklist?: Json | null
          checklist_state?: Json | null
          course_slug?: string
          finished_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          trainee_signature_url?: string | null
          trainee_user_id: string
          trainer_signature_url?: string | null
          trainer_user_id: string
        }
        Update: {
          checklist?: Json | null
          checklist_state?: Json | null
          course_slug?: string
          finished_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          trainee_signature_url?: string | null
          trainee_user_id?: string
          trainer_signature_url?: string | null
          trainer_user_id?: string
        }
        Relationships: []
      }
      price_update_queue: {
        Row: {
          created_at: string | null
          id: string
          new_price_cents: number | null
          old_price_cents: number | null
          part_id: string | null
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_price_cents?: number | null
          old_price_cents?: number | null
          part_id?: string | null
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_price_cents?: number | null
          old_price_cents?: number | null
          part_id?: string | null
          stripe_price_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_update_queue_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "green_chargers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_update_queue_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          locale: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          locale?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          locale?: string | null
          role?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          correct_count: number
          course_id: string | null
          created_at: string
          id: string
          incorrect_ids: Json
          mode: string
          module_id: string | null
          passed: boolean | null
          question_ids: Json
          score: number
          seed: string
          total_count: number
          user_id: string
        }
        Insert: {
          correct_count?: number
          course_id?: string | null
          created_at?: string
          id?: string
          incorrect_ids?: Json
          mode?: string
          module_id?: string | null
          passed?: boolean | null
          question_ids?: Json
          score?: number
          seed: string
          total_count?: number
          user_id: string
        }
        Update: {
          correct_count?: number
          course_id?: string | null
          created_at?: string
          id?: string
          incorrect_ids?: Json
          mode?: string
          module_id?: string | null
          passed?: boolean | null
          question_ids?: Json
          score?: number
          seed?: string
          total_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_item_revisions: {
        Row: {
          action: string
          after: Json | null
          before: Json | null
          created_at: string | null
          editor_user_id: string | null
          id: number
          question_id: string
          version: number
        }
        Insert: {
          action: string
          after?: Json | null
          before?: Json | null
          created_at?: string | null
          editor_user_id?: string | null
          id?: never
          question_id: string
          version: number
        }
        Update: {
          action?: string
          after?: Json | null
          before?: Json | null
          created_at?: string | null
          editor_user_id?: string | null
          id?: never
          question_id?: string
          version?: number
        }
        Relationships: []
      }
      quiz_items: {
        Row: {
          active: boolean | null
          choices: string[]
          content_hash: string | null
          correct_index: number
          created_at: string | null
          created_by: string | null
          difficulty: number | null
          explain: string | null
          id: string
          is_exam_candidate: boolean | null
          locale: string
          module_slug: string
          question: string
          source: string | null
          status: string
          tags: string[] | null
          updated_by: string | null
          version: number
        }
        Insert: {
          active?: boolean | null
          choices: string[]
          content_hash?: string | null
          correct_index: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: number | null
          explain?: string | null
          id?: string
          is_exam_candidate?: boolean | null
          locale?: string
          module_slug: string
          question: string
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          active?: boolean | null
          choices?: string[]
          content_hash?: string | null
          correct_index?: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: number | null
          explain?: string | null
          id?: string
          is_exam_candidate?: boolean | null
          locale?: string
          module_slug?: string
          question?: string
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      raymond_model_families: {
        Row: {
          code: string
          created_at: string | null
          example_models: string | null
          family: string | null
          notes: string | null
          source_url: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          example_models?: string | null
          family?: string | null
          notes?: string | null
          source_url?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          example_models?: string | null
          family?: string | null
          notes?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      raymond_plate_locations: {
        Row: {
          created_at: string | null
          id: number
          location_notes: string
          source_url: string | null
          truck_family: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          location_notes: string
          source_url?: string | null
          truck_family: string
        }
        Update: {
          created_at?: string | null
          id?: number
          location_notes?: string
          source_url?: string | null
          truck_family?: string
        }
        Relationships: []
      }
      raymond_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          notes: string | null
          serial_end: string
          serial_start: string
          series_or_model: string
          source_url: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          notes?: string | null
          serial_end: string
          serial_start: string
          series_or_model: string
          source_url?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: number
          notes?: string | null
          serial_end?: string
          serial_start?: string
          series_or_model?: string
          source_url?: string | null
          year?: number
        }
        Relationships: []
      }
      raymond_serial_rules: {
        Row: {
          applies_from_year: number | null
          created_at: string | null
          model_digits: number | null
          notes: string | null
          rule_name: string
          source_url: string | null
          year_digits_len: number | null
          year_digits_start: number | null
        }
        Insert: {
          applies_from_year?: number | null
          created_at?: string | null
          model_digits?: number | null
          notes?: string | null
          rule_name: string
          source_url?: string | null
          year_digits_len?: number | null
          year_digits_start?: number | null
        }
        Update: {
          applies_from_year?: number | null
          created_at?: string | null
          model_digits?: number | null
          notes?: string | null
          rule_name?: string
          source_url?: string | null
          year_digits_len?: number | null
          year_digits_start?: number | null
        }
        Relationships: []
      }
      rental_equipment: {
        Row: {
          brand: string
          category: string
          city: string | null
          created_at: string | null
          daily_price: number | null
          description: string | null
          id: string
          image_url: string | null
          lift_height_ft: number | null
          model: string
          power_source: string | null
          seo_slug: string
          weight_capacity_lbs: number | null
        }
        Insert: {
          brand: string
          category: string
          city?: string | null
          created_at?: string | null
          daily_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          lift_height_ft?: number | null
          model: string
          power_source?: string | null
          seo_slug: string
          weight_capacity_lbs?: number | null
        }
        Update: {
          brand?: string
          category?: string
          city?: string | null
          created_at?: string | null
          daily_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          lift_height_ft?: number | null
          model?: string
          power_source?: string | null
          seo_slug?: string
          weight_capacity_lbs?: number | null
        }
        Relationships: []
      }
      repair_orders: {
        Row: {
          carrier: string
          created_at: string | null
          customer_email: string
          customer_name: string
          firmware_version: string | null
          id: string
          inbound_tracking_status: string | null
          label_url: string
          module_type: string
          outbound_label_url: string | null
          outbound_tracking_number: string | null
          repair_notes: string | null
          service_name: string | null
          shipping_cost: number | null
          status: string
          stripe_session_id: string
          tracking_number: string
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          carrier: string
          created_at?: string | null
          customer_email: string
          customer_name: string
          firmware_version?: string | null
          id?: string
          inbound_tracking_status?: string | null
          label_url: string
          module_type: string
          outbound_label_url?: string | null
          outbound_tracking_number?: string | null
          repair_notes?: string | null
          service_name?: string | null
          shipping_cost?: number | null
          status?: string
          stripe_session_id: string
          tracking_number: string
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          carrier?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          firmware_version?: string | null
          id?: string
          inbound_tracking_status?: string | null
          label_url?: string
          module_type?: string
          outbound_label_url?: string | null
          outbound_tracking_number?: string | null
          repair_notes?: string | null
          service_name?: string | null
          shipping_cost?: number | null
          status?: string
          stripe_session_id?: string
          tracking_number?: string
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seat_claims: {
        Row: {
          created_at: string
          id: string
          order_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_order_seat_usage"
            referencedColumns: ["order_id"]
          },
        ]
      }
      seat_invites: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          course_id: string
          created_at: string
          created_by: string
          email: string
          expires_at: string | null
          id: string
          invite_token: string | null
          note: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          course_id: string
          created_at?: string
          created_by: string
          email: string
          expires_at?: string | null
          id?: string
          invite_token?: string | null
          note?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          course_id?: string
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string | null
          id?: string
          invite_token?: string | null
          note?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_invites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      sinoboom_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      sinoboom_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      sinoboom_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      skyjack_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      skyjack_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      skyjack_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      study_cards: {
        Row: {
          active: boolean
          body: string | null
          created_at: string | null
          id: string
          kind: string
          locale: string
          media_url: string | null
          module_slug: string | null
          order_index: number
          tag: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string | null
          id?: string
          kind?: string
          locale?: string
          media_url?: string | null
          module_slug?: string | null
          order_index?: number
          tag: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string | null
          id?: string
          kind?: string
          locale?: string
          media_url?: string | null
          module_slug?: string | null
          order_index?: number
          tag?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      supervisor_leads: {
        Row: {
          company: string | null
          created_at: string | null
          email_opened: boolean | null
          enrollment_id: string | null
          evaluation_completed: boolean | null
          id: string
          invited_at: string | null
          link_clicked: boolean | null
          source: string | null
          supervisor_email: string
          supervisor_name: string | null
          trainee_user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email_opened?: boolean | null
          enrollment_id?: string | null
          evaluation_completed?: boolean | null
          id?: string
          invited_at?: string | null
          link_clicked?: boolean | null
          source?: string | null
          supervisor_email: string
          supervisor_name?: string | null
          trainee_user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email_opened?: boolean | null
          enrollment_id?: string | null
          evaluation_completed?: boolean | null
          id?: string
          invited_at?: string | null
          link_clicked?: boolean | null
          source?: string | null
          supervisor_email?: string
          supervisor_name?: string | null
          trainee_user_id?: string | null
        }
        Relationships: []
      }
      svc_code_retrieval: {
        Row: {
          brand: string
          created_at: string | null
          id: number
          model_pattern: string | null
          steps: string
          updated_at: string | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          id?: number
          model_pattern?: string | null
          steps: string
          updated_at?: string | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          id?: number
          model_pattern?: string | null
          steps?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      svc_fault_codes: {
        Row: {
          brand: string
          checks: string[] | null
          code: string
          created_at: string | null
          fixes: string[] | null
          id: number
          likely_causes: string[] | null
          meaning: string | null
          model_pattern: string | null
          provenance: string | null
          severity: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          brand: string
          checks?: string[] | null
          code: string
          created_at?: string | null
          fixes?: string[] | null
          id?: number
          likely_causes?: string[] | null
          meaning?: string | null
          model_pattern?: string | null
          provenance?: string | null
          severity?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string
          checks?: string[] | null
          code?: string
          created_at?: string | null
          fixes?: string[] | null
          id?: number
          likely_causes?: string[] | null
          meaning?: string | null
          model_pattern?: string | null
          provenance?: string | null
          severity?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      svc_mod_audit: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          id: number
          notes: string | null
          suggestion_id: number | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          id?: number
          notes?: string | null
          suggestion_id?: number | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          id?: number
          notes?: string | null
          suggestion_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "svc_mod_audit_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "svc_user_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      svc_public_notes: {
        Row: {
          approved_by: string | null
          brand: string
          category: string
          code: string | null
          content: string
          created_at: string
          id: number
          model: string | null
          source: string | null
        }
        Insert: {
          approved_by?: string | null
          brand: string
          category: string
          code?: string | null
          content: string
          created_at?: string
          id?: number
          model?: string | null
          source?: string | null
        }
        Update: {
          approved_by?: string | null
          brand?: string
          category?: string
          code?: string | null
          content?: string
          created_at?: string
          id?: number
          model?: string | null
          source?: string | null
        }
        Relationships: []
      }
      svc_user_suggestions: {
        Row: {
          brand: string
          code: string | null
          contact_email: string | null
          created_at: string
          details: string | null
          id: number
          ip: unknown
          model: string | null
          moderated_at: string | null
          moderator: string | null
          photos: string[] | null
          serial: string | null
          status: string
          suggestion_type: string
          title: string | null
        }
        Insert: {
          brand: string
          code?: string | null
          contact_email?: string | null
          created_at?: string
          details?: string | null
          id?: number
          ip?: unknown
          model?: string | null
          moderated_at?: string | null
          moderator?: string | null
          photos?: string[] | null
          serial?: string | null
          status?: string
          suggestion_type: string
          title?: string | null
        }
        Update: {
          brand?: string
          code?: string | null
          contact_email?: string | null
          created_at?: string
          details?: string | null
          id?: number
          ip?: unknown
          model?: string | null
          moderated_at?: string | null
          moderator?: string | null
          photos?: string[] | null
          serial?: string | null
          status?: string
          suggestion_type?: string
          title?: string | null
        }
        Relationships: []
      }
      takeuchi_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      takeuchi_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      takeuchi_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      tennant_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      tennant_model_serial_notes: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          note: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          note: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          note?: string
        }
        Relationships: []
      }
      tennant_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      tennant_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      tennant_user_submissions: {
        Row: {
          family: string | null
          id: number
          model_input: string | null
          serial_input: string | null
          submitted_at: string | null
          user_notes: string | null
        }
        Insert: {
          family?: string | null
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Update: {
          family?: string | null
          id?: number
          model_input?: string | null
          serial_input?: string | null
          submitted_at?: string | null
          user_notes?: string | null
        }
        Relationships: []
      }
      toro_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      toro_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_number: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_number: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_number?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      toro_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      toyota_serial_lookup: {
        Row: {
          beginning_serial: string
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          source: string | null
          source_page: string | null
          year: number
        }
        Insert: {
          beginning_serial: string
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          source?: string | null
          source_page?: string | null
          year: number
        }
        Update: {
          beginning_serial?: string
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          source?: string | null
          source_page?: string | null
          year?: number
        }
        Relationships: []
      }
      training_shares: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          shared_at: string | null
          supervisor_email: string
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          shared_at?: string | null
          supervisor_email: string
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          shared_at?: string | null
          supervisor_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_shares_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      uc_capacity_map: {
        Row: {
          approx_capacity: string
          code: string
        }
        Insert: {
          approx_capacity: string
          code: string
        }
        Update: {
          approx_capacity?: string
          code?: string
        }
        Relationships: []
      }
      uc_model_prefixes: {
        Row: {
          created_at: string | null
          example_models: string | null
          family: string
          notes: string | null
          prefix: string
        }
        Insert: {
          created_at?: string | null
          example_models?: string | null
          family: string
          notes?: string | null
          prefix: string
        }
        Update: {
          created_at?: string | null
          example_models?: string | null
          family?: string
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      uc_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      uc_series_examples: {
        Row: {
          example_note: string
          series_code: string
        }
        Insert: {
          example_note: string
          series_code: string
        }
        Update: {
          example_note?: string
          series_code?: string
        }
        Relationships: []
      }
      uc_vin_year_map: {
        Row: {
          code: string
          year: number
        }
        Insert: {
          code: string
          year: number
        }
        Update: {
          code?: string
          year?: number
        }
        Relationships: []
      }
      unclaimed_purchases: {
        Row: {
          amount_cents: number
          claimed_at: string | null
          claimed_by_user_id: string | null
          course_id: string
          created_at: string | null
          customer_email: string
          id: string
          purchase_date: string
          quantity: number | null
          status: string | null
          stripe_session_id: string
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          course_id: string
          created_at?: string | null
          customer_email: string
          id?: string
          purchase_date: string
          quantity?: number | null
          status?: string | null
          stripe_session_id: string
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          course_id?: string
          created_at?: string | null
          customer_email?: string
          id?: string
          purchase_date?: string
          quantity?: number | null
          status?: string | null
          stripe_session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unclaimed_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      xcmg_model_cues: {
        Row: {
          created_at: string | null
          cue: string
          example_models: string | null
          family: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          cue: string
          example_models?: string | null
          family: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          cue?: string
          example_models?: string | null
          family?: string
          notes?: string | null
        }
        Relationships: []
      }
      xcmg_model_serial_ranges: {
        Row: {
          created_at: string | null
          id: number
          model_code: string
          notes: string | null
          serial_range: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          model_code: string
          notes?: string | null
          serial_range: string
        }
        Update: {
          created_at?: string | null
          id?: number
          model_code?: string
          notes?: string | null
          serial_range?: string
        }
        Relationships: []
      }
      xcmg_plate_locations: {
        Row: {
          created_at: string | null
          equipment_type: string
          id: number
          location_notes: string
          series: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type: string
          id?: number
          location_notes: string
          series?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type?: string
          id?: number
          location_notes?: string
          series?: string | null
        }
        Relationships: []
      }
      yale_model_prefixes: {
        Row: {
          family: string | null
          marketed_model: string | null
          notes: string | null
          prefix: string
        }
        Insert: {
          family?: string | null
          marketed_model?: string | null
          notes?: string | null
          prefix: string
        }
        Update: {
          family?: string | null
          marketed_model?: string | null
          notes?: string | null
          prefix?: string
        }
        Relationships: []
      }
      yale_plants: {
        Row: {
          city: string | null
          code: string
          country: string | null
          name: string | null
          notes: string | null
          state_province: string | null
        }
        Insert: {
          city?: string | null
          code: string
          country?: string | null
          name?: string | null
          notes?: string | null
          state_province?: string | null
        }
        Update: {
          city?: string | null
          code?: string
          country?: string | null
          name?: string | null
          notes?: string | null
          state_province?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      green_chargers: {
        Row: {
          amperage: number | null
          brand: string | null
          description: string | null
          id: string | null
          image_url: string | null
          name: string | null
          phase: string | null
          price: number | null
          price_cents: number | null
          sku: string | null
          slug: string | null
          stripe_price_id: string | null
          voltage: number | null
        }
        Insert: {
          amperage?: number | null
          brand?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          phase?: string | null
          price?: number | null
          price_cents?: number | null
          sku?: string | null
          slug?: string | null
          stripe_price_id?: string | null
          voltage?: number | null
        }
        Update: {
          amperage?: number | null
          brand?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          phase?: string | null
          price?: number | null
          price_cents?: number | null
          sku?: string | null
          slug?: string | null
          stripe_price_id?: string | null
          voltage?: number | null
        }
        Relationships: []
      }
      parts_leads: {
        Row: {
          brand: string | null
          created_at: string | null
          email: string | null
          fault_code: string | null
          id: number | null
          model: string | null
          name: string | null
          notes: string | null
          page_source: string | null
          phone: string | null
          serial: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          zip: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          email?: string | null
          fault_code?: string | null
          id?: number | null
          model?: string | null
          name?: string | null
          notes?: string | null
          page_source?: string | null
          phone?: string | null
          serial?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          zip?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          email?: string | null
          fault_code?: string | null
          id?: number | null
          model?: string | null
          name?: string | null
          notes?: string | null
          page_source?: string | null
          phone?: string | null
          serial?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      v_order_seat_usage: {
        Row: {
          claimed: number | null
          course_id: string | null
          order_id: string | null
          remaining: number | null
          total_seats: number | null
          trainer_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: boolean }
      check_demo_completion: {
        Args: { p_course: string; p_user_id: string }
        Returns: boolean
      }
      fix_part_prices: { Args: never; Returns: undefined }
      gen_verify_code: { Args: never; Returns: string }
      introspect_public_tables: {
        Args: never
        Returns: {
          policy_count: number
          rowsecurity: boolean
          table_name: string
        }[]
      }
      is_org_role: {
        Args: { p_org: string; roles: string[] }
        Returns: boolean
      }
      is_staff: { Args: { uid: string }; Returns: boolean }
      set_resume: {
        Args: { p_enrollment: string; p_state: Json }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
