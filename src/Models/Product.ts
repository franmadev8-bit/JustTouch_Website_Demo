import { UploadFile } from "antd";

export class Product {
    id: number = 0;
    name: string = String();
    description: string = String();
    price: string = String();
    pictureUrl: string = String();
    signedUrl: string = String();
    productCode: string = String();
    isAvailable: boolean = true;
    image?: UploadFile[];

    static schema = [
        '++id', 'name', 'description', 'price', 'pictureUrl',
        'signedUrl', 'productCode', 'isAvailable', 'image'
    ] as const;

    constructor(data?: Partial<Product>) {
        Object.assign(this, data);
    }
}