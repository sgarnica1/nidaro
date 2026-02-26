export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
