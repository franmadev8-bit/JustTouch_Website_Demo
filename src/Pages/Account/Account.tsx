import { CSSProperties, FC, useEffect } from "react";
import { Card, Input, Grid, Flex, Button, Typography, ConfigProvider, Tabs, Row, Col, Select, TimePicker, Space, Empty, Spin } from "antd";
import { Page } from "@/Pages/Page";
import { HeadActions } from "@/Components/HeadActions";
import { useApp } from "@/Hooks/AppHook";
import { FaRegSquarePlus, FaRegPenToSquare } from "react-icons/fa6";
import { Countries } from "@/Models/Enums/Countries";
import { DefaultOptionType } from "antd/es/select";
import { useAccount } from "@/Hooks/AccountHook";
import { useAccountContext } from "@/Context/AccountContext";
import { User } from "@/Models/User";
import { Franchise } from "@/Models/Franchise";
import { Branch } from "@/Models/Branch";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs from 'dayjs';
import { FranchiseModal } from "./Components/FranchiseModal";
import { ModalSocial } from "./Components/ModalSocial";
import { PictureModal } from "./Components/PictureModal";
import './Account.scss';

const { useBreakpoint } = Grid;
const { Text } = Typography;
const { RangePicker } = TimePicker;


export const Account: FC = () => {
    const { account, SaveChanges, GoBack, loadData, accountLoading } = useAccountContext();

    useEffect(() => {
        loadData();
    }, []);

    if (accountLoading) {
        return (
            <Flex justify="center" align="center" style={{ height: '60vh' }}>
                <Spin size="large" />
            </Flex>
        );
    }

    return (
        <Page HeadTitle="Editar perfil"
            Actions={<HeadActions Save={SaveChanges} Back={GoBack} />}
            Body={
                <div className="account">
                    <FranchiseModal />
                    <UserData user={account} />
                    <Franchises fr={account.franchises} />
                </div>
            } />
    )
}



