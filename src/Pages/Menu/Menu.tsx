import { FC, useEffect, useState } from "react";
import { Page } from "@/Pages/Page";
import { Button, Checkbox, Flex, Tag, Divider, Empty, Spin, Popconfirm, Space } from "antd";
import { FaRegSquarePlus, FaRegRectangleXmark, FaRegPenToSquare, FaEye } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { motion } from 'framer-motion';
import { useFramerMotion } from "../../Hooks/MotionHook";
import { useApp } from "@/Hooks/AppHook";
import './Menu.scss';
import { useMenuContext } from "@/Context/MenuContext";
import { Category } from "@/Models/Category";
import { Product } from "@/Models/Product";


export const Menu: FC = () => {
    const { GetMenu, menu, isMenuLoading } = useMenuContext();
    const navigate = useNavigate();
    const { fadeUp } = useFramerMotion();
    const { isLarge, isMed } = useApp();

    const sizeButton = isLarge ? "large" : isMed ? "middle" : "small";

    useEffect(() => {
        GetMenu();
    }, []);

    return (
        <Page HeadTitle="Menu"
            className="menu"
            Actions={
                <Space>
                    <Button
                        variant="outlined"
                        size={sizeButton}
                        icon={<FaEye />}
                        onClick={() => window.open('/public/menu', '_blank')}>
                        Ver menú público
                    </Button>
                    <Button color="cyan"
                        variant="solid"
                        size={sizeButton}
                        icon={<FaRegSquarePlus />}
                        onClick={() => navigate('/menu/new/category')}>Añadir</Button>
                </Space>
            }
            Body={
                <div>
                    {isMenuLoading
                        ? <Flex justify="center" align="center" style={{ height: 300 }}><Spin size="large" /></Flex>
                        : menu?.categories.length > 0
                            ? <Catalogs Items={menu.categories} />
                            : <motion.div custom={.2} variants={fadeUp} initial="hidden" animate="show" exit="exit">
                                <Empty description="Aun no hay productos en el menu" />
                              </motion.div>
                    }
                </div>
            } />
    )
}


interface CatalogsProps {
    Items: Category[]
}
const Catalogs: FC<CatalogsProps> = ({ Items }) => {
    const { isLarge } = useApp();
    const [selected, setSelected] = useState<string>(Items[0].categoryCode);


    return (
        <div className="catalogs" style={{ flexDirection: isLarge ? 'row' : 'column' }}>
            <aside className="catalog-list" style={{
                width: isLarge ? '15vw' : '100%',
                height: isLarge ? '100%' : 'auto'
            }}>
                {Items.map((x, i) => {
                    return (
                        <Button color="blue"
                            variant="filled"
                            key={i}
                            onClick={() => setSelected(x.categoryCode)}>
                            {x.category}
                        </Button>
                    )
                })}
            </aside>
            <Divider style={{ height: isLarge ? '500px' : 'auto' }} vertical={isLarge ? true : false} />
            <Products Code={selected} Items={Items.filter(x => x.categoryCode == selected)[0]?.products ?? []} />
        </div>
    )
}

interface ProdProps {
    Code: string;
    Items: Product[]
}
const Products: FC<ProdProps> = ({ Items, Code }) => {
    const navigate = useNavigate();
    const { DeleteCategory } = useMenuContext();

    return (
        <div className="product-list">
            <Flex gap={5}>
                <Button color="gold"
                    variant="filled"
                    size="small"
                    icon={<FaRegPenToSquare />}
                    onClick={() => navigate(`/menu/edit/category/${Code}`)}>
                    Editar
                </Button>
                <Popconfirm
                    title="¿Eliminar esta categoría?"
                    description="Se eliminarán todos los productos asociados."
                    okText="Sí, eliminar"
                    cancelText="Cancelar"
                    onConfirm={() => DeleteCategory(Code)}>
                    <Button color="red" variant="filled" size="small" icon={<FaRegRectangleXmark />}>Quitar</Button>
                </Popconfirm>
            </Flex>
            {Items.map((x, i) => {
                return (
                    <Flex className="product" key={i}>
                        <p>{x.name}</p>
                        <Flex gap={20} align="center">
                            <p>$ {x.price}</p>
                            <Checkbox checked={x.isAvailable}>
                                <Tag color={x.isAvailable ? 'cyan' : 'red'} variant={'solid'}>
                                    {x.isAvailable ? 'Disponible' : 'No disponible'}
                                </Tag>
                            </Checkbox>
                        </Flex>
                    </Flex>
                )
            })}
        </div>
    )
}
