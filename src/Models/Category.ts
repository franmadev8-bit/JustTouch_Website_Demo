import { Product } from "./Product";

export class Category {
    id: number = 0;
    category: string = String();
    categoryCode: string = String();
    branchCode: string = String();
    products: Product[] = [];

    static schema = ['++id', 'category', 'categoryCode', 'branchCode'] as const;

    constructor(data?: Partial<Category>) {
        Object.assign(this, data);
    }
}