export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "employer" | "seeker" | "personal";
export type JobStatus = "pending" | "approved" | "rejected" | "draft" | "closed";
export type EmploymentType = "permanent" | "temporary" | "task_force";
export type ArticleStatus = "pending" | "approved";
export type ArticleCategory = "safety_hse" | "engineering" | "career_tips";
export type ListingStatus = "pending" | "approved" | "rejected";
export type ListingCategory =
  | "for_sale"
  | "for_rent"
  | "services"
  | "accommodation"
  | "property"
  | "vehicles"
  | "electronics"
  | "furniture_home"
  | "wanted"
  | "free_items"
  | "lost_found"
  | "events"
  | "business_commercial"
  | "offers_deals"
  | "announcements"
  | "donations"
  | "community"
  | "education_training"
  | "wholesale"
  | "other";
export type OrderStatus = "pending" | "completed" | "cancelled";
export type AdType = "adsense" | "custom";

export interface SiteSettings {
  id: number;
  auto_approve_jobs: boolean;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          username: string | null;
          email: string;
          phone: string | null;
          gender: string | null;
          location: string | null;
          country: string | null;
          city: string | null;
          profession: string | null;
          job_interests: string[] | null;
          avatar_url: string | null;
          avatar_public_id: string | null;
          cv_url: string | null;
          company_cr: string | null;
          company_website: string | null;
          company_address: string | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          username?: string | null;
          email: string;
          phone?: string | null;
          gender?: string | null;
          location?: string | null;
          country?: string | null;
          city?: string | null;
          profession?: string | null;
          job_interests?: string[] | null;
          avatar_url?: string | null;
          avatar_public_id?: string | null;
          cv_url?: string | null;
          company_cr?: string | null;
          company_website?: string | null;
          company_address?: string | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          username?: string | null;
          email?: string;
          phone?: string | null;
          gender?: string | null;
          location?: string | null;
          country?: string | null;
          city?: string | null;
          profession?: string | null;
          job_interests?: string[] | null;
          avatar_url?: string | null;
          avatar_public_id?: string | null;
          cv_url?: string | null;
          company_cr?: string | null;
          company_website?: string | null;
          company_address?: string | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      jobs: {
  Row: {
    id: string;
    employer_id: string;
    job_title: string;
    job_description: string;
    positions: number | null;
    location: string;
    country: string | null;
    city: string | null;
    employment_type: EmploymentType;
    duration: string;
    salary_rate: string | null;
    salary_type: string | null;
    currency: string | null;
    category: string;
    subcategory: string | null;
    company_name: string;
    company_phone: string | null;
    company_email: string | null;
    company_address: string | null;
    office_lat: number | null;
    office_lng: number | null;
    office_address: string | null;
    status: JobStatus;
    created_at: string;
    show_profile_contact: boolean; // ← added
  };
  Insert: {
    id?: string;
    employer_id: string;
    job_title: string;
    job_description: string;
    positions?: number | null;
    location: string;
    country?: string | null;
    city?: string | null;
    employment_type?: EmploymentType;
    duration: string;
    salary_rate?: string | null;
    salary_type?: string | null;
    currency?: string | null;
    category: string;
    subcategory?: string | null;
    company_name: string;
    company_phone?: string | null;
    company_email?: string | null;
    company_address?: string | null;
    office_lat?: number | null;
    office_lng?: number | null;
    office_address?: string | null;
    status?: JobStatus;
    created_at?: string;
    show_profile_contact?: boolean; // ← added
  };
  Update: {
    id?: string;
    employer_id?: string;
    job_title?: string;
    job_description?: string;
    positions?: number | null;
    location?: string;
    country?: string | null;
    city?: string | null;
    employment_type?: EmploymentType;
    duration?: string;
    salary_rate?: string | null;
    salary_type?: string | null;
    currency?: string | null;
    category?: string;
    subcategory?: string | null;
    company_name?: string;
    company_phone?: string | null;
    company_email?: string | null;
    company_address?: string | null;
    office_lat?: number | null;
    office_lng?: number | null;
    office_address?: string | null;
    status?: JobStatus;
    created_at?: string;
    show_profile_contact?: boolean; // ← added
  };
  Relationships: [];
};
      articles: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          category: ArticleCategory;
          subcategory: string | null;
          status: ArticleStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          category: ArticleCategory;
          subcategory?: string | null;
          status?: ArticleStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          category?: ArticleCategory;
          subcategory?: string | null;
          status?: ArticleStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      marketplace_listings: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          description: string;
          price: string;
          currency: string;
          category: ListingCategory;
          subcategory: string | null;
          location: string | null;
          country: string | null;
          city: string | null;
          contact_phone: string | null;
          image_url: string | null;
          image_public_id: string | null;
          image_urls: string[] | null;
          listing_type: string;
          external_link: string | null;
          status: ListingStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          description: string;
          price: string;
          currency?: string;
          category: ListingCategory;
          subcategory?: string | null;
          location?: string | null;
          country?: string | null;
          city?: string | null;
          contact_phone?: string | null;
          image_url?: string | null;
          image_public_id?: string | null;
          image_urls?: string[] | null;
          listing_type?: string;
          external_link?: string | null;
          status?: ListingStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          title?: string;
          description?: string;
          price?: string;
          currency?: string;
          category?: ListingCategory;
          subcategory?: string | null;
          location?: string | null;
          country?: string | null;
          city?: string | null;
          contact_phone?: string | null;
          image_url?: string | null;
          image_public_id?: string | null;
          image_urls?: string[] | null;
          listing_type?: string;
          external_link?: string | null;
          status?: ListingStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      ad_placements: {
        Row: {
          id: string;
          slot_name: string;
          is_active: boolean;
          ad_type: AdType;
          custom_image_url: string | null;
          custom_redirect_url: string | null;
          adsense_slot_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slot_name: string;
          is_active?: boolean;
          ad_type?: AdType;
          custom_image_url?: string | null;
          custom_redirect_url?: string | null;
          adsense_slot_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slot_name?: string;
          is_active?: boolean;
          ad_type?: AdType;
          custom_image_url?: string | null;
          custom_redirect_url?: string | null;
          adsense_slot_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          auto_approve_market_listings: boolean;
          auto_approve_articles: boolean;
          auto_approve_jobs: boolean;
        };
        Insert: {
          id?: number;
          auto_approve_market_listings?: boolean;
          auto_approve_articles?: boolean;
          auto_approve_jobs?: boolean;
        };
        Update: {
          id?: number;
          auto_approve_market_listings?: boolean;
          auto_approve_articles?: boolean;
          auto_approve_jobs?: boolean;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          price: string;
          currency: string;
          payment_method: string;
          status: OrderStatus;
          delivery_name: string;
          delivery_address: string;
          delivery_phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          price: string;
          currency?: string;
          payment_method?: string;
          status?: OrderStatus;
          delivery_name: string;
          delivery_address: string;
          delivery_phone: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          buyer_id?: string;
          seller_id?: string;
          price?: string;
          currency?: string;
          payment_method?: string;
          status?: OrderStatus;
          delivery_name?: string;
          delivery_address?: string;
          delivery_phone?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      job_status: JobStatus;
      article_status: ArticleStatus;
      article_category: ArticleCategory;
      listing_status: ListingStatus;
      listing_category: ListingCategory;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type Article = Database["public"]["Tables"]["articles"]["Row"];
export type Listing = Database["public"]["Tables"]["marketplace_listings"]["Row"];
export type ListingWithSeller = Listing & {
  profiles: { full_name: string; username: string | null } | null;
};
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderWithListing = Order & {
  marketplace_listings: { title: string; image_url: string | null } | null;
  profiles: { full_name: string; email: string } | null;
};
export type AdPlacement = Database["public"]["Tables"]["ad_placements"]["Row"];