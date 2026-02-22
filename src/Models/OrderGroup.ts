import { Order } from "./Order";

export class OrderGroup {
    id: number = 0;
    subtotal?: number;
    total?: number;
    tip?: number;
    delivery: string = String();
    phone: string = String();
    groupCode: string = String();
    state: number = 1;
    orders: Order[] = [];
    
    static schema = ['++id', 'subtotal', 'total', 'tip', 'delivery', 'phone', 'groupCode', 'state'] as const;

    constructor(init?: Partial<OrderGroup>) {
        Object.assign(this, init);
    }
}