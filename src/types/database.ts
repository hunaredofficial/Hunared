export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "employer" | "seeker" | "personal";
export type JobStatus = "pending" | "approved" | "rejected" | "draft" | "closed";
export type EmploymentType = "permanent" | "temporary";
export type ArticleStatus = "pending" | "approved";
export type ArticleCategory = "safety_hse" | "engineering" | "career_tips" | "rights_responsibilities";
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
export type NotificationType =
  | "job_match"
  | "listing_match"
  | "order"
  | "system"
  | "application";
export type AdType = "adsense" | "custom";
export type CompanyStatus = "active" | "temporarily_closed" | "closed" | "pending";
export type CompanyVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

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
          available_for_hire: boolean;
          listed_publicly: boolean;
          phone_verified_at: string | null;
          skill_level: string | null;
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
          available_for_hire?: boolean;
          listed_publicly?: boolean;
          phone_verified_at?: string | null;
          skill_level?: string | null;
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
          available_for_hire?: boolean;
          listed_publicly?: boolean;
          phone_verified_at?: string | null;
          skill_level?: string | null;
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
          categories: string[] | null;
          subcategory: string | null;
          company_name: string;
          company_phone: string | null;
          company_email: string | null;
          company_address: string | null;
          office_lat: number | null;
          office_lng: number | null;
          office_address: string | null;
          status: JobStatus;
          expires_at: string | null;
          closed_at: string | null;
          close_reason: string | null;
          created_at: string;
          show_profile_contact: boolean;
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
          categories?: string[] | null;
          subcategory?: string | null;
          company_name: string;
          company_phone?: string | null;
          company_email?: string | null;
          company_address?: string | null;
          office_lat?: number | null;
          office_lng?: number | null;
          office_address?: string | null;
          status?: JobStatus;
          expires_at?: string | null;
          closed_at?: string | null;
          close_reason?: string | null;
          created_at?: string;
          show_profile_contact?: boolean;
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
          categories?: string[] | null;
          subcategory?: string | null;
          company_name?: string;
          company_phone?: string | null;
          company_email?: string | null;
          company_address?: string | null;
          office_lat?: number | null;
          office_lng?: number | null;
          office_address?: string | null;
          status?: JobStatus;
          expires_at?: string | null;
          closed_at?: string | null;
          close_reason?: string | null;
          created_at?: string;
          show_profile_contact?: boolean;
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
          expires_at: string | null;
          closed_at: string | null;
          close_reason: string | null;
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
          expires_at?: string | null;
          closed_at?: string | null;
          close_reason?: string | null;
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
          expires_at?: string | null;
          closed_at?: string | null;
          close_reason?: string | null;
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
      saved_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      saved_items: {
        Row: {
          id: string;
          user_id: string;
          item_type: "job" | "listing";
          item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: "job" | "listing";
          item_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_type?: "job" | "listing";
          item_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      job_category_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      marketplace_category_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          entity_type: "job" | "listing" | "order" | "article" | null;
          entity_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          entity_type?: "job" | "listing" | "order" | "article" | null;
          entity_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          body?: string | null;
          entity_type?: "job" | "listing" | "order" | "article" | null;
          entity_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      job_shares: {
        Row: {
          id: string;
          job_id: string;
          user_id: string | null;
          channel: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          user_id?: string | null;
          channel?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          user_id?: string | null;
          channel?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      listing_shares: {
        Row: {
          id: string;
          listing_id: string;
          user_id: string | null;
          channel: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          user_id?: string | null;
          channel?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          user_id?: string | null;
          channel?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          name: string;
          legal_name: string | null;
          display_name: string | null;
          logo_url: string | null;
          logo_public_id: string | null;
          cover_url: string | null;
          cover_public_id: string | null;
          short_description: string | null;
          about: string | null;
          mission: string | null;
          vision: string | null;
          values_text: string | null;
          company_type: string | null;
          industry: string[] | null;
          sub_industry: string | null;
          services: string[] | null;
          products: string[] | null;
          business_size: string | null;
          employee_count: number | null;
          employee_range: string | null;
          founded_year: number | null;
          status: CompanyStatus;
          verification_status: CompanyVerificationStatus;
          is_featured: boolean;
          is_premium: boolean;
          is_hiring: boolean;
          headquarters_country: string | null;
          headquarters_country_code: string | null;
          headquarters_city: string | null;
          headquarters_address: string | null;
          postal_code: string | null;
          locations: Json | null;
          countries_served: string[] | null;
          languages: string[] | null;
          website: string | null;
          email: string | null;
          phone: string | null;
          whatsapp: string | null;
          social_links: Json | null;
          certifications: string[] | null;
          rating_avg: number | null;
          reviews_count: number;
          followers_count: number;
          jobs_count: number;
          services_count: number;
          profile_completion: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          name: string;
          legal_name?: string | null;
          display_name?: string | null;
          logo_url?: string | null;
          logo_public_id?: string | null;
          cover_url?: string | null;
          cover_public_id?: string | null;
          short_description?: string | null;
          about?: string | null;
          mission?: string | null;
          vision?: string | null;
          values_text?: string | null;
          company_type?: string | null;
          industry?: string[] | null;
          sub_industry?: string | null;
          services?: string[] | null;
          products?: string[] | null;
          business_size?: string | null;
          employee_count?: number | null;
          employee_range?: string | null;
          founded_year?: number | null;
          status?: CompanyStatus;
          verification_status?: CompanyVerificationStatus;
          is_featured?: boolean;
          is_premium?: boolean;
          is_hiring?: boolean;
          headquarters_country?: string | null;
          headquarters_country_code?: string | null;
          headquarters_city?: string | null;
          headquarters_address?: string | null;
          postal_code?: string | null;
          locations?: Json | null;
          countries_served?: string[] | null;
          languages?: string[] | null;
          website?: string | null;
          email?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          social_links?: Json | null;
          certifications?: string[] | null;
          rating_avg?: number | null;
          reviews_count?: number;
          followers_count?: number;
          jobs_count?: number;
          services_count?: number;
          profile_completion?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          slug?: string;
          name?: string;
          legal_name?: string | null;
          display_name?: string | null;
          logo_url?: string | null;
          logo_public_id?: string | null;
          cover_url?: string | null;
          cover_public_id?: string | null;
          short_description?: string | null;
          about?: string | null;
          mission?: string | null;
          vision?: string | null;
          values_text?: string | null;
          company_type?: string | null;
          industry?: string[] | null;
          sub_industry?: string | null;
          services?: string[] | null;
          products?: string[] | null;
          business_size?: string | null;
          employee_count?: number | null;
          employee_range?: string | null;
          founded_year?: number | null;
          status?: CompanyStatus;
          verification_status?: CompanyVerificationStatus;
          is_featured?: boolean;
          is_premium?: boolean;
          is_hiring?: boolean;
          headquarters_country?: string | null;
          headquarters_country_code?: string | null;
          headquarters_city?: string | null;
          headquarters_address?: string | null;
          postal_code?: string | null;
          locations?: Json | null;
          countries_served?: string[] | null;
          languages?: string[] | null;
          website?: string | null;
          email?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          social_links?: Json | null;
          certifications?: string[] | null;
          rating_avg?: number | null;
          reviews_count?: number;
          followers_count?: number;
          jobs_count?: number;
          services_count?: number;
          profile_completion?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_reviews: {
        Row: {
          id: string;
          company_id: string;
          reviewer_id: string;
          rating: number;
          title: string | null;
          body: string | null;
          helpful_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          reviewer_id: string;
          rating: number;
          title?: string | null;
          body?: string | null;
          helpful_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          reviewer_id?: string;
          rating?: number;
          title?: string | null;
          body?: string | null;
          helpful_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      company_follows: {
        Row: {
          user_id: string;
          company_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          company_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          company_id?: string;
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
      notification_type: NotificationType;
      company_status: CompanyStatus;
      company_verification_status: CompanyVerificationStatus;
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

export type SavedJob = Database["public"]["Tables"]["saved_jobs"]["Row"];
export type SavedItem = Database["public"]["Tables"]["saved_items"]["Row"];
export type JobCategorySubscription =
  Database["public"]["Tables"]["job_category_subscriptions"]["Row"];
export type MarketplaceCategorySubscription =
  Database["public"]["Tables"]["marketplace_category_subscriptions"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type ListingWithSeller = Listing & {
  profiles: { full_name: string; username: string | null } | null;
};
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderWithListing = Order & {
  marketplace_listings: { title: string; image_url: string | null } | null;
  profiles: { full_name: string; email: string } | null;
};
export type AdPlacement = Database["public"]["Tables"]["ad_placements"]["Row"];

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type CompanyReview = Database["public"]["Tables"]["company_reviews"]["Row"];
export type CompanyFollow = Database["public"]["Tables"]["company_follows"]["Row"];
