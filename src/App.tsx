import { RouterProvider } from 'react-router';
import { router } from './Routes';
import { AppProvider } from '@/Context/AppContext';
import { AutheticationProvider } from '@/Context/AuthenticationContext';
import { MenuProvider } from '@/Context/MenuContext';
import { AccountProvider } from './Context/AccountContext';
import { OrderProvider } from './Context/OrderContext';


function App() {
  return (
    <AppProvider>
      <AccountProvider>
        <AutheticationProvider>
          <MenuProvider>
            <OrderProvider>
              <RouterProvider router={router} />
            </OrderProvider>
          </MenuProvider>
        </AutheticationProvider>
      </AccountProvider>
    </AppProvider>
  )
}

export default App
