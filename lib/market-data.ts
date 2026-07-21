export const MARKET_LOCATION = "Greater Accra";

export const MARKET_CONTACT = {
  phone: "+233 50 947 4349",
  email: "orders@mamapeacemart.com",
} as const;

export const MARKET_HOURS = [
  { days: "Monday – Saturday", hours: "9:00 AM – 6:00 PM" },
  { days: "Sunday", hours: "2:00 PM – 6:00 PM" },
] as const;

export const marketFeatures = [
  { title: "Quality Products", subtitle: "Carefully Selected" },
  { title: "Fresh & Reliable", subtitle: "Every Time" },
  { title: "Wide Variety", subtitle: "All You Need" },
  { title: "Trusted by Many", subtitle: "For Your Family" },
] as const;

export const marketCategories = [
  { id: "vegetables", name: "Vegetables", image: "/images/market/vegetables.webp" },
  { id: "fruits", name: "Fruits", image: "/images/market/fruits.jpg" },
  { id: "rice-grains", name: "Rice & Grains", image: "/images/market/rice-grains.jpg" },
  { id: "drinks", name: "Drinks", image: "/images/market/beverages.jpg" },
  { id: "meat-fish", name: "Meat & Fish", image: "/images/market/meat-fish.jpg" },
  { id: "household", name: "Household", image: "/images/market/household.jpg" },
  { id: "toiletries", name: "Toiletries", image: "/images/market/toiletries.jpg" },
  { id: "canned-food", name: "Canned Food", image: "/images/market/canned-food.jpg" },
] as const;

export const marketProducts = [
  {
    id: "tomatoes",
    name: "Fresh Tomatoes",
    image: "/images/market/tomatoes.jpg",
  },
  {
    id: "onions",
    name: "Red Onions",
    image: "/images/market/onions.jpg",
  },
  {
    id: "bell-peppers",
    name: "Bell Peppers",
    image: "/images/market/bell-peppers.jpg",
  },
  {
    id: "vegetables-mix",
    name: "Fresh Vegetables",
    image: "/images/market/vegetables-mix.jpg",
  },
  {
    id: "vegetables",
    name: "Farm Pick",
    image: "/images/market/vegetables.webp",
  },
  {
    id: "fruits",
    name: "Seasonal Fruits",
    image: "/images/market/fruits.jpg",
  },
  {
    id: "rice-grains",
    name: "Rice & Grains",
    image: "/images/market/rice-grains.jpg",
  },
  {
    id: "beverages",
    name: "Beverages",
    image: "/images/market/beverages.jpg",
  },
  {
    id: "meat-fish",
    name: "Meat & Fish",
    image: "/images/market/meat-fish.jpg",
  },
  {
    id: "household",
    name: "Household",
    image: "/images/market/household.jpg",
  },
  {
    id: "toiletries",
    name: "Toiletries",
    image: "/images/market/toiletries.jpg",
  },
  {
    id: "canned-food",
    name: "Canned Food",
    image: "/images/market/canned-food.jpg",
  },
  {
    id: "books",
    name: "Books & More",
    image: "/images/market/books.jpg",
  },
] as const;

export const whyShopItems = [
  "Fresh & Quality Products",
  "Wide Selection of Items",
  "Trusted Service",
] as const;

export const howItWorksSteps = [
  {
    step: 1,
    title: "Send Your Request",
    description: "Enter your details and list the items you need from the mart",
  },
  {
    step: 2,
    title: "Mama Peace Reviews",
    description: "We check availability and send you the total order price",
  },
  {
    step: 3,
    title: "Pay & Get Delivered",
    description: "Make payment and receive your groceries at your doorstep",
  },
] as const;

export const helpCards = [
  {
    title: "Place an Order",
    description: "Send your grocery list and delivery details",
    href: "/order",
    cta: "Order Now",
  },
  {
    title: "Track Your Order",
    description: "Check status and payment updates anytime",
    href: "/track",
    cta: "Track Order",
  },
  {
    title: "Enquiries & Complaints",
    description: "Reach our team for help or feedback",
    href: "/support",
    cta: "Contact Us",
  },
] as const;

export const footerQuickLinks = [
  { label: "Home", href: "/home" },
  { label: "Shop", href: "/order" },
  { label: "About Us", href: "/home#about" },
  { label: "Contact Us", href: "/support" },
  { label: "My Orders", href: "/track" },
  { label: "Track Order", href: "/track" },
  { label: "Enquiries / Complaints", href: "/support" },
] as const;
