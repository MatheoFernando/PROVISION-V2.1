import {
  type Icon,
  SquaresFour,
  Users,
  Buildings,
  Gear,
  Package,
  ChartPie,
} from "phosphor-react";
import { navData, type NavItemData } from "@/config/nav-data";

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
};

function mapNavItem(item: NavItemData): BaseNavItem {
  const { iconKey, items, ...rest } = item;
  return {
    ...rest,
    icon: iconKey ? iconMap[iconKey] : undefined,
    items: items?.map(mapNavItem),
  };
}

export const allNavItems: BaseNavItem[] = navData.map(mapNavItem);

export { adminOnlyPaths } from "@/config/nav-data";
