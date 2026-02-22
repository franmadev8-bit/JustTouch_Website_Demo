import { ContextChildren } from '@/Models/Interfaces/ContextChildren';
import { IOrderContext } from '@/Models/Interfaces/IOrderContext';
import { Order } from '@/Models/Order';
import { OrderDetail } from '@/Models/OrderDetail';
import { OrderGroup } from '@/Models/OrderGroup';
import { db } from '@/Database/Database';
import { message } from 'antd';
import { createContext, FC, useContext, useState } from 'react';

const OrderContext = createContext<IOrderContext | undefined>(undefined);

export const useOrderContext = (): IOrderContext => {
    const context = useContext(OrderContext);
    if (!context) throw new Error('Order Context not provided!');
    return context;
}

// Datos de demo precargados usando los modelos reales
const seedGroups: Omit<OrderGroup, 'id'>[] = [
    {
        groupCode: 'GRP-001', state: 1, delivery: 'Av. Siempre Viva 742', phone: '11-4444-5555',
        subtotal: 1650, tip: 200, total: 1850,
        orders: [
            new Order({ orderCode: 'ORD-001', description: 'Sin cebolla', orderDetails: [new OrderDetail({ detailCode: 'DTL-001', productName: 'Pizza Mozzarella', quantity: 2 }), new OrderDetail({ detailCode: 'DTL-002', productName: 'Coca Cola', quantity: 1 })] }),
        ]
    },
    {
        groupCode: 'GRP-002', state: 1, delivery: 'Calle Falsa 123', phone: '11-3333-2222',
        subtotal: 1900, tip: 300, total: 2200,
        orders: [
            new Order({ orderCode: 'ORD-002', description: 'Término medio', orderDetails: [new OrderDetail({ detailCode: 'DTL-003', productName: 'Hamburguesa Completa', quantity: 2 }), new OrderDetail({ detailCode: 'DTL-004', productName: 'Papas Fritas', quantity: 1 })] }),
        ]
    },
    {
        groupCode: 'GRP-003', state: 2, delivery: 'Belgrano 456', phone: '11-7777-8888',
        subtotal: 880, tip: 100, total: 980,
        orders: [
            new Order({ orderCode: 'ORD-003', description: 'Extra salsa', orderDetails: [new OrderDetail({ detailCode: 'DTL-005', productName: 'Milanesa Napolitana', quantity: 1 }), new OrderDetail({ detailCode: 'DTL-006', productName: 'Agua Mineral', quantity: 2 })] }),
        ]
    },
    {
        groupCode: 'GRP-004', state: 2, delivery: 'San Martín 890', phone: '11-5555-1111',
        subtotal: 2800, tip: 300, total: 3100,
        orders: [
            new Order({ orderCode: 'ORD-004', description: '', orderDetails: [new OrderDetail({ detailCode: 'DTL-007', productName: 'Pizza Especial', quantity: 2 }), new OrderDetail({ detailCode: 'DTL-008', productName: 'Empanadas x6', quantity: 1 })] }),
        ]
    },
    {
        groupCode: 'GRP-005', state: 3, delivery: 'Rivadavia 321', phone: '11-9999-4444',
        subtotal: 1350, tip: 100, total: 1450,
        orders: [
            new Order({ orderCode: 'ORD-005', description: 'Sin wasabi', orderDetails: [new OrderDetail({ detailCode: 'DTL-009', productName: 'Sushi Roll x8', quantity: 1 })] }),
        ]
    },
    {
        groupCode: 'GRP-006', state: 3, delivery: 'Corrientes 777', phone: '11-2222-6666',
        subtotal: 660, tip: 100, total: 760,
        orders: [
            new Order({ orderCode: 'ORD-006', description: '', orderDetails: [new OrderDetail({ detailCode: 'DTL-010', productName: 'Tostado Mixto', quantity: 2 }), new OrderDetail({ detailCode: 'DTL-011', productName: 'Jugo de Naranja', quantity: 1 })] }),
        ]
    },
    {
        groupCode: 'GRP-007', state: 4, delivery: 'Libertad 555', phone: '11-8888-3333',
        subtotal: 2500, tip: 300, total: 2800,
        orders: [
            new Order({ orderCode: 'ORD-007', description: 'Punto jugoso', orderDetails: [new OrderDetail({ detailCode: 'DTL-012', productName: 'Asado para 2', quantity: 1 })] }),
        ]
    },
    {
        groupCode: 'GRP-008', state: 4, delivery: 'Tucumán 222', phone: '11-1111-7777',
        subtotal: 1000, tip: 100, total: 1100,
        orders: [
            new Order({ orderCode: 'ORD-008', description: '', orderDetails: [new OrderDetail({ detailCode: 'DTL-013', productName: 'Pasta Bolognesa', quantity: 1 }), new OrderDetail({ detailCode: 'DTL-014', productName: 'Ensalada César', quantity: 1 })] }),
        ]
    },
];

export const OrderProvider: FC<ContextChildren> = ({ children }) => {
    const [groups, setGroups] = useState<OrderGroup[]>([]);
    const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
    const [selectedGroup, setSelectedGroup] = useState<OrderGroup | null>(null);

    const GetOrders = async () => {
        if (groups.length > 0) return;

        setOrdersLoading(true);
        try {
            const existing = await db.orderGroups.count();

            if (existing === 0) {
                await db.orderGroups.bulkAdd(seedGroups as OrderGroup[]);
            }

            const all = await db.orderGroups.toArray();
            setGroups(all);
        } catch {
            message.error('Error al cargar los pedidos.');
        } finally {
            setOrdersLoading(false);
        }
    }

    const ChangeStatus = async (id: number, state: number) => {
        try {
            await db.orderGroups.update(id, { state });
            setGroups(prev => prev.map(g => g.id === id ? { ...g, state } : g));
            setSelectedGroup(prev => prev?.id === id ? { ...prev, state } : prev);
            message.success('Estado actualizado.');
        } catch {
            message.error('Error al actualizar el estado.');
        }
    }

    const SelectGroup = (group: OrderGroup | null) => setSelectedGroup(group);

    return (
        <OrderContext.Provider value={{
            groups, ordersLoading,
            selectedGroup,
            GetOrders, ChangeStatus, SelectGroup
        }}>
            {children}
        </OrderContext.Provider>
    )
}
