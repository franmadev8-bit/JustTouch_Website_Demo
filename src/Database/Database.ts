import { Branch } from '@/Models/Branch';
import { Category } from '@/Models/Category';
import { AuthData } from '@/Models/Db/AuthData';
import { Franchise } from '@/Models/Franchise';
import { OrderGroup } from '@/Models/OrderGroup';
import { Product } from '@/Models/Product';
import { User } from '@/Models/User';
import Dexie, { type EntityTable } from 'dexie';

class Database extends Dexie {
    authData!: EntityTable<AuthData, 'id'>;
    user!: EntityTable<User, 'id'>;
    franchise!: EntityTable<Franchise, 'id'>;
    branch!: EntityTable<Branch, 'id'>;
    category!: EntityTable<Category, 'id'>;
    products!: EntityTable<Product, 'id'>;
    orderGroups!: EntityTable<OrderGroup, 'id'>;

    constructor() {
        super('LocalDb');

        this.version(1).stores({
            authData: AuthData.schema.join(', '),
            user: User.schema.join(', '),
            franchise: Franchise.schema.join(', '),
            branch: Branch.schema.join(', '),
            category: Category.schema.join(', '),
            products: Product.schema.join(', '),
            orderGroups: OrderGroup.schema.join(', ')
        })
    }
}

export const db = new Database();
