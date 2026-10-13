/**
 * Icon layer for the whole app.
 *
 * Components import icons from here by their familiar names (`import { Gift } from "../lib/icons"`).
 * Each one is a Phosphor icon (https://phosphoricons.com) with a consistent weight:
 *  - content icons (gifts, stores, money, people…) use Phosphor's duotone weight,
 *  - small UI glyphs (arrows, chevrons, close, check…) use the bold weight so they stay crisp,
 *  - an icon given a `fill-*` class (e.g. rating stars) switches to the filled weight.
 */
import { forwardRef, type SVGProps } from "react";
import { P, type IconPaths } from "./iconPaths";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  color?: string;
};

const TINY = /(^|\s)(w|h|size)-(2|2\.5|3|3\.5)(\s|$)/;

type IconWeight = keyof IconPaths;

function make(paths: IconPaths, kind: "ui" | "feature", name: string) {
  // Keep the old lucide-style class (e.g. "lucide-x") so existing selectors keep working.
  const cls = "lucide-" + name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Za-z])([0-9])/g, "$1-$2").toLowerCase();
  const C = forwardRef<SVGSVGElement, IconProps>(function Icon(
    { strokeWidth: _sw, absoluteStrokeWidth: _asw, className = "", size, fill, color, style, ...rest },
    ref
  ) {
    let weight: IconWeight = kind === "ui" || TINY.test(className) ? "bold" : "duotone";
    if (/(^|\s)fill-(?!none|transparent)/.test(className) || (fill && fill !== "none")) weight = "fill";
    const s = size ?? 24;
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={s}
        height={s}
        viewBox="0 0 256 256"
        fill="currentColor"
        aria-hidden={rest["aria-label"] ? undefined : true}
        className={`sv-icon ${cls} ${className}`.trim()}
        style={color ? { color, ...style } : style}
        {...(rest as any)}
        dangerouslySetInnerHTML={{ __html: paths[weight] }}
      />
    );
  });
  C.displayName = name;
  return C;
}

