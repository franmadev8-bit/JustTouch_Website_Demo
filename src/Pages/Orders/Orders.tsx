import { FC, useEffect } from "react";
import { Page } from "@/Pages/Page";
import { Button, Card, Col, Flex, Modal, Row, Tabs, Tag, Typography, Grid, Spin, Empty } from "antd";
import { OrderStatus } from "@/Models/Enums/OrderStatus";
import { OrderGroup } from "@/Models/OrderGroup";
import { useOrderContext } from "@/Context/OrderContext";
import './Orders.scss';
import { useApp } from "@/Hooks/AppHook";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const STATUS_LABELS: Record<number, string> = {
    [OrderStatus.Pending]: 'Pendientes',
    [OrderStatus.Proccess]: 'Tomadas',
    [OrderStatus.Delivery]: 'En camino',
    [OrderStatus.Done]: 'Listos',
};

const STATUS_COLORS: Record<number, string> = {
    [OrderStatus.Pending]: 'volcano',
    [OrderStatus.Proccess]: 'warning',
    [OrderStatus.Delivery]: 'purple',
    [OrderStatus.Done]: 'cyan',
};

const NEXT_STATUS: Record<number, { label: string; value: number } | null> = {
    [OrderStatus.Pending]: { label: 'Tomar', value: OrderStatus.Proccess },
    [OrderStatus.Proccess]: { label: 'En camino', value: OrderStatus.Delivery },
    [OrderStatus.Delivery]: { label: 'Listo', value: OrderStatus.Done },
    [OrderStatus.Done]: null,
};

export const Orders: FC = () => {
    const { GetOrders, ordersLoading } = useOrderContext();

    useEffect(() => {
        GetOrders();
    }, []);

    const tabItems = Object.entries(OrderStatus).map(([, value]) => ({
        label: STATUS_LABELS[value],
        key: String(value),
        children: <OrderTab status={value} />
    }));

    return (
        <Page HeadTitle="Pedidos"
            Actions={<></>}
            Body={
                <div className="orders">
                    {ordersLoading
                        ? <Flex justify="center" align="center" style={{ height: 300 }}><Spin size="large" /></Flex>
                        : <Tabs items={tabItems} />
                    }
                </div>
            } />
    )
}

interface OrderTabProps {
    status: number;
}

const OrderTab: FC<OrderTabProps> = ({ status }) => {
    const { groups, selectedGroup, SelectGroup } = useOrderContext();
    const filtered = groups.filter(g => g.state === status);
    const { sm, xs, md, lg, xl, xxl } = useBreakpoint();
    const isMobile = (xs || sm) && !md && !lg && !xl && !xxl;

    return (
        <div className="order-tab">
            {isMobile && selectedGroup && <DetailModal />}
            <Row style={{ gap: 10 }}>
                <Col xl={9} lg={11} md={9} sm={24} xs={24}>
                    <Card className="order-list">
                        {filtered.length === 0
                            ? <Empty description="No hay pedidos en este estado" style={{ padding: 20 }} />
                            : filtered.map(group => (
                                <GroupItem
                                    key={group.id}
                                    group={group}
                                    onSelect={() => isMobile
                                        ? SelectGroup(group)
                                        : SelectGroup(selectedGroup?.id === group.id ? null : group)
                                    }
                                    isSelected={selectedGroup?.id === group.id}
                                />
                            ))
                        }
                    </Card>
                </Col>
                <Col xl={9} lg={12} md={14} sm={0} xs={0}>
                    {selectedGroup && selectedGroup.state === status
                        ? <Detail group={selectedGroup} />
                        : <Card className="order-detail">
                            <Flex justify="center" align="center" style={{ height: 200 }}>
                                <Text type="secondary">Seleccioná un pedido para ver el detalle</Text>
                            </Flex>
                          </Card>
                    }
                </Col>
            </Row>
        </div>
    )
}

interface GroupItemProps {
    group: OrderGroup;
    onSelect: () => void;
    isSelected: boolean;
}

const GroupItem: FC<GroupItemProps> = ({ group, onSelect, isSelected }) => {
    const { isLarge } = useApp();
    const label = STATUS_LABELS[group.state];
    const singular = label?.endsWith('s') ? label.slice(0, -1) : label;

    // Contamos el total de productos del grupo
    const totalItems = group.orders.reduce((acc, o) =>
        acc + o.orderDetails.reduce((a, d) => a + (d.quantity ?? 1), 0), 0);

    return (
        <Flex
            className="order-item"
            onClick={onSelect}
            style={{
                padding: isLarge ? '15px 10px' : '10px 10px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#f0f9ff' : undefined
            }}>
            <Flex vertical gap={5}>
                <Text>Pedido: #{group.groupCode}</Text>
                <p>{group.phone} — {totalItems} producto{totalItems !== 1 ? 's' : ''}</p>
            </Flex>
            <div style={{ marginLeft: 'auto' }}>
                <Tag variant="solid" style={{ color: 'white' }} color={STATUS_COLORS[group.state]}>
                    {singular}
                </Tag>
            </div>
        </Flex>
    )
}

