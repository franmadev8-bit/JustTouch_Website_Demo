export class AuthData {
    id?: number;
    BranchCode?: string;
    Token?: string;
    AccountKey?: string;

    static schema = ['++id', 'Token', 'BranchCode', 'AccountKey'] as const;

    constructor(init?: Partial<AuthData>) {
        Object.assign(this, init);
    }
}