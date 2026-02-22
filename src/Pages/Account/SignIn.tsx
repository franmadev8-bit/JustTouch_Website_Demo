import { Button, Card, Col, Flex, Input, Row, Typography, Image, Select } from "antd";
import { ChangeEvent, FC, useEffect, useState } from "react";
import logo from '@/Public/JustTouch.svg';
import { useApp } from "@/Hooks/AppHook";
import { useFramerMotion } from "@/Hooks/MotionHook";
import { motion } from 'framer-motion';
import { useAuthenticationContext } from "@/Context/AuthenticationContext";
import './Account.scss';
import { User } from "@/Models/User";
import { db } from "@/Database/Database";
import { message } from "antd";
import { useNavigate } from "react-router";

const { Text, Title, Link } = Typography;


export const SignIn: FC = () => {
    const { branchSelector } = useAuthenticationContext();
    const { bounceIn } = useFramerMotion();
    const { isLarge } = useApp();

    return (
        <div className="sign-in-container">
            <Row>
                <Col xxl={{ span: 6, offset: 9 }}
                    xl={{ span: 10, offset: 7 }}
                    lg={{ span: 16, offset: 4 }}
                    md={{ span: 16, offset: 4 }}
                    sm={{ span: 16, offset: 4 }}
                    xs={{ span: 20, offset: 2 }}>
                    <motion.div variants={bounceIn} initial="hidden" animate="show" exit="exit">
                        <Card className="sign-in" title={
                            <motion.div variants={bounceIn} custom={.15} initial="hidden" animate="show" exit="exit">
                                <div className="sign-in-header">
                                    <Image src={logo} style={{ width: isLarge ? 150 : 100 }} />
                                    <Title level={3} style={{ margin: 0, textAlign: 'center', color: 'gray' }}>¡Bienvenid@!</Title>
                                </div>
                            </motion.div>
                        }>
                            {!branchSelector ? <SignInForm /> : < BranchSelector />}
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </div>
    )
}

const SignInForm: FC = () => {
    const navigate = useNavigate();
    const { fadeUp } = useFramerMotion();
    const { signingIn, SignIn } = useAuthenticationContext();
    const [user, setUser] = useState<User>(new User());

    const handleUser = (e: ChangeEvent<HTMLInputElement>) => {
        var value = e.target.value;
        setUser(prev => {
            return { ...prev, email: value }
        })
    }

    const handlePassword = (e: ChangeEvent<HTMLInputElement>) => {
        var value = e.target.value;
        setUser(prev => {
            return { ...prev, password: value }
        })
    }

    return (
        <>
            <Flex vertical gap={20}>
                <motion.div variants={fadeUp} custom={.3} initial="hidden" animate="show" exit="exit">
                    <Flex vertical gap={5}>
                        <Text>Email</Text>
                        <Input value={user.email} onChange={handleUser} placeholder="E-mail..." />
                    </Flex>
                </motion.div>
                <motion.div variants={fadeUp} custom={.45} initial="hidden" animate="show" exit="exit">
                    <Flex vertical gap={5}>
                        <Text>Contraseña</Text>
                        <Input value={user.password} onChange={handlePassword} placeholder="Contraseña..." type={'password'} />
                    </Flex>
                </motion.div>
                <motion.div variants={fadeUp} custom={.6} initial="hidden" animate="show" exit="exit">
                    <Button onClick={() => SignIn(user)}
                        loading={signingIn}
                        style={{ backgroundColor: '#00A8E8', color: 'white', width: '100%' }}
                        variant="solid"><p>Ingresar</p></Button>
                </motion.div>
                <motion.div variants={fadeUp} custom={.6} initial="hidden" animate="show" exit="exit">
                    <p style={{ margin: 0, textAlign: 'center' }}>Si no eres cliente, solicita tu servicio <Link onClick={()=> navigate('/service-request')}>Aqui.</Link> </p>
                </motion.div>
            </Flex>
        </>
    )
}

const BranchSelector: FC = () => {
    const { fadeUp } = useFramerMotion();
    const [franchises, setFranchises] = useState<{ idx: number; fantasyName: string; branches: { branchCode: string; label: string }[] }[]>([]);
    const [selectedFranchiseIdx, setSelectedFranchiseIdx] = useState<number | undefined>(undefined);
    const [selectedBranchCode, setSelectedBranchCode] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            const user = await db.user.toCollection().first();
            if (user?.franchises) {
                const mapped = user.franchises
                    .filter(f => f.branches && f.branches.length > 0)
                    .map((f, i) => ({
                        idx: i,
                        fantasyName: f.fantasyName,
                        branches: f.branches.map(b => ({
                            branchCode: b.branchCode,
                            label: `${b.city}, ${b.address}`
                        }))
                    }));
                setFranchises(mapped);
                // Auto-seleccionar si hay una sola opción
                if (mapped.length === 1) {
                    setSelectedFranchiseIdx(0);
                    if (mapped[0].branches.length === 1) {
                        setSelectedBranchCode(mapped[0].branches[0].branchCode);
                    }
                }
            }
        };
        load();
    }, []);

    const franchiseOptions = franchises.map((f, i) => ({ value: i, label: f.fantasyName }));
    const branchOptions = selectedFranchiseIdx !== undefined
        ? franchises[selectedFranchiseIdx]?.branches.map(b => ({ value: b.branchCode, label: b.label })) ?? []
        : [];

    const handleFranchiseChange = (idx: number) => {
        setSelectedFranchiseIdx(idx);
        setSelectedBranchCode(undefined);
    };

    const handleConfirm = async () => {
        if (!selectedBranchCode) {
            message.warning('Seleccioná una sucursal para continuar.');
            return;
        }
        setLoading(true);
        try {
            const authData = await db.authData.get(1);
            await db.authData.put({ ...authData, id: 1, BranchCode: selectedBranchCode });
            window.location.href = '/orders';
        } catch {
            message.error('Error al guardar la sucursal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Flex vertical gap={20}>
                <motion.div variants={fadeUp} custom={.3} initial="hidden" animate="show" exit="exit">
                    <Flex vertical gap={5}>
                        <Text>Negocio</Text>
                        <Select
                            placeholder="Seleccioná un negocio..."
                            options={franchiseOptions}
                            value={selectedFranchiseIdx}
                            onChange={handleFranchiseChange}
                            style={{ width: '100%' }}
                        />
                    </Flex>
                </motion.div>
                <motion.div variants={fadeUp} custom={.45} initial="hidden" animate="show" exit="exit">
                    <Flex vertical gap={5}>
                        <Text>Sucursal</Text>
                        <Select
                            placeholder="Seleccioná una sucursal..."
                            options={branchOptions}
                            value={selectedBranchCode}
                            onChange={setSelectedBranchCode}
                            disabled={selectedFranchiseIdx === undefined}
                            style={{ width: '100%' }}
                        />
                    </Flex>
                </motion.div>
                <motion.div variants={fadeUp} custom={.6} initial="hidden" animate="show" exit="exit">
                    <Button
                        loading={loading}
                        onClick={handleConfirm}
                        style={{ backgroundColor: '#00A8E8', color: 'white', width: '100%' }}
                        variant="solid"><p>Ingresar</p></Button>
                </motion.div>
            </Flex>
        </>
    )
}
