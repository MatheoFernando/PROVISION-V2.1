import {
  type Icon,
  SquaresFour,
  Users,
  Buildings,
  Gear,
  Package,
  ChartPie,
  Car,
  MapPinLine,
  Wrench,
  Globe,
  Lock,
  Database,
  Plugs,
  UsersFour,
  Truck,
  TreeStructure,
  CirclesThreePlus,
  GridFour,
  MapTrifold,
  UserCircleGear,
  Sliders,
  PlugsConnected,
  ShieldCheck,
  HardDrives,
} from "phosphor-react";
import { getNavData, type NavItemData } from "@/config/nav-data";

export interface BaseNavItem extends Omit<NavItemData, "items" | "iconKey"> {
  icon?: Icon;
  items?: BaseNavItem[];
}

const iconMap: Record<string, Icon> = {
  SquaresFour,
  Users,
  Buildings,
  Gear,
  Package,
  ChartPie,
  Car,
  MapPinLine,
  Wrench,
  Globe,
  Lock,
  Database,
  Plugs,
  UsersFour,
  Truck,
  TreeStructure,
  CirclesThreePlus,
  GridFour,
  MapTrifold,
  UserCircleGear,
  Sliders,
  PlugsConnected,
  ShieldCheck,
  HardDrives,
};

function mapNavItem(item: NavItemData): BaseNavItem {
  const { iconKey, items, ...rest } = item;
  return {
    ...rest,
    icon: iconKey ? iconMap[iconKey] : undefined,
    items: items?.map(mapNavItem),
  };
}

export const getAllNavItems = (isGlobalAdmin: boolean): BaseNavItem[] =>
  getNavData(isGlobalAdmin).map(mapNavItem);

export const allNavItems: BaseNavItem[] = getAllNavItems(false);

export { adminOnlyPaths } from "@/config/nav-data";
