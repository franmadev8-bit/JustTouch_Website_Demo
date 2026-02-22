import { createBrowserRouter } from "react-router";
import { MainLayout } from "./Pages/MainLayout";
import { MenuInfo } from "./Pages/Menu/MenuInfo";
import { Menu } from "./Pages/Menu/Menu";
import { PublicMenu } from "./Pages/Menu/PublicMenu";
import { Account } from "./Pages/Account/Account";
import { SignIn } from "./Pages/Account/SignIn";
import { ServiceRequest } from "./Pages/Account/ServiceRequest";
import { EmailConfirmation } from './Pages/Account/EmailConfirmation';
import { Orders } from "./Pages/Orders/Orders";
import { GateKeeper } from "./Pages/GateKeeper";

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
