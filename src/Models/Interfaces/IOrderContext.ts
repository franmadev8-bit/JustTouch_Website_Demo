import { OrderGroup } from "@/Models/OrderGroup";

export interface IOrderContext {
    groups: OrderGroup[];
    ordersLoading: boolean;
    selectedGroup: OrderGroup | null;
    GetOrders: () => void;
    ChangeStatus: (id: number, state: number) => void;
    SelectGroup: (group: OrderGroup | null) => void;
}
