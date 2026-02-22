import { createBrowserRouter } from "react-router";
import { MainLayout } from "./src/Pages/MainLayout";
import { MenuInfo } from "./src/Pages/Menu/MenuInfo";
import { Menu } from "./src/Pages/Menu/Menu";
import { PublicMenu } from "./src/Pages/Menu/PublicMenu";
import { Account } from "./src/Pages/Account/Account";
import { SignIn } from "./src/Pages/Account/SignIn";
import { ServiceRequest } from "./src/Pages/Account/ServiceRequest";
import { EmailConfirmation } from './src/Pages/Account/EmailConfirmation';
import { Orders } from "./src/Pages/Orders/Orders";
import { GateKeeper } from "./src/Pages/GateKeeper";

export const router = createBrowserRouter([
    // ── Ruta pública del menú — sin autenticación ──────────────────────────
    {
        path: '/public/menu',
        element: <PublicMenu />,
    },

    // ── App protegida ──────────────────────────────────────────────────────
    {
        path: '/',
        element: <GateKeeper />,
        children: [
            { path: '/email-confirm/:email',             element: <EmailConfirmation /> },
            { path: '/service-request',                  element: <ServiceRequest /> },
            { path: '/sign-in',                          element: <SignIn /> },
            { path: '/account',                          element: <MainLayout withSide={false} Body={<Account />} /> },
            { path: '/orders',                           element: <MainLayout Body={<Orders />} /> },
            { path: '/menu',                             element: <MainLayout Body={<Menu />} /> },
            { path: '/menu/new/category',                element: <MainLayout Body={<MenuInfo />} /> },
            { path: '/menu/edit/category/:categoryCode', element: <MainLayout Body={<MenuInfo />} /> },
        ]
    }
]);
