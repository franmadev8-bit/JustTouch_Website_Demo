import { Category } from "./Category";

export class Menu {
    categories: Category[] = [];
    
    constructor(init?: Partial<Menu>){
        Object.assign(this, init);
    }
}