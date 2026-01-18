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
            admin_settings: {
                Row: {
                    created_at: string | null
                    id: string
                    setting_key: string
                    setting_value: Json
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    setting_key: string
                    setting_value: Json
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    setting_key?: string
                    setting_value?: Json
                    updated_at?: string | null
                }
                Relationships: []
            }
            admin_users: {
                Row: {
                    created_at: string | null
                    email: string
                    id: string
                    role: string
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    id?: string
                    role?: string
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    id?: string
                    role?: string
                    user_id?: string | null
                }
                Relationships: []
            }
            api_usage_logs: {
                Row: {
                    api_calls: number | null
                    api_name: string
                    cost: number | null
                    created_at: string | null
                    endpoint: string | null
                    id: string
                    model: string | null
                    request_data: Json | null
                    tokens_input: number | null
                    tokens_output: number | null
                    tokens_total: number | null
                    user_id: string | null
                }
                Insert: {
                    api_calls?: number | null
                    api_name: string
                    cost?: number | null
                    created_at?: string | null
                    endpoint?: string | null
                    id?: string
                    model?: string | null
                    request_data?: Json | null
                    tokens_input?: number | null
                    tokens_output?: number | null
                    tokens_total?: number | null
                    user_id?: string | null
                }
                Update: {
                    api_calls?: number | null
                    api_name?: string
                    cost?: number | null
                    created_at?: string | null
                    endpoint?: string | null
                    id?: string
                    model?: string | null
                    request_data?: Json | null
                    tokens_input?: number | null
                    tokens_output?: number | null
                    tokens_total?: number | null
                    user_id?: string | null
                }
                Relationships: []
            }
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
            course_tees: {
                Row: {
                    color: string
                    course_id: string | null
                    course_rating: number
                    created_at: string | null
                    id: string
                    name: string
                    slope_rating: number
                    updated_at: string | null
                }
                Insert: {
                    color: string
                    course_id?: string | null
                    course_rating: number
                    created_at?: string | null
                    id?: string
                    name: string
                    slope_rating: number
                    updated_at?: string | null
                }
                Update: {
                    color?: string
                    course_id?: string | null
                    course_rating?: number
                    created_at?: string | null
                    id?: string
                    name?: string
                    slope_rating?: number
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "course_tees_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            courses: {
                Row: {
                    created_at: string | null
                    holes: number
                    id: string
                    name: string
                    par: number
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    holes: number
                    id?: string
                    name: string
                    par: number
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    holes?: number
                    id?: string
                    name?: string
                    par?: number
                    updated_at?: string | null
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
            daily_prizes: {
                Row: {
                    created_at: string | null
                    date: string | null
                    game_id: string | null
                    id: string
                    paid: boolean | null
                    prize_amount: number | null
                    rank: number | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    date?: string | null
                    game_id?: string | null
                    id?: string
                    paid?: boolean | null
                    prize_amount?: number | null
                    rank?: number | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    date?: string | null
                    game_id?: string | null
                    id?: string
                    paid?: boolean | null
                    prize_amount?: number | null
                    rank?: number | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "daily_prizes_game_id_fkey"
                        columns: ["game_id"]
                        isOneToOne: false
                        referencedRelation: "games"
                        referencedColumns: ["id"]
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
            game_scores: {
                Row: {
                    created_at: string | null
                    game_data: Json | null
                    id: string
                    score: number
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    game_data?: Json | null
                    id?: string
                    score: number
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    game_data?: Json | null
                    id?: string
                    score?: number
                    user_id?: string
                }
                Relationships: []
            }
            gamepool_entries: {
                Row: {
                    created_at: string | null
                    gamepool_id: string | null
                    id: string
                    quantity: number | null
                    stripe_checkout_id: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    gamepool_id?: string | null
                    id?: string
                    quantity?: number | null
                    stripe_checkout_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    gamepool_id?: string | null
                    id?: string
                    quantity?: number | null
                    stripe_checkout_id?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "gamepool_entries_gamepool_id_fkey"
                        columns: ["gamepool_id"]
                        isOneToOne: false
                        referencedRelation: "gamepools"
                        referencedColumns: ["id"]
                    },
                ]
            }
            gamepools: {
                Row: {
                    created_at: string | null
                    created_by: string | null
                    current_players: number | null
                    end_date: string | null
                    entry_fee_points: number
                    id: string
                    max_players: number | null
                    min_players: number | null
                    name: string
                    prize_pool_percentage: number | null
                    start_date: string | null
                    status: string
                    total_prize_pool: number | null
                }
                Insert: {
                    created_at?: string | null
                    created_by?: string | null
                    current_players?: number | null
                    end_date?: string | null
                    entry_fee_points: number
                    id?: string
                    max_players?: number | null
                    min_players?: number | null
                    name: string
                    prize_pool_percentage?: number | null
                    start_date?: string | null
                    status: string
                    total_prize_pool?: number | null
                }
                Update: {
                    created_at?: string | null
                    created_by?: string | null
                    current_players?: number | null
                    end_date?: string | null
                    entry_fee_points?: number
                    id?: string
                    max_players?: number | null
                    min_players?: number | null
                    name?: string
                    prize_pool_percentage?: number | null
                    start_date?: string | null
                    status?: string
                    total_prize_pool?: number | null
                }
                Relationships: []
            }
            games: {
                Row: {
                    adjusted_average_score: number | null
                    course_id: string | null
                    course_name: string
                    created_at: string | null
                    four_points_earned: number
                    game_type: number | null
                    ghin_handicap: number | null
                    hole_categories: Json | null
                    hole_scores: Json
                    id: string
                    leaderboard_type: string | null
                    paid_entry: boolean | null
                    player_name: string
                    target_score: number
                    tee_id: string | null
                    tee_name: string
                    total_points: number
                    user_id: string | null
                    user_type: string | null
                    validated: boolean | null
                }
                Insert: {
                    adjusted_average_score?: number | null
                    course_id?: string | null
                    course_name: string
                    created_at?: string | null
                    four_points_earned: number
                    game_type?: number | null
                    ghin_handicap?: number | null
                    hole_categories?: Json | null
                    hole_scores: Json
                    id?: string
                    leaderboard_type?: string | null
                    paid_entry?: boolean | null
                    player_name: string
                    target_score: number
                    tee_id?: string | null
                    tee_name: string
                    total_points: number
                    user_id?: string | null
                    user_type?: string | null
                    validated?: boolean | null
                }
                Update: {
                    adjusted_average_score?: number | null
                    course_id?: string | null
                    course_name?: string
                    created_at?: string | null
                    four_points_earned?: number
                    game_type?: number | null
                    ghin_handicap?: number | null
                    hole_categories?: Json | null
                    hole_scores?: Json
                    id?: string
                    leaderboard_type?: string | null
                    paid_entry?: boolean | null
                    player_name?: string
                    target_score?: number
                    tee_id?: string | null
                    tee_name?: string
                    total_points?: number
                    user_id?: string | null
                    user_type?: string | null
                    validated?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "games_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "games_tee_id_fkey"
                        columns: ["tee_id"]
                        isOneToOne: false
                        referencedRelation: "course_tees"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "games_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            guest_users: {
                Row: {
                    created_at: string | null
                    games_played: number | null
                    golfer_name: string
                    id: string
                    last_used: string | null
                }
                Insert: {
                    created_at?: string | null
                    games_played?: number | null
                    golfer_name: string
                    id?: string
                    last_used?: string | null
                }
                Update: {
                    created_at?: string | null
                    games_played?: number | null
                    golfer_name?: string
                    id?: string
                    last_used?: string | null
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
            payment_transactions: {
                Row: {
                    amount: number
                    created_at: string | null
                    id: string
                    points_awarded: number | null
                    status: string
                    stripe_customer_id: string | null
                    stripe_payment_intent_id: string | null
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    amount: number
                    created_at?: string | null
                    id?: string
                    points_awarded?: number | null
                    status: string
                    stripe_customer_id?: string | null
                    stripe_payment_intent_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    amount?: number
                    created_at?: string | null
                    id?: string
                    points_awarded?: number | null
                    status?: string
                    stripe_customer_id?: string | null
                    stripe_payment_intent_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: []
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
            points_ledger: {
                Row: {
                    amount: number
                    created_at: string | null
                    description: string | null
                    id: string
                    reference_id: string | null
                    type: string
                    user_id: string | null
                }
                Insert: {
                    amount: number
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    reference_id?: string | null
                    type: string
                    user_id?: string | null
                }
                Update: {
                    amount?: number
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    reference_id?: string | null
                    type?: string
                    user_id?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    display_name: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                    member_cat: string | null
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    display_name?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    member_cat?: string | null
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    display_name?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    member_cat?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            saved_items: {
                Row: {
                    content: Json
                    created_at: string | null
                    id: string
                    metadata: Json | null
                    title: string
                    type: string
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    content: Json
                    created_at?: string | null
                    id?: string
                    metadata?: Json | null
                    title: string
                    type: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    content?: Json
                    created_at?: string | null
                    id?: string
                    metadata?: Json | null
                    title?: string
                    type?: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            search_cache: {
                Row: {
                    created_at: string | null
                    expires_at: string
                    hit_count: number | null
                    id: string
                    query: string
                    results: Json
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    expires_at: string
                    hit_count?: number | null
                    id?: string
                    query: string
                    results: Json
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    expires_at?: string
                    hit_count?: number | null
                    id?: string
                    query?: string
                    results?: Json
                    user_id?: string | null
                }
                Relationships: []
            }
            stripe_prices: {
                Row: {
                    active: boolean | null
                    created_at: string | null
                    id: string
                    member_cat: string
                    price_id: string
                    product_name: string
                }
                Insert: {
                    active?: boolean | null
                    created_at?: string | null
                    id?: string
                    member_cat: string
                    price_id: string
                    product_name: string
                }
                Update: {
                    active?: boolean | null
                    created_at?: string | null
                    id?: string
                    member_cat?: string
                    price_id?: string
                    product_name?: string
                }
                Relationships: []
            }
            survey_responses: {
                Row: {
                    completed: boolean | null
                    completed_at: string | null
                    created_at: string | null
                    drop_off_step: number | null
                    id: string
                    ip_address: unknown
                    question_1_answer: string | null
                    question_2_answer: string | null
                    question_3_answer: string | null
                    session_id: string
                    started_at: string | null
                    updated_at: string | null
                    user_agent: string | null
                    user_id: string | null
                }
                Insert: {
                    completed?: boolean | null
                    completed_at?: string | null
                    created_at?: string | null
                    drop_off_step?: number | null
                    id?: string
                    ip_address?: unknown
                    question_1_answer?: string | null
                    question_2_answer?: string | null
                    question_3_answer?: string | null
                    session_id: string
                    started_at?: string | null
                    updated_at?: string | null
                    user_agent?: string | null
                    user_id?: string | null
                }
                Update: {
                    completed?: boolean | null
                    completed_at?: string | null
                    created_at?: string | null
                    drop_off_step?: number | null
                    id?: string
                    ip_address?: unknown
                    question_1_answer?: string | null
                    question_2_answer?: string | null
                    question_3_answer?: string | null
                    session_id?: string
                    started_at?: string | null
                    updated_at?: string | null
                    user_agent?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            system_settings: {
                Row: {
                    created_at: string | null
                    enable_ai: boolean | null
                    id: string
                    max_conversation_length: number | null
                    openai_api_key: string | null
                    openai_model: string | null
                    system_prompt: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    enable_ai?: boolean | null
                    id?: string
                    max_conversation_length?: number | null
                    openai_api_key?: string | null
                    openai_model?: string | null
                    system_prompt?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    enable_ai?: boolean | null
                    id?: string
                    max_conversation_length?: number | null
                    openai_api_key?: string | null
                    openai_model?: string | null
                    system_prompt?: string | null
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
            tts_usage_logs: {
                Row: {
                    characters: number
                    cost: number
                    created_at: string | null
                    id: string
                    user_id: string | null
                    voice: string
                }
                Insert: {
                    characters: number
                    cost: number
                    created_at?: string | null
                    id?: string
                    user_id?: string | null
                    voice: string
                }
                Update: {
                    characters?: number
                    cost?: number
                    created_at?: string | null
                    id?: string
                    user_id?: string | null
                    voice?: string
                }
                Relationships: []
            }
            user_points: {
                Row: {
                    id: string
                    total_points: number | null
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    id?: string
                    total_points?: number | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    id?: string
                    total_points?: number | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: []
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
            waitlist: {
                Row: {
                    avail_1: string
                    avail_2: string | null
                    avail_3: string | null
                    created_at: string | null
                    id: string
                }
                Insert: {
                    avail_1: string
                    avail_2?: string | null
                    avail_3?: string | null
                    created_at?: string | null
                    id: string
                }
                Update: {
                    avail_1?: string
                    avail_2?: string | null
                    avail_3?: string | null
                    created_at?: string | null
                    id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "waitlist_profile_fk"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
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
            cleanup_expired_search_cache: { Args: never; Returns: undefined }
            cleanup_expired_sessions: { Args: never; Returns: undefined }
            cleanup_old_conversations: { Args: never; Returns: undefined }
            decrement_mint_count: {
                Args: { template_cube_id: string }
                Returns: boolean
            }
            generate_api_key: { Args: never; Returns: string }
            generate_api_secret: { Args: never; Returns: string }
            increment_current_players: {
                Args: { pool_id: string; qty: number }
                Returns: undefined
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
