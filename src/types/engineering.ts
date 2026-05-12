export interface EngineeringCategory {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface EngineeringModule {
  id: string;
  title: string;
  description: string;
  category: string;

  href: string;

  icon: string;

  status: "live" | "beta" | "planned";

  featured?: boolean;

  color: string;
}