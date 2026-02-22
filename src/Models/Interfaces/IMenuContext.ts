import { Category } from "@/Models/Category";
import { Menu } from "@/Models/Menu";

export interface IMenuContext {
    isMenuLoading: boolean,
    menu: Menu,
    category: Category,
    handler: (callback: (prev: Category) => Category) => void,
    GetMenu: (force?: boolean) => void,
    AddCategory: () => void,
    DeleteCategory: (categoryCode: string) => void,
    LoadCategory: (categoryCode: string) => void,
    ResetCategory: () => void,
}
