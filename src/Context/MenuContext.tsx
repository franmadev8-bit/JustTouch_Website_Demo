import { Category } from '@/Models/Category';
import { ContextChildren } from '@/Models/Interfaces/ContextChildren';
import { IMenuContext } from '@/Models/Interfaces/IMenuContext';
import { Menu } from '@/Models/Menu';
import { Product } from '@/Models/Product';
import { db } from '@/Database/Database';
import { message } from 'antd';
import { createContext, FC, useContext, useState } from 'react';

const MenuContext = createContext<IMenuContext | undefined>(undefined);

export const useMenuContext = (): IMenuContext => {
    const context = useContext(MenuContext);
    if (!context) throw new Error('Menu Context not provided!');
    return context;
}

// Convierte un UploadFile[] a base64 strings para poder persistir en IndexedDB
// (los File/Blob objects no son serializables por el structured clone algorithm)
const serializeImages = async (images?: any[]): Promise<string[]> => {
    if (!images || images.length === 0) return [];
    const results: string[] = [];
    for (const f of images) {
        try {
            // Si ya es base64 / url guardada anteriormente
            if (typeof f === 'string') { results.push(f); continue; }
            // thumbUrl viene del antd Upload después del crop
            if (f.thumbUrl) { results.push(f.thumbUrl); continue; }
            if (f.url) { results.push(f.url); continue; }
            // Generar desde el File object original
            if (f.originFileObj) {
                const b64 = await new Promise<string>((res, rej) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(f.originFileObj);
                    reader.onload = () => res(reader.result as string);
                    reader.onerror = rej;
                });
                results.push(b64);
            }
        } catch { /* imagen inválida, ignorar */ }
    }
    return results;
};

export const MenuProvider: FC<ContextChildren> = ({ children }) => {
    const [isMenuLoading, setIsMenuLoading] = useState<boolean>(false);
    const [menu, setMenu] = useState<Menu>(new Menu());
    const [category, setCategory] = useState<Category>(new Category({ products: [new Product()] }));

    const handler = (callback: (prev: Category) => Category) => setCategory(callback);

    const GetMenu = async (force = false) => {
        if (!force && menu.categories.length > 0) return;

        setIsMenuLoading(true);
        try {
            const categories = await db.category.toArray();
            const categoriesWithProducts = await Promise.all(
                categories.map(async (cat) => {
                    const products = await db.products
                        .where('productCode')
                        .startsWith(cat.categoryCode)
                        .toArray();
                    return { ...cat, products };
                })
            );
            setMenu(new Menu({ categories: categoriesWithProducts }));
        } catch {
            message.error('Error al cargar el menú.');
        } finally {
            setIsMenuLoading(false);
        }
    }

    const LoadCategory = async (categoryCode: string) => {
        setIsMenuLoading(true);
        try {
            const cat = await db.category
                .where('categoryCode')
                .equals(categoryCode)
                .first();

            if (!cat) {
                message.error('Categoría no encontrada.');
                return;
            }

            const products = await db.products
                .where('productCode')
                .startsWith(categoryCode)
                .toArray();

            // Reconstituir image como UploadFile[] desde pictureUrl guardado
            const productsWithImages = products.map((p, i) => ({
                ...p,
                image: p.pictureUrl
                    ? [{ uid: `loaded-${i}`, name: 'image', status: 'done' as const, url: p.pictureUrl }]
                    : undefined
            }));

            setCategory({ ...cat, products: productsWithImages.length > 0 ? productsWithImages : [new Product()] });
        } catch {
            message.error('Error al cargar la categoría.');
        } finally {
            setIsMenuLoading(false);
        }
    }

   const AddCategory = async () => {
        if (!category.category) {
            message.error('Ingresá un nombre de categoría.');
            return;
        }
        const hasProducts = category.products.some(p => p.name && p.price);
        if (!hasProducts) {
            message.error('Agregá al menos un producto con nombre y precio.');
            return;
        }

        setIsMenuLoading(true);
        try {
            const isEdit = !!category.categoryCode;
            const categoryCode = isEdit ? category.categoryCode : `cat-${Date.now()}`;
            const authData = await db.authData.get(1);

            if (isEdit) {
                const existing = await db.category.where('categoryCode').equals(categoryCode).first();
                if (existing) {
                    await db.category.update(existing.id, { category: category.category });
                }
                await db.products.where('productCode').startsWith(categoryCode).delete();
            } else {
                // CLAVE: Crear un objeto limpio sin ID para evitar ConstraintError
                const newCat = {
                    category: category.category,
                    categoryCode,
                    branchCode: authData?.BranchCode ?? 'demo'
                };
                // Usamos put por seguridad, aunque sea nueva
                await db.category.put(newCat as Category);
            }

            const validProducts = category.products.filter(p => p.name && p.price);
            const productsToInsert: Product[] = [];
            
            for (let i = 0; i < validProducts.length; i++) {
                const p = validProducts[i];
                const imageBase64 = await serializeImages(p.image);
                
                // Creamos el objeto de producto asegurándonos de NO incluir la propiedad 'id'
                const productData: any = {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    isAvailable: p.isAvailable ?? true,
                    productCode: `${categoryCode}-prod-${i}-${Date.now()}`, // Unicidad garantizada
                    pictureUrl: imageBase64[0] ?? '',
                    signedUrl: '',
                };
                
                // Eliminamos el id por si acaso viene en el modelo original
                delete productData.id;
                productsToInsert.push(productData as Product);
            }

            // Usar bulkPut para manejar cualquier residuo de llaves
            await db.products.bulkPut(productsToInsert);

            message.success(isEdit ? 'Categoría actualizada.' : 'Categoría guardada.');
            
            // Resetear estados
            setCategory(new Category({ products: [new Product()] }));
            setMenu(new Menu());
            
            // Forzar recarga del menú antes de navegar
            await GetMenu(true);
            window.location.href = '/menu';
        } catch (e) {
            console.error('Error detallado de Dexie:', e);
            message.error('Error al guardar la categoría.');
        } finally {
            setIsMenuLoading(false);
        }
    }

    const DeleteCategory = async (categoryCode: string) => {
        try {
            await db.category.where('categoryCode').equals(categoryCode).delete();
            await db.products.where('productCode').startsWith(categoryCode).delete();
            setMenu(new Menu());
            message.success('Categoría eliminada.');
            await GetMenu(true);
        } catch {
            message.error('Error al eliminar la categoría.');
        }
    }

    const ResetCategory = () => {
        setCategory(new Category({ products: [new Product()] }));
    }

    return (
        <MenuContext.Provider value={{
            isMenuLoading,
            handler,
            menu, category,
            GetMenu, AddCategory, DeleteCategory, LoadCategory, ResetCategory
        }}>
            {children}
        </MenuContext.Provider>
    )
}
