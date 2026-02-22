import { FC, useEffect } from "react";
import { Button, Card, ConfigProvider, Flex, Input, Typography, Space, Row, Col, Spin } from "antd";
import { Page } from "@/Pages/Page";
import { useApp } from "@/Hooks/AppHook";
import { UploadPictureCard } from "@/Components/UploadPictureCard";
import { useFramerMotion } from "@/Hooks/MotionHook";
import { FaRegFloppyDisk, FaArrowLeftLong, FaRegSquarePlus } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router";
import { motion } from 'framer-motion';
import './Menu.scss';
import { useMenu } from "@/Hooks/MenuHook";
import { Product } from "@/Models/Product";
import { useMenuContext } from "@/Context/MenuContext";

const { Text } = Typography;
const { TextArea } = Input;

export const MenuInfo: FC = () => {
    const { categoryCode } = useParams();
    const { AddCategory, LoadCategory, ResetCategory, isMenuLoading } = useMenuContext();
    const { category, handleCategory, pushProduct } = useMenu();
    const { bounceIn, fadeRight, fadeLeft } = useFramerMotion();

    const navigate = useNavigate();
    const { isLarge, isMed } = useApp();
    const sizeButton = isLarge ? "large" : isMed ? "middle" : "small";

    useEffect(() => {
        if (categoryCode) {
            // Modo edición: cargar datos existentes
            LoadCategory(categoryCode);
        } else {
            // Modo nuevo: resetear el estado
            ResetCategory();
        }
    }, [categoryCode]);

    const handleBack = () => {
        ResetCategory();
        navigate('/menu');
    };

    if (isMenuLoading) {
        return (
            <Flex justify="center" align="center" style={{ height: '60vh' }}>
                <Spin size="large" />
            </Flex>
        );
    }

    return (
        <Page HeadTitle={categoryCode != undefined ? 'Editar categoria' : 'Añadir categoria'}
            className="menu-info"
            Actions={
                <Space className="actions">
                    <Button className="btn-back" size={sizeButton} icon={<FaArrowLeftLong />}
                        variant="outlined" onClick={handleBack}>Volver</Button>
                    <Button className="btn-save" size={sizeButton} icon={<FaRegFloppyDisk />} color="primary"
                        variant="solid" onClick={AddCategory}>Guardar</Button>
                </Space>
            }
            Body={
                <ConfigProvider theme={{
                    components: {
                        Typography: {
                            fontSize: isLarge ? 17 : 15,
                            colorText: 'gray',
                        }
                    },
                }}>
                    <motion.div variants={bounceIn} initial="hidden" animate="show" exit="exit">
                        <Card className="info-category">
                            <Flex vertical gap={20}>
                                <motion.div variants={fadeRight} custom={.3} initial="hidden" animate="show" exit="exit">
                                    <Flex style={{ width: isLarge ? '20vw' : '100%' }} vertical gap={10}>
                                        <Text>Categoria</Text>
                                        <Input placeholder="Categoria..."
                                            value={category.category}
                                            onChange={e => handleCategory('category', e.target.value)} />
                                    </Flex>
                                </motion.div>

                                <motion.div variants={fadeLeft} custom={.5} initial="hidden" animate="show" exit="exit">
                                    <Flex vertical gap={25} className="info-products">
                                        <Text>Productos</Text>
                                        <Flex vertical className="info-list" gap={20} style={{ maxHeight: isLarge ? 430 : isMed ? 350 : 330 }}>
                                            {category.products.map((x, i) => (
                                                <ProductItem prod={x} index={i} key={i} />
                                            ))}
                                            <Row>
                                                <Col xxl={2}>
                                                    <Button variant="filled" onClick={pushProduct} style={{ border: 'none', color: '#00A8E8' }}>
                                                        <FaRegSquarePlus /> <p>Añadir plato</p>
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Flex>
                                    </Flex>
                                </motion.div>
                            </Flex>
                        </Card>
                    </motion.div>
                </ConfigProvider>
            } />
    )
}

interface ProdProps {
    prod: Product;
    index: number;
}

const ProductItem: FC<ProdProps> = ({ prod, index }) => {
    const { handleProduct, handleImage, remoteProduct } = useMenu();

    const handlePrice = (value: string) => {
        const regex = /^$|^\d+([.,]\d{0,2})?$/;
        if (!regex.test(value)) return;
        handleProduct(index, 'price', value);
    }

    return (
        <div className="product-item">
            <Button size="small" color="red" variant="filled" onClick={() => remoteProduct(index)}>Quitar</Button>
            <Row style={{ gap: 10, marginTop: 5 }}>
                <Col lg={6} md={7} sm={12} xs={24}>
                    <Input placeholder="Nombre..."
                        value={prod.name}
                        onChange={e => handleProduct(index, 'name', e.target.value)} />
                </Col>
                <Col lg={6} md={7} sm={11} xs={24}>
                    <Input placeholder="Precio..."
                        onChange={e => handlePrice(e.target.value)}
                        value={prod.price} />
                </Col>
            </Row>
            <Row style={{ gap: 10, marginTop: 10 }}>
                <Col xl={10} lg={10} md={11} sm={19} xs={17}>
                    <TextArea placeholder="Descripción..."
                        onChange={e => handleProduct(index, 'description', e.target.value)}
                        value={prod.description} />
                </Col>
                <Col xl={2} lg={2} md={3} sm={4} xs={6}>
                    <UploadPictureCard
                        value={prod.image}
                        change={e => handleImage(index, e)} />
                </Col>
            </Row>
        </div>
    )
}
