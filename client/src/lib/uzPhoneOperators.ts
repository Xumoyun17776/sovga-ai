export interface OperatorInfo {
  name: string;
  code: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badge: string;
  dotColor: string;
}

export function detectUzOperator(phoneRaw: string): OperatorInfo | null {
  const clean = phoneRaw.replace(/\D/g, "");
  let prefix = "";
  if (clean.startsWith("998") && clean.length >= 5) {
    prefix = clean.slice(3, 5);
  } else if (clean.length >= 2) {
    prefix = clean.slice(0, 2);
  }

  if (!prefix || prefix.length < 2) return null;

  switch (prefix) {
    case "90":
    case "91":
      return {
        name: "Beeline",
        code: prefix,
        color: "#FBBF24",
        textColor: "text-amber-800 dark:text-amber-300",
        bgColor: "bg-amber-100 dark:bg-amber-950/60",
        borderColor: "border-amber-300 dark:border-amber-700",
        badge: "Beeline",
        dotColor: "bg-amber-500",
      };
    case "93":
    case "94":
    case "50":
      return {
        name: "Ucell",
        code: prefix,
        color: "#A855F7",
        textColor: "text-purple-800 dark:text-purple-300",
        bgColor: "bg-purple-100 dark:bg-purple-950/60",
        borderColor: "border-purple-300 dark:border-purple-700",
        badge: "Ucell",
        dotColor: "bg-purple-500",
      };
    case "97":
    case "88":
      return {
        name: "Mobiuz",
        code: prefix,
        color: "#EF4444",
        textColor: "text-rose-800 dark:text-rose-300",
        bgColor: "bg-rose-100 dark:bg-rose-950/60",
        borderColor: "border-rose-300 dark:border-rose-700",
        badge: "Mobiuz",
        dotColor: "bg-rose-500",
      };
    case "99":
    case "95":
    case "77":
      return {
        name: "Uztelecom",
        code: prefix,
        color: "#3B82F6",
        textColor: "text-blue-800 dark:text-blue-300",
        bgColor: "bg-blue-100 dark:bg-blue-950/60",
        borderColor: "border-blue-300 dark:border-blue-700",
        badge: "Uztelecom",
        dotColor: "bg-blue-500",
      };
    case "33":
      return {
        name: "Humans",
        code: prefix,
        color: "#F97316",
        textColor: "text-orange-800 dark:text-orange-300",
        bgColor: "bg-orange-100 dark:bg-orange-950/60",
        borderColor: "border-orange-300 dark:border-orange-700",
        badge: "Humans",
        dotColor: "bg-orange-500",
      };
    case "71":
    case "78":
      return {
        name: "Toshkent",
        code: prefix,
        color: "#64748B",
        textColor: "text-slate-800 dark:text-slate-300",
        bgColor: "bg-slate-100 dark:bg-slate-800",
        borderColor: "border-slate-300 dark:border-slate-600",
        badge: "Toshkent ATS",
        dotColor: "bg-slate-500",
      };
    default:
      return null;
  }
}
