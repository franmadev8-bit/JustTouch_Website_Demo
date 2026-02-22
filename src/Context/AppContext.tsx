import { createContext, FC, useContext } from "react";
import { IAppContext } from '@/Models/Interfaces/IAppContext';
import { ContextChildren } from "@/Models/Interfaces/ContextChildren";
import { FaBowlRice,  FaStore } from "react-icons/fa6";
import { ItemType, MenuItemType } from "antd/es/menu/interface";

const AppContext = createContext<IAppContext | undefined>(undefined);

export const UseAppContext = (): IAppContext => {
    const context = useContext(AppContext);
    if (!context) throw new Error('App Context not provided!');
    return context;
}

export const AppProvider: FC<ContextChildren> = ({ children }) => {

    const sideItems: ItemType<MenuItemType>[] | undefined = [
        {
            className: 'sider-item',
            key: '1',
            icon: <FaStore />,
            label: 'Pedidos',
        },
        {
            className: 'sider-item',
            key: '2',
            icon: <FaBowlRice />,
            label: 'Menu',
        }
    ]



    return (
        <AppContext.Provider value={{ sideItems }}>
            {children}
        </AppContext.Provider>
    )
}

