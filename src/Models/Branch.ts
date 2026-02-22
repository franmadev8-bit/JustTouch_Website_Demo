export class Branch {
    id: number = 0;
    country: string = String();
    provinceOrState: string = String();
    city: string = String();
    address: string = String();
    postalCode: string = String();
    email?: string;
    openTime?: string;
    closeTime?: string;

    instagramUrl?: string;
    facebookUrl?: string;
    whatsappUrl?: string;

    coverUrl?: string;
    coverFile?: File;

    pictureUrl?: string;
    pictureFile?: File;

    branchCode: string = String();
    deleted: boolean = false;

    static schema = [
        '++id', 'country',
        'provinceOrState', 'city', 'address', 'postalCode',
        'email', 'openTime', 'closeTime',
        'instagramUrl', 'facebookUrl', 'whatsappUrl',
        'coverUrl', 'coverFile', 'pictureUrl', 'pictureFile',
        'branchCode', 'deleted'
    ] as const;

    constructor(init?: Partial<Branch>) {
        Object.assign(this, init);
    }
}