interface DetailProps {
    group: OrderGroup;
}

const Detail: FC<DetailProps> = ({ group }) => {
    const { ChangeStatus } = useOrderContext();
    const nextStatus = NEXT_STATUS[group.state];

    const totalItems = group.orders.reduce((acc, o) =>
        acc + o.orderDetails.reduce((a, d) => a + (d.quantity ?? 1), 0), 0);

    return (
        <Card className="order-detail">
            {/* Encabezado */}
            <Flex vertical gap={4} style={{ marginBottom: 16 }}>
                <Flex align="center" gap={8}>
                    <Tag color={STATUS_COLORS[group.state]} variant="solid" style={{ color: 'white', margin: 0 }}>
                        {STATUS_LABELS[group.state]}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>#{group.groupCode}</Text>
                </Flex>
                <Flex gap={20} wrap style={{ marginTop: 6 }}>
                    <p>📞 <b>{group.phone}</b></p>
                    <p>📍 <b>{group.delivery}</b></p>
                    <p>🛍️ <b>{totalItems} producto{totalItems !== 1 ? 's' : ''}</b></p>
                </Flex>
            </Flex>

            {/* Sub-órdenes */}
            <Flex vertical className="detail">
                {group.orders.map((order, i) => (
                    <Flex vertical className="detail-item" key={i} gap={8}>
                        {/* Cabecera de la sub-orden */}
                        <Flex align="center" justify="space-between">
                            <Text strong style={{ fontSize: 13 }}>Orden {i + 1}</Text>
                            {order.orderDetails.length > 0 && (
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    {order.orderDetails.reduce((a, d) => a + (d.quantity ?? 1), 0)} item{order.orderDetails.reduce((a, d) => a + (d.quantity ?? 1), 0) !== 1 ? 's' : ''}
                                </Text>
                            )}
                        </Flex>

                        {/* Nota de la sub-orden */}
                        {order.description ? (
                            <Flex className="detail-note" gap={6} align="flex-start">
                                <span style={{ fontSize: 13 }}>📝</span>
                                <Text italic style={{ fontSize: 13, color: '#888' }}>{order.description}</Text>
                            </Flex>
                        ) : (
                            <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>Sin nota</Text>
                        )}

                        {/* Productos */}
                        <Flex vertical gap={4}>
                            {order.orderDetails.map((detail, j) => (
                                <Flex key={j} justify="space-between" align="center" className="detail-product-row">
                                    <Flex align="center" gap={8}>
                                        <div className="detail-qty-badge">{detail.quantity ?? 1}</div>
                                        <Text style={{ fontSize: 13 }}>{detail.productName}</Text>
                                    </Flex>
                                </Flex>
                            ))}
                        </Flex>
                    </Flex>
                ))}
            </Flex>

            {/* Totales + acción */}
            <Flex vertical gap={10}>
                <Flex justify="space-between" wrap gap={5} className="detail-totals">
                    {group.subtotal != null && (
                        <Flex justify="space-between" style={{ width: '100%' }}>
                            <Text type="secondary">Subtotal</Text>
                            <Text strong>$ {group.subtotal}</Text>
                        </Flex>
                    )}
                    {group.tip != null && group.tip > 0 && (
                        <Flex justify="space-between" style={{ width: '100%' }}>
                            <Text type="secondary">Propina</Text>
                            <Text strong>$ {group.tip}</Text>
                        </Flex>
                    )}
                    {group.total != null && (
                        <Flex justify="space-between" style={{ width: '100%' }}>
                            <Text type="secondary" strong>Total</Text>
                            <Text strong style={{ fontSize: 15, color: '#1677ff' }}>$ {group.total}</Text>
                        </Flex>
                    )}
                </Flex>
                {nextStatus
                    ? <Button color="primary" size="middle" variant="filled"
                        onClick={() => ChangeStatus(group.id, nextStatus.value)}>
                        {nextStatus.label}
                      </Button>
                    : <Tag color="cyan" style={{ width: 'fit-content' }}>Pedido completado</Tag>
                }
            </Flex>
        </Card>
    )
}
const DetailModal: FC = () => {
    const { selectedGroup, SelectGroup } = useOrderContext();

    return (
        <Modal
            title={`Pedido #${selectedGroup?.groupCode}`}
            open={!!selectedGroup}
            onCancel={() => SelectGroup(null)}
            footer={null}>
            {selectedGroup && <Detail group={selectedGroup} />}
        </Modal>
    )
}
