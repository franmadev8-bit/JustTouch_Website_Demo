import { Button, Card, Col, 
    // ConfigProvider, Divider, 
    Flex, Image, Input, Row, Typography } from "antd";
import { FC } from "react";
import logo from '@/Public/JustTouch.svg';
import { useApp } from "@/Hooks/AppHook";
import { useFramerMotion } from "@/Hooks/MotionHook";
import { motion } from 'framer-motion';
import { useAuthenticationContext } from "@/Context/AuthenticationContext";
// import { useNavigate } from "react-router";
const { 
    // Text, 
    Title } = Typography;

export const ServiceRequest: FC = () => {
    const {  } = useAuthenticationContext();

    return (
        <div className="service-request">
           <ServiceRequestForm />
            {/* {true ?  : <EmailSendedNotification />} */}
        </div>
    )
}

const ServiceRequestForm: FC = () => {
    const { isLarge } = useApp();
    const { bounceIn, fadeUp } = useFramerMotion();
    const {user,handleUser,  RequestService, requesting } = useAuthenticationContext();
  
    return (
        <Row>
            <Col xxl={{ span: 6, offset: 9 }}
                xl={{ span: 8, offset: 8 }}
                lg={{ span: 12, offset: 6 }}
                md={{ span: 14, offset: 5 }}
                sm={{ span: 16, offset: 4 }}
                xs={{ span: 20, offset: 2 }}>

                <motion.div variants={bounceIn} initial="hidden" animate="show" exit="exit">
                    <Card className="service-request-form" title={
                        <motion.div variants={bounceIn} custom={.2} initial="hidden" animate="show" exit="exit">
                            <div className="service-request-header">
                                <Image src={logo} style={{ width: isLarge ? 100 : 100 }} />
                                <Title level={3} style={{ margin: 0, textAlign: 'center', color: 'gray' }}>Solicitud de servicio</Title>
                            </div>
                        </motion.div>
                    }>
                        <Flex vertical gap={20}>
                            <motion.div variants={fadeUp} custom={.3} initial="hidden" animate="show" exit="exit">
                                <Input placeholder="E-mail..."
                                    value={user.email}
                                    onChange={e => handleUser('email', e.target.value)} />
                            </motion.div>
                            <motion.div variants={fadeUp} custom={.45} initial="hidden" animate="show" exit="exit">
                                <Input.Password placeholder="Contraseña..."
                                    value={user.password}
                                    onChange={e => handleUser('password', e.target.value)} />
                            </motion.div>
                            <motion.div variants={fadeUp} custom={.6} initial="hidden" animate="show" exit="exit">
                                <Button onClick={RequestService} loading={requesting} style={{ backgroundColor: '#00A8E8' }} color={'green'} variant="solid">Solicitar</Button>
                            </motion.div>
                        </Flex>
                    </Card>
                </motion.div>
            </Col>
        </Row>
    )
}

// const EmailSendedNotification: FC = () => {
//     const { isLarge } = useApp();
//     const { fadeUp } = useFramerMotion();
//     const { user } = useAuthenticationContext();
//     const navigation = useNavigate();


//     return (
//         <ConfigProvider theme={{
//             components: {
//                 Typography: {
//                     fontSizeHeading1: isLarge ? 50 : 30,
//                     fontSize: isLarge ? 20 : 15
//                 }
//             }
//         }}>
//             <motion.div variants={fadeUp} custom={.6} initial="hidden" animate="show" exit="exit">
//                 <Flex vertical align="center" className="email-notification">
//                     <Title level={1}>¡Una cosa mas!</Title>
//                     <Divider style={{ backgroundColor: 'white' }} />
//                     <Text>Te hemos enviado un email para que confirmes tu direccion de correo.</Text>
//                     <Text>Revisa tu casilla de correo <b>{user.email}</b> para continuar.</Text>
//                     <Button color="blue" variant="solid"
//                         style={{ marginTop: 50 }}
//                         onClick={() => navigation('/sign-in')}>Volver al inicio</Button>
//                 </Flex>
//             </motion.div>
//         </ConfigProvider>
//     )
// }