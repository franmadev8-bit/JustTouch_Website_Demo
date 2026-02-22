export class OrderDetail {
    id:number = 0;
    productName: string = String();
    detailCode: string = String();
    quantity?: number;

    static schema = ['++id', 'productName', 'detailCode', 'quantity'] as const;

    constructor(init: Partial<OrderDetail>) {
        Object.assign(this, init);
    }
}