import { ItemType, MenuItemType } from "antd/es/menu/interface";

export interface IAppContext {
    sideItems: ItemType<MenuItemType>[] | undefined,
}