import { Branch } from './Branch';

export class Franchise {
    id: number = 0;
    fantasyName: string = String();
    companyName: string = String();
    taxId: string = String();
    taxCategory: string = String();
    deleted: boolean = false;
    branches: Branch[] = [];

    static schema = ['++id', 'fantasyName', 'companyName', 'taxId', 'taxCategory', 'deleted'] as const;

    constructor(init?: Partial<Franchise>) {
        Object.assign(this, init);
    }
}