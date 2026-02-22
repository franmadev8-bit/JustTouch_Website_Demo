import { Session } from "./Session";
import { SessionUser } from "./SessionUser";

export class AuthResponse {
    user?: SessionUser;
    session?: Session;

    constructor(init?: Partial<AuthResponse>) {
        Object.assign(this, init);
    }
}