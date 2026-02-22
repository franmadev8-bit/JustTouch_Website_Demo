import { FC, ReactNode } from "react";
import { Button, Dropdown, Layout, Menu, Typography, Image, Grid, Drawer, Flex, ConfigProvider, Divider, MenuProps } from "antd";
import { FaAngleLeft, FaBars, FaBowlRice, FaPowerOff, FaRegCircleUser, FaStore } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { useApp } from "@/Hooks/AppHook";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { useMenuContext } from "@/Context/MenuContext";
import { Loading } from "@/Components/Loading";
import { useAccountContext } from "@/Context/AccountContext";
import './MainLayout.scss';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const { useBreakpoint } = Grid;

interface Props {
    Body: ReactNode,
    withSide?: boolean,
}




export const MainLayout: FC<Props> = ({ Body, withSide = true }) => {
    const navigate = useNavigate();
    const { isMenuLoading } = useMenuContext();
    const { accountLoading } = useAccountContext();
    const screens = useBreakpoint();
    const { collapsed, changeCollaped } = useApp();
    const sideItems: ItemType<MenuItemType>[] | undefined = [
        {
            className: 'sider-item',
            key: '1',
            icon: <FaStore />,
            onClick: () => navigate('/orders'),
            label: 'Pedidos',
        },
        {
            className: 'sider-item',
            key: '2',
            icon: <FaBowlRice />,
            onClick: () => navigate('/menu'),
            label: 'Menu',
        }
    ]

    const items: MenuProps['items'] = [
        {
            key: '1',
            icon: <FaRegCircleUser />,
            onClick: () => navigate('/account'),
            label: (<a>Cuenta</a>),
        },
        {
            key: '2',
            icon: <FaPowerOff />,
            onClick: () => navigate('/sign-in'),
            label: (<a>Cerrar sesión</a>),
        },
    ];

    return (
        <Layout className="main-layout">
            {isMenuLoading || accountLoading ? <Loading /> : null}
            {withSide ?
                screens.xxl || screens.xl || screens.lg ?
                    <Sider className="layout-sider" width={300} trigger={null} collapsible collapsed={collapsed}>
                        <Flex className="side-header" justify="center">
                            <Image preview={false}
                                width={55}
                                src="https://dvvlhkouasxqzmaxkvll.supabase.co/storage/v1/object/public/footages/JustTouchLogo.png" />
                        </Flex>
                        <Divider className="divider" />
                        <Menu mode="inline" defaultSelectedKeys={['1']} items={sideItems} />
                    </Sider>
                    :
                    <Drawer className="floating-sider"
                        title={
                            <Flex align="center" gap={20}>
                                <Button icon={<FaAngleLeft />}
                                    onClick={() => changeCollaped()}
                                    style={{ backgroundColor: 'inherit', border: 'none', color: 'white', fontSize: 20 }} />
                                <Image preview={false}
                                    width={70}
                                    src="https://dvvlhkouasxqzmaxkvll.supabase.co/storage/v1/object/public/footages/JustTouchLogo.png" />
                            </Flex>
                        }
                        placement={'left'}
                        closable={false}
                        open={collapsed}
                        onClose={changeCollaped}
                        size={256}>
                        <Menu mode="inline" defaultSelectedKeys={['1']} items={sideItems} />
                    </Drawer>
                : null}
            {/* ====================================================================================================================== */}
            <Layout>
                <ConfigProvider theme={{
                    token: {
                        fontSize: screens.xxl || screens.xl || screens.lg ? 17 : 15
                    }
                }}>
                    <Header className="layout-header">
                        {withSide ? <Button size="large" type="text" icon={<FaBars />} onClick={changeCollaped} /> : null}
                        <Text>Just Touch</Text>
                        <Dropdown menu={{ items }}
                            styles={{ itemContent: { color: 'gray' }, itemIcon: { color: 'gray' } }}
                            placement="bottomRight">
                            <Button size="large"
                                style={{ fontSize: screens.xxl || screens.xl || screens.lg ? 17 : 15 }}
                                icon={<FaRegCircleUser />}
                                variant="solid">Usuario</Button>
                        </Dropdown>
                    </Header>
                </ConfigProvider>
                <Content className="layout-content">
                    {Body}
                </Content>
            </Layout>
        </Layout>
    )
}