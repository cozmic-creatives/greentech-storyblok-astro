// Import the separated navbar components
import { MobileNavbar } from '~/components/navigation/MobileNavbar';
import { DesktopNavbar } from '~/components/navigation/DesktopNavbar';
import type { NavItem } from '~/types/navigation';

// Navigation data
const mainLinks: NavItem[] = [
  {
    title: 'Contact',
    description: 'Get in touch with our team',
    href: '/contact',
  },
  {
    title: 'About Us',
    description: 'Learn more about GreenTech',
    href: '/about',
  },
  {
    title: 'News',
    description: 'Latest updates and industry news',
    href: '/news',
  },
];

const businessLines: NavItem[] = [
  {
    title: 'Injection Moulding',
    description: 'High-precision injection moulding solutions for various industries',
    href: '/business/injection-moulding',
    imageUrl: '/images/nav/injection-moulding.jpg',
  },
  {
    title: 'Extrusion',
    description: 'Advanced extrusion technology for continuous production processes',
    href: '/business/extrusion',
    imageUrl: '/images/nav/extrusion.jpg',
  },
  {
    title: 'Ancillaries',
    description: 'Supporting equipment and accessories for plastic processing',
    href: '/business/ancillaries',
    imageUrl: '/images/nav/ancillaries.jpg',
  },
  {
    title: 'Services & Spares',
    description: 'Comprehensive maintenance services and spare parts',
    href: '/business/services-spares',
    imageUrl: '/images/nav/services-spares.jpg',
  },
  {
    title: 'Automation & Grippers',
    description: 'Robotic solutions for efficient production workflows',
    href: '/business/automation-grippers',
    imageUrl: '/images/nav/automation-grippers.jpg',
  },
  {
    title: 'Recycling',
    description: 'Sustainable recycling solutions for plastic materials',
    href: '/business/recycling',
    imageUrl: '/images/nav/recycling.jpg',
  },
];

const brands: NavItem[] = [
  {
    title: 'ENGEL',
    description: 'Premium injection moulding machines and automation technology',
    href: '/brands/engel',
    imageUrl: '/images/nav/engel.jpg',
  },
  {
    title: 'WINTEC',
    description: 'Reliable and efficient injection moulding solutions',
    href: '/brands/wintec',
    imageUrl: '/images/nav/wintec.jpg',
  },
  {
    title: 'Battenfeld-Cincinnati',
    description: 'Leading extrusion technology for various applications',
    href: '/brands/battenfeld-cincinnati',
    imageUrl: '/images/nav/battenfeld-cincinnati.jpg',
  },
  {
    title: 'Motan',
    description: 'Material handling systems for the plastics industry',
    href: '/brands/motan',
    imageUrl: '/images/nav/motan.jpg',
  },
  {
    title: 'HB-Therm',
    description: 'Precision temperature control units for plastics processing',
    href: '/brands/hb-therm',
    imageUrl: '/images/nav/hb-therm.jpg',
  },
  {
    title: 'TAMPOPRINT',
    description: 'Innovative pad printing solutions for decorative applications',
    href: '/brands/tampoprint',
    imageUrl: '/images/nav/tampoprint.jpg',
  },
  {
    title: 'EAS',
    description: 'Advanced mold change systems for injection molding',
    href: '/brands/eas',
    imageUrl: '/images/nav/eas.jpg',
  },
  {
    title: 'Tantec',
    description: 'Surface treatment technology for improved adhesion',
    href: '/brands/tantec',
    imageUrl: '/images/nav/tantec.jpg',
  },
  {
    title: 'NGR',
    description: 'Next generation recycling equipment for plastics',
    href: '/brands/ngr',
    imageUrl: '/images/nav/ngr.jpg',
  },
  {
    title: 'MOLDO PLASTICO',
    description: 'Specialized plastic molding solutions',
    href: '/brands/moldo-plastico',
    imageUrl: '/images/nav/moldo-plastico.jpg',
  },
  {
    title: 'SWIFT',
    description: 'Rapid and efficient plastic processing technology',
    href: '/brands/swift',
    imageUrl: '/images/nav/swift.jpg',
  },
];

const markets: NavItem[] = [
  {
    title: 'Automotive',
    description: 'Automotive industry solutions for plastics processing',
    href: '/markets/automotive',
    imageUrl: '/images/nav/automotive.jpg',
  },
  {
    title: 'Electrical & Electronics',
    description: 'Electrical and electronic industry solutions for plastics processing',
    href: '/markets/electrical-electronics',
    imageUrl: '/images/nav/electrical-electronics.jpg',
  },
  {
    title: 'Food & Beverage',
    description: 'Food and beverage industry solutions for plastics processing',
    href: '/markets/food-beverage',
    imageUrl: '/images/nav/food-beverage.jpg',
  },
  {
    title: 'Medical',
    description: 'Medical industry solutions for plastics processing',
    href: '/markets/medical',
    imageUrl: '/images/nav/medical.jpg',
  },
  {
    title: 'Packaging',
    description: 'Packaging industry solutions for plastics processing',
    href: '/markets/packaging',
    imageUrl: '/images/nav/packaging.jpg',
  },
  {
    title: 'Other',
    description: 'Other industry solutions for plastics processing',
    href: '/markets/other',
    imageUrl: '/images/nav/other.jpg',
  },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-18 items-center">
        <div className="md:hidden">
          <MobileNavbar
            businessLines={businessLines}
            brands={brands}
            markets={markets}
            mainLinks={mainLinks}
          />
        </div>

        <a href="/" className="flex items-center space-x-2">
          <img src="/greentech-logo.svg" alt="GreenTech Logo" className="h-9 w-auto" />
        </a>

        <div className="hidden md:flex md:flex-1 md:justify-center">
          <DesktopNavbar
            businessLines={businessLines}
            brands={brands}
            markets={markets}
            mainLinks={mainLinks}
          />
        </div>
      </div>
    </header>
  );
}
