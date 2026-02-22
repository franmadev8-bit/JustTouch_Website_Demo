import { db } from "@/Database/Database";
import { FC, useEffect, useState } from "react";
import Cookie from 'js-cookie';

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthenticationContext } from "@/Context/AuthenticationContext";
import { Loading } from "@/Components/Loading";

export const GateKeeper: FC = () => {
    const { DetectBranch } = useAuthenticationContext();
    const location = useLocation();

    const token = Cookie.get('JToken');

    const [loading, setLoading] = useState(true);
    const [redirect, setRedirect] = useState<string | null>(null);

    const checkAccess = async () => {
        const currentPath = location.pathname;

        // Sin token → rutas públicas o login
        if (!token) {
            if (
                currentPath.includes('/email-confirm') ||
                currentPath.includes('/service-request') ||
                currentPath === '/sign-in'
            ) {
                setRedirect(null);
                setLoading(false);
                return;
            }
            DetectBranch(false);
            setRedirect('/sign-in');
            setLoading(false);
            return;
        }

        const account = await db.authData.get(1);
        const user = await db.user.toCollection().first();
        const hasBranches = user?.franchises?.some(x => x.branches.length > 0) ?? false;

        // Tiene token pero no tiene sucursales → completar perfil
        if (!hasBranches && account?.BranchCode == null) {
            if (currentPath !== '/account') {
                setRedirect('/account');
            } else {
                setRedirect(null);
            }
            setLoading(false);
            return;
        }

        // Tiene sucursales pero no eligió ninguna → branch selector
        if (hasBranches && account?.BranchCode == null) {
            DetectBranch(true);
            if (currentPath !== '/sign-in') {
                setRedirect('/sign-in');
            } else {
                setRedirect(null);
            }
            setLoading(false);
            return;
        }

        // Todo OK → si está en "/" o en rutas de auth, mandar a /orders
        if (currentPath === '/' || currentPath === '/sign-in' || currentPath === '/service-request') {
            setRedirect('/orders');
            setLoading(false);
            return;
        }

        setRedirect(null);
        setLoading(false);
    }

    useEffect(() => {
        checkAccess();
    }, [token, location.pathname]);

    if (loading) return <Loading />;
    if (redirect) return <Navigate to={redirect} />;

    return <Outlet />;
}