interface user {
    user: User
}
const UserData: FC<user> = ({ user }) => {
    const { handleUser } = useAccount();
    const screens = useBreakpoint();
    const { isLarge, isMed } = useApp();

    const inputSize = isLarge ? 'large' : isMed ? 'middle' : 'middle';

    const min = screens.xl ? 300 : screens.md ? 250 : screens.sm ? 200 : screens.sm ? 150 : 100;
    const gridProps: CSSProperties = {
        display: 'grid',
        gap: isLarge ? 20 : isMed ? 10 : 7,
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`
    }

    return (
        <Card className="user-data" styles={{ body: gridProps }}>
            <div>
                <p>Nombre</p>
                <Input size={inputSize}
                    placeholder="Nombre..."
                    value={user.firstName}
                    onChange={e => handleUser('firstName', e.target.value)} />
            </div>
            <div>
                <p>Apellido</p>
                <Input size={inputSize}
                    placeholder="Apellido..."
                    value={user.lastName}
                    onChange={e => handleUser('lastName', e.target.value)} />
            </div>
            <div>
                <p>Usuario</p>
                <Input size={inputSize}
                    placeholder="Usuario..."
                    value={user.userName}
                    onChange={e => handleUser('userName', e.target.value)} />
            </div>
            <div>
                <p>Telefono</p>
                <Input size={inputSize}
                    placeholder="Telefono..."
                    value={user.phone}
                    onChange={e => handleUser('phone', e.target.value)} />
            </div>
            <div>
                <p>Email</p>
                <Input size={inputSize}
                    placeholder="Email..."
                    value={user.email}
                    disabled
                    onChange={e => handleUser('email', e.target.value)} />
            </div>
            <div>
                <p>Contraseña</p>
                <Input.Password size={inputSize}
                    placeholder="Contraseña..."
                    value={user.password}
                    onChange={e => handleUser('password', e.target.value)} />
            </div>
            <div>
                <p>Repetir Contraseña</p>
                <Input.Password size={inputSize}
                    placeholder="Repetir..."
                    value={user.repeat}
                    onChange={e => handleUser('repeat', e.target.value)} />
            </div>
        </Card>
    )
}


interface franchises {
    fr: Franchise[]
}
const Franchises: FC<franchises> = ({ fr }) => {
    const { openModal, pickFranchise } = useAccountContext();

    const items = fr.map((item, i) => {
        return ({
            label:
                <Flex align="center" gap={10} onClick={(() => {
                    const index = i;
                    pickFranchise(index);
                })}>
                    <p style={{ margin: 0 }}>{item.fantasyName}</p>
                    <Button color="orange" size="small" variant="filled" onClick={(() => {
                        const index = i;
                        return () => openModal('franchise', index);
                    })()}><p style={{ margin: 0 }}><FaRegPenToSquare /></p></Button>
                </Flex>,
            children: <BranchList br={item.branches} index={(() => {
                const index = i;
                return index;
            })()} />,
            key: String(i)
        })
    })

    return (
        <Card className="franchises">
            <ConfigProvider theme={{ components: { Typography: { fontSize: 17 } } }}>
                <Flex align="center">
                    <Text>Negocios</Text>
                    <Button onClick={() => openModal('franchise')} size="middle" color="cyan" variant="filled">
                        <FaRegSquarePlus />
                        <p>Agregar negocio</p>
                    </Button>
                </Flex>
            </ConfigProvider>
            {fr.length > 0 ?
                <Tabs defaultActiveKey="1"
                    items={items} />
                :
                <Empty description="No hay negocios registrados" />
            }

        </Card>
    )
}


interface branches {
    br: Branch[],
    index: number,
}
const BranchList: FC<branches> = ({ br, index }) => {
    const { pushBranch } = useAccount();

    return (
        <Flex vertical className="branch-list" gap={40}>
            {
                br.length > 0 ?
                    br.map((item, i) => <BranchItem key={i} br={item} fkey={index} bkey={i} />)
                    :
                    <Empty style={{ margin: 'auto' }} description="No hay sucursales registradas para este negocio" />
            }
            <Button onClick={() => pushBranch(index)} size="middle" color="primary" variant="filled">
                <FaRegSquarePlus />
                <p>Agregar sucursal</p>
            </Button>
        </Flex>
    )
}


interface branch {
    br: Branch,
    fkey: number,
    bkey: number
}
const BranchItem: FC<branch> = ({ br, fkey, bkey }) => {
    const { handleBranch, removeBranch } = useAccount();
    const { openModal } = useAccountContext();
    const options: DefaultOptionType[] = Array.from(Object.entries(Countries).map((x) => {
        return { label: x[1], value: x[0] }
    }))

    const handleHour: RangePickerProps['onChange'] = (_, dateStrings) => {
        handleBranch('openTime', dateStrings != null ? dateStrings[0] : '', fkey, bkey);
        handleBranch('closeTime', dateStrings != null ? dateStrings[1] : '', fkey, bkey);
    };

    const toTime = (time?: string | null): dayjs.Dayjs | null => {
        if (!time) return null;
        const d = dayjs(`2000-01-01 ${time}`, 'YYYY-MM-DD HH:mm', true);
        return d.isValid() ? d : null;
    };

    const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
        toTime(br.openTime),
        toTime(br.closeTime)
    ];

    return (
        <div className="branch-item">
            <ModalSocial />
            <PictureModal />
            <Button color="red"
                variant="filled"
                size="small"
                onClick={() => removeBranch(fkey, bkey)}
                style={{ marginBottom: 10 }}><p>Quitar</p></Button>
            <Row style={{ gap: 10 }}>
                <Col xl={5} lg={5} md={5} sm={12} xs={24}>
                    <Select defaultValue="AR"
                        options={options}
                        value={br.country || "AR"}
                        onChange={e => handleBranch('country', e, fkey, bkey)} />
                </Col>
                <Col xl={5} lg={5} md={5} sm={11} xs={24}>
                    <Input placeholder="Provincia o estado..."
                        value={br.provinceOrState}
                        onChange={e => handleBranch('provinceOrState', e.target.value, fkey, bkey)} />
                </Col>
                <Col xl={5} lg={5} md={6} sm={12} xs={24}>
                    <Input placeholder="Ciudad..."
                        value={br.city}
                        onChange={e => handleBranch('city', e.target.value, fkey, bkey)} />
                </Col>
                <Col xl={5} lg={5} md={6} sm={11} xs={24}>
                    <Input placeholder="Direccion..."
                        value={br.address}
                        onChange={e => handleBranch('address', e.target.value, fkey, bkey)} />
                </Col>
            </Row>
            <Row style={{ gap: 10, marginTop: 10 }}>
                <Col xl={5} lg={5} md={5} sm={12} xs={24}>
                    <Input placeholder="Codigo Postal..."
                        value={br.postalCode}
                        onChange={e => handleBranch('postalCode', e.target.value, fkey, bkey)} />
                </Col>
                <Col xl={5} lg={5} md={5} sm={11} xs={24}>
                    <Input placeholder="Email (Opcional)..."
                        value={br.email}
                        onChange={e => handleBranch('email', e.target.value, fkey, bkey)} />
                </Col>
                <Col xl={5} lg={5} md={12} sm={12} xs={24}>
                    <RangePicker showSecond={false}
                        variant="outlined"
                        value={range}
                        placeholder={['Abierto', 'Cerrado']}
                        onChange={handleHour} />
                </Col>
                <Col xl={5} lg={5} md={5} sm={11} xs={24}>
                    <Space>
                        <Button onClick={() => openModal('picture', fkey, bkey)} color="primary" variant="filled"><p>Portada</p></Button>
                        <Button onClick={() => openModal('social', fkey, bkey)} color="primary" variant="filled"><p>Contactos</p></Button>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}
