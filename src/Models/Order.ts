import { OrderDetail } from "./OrderDetail";

export class Order {
    id: number = 0;
    description:string = String();
    orderCode:string = String();
    orderDetails: OrderDetail[] = [];
    
    static schema = ['++id', 'description', 'orderCode'] as const;

    constructor(data?: Partial<Order>) {
        Object.assign(this, data);
    }
}
