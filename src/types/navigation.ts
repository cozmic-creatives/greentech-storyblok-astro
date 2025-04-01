/**
 * Navigation item type for menus
 */
export interface NavItem {
  /**
   * The display title of the navigation item
   */
  title: string;

  /**
   * Short description of the navigation item
   */
  description: string;

  /**
   * URL where the navigation item links to
   */
  href: string;

  /**
   * Image URL for hover effect (desktop only)
   */
  imageUrl?: string;
}
