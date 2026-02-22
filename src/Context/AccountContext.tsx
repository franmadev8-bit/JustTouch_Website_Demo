import { db } from '@/Database/Database';
import { Validator } from '@/Helpers/Validator';
import { ContextChildren } from '@/Models/Interfaces/ContextChildren';
import { IAccountContext } from '@/Models/Interfaces/IAccountContext';
import { User } from '@/Models/User';
import { message } from 'antd';
import { createContext, FC, useContext, useState } from 'react';

const AccountContext = createContext<IAccountContext | undefined>(undefined);

export const useAccountContext = (): IAccountContext => {
    const context = useContext(AccountContext);
    if (!context) throw new Error('account context not provided!');
    return context;
}

export const AccountProvider: FC<ContextChildren> = ({ children }) => {
    const [account, setAccount] = useState<User>(new User());

    const [selectedFranchise, setSelectedFranchise] = useState<number | undefined>(undefined);
    const [selectedBranch, setSelectedBranch] = useState<number | undefined>(undefined);

    const [accountLoading, setAccountLoading] = useState<boolean>(false);
    const [franchiseModal, setFranchiseModal] = useState<boolean>(false);
    const [socialModal, setSocialModal] = useState<boolean>(false);
    const [pictureModal, setPictureModal] = useState<boolean>(false);

    const validator = Validator.getInstance();

    const handler = (callback: (prev: User) => User) => setAccount(callback);

    const pickFranchise = (index: number) => setSelectedFranchise(index);

    const openModal = (type: 'franchise' | 'social' | 'picture', findex?: number, bindex?: number) => {
        setSelectedFranchise(findex);
        setSelectedBranch(bindex);

        if (type == 'franchise') setFranchiseModal(true);
        if (type == 'social') setSocialModal(true);
        if (type == 'picture') setPictureModal(true);
    }

    const closeModal = (type: 'franchise' | 'social' | 'picture') => {
        setSelectedFranchise(undefined);
        setSelectedBranch(undefined);

        if (type == 'franchise') setFranchiseModal(false);
        if (type == 'social') setSocialModal(false);
        if (type == 'picture') setPictureModal(false);
    }

    const SaveChanges = async () => {
        const valid = validator.AccountValidator(account);
        if (!valid) return;

        setAccountLoading(true);
        try {
            const existing = await db.user.where('email').equals(account.email).first();
            if (existing) {
                await db.user.update(existing.id, { ...account, id: existing.id });
            } else {
                await db.user.add({ ...account, id: 0 });
            }
            message.success('Cambios guardados correctamente.');
        } catch {
            message.error('Error al guardar los cambios.');
        } finally {
            setAccountLoading(false);
        }
    }

    const GoBack = async () => {
        // 1. Obtener sucursales del usuario actual
        const user = await db.user.toCollection().first();
        const hasBranches = user?.franchises?.some(f => f.branches && f.branches.length > 0) ?? false;

        // 2. Sin sucursales cargadas — no puede avanzar ni retroceder
        if (!hasBranches) {
            message.warning('Necesitás cargar al menos una sucursal antes de continuar.');
            return;
        }

        // 3. Hay sucursales pero no hay una seleccionada — ir al selector
        const authData = await db.authData.get(1);
        if (!authData?.BranchCode) {
            window.location.href = '/sign-in';
            return;
        }

        // 4. Hay sucursal seleccionada — ir a la app
        window.location.href = '/orders';
    }

    const loadData = async () => {
        setAccountLoading(true);
        try {
            const stored = await db.user.toCollection().first();
            if (stored) {
                // La contraseña va en password y repeat para que los campos queden pre-cargados
                setAccount({ ...stored, repeat: stored.password, accountKey: 'aDFfdsa789' });
            }
        } catch {
            message.error('Error al cargar los datos de la cuenta.');
        } finally {
            setAccountLoading(false);
        }
    }

    return (
        <AccountContext.Provider value={{
            loadData, accountLoading,
            SaveChanges, GoBack,
            handler, account,
            pickFranchise, selectedFranchise, selectedBranch,
            openModal, closeModal, franchiseModal, socialModal, pictureModal
        }}>
            {children}
        </AccountContext.Provider>
    )
}