export const Activity = make(P.Pulse, "feature", "Activity");
export const AlertCircle = make(P.WarningCircle, "feature", "AlertCircle");
export const AlertTriangle = make(P.Warning, "feature", "AlertTriangle");
export const ArrowDownRight = make(P.ArrowDownRight, "ui", "ArrowDownRight");
export const ArrowLeft = make(P.ArrowLeft, "ui", "ArrowLeft");
export const ArrowRight = make(P.ArrowRight, "ui", "ArrowRight");
export const ArrowRightLeft = make(P.ArrowsLeftRight, "ui", "ArrowRightLeft");
export const ArrowUp = make(P.ArrowUp, "ui", "ArrowUp");
export const ArrowUpDown = make(P.ArrowsDownUp, "ui", "ArrowUpDown");
export const ArrowUpRight = make(P.ArrowUpRight, "ui", "ArrowUpRight");
export const Award = make(P.Medal, "feature", "Award");
export const Baby = make(P.Baby, "feature", "Baby");
export const BarChart2 = make(P.ChartBar, "feature", "BarChart2");
export const BarChart3 = make(P.ChartBar, "feature", "BarChart3");
export const Bell = make(P.Bell, "feature", "Bell");
export const BookOpen = make(P.BookOpen, "feature", "BookOpen");
export const Box = make(P.Package, "feature", "Box");
export const Briefcase = make(P.Briefcase, "feature", "Briefcase");
export const Building2 = make(P.Buildings, "feature", "Building2");
export const Cake = make(P.Cake, "feature", "Cake");
export const Calculator = make(P.Calculator, "feature", "Calculator");
export const Calendar = make(P.CalendarBlank, "feature", "Calendar");
export const Camera = make(P.Camera, "feature", "Camera");
export const Check = make(P.Check, "ui", "Check");
export const CheckCircle = make(P.CheckCircle, "feature", "CheckCircle");
export const CheckCircle2 = make(P.CheckCircle, "feature", "CheckCircle2");
export const ChevronDown = make(P.CaretDown, "ui", "ChevronDown");
export const ChevronLeft = make(P.CaretLeft, "ui", "ChevronLeft");
export const ChevronRight = make(P.CaretRight, "ui", "ChevronRight");
export const ChevronUp = make(P.CaretUp, "ui", "ChevronUp");
export const Clock = make(P.Clock, "feature", "Clock");
export const Coffee = make(P.Coffee, "feature", "Coffee");
export const Coins = make(P.Coins, "feature", "Coins");
export const Command = make(P.Command, "ui", "Command");
export const Compass = make(P.Compass, "feature", "Compass");
export const Copy = make(P.Copy, "ui", "Copy");
export const Cpu = make(P.Cpu, "feature", "Cpu");
export const CreditCard = make(P.CreditCard, "feature", "CreditCard");
export const Crown = make(P.Crown, "feature", "Crown");
export const Database = make(P.Database, "feature", "Database");
export const DollarSign = make(P.CurrencyDollar, "feature", "DollarSign");
export const Download = make(P.DownloadSimple, "ui", "Download");
export const Edit2 = make(P.PencilSimple, "ui", "Edit2");
export const ExternalLink = make(P.ArrowSquareOut, "ui", "ExternalLink");
export const Eye = make(P.Eye, "ui", "Eye");
export const EyeOff = make(P.EyeSlash, "ui", "EyeOff");
export const FileCheck2 = make(P.SealCheck, "feature", "FileCheck2");
export const FileText = make(P.FileText, "feature", "FileText");
export const Filter = make(P.Funnel, "ui", "Filter");
export const Fingerprint = make(P.Fingerprint, "feature", "Fingerprint");
export const Flag = make(P.Flag, "feature", "Flag");
export const Flame = make(P.Fire, "feature", "Flame");
export const Gift = make(P.Gift, "feature", "Gift");
export const Globe = make(P.Globe, "feature", "Globe");
export const GraduationCap = make(P.GraduationCap, "feature", "GraduationCap");
export const Grid = make(P.GridFour, "ui", "Grid");
export const Headphones = make(P.Headphones, "feature", "Headphones");
export const Heart = make(P.Heart, "feature", "Heart");
export const HelpCircle = make(P.Question, "feature", "HelpCircle");
export const History = make(P.ClockCounterClockwise, "feature", "History");
export const Home = make(P.House, "feature", "Home");
export const Image = make(P.Image, "feature", "Image");
export const Info = make(P.Info, "feature", "Info");
export const KeyRound = make(P.Key, "feature", "KeyRound");
export const Laptop = make(P.Laptop, "feature", "Laptop");
export const Layers = make(P.Stack, "feature", "Layers");
export const LayoutGrid = make(P.SquaresFour, "ui", "LayoutGrid");
export const Lightbulb = make(P.Lightbulb, "feature", "Lightbulb");
export const Link = make(P.Link, "ui", "Link");
export const Loader = make(P.CircleNotch, "ui", "Loader");
export const Loader2 = make(P.CircleNotch, "ui", "Loader2");
export const Lock = make(P.Lock, "feature", "Lock");
export const LogOut = make(P.SignOut, "ui", "LogOut");
export const Mail = make(P.Envelope, "feature", "Mail");
export const MapPin = make(P.MapPin, "feature", "MapPin");
export const Maximize2 = make(P.ArrowsOut, "ui", "Maximize2");
export const Menu = make(P.List, "ui", "Menu");
export const MessageCircle = make(P.ChatCircle, "feature", "MessageCircle");
export const MessageSquare = make(P.ChatText, "feature", "MessageSquare");
export const Mic = make(P.Microphone, "ui", "Mic");
export const MicOff = make(P.MicrophoneSlash, "ui", "MicOff");
export const Monitor = make(P.Monitor, "feature", "Monitor");
export const Moon = make(P.Moon, "ui", "Moon");
export const Music = make(P.MusicNote, "feature", "Music");
export const Navigation = make(P.NavigationArrow, "feature", "Navigation");
export const Package = make(P.Package, "feature", "Package");
export const PackageCheck = make(P.Package, "feature", "PackageCheck");
export const PackageSearch = make(P.Package, "feature", "PackageSearch");
export const Palette = make(P.Palette, "feature", "Palette");
export const PenTool = make(P.PenNib, "feature", "PenTool");
export const Phone = make(P.Phone, "feature", "Phone");
export const PhoneCall = make(P.PhoneCall, "feature", "PhoneCall");
export const PieChart = make(P.ChartPie, "feature", "PieChart");
export const Play = make(P.Play, "feature", "Play");
export const Plus = make(P.Plus, "ui", "Plus");
export const Printer = make(P.Printer, "ui", "Printer");
export const QrCode = make(P.QrCode, "feature", "QrCode");
export const Quote = make(P.Quotes, "feature", "Quote");
export const Radar = make(P.Crosshair, "feature", "Radar");
export const Receipt = make(P.Receipt, "feature", "Receipt");
export const RefreshCw = make(P.ArrowsClockwise, "ui", "RefreshCw");
export const RotateCcw = make(P.ArrowCounterClockwise, "ui", "RotateCcw");
export const Scale = make(P.Scales, "feature", "Scale");
export const ScanLine = make(P.Scan, "feature", "ScanLine");
export const Scissors = make(P.Scissors, "feature", "Scissors");
export const Search = make(P.MagnifyingGlass, "ui", "Search");
export const Send = make(P.PaperPlaneTilt, "ui", "Send");
export const Share2 = make(P.ShareNetwork, "ui", "Share2");
export const Shield = make(P.Shield, "feature", "Shield");
export const ShieldAlert = make(P.ShieldWarning, "feature", "ShieldAlert");
export const ShieldCheck = make(P.ShieldCheck, "feature", "ShieldCheck");
export const ShoppingBag = make(P.ShoppingBag, "feature", "ShoppingBag");
export const Shuffle = make(P.Shuffle, "ui", "Shuffle");
export const Sliders = make(P.Sliders, "ui", "Sliders");
export const SlidersHorizontal = make(P.SlidersHorizontal, "ui", "SlidersHorizontal");
export const Smartphone = make(P.DeviceMobile, "feature", "Smartphone");
export const Sparkles = make(P.Sparkle, "feature", "Sparkles");
export const Square = make(P.Square, "ui", "Square");
export const Stamp = make(P.Stamp, "feature", "Stamp");
export const Star = make(P.Star, "feature", "Star");
export const Store = make(P.Storefront, "feature", "Store");
export const Sun = make(P.Sun, "ui", "Sun");
export const Swords = make(P.Scales, "feature", "Swords");
export const Table = make(P.Table, "feature", "Table");
export const Tablet = make(P.DeviceTablet, "feature", "Tablet");
export const Tag = make(P.Tag, "feature", "Tag");
export const Target = make(P.Target, "feature", "Target");
export const Ticket = make(P.Ticket, "feature", "Ticket");
export const Timer = make(P.Timer, "feature", "Timer");
export const Trash2 = make(P.Trash, "ui", "Trash2");
export const TrendingDown = make(P.TrendDown, "ui", "TrendingDown");
export const TrendingUp = make(P.TrendUp, "ui", "TrendingUp");
export const Trophy = make(P.Trophy, "feature", "Trophy");
export const Truck = make(P.Truck, "feature", "Truck");
export const Unlock = make(P.LockOpen, "feature", "Unlock");
export const Upload = make(P.UploadSimple, "ui", "Upload");
export const UploadCloud = make(P.CloudArrowUp, "feature", "UploadCloud");
export const User = make(P.User, "feature", "User");
export const UserCheck = make(P.UserCheck, "feature", "UserCheck");
export const Users = make(P.Users, "feature", "Users");
export const Volume2 = make(P.SpeakerHigh, "ui", "Volume2");
export const VolumeX = make(P.SpeakerSlash, "ui", "VolumeX");
export const Wallet = make(P.Wallet, "feature", "Wallet");
export const Watch = make(P.Watch, "feature", "Watch");
export const Wifi = make(P.WifiHigh, "ui", "Wifi");
export const WifiOff = make(P.WifiSlash, "ui", "WifiOff");
export const X = make(P.X, "ui", "X");
export const XCircle = make(P.XCircle, "feature", "XCircle");
export const Zap = make(P.Lightning, "feature", "Zap");
