import { ContextChildren } from '@/Models/Interfaces/ContextChildren';
import { IAuthContext } from '@/Models/Interfaces/IAuthContext';
import { User } from '@/Models/User';
import { createContext, FC, useContext, useState } from 'react';
import { message } from 'antd';
import Cookie from 'js-cookie';

import { db } from '@/Database/Database';

const AutheticationContext = createContext<IAuthContext | undefined>(undefined);

export const useAuthenticationContext = (): IAuthContext => {
    const context = useContext(AutheticationContext);
    if (!context) throw new Error('Auth context not provided!');
    return context;
}

export const AutheticationProvider: FC<ContextChildren> = ({ children }) => {
    const [branchSelector, setBranchSelector] = useState<boolean>(false);

    // const [serviceRequested, setServiceRequested] = useState<boolean>(false);
    const [requesting, setRequesting] = useState<boolean>(false);
    // const [confirming, setConfirming] = useState<boolean>(false);

    const [signingIn, setSigningIn] = useState<boolean>(false);

    const [user, setUser] = useState<User>(new User());

    const handleUser = <K extends keyof User>(key: K, value: any) => setUser(prev => ({ ...prev, [key]: value }));

    const DetectBranch = (value: boolean) => setBranchSelector(value);

    const RequestService = async () => {
        if (!user.email || !user.password) {
            message.error('Completá el email y la contraseña para continuar.');
            return;
        }

        setRequesting(true);
        try {
            const existing = await db.user.where('email').equals(user.email).first();
            if (existing) {
                message.error('Ya existe una cuenta con ese email.');
                return;
            }

            const token = `demo-${Date.now()}`;
            await db.user.add({ ...user, id: 0 });
            await db.authData.put({ id: 1, Token: token });
            Cookie.set('JToken', token, { expires: 7 });

            // Forzar recarga para que GateKeeper detecte el nuevo token y redirija
            window.location.href = '/account';
        } catch {
            message.error('Ocurrió un error al crear la cuenta.');
        } finally {
            setRequesting(false);
        }
    }

    const ConfirmAccount = async (_email: string) => {
        window.location.href = '/sign-in';
    }

    const SignIn = async (credentials: User) => {
        if (!credentials.email || !credentials.password) {
            message.error('Completá el email y la contraseña.');
            return;
        }

        setSigningIn(true);
        try {
            const found = await db.user.where('email').equals(credentials.email).first();

            if (!found || found.password !== credentials.password) {
                message.error('Email o contraseña incorrectos.');
                return;
            }

            const token = `demo-${Date.now()}`;
            await db.authData.put({ id: 1, Token: token });
            Cookie.set('JToken', token, { expires: 7 });
            window.location.href = '/account';
        } catch {
            message.error('Ocurrió un error al iniciar sesión.');
        } finally {
            setSigningIn(false);
        }
    }

    const SignOut = async () => {
        Cookie.remove('JToken');
        await db.authData.clear();
        window.location.href = '/sign-in';
    }

    return (
        <AutheticationContext.Provider value={{
            user, handleUser,
            requesting, 
            // confirming, 
            signingIn,
            // serlviceRequested, 
            branchSelector,
            SignOut, SignIn,
            ConfirmAccount, RequestService, DetectBranch
        }}>
            {children}
        </AutheticationContext.Provider>
    )
}