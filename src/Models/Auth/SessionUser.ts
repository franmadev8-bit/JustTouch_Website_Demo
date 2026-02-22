export class SessionUser {
    id!: string;
    email?: string;
    createdAt!: Date;
    userMetadata?: Record<string, any>;

    constructor(init?: Partial<SessionUser>) {
        Object.assign(this, init);
    }
}