import { useMenuContext } from "@/Context/MenuContext"
import { Category } from "@/Models/Category";
import { Product } from "@/Models/Product";
import { UploadFile } from "antd";

export const useMenu = () => {
    const { category, handler } = useMenuContext();

    const handleCategory = <k extends keyof Category>(key: k, value: Category[k]) => {
        handler(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleProduct = <k extends keyof Product>(index: number, key: k, value: Product[k]) => {
        handler(prev => ({
            ...prev,
            products: prev.products.map((item, i) => i === index ? { ...item, [key]: value } : item)
        }));
    }

    const handleImage = (index: number, images: UploadFile[]) => {
        handler(prev => {
            const item = { ...prev };
            item.products[index].image = images;
            return item;
        })
    }

    const pushProduct = () => {
        handler(prev => {
            return { ...prev, products: [...prev.products, new Product()] }
        })
    }

    const remoteProduct = (index: number) => {
        handler(prev => {
            return { ...prev, products: [...prev.products].filter((_, i) => i !== index) }
        })
    }

    return {
        category,
        handleCategory,
        handleProduct,
        handleImage,
        pushProduct,
        remoteProduct
    }
}