// Static visual + lookup tables for the Rush Guide / Timeline rendering in
// App.tsx. None of these depend on order state — they're skin/data only. The
// per-render decisions (which color to pick, which icon to show) still happen
// inside the JSX with `MAP[key] || fallback`.

// DURATION_DAYS — interview "duration" answer → days for timeline math.
// "Until repairs done" is 0 so callers fall back to estimatedReturn.
export const DURATION_DAYS: Record<string, number> = {
  "A few days":         5,
  "1-2 weeks":          14,
  "1 month":            30,
  "2-3 months":         75,
  "6+ months":          180,
  "Until repairs done": 0,
};

// BAND_COLORS — Tailwind bg-* class for each living-situation band on the
// timeline strip (matches STAY_TYPE_COLORS for the delivery markers but at a
// lighter shade so the strip reads as a background).
export const BAND_COLORS: Record<string, string> = {
  "Neighbor":        "bg-orange-400",
  "Relative":        "bg-pink-400",
  "Hotel":           "bg-amber-400",
  "Rental":          "bg-sky-400",
  "Temp":            "bg-sky-400",
  "Staying in home": "bg-emerald-400",
  "Moving":          "bg-violet-400",
};

// DELIVERY_COLORS — cycled Tailwind bg-* classes for delivery group markers
// (rush / short-term / final / custom). The renderer indexes into this array,
// wrapping with modulo when there are more groups than colors.
export const DELIVERY_COLORS: string[] = ["bg-teal-600", "bg-sky-600", "bg-indigo-600", "bg-amber-600", "bg-emerald-700"];

// STAY_TYPE_COLORS — Tailwind bg-* class for delivery markers anchored to a
// specific living-situation type (used when a delivery's location implies its
// color, e.g. a rental delivery uses the rental band's color).
export const STAY_TYPE_COLORS: Record<string, string> = {
  "Hotel":           "bg-amber-500",
  "Rental":          "bg-sky-600",
  "Temp":            "bg-sky-600",
  "Neighbor":        "bg-indigo-500",
  "Relative":        "bg-indigo-500",
  "Moving":          "bg-slate-600",
  "Staying in home": "bg-emerald-600",
};

// SEASON_ICONS / HOLIDAY_ICONS / EVENT_ICONS — emoji for the season-change,
// holiday, and lifestyle-event pins on the timeline.
export const SEASON_ICONS: Record<string, string>  = { Spring: "🌷", Summer: "☀️", Fall: "🍂", Winter: "❄️" };
export const HOLIDAY_ICONS: Record<string, string> = { Halloween: "🎃", Thanksgiving: "🦃", "Christmas / Hanukkah": "🎄", "Easter / Passover": "🐣", Graduation: "🎓" };
export const EVENT_ICONS: Record<string, string>   = { vacation_beach: "🏖️", vacation_ski: "⛷️", wedding: "💒", business: "💼", sports: "⚽" };

// SEASON_DATES — meteorological boundaries used to detect season changes that
// fall inside the active repair window. month is 0-indexed (matches Date()).
// items/events become defaults for the season's pack-out suggestions; the
// caller enriches with interest-specific extras.
export type SeasonDate = {
  name: string;
  month: number;
  day: number;
  items: string[];
  events: string[];
};

export const SEASON_DATES: SeasonDate[] = [
  { name: "Spring", month: 2, day: 20, items: ["Light jackets, windbreakers, and rain gear", "Transition layers (long sleeves, light sweaters)", "Sneakers and rain boots"], events: ["Graduation", "Prom", "Easter / Passover", "Spring Break"] },
  { name: "Summer", month: 5, day: 20, items: ["Shorts, t-shirts, skirts, and lightweight clothing", "Sandals, open-toe shoes, and sunglasses", "Swimwear, beach bags, sun hats, and pool gear"], events: ["Beach Vacations", "Summer Camp", "July 4th", "Outdoor Weddings"] },
  { name: "Fall",   month: 8, day: 22, items: ["Sweaters, fleeces, and mid-weight coats", "Jeans, heavier pants, and closed-toe shoes", "Boots and layering pieces"], events: ["Back to School", "Halloween", "Thanksgiving"] },
  { name: "Winter", month: 11, day: 21, items: ["Heavy winter coats, parkas, and snow boots", "Gloves, scarves, thermal layers, and thick socks", "Holiday formal wear"], events: ["Christmas / Hanukkah", "New Year's Eve", "Ski Trips"] },
];
