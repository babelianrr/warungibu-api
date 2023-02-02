/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Categories } from 'src/models/categories';
import { ErrorCodes } from 'src/libs/errors';
import { ErrorObject } from 'src/libs/error-object';

interface ICategoryRepo {
    find(): Promise<Categories[]>;
    findAllSorted(): Promise<Categories[]>;
    findOne(id: string): Promise<Categories>;
    findByName(name: string): Promise<Categories>;
    create(catdata: any): Categories;
    save(catdata: any): Promise<Categories>;
    deleteCategory(id: string): Promise<any>;
}

export class CategoryService {
    private repository: ICategoryRepo;

    constructor(repository: ICategoryRepo) {
        this.repository = repository;
    }

    public async findAll(): Promise<Categories[]> {
        return this.repository.findAllSorted();
    }

    public async findByName(catName: string): Promise<Categories> {
        return this.repository.findByName(catName);
    }

    public async findById(id: string): Promise<Categories> {
        return this.repository.findOne(id);
    }

    public async add(categorydata: any): Promise<Categories> {
        const category = this.repository.create({
            name: categorydata.name,
            icon_url: categorydata.icon_url
        });

        return this.repository.save(category);
    }

    public async update(categorydata: any): Promise<Categories> {
        const category = await this.repository.findOne(categorydata.id);

        if (!category) {
            throw new ErrorObject(ErrorCodes.CATEGORY_NOT_FOUND_ERROR, 'Category tidak ditemukan');
        }

        const newCategory = {
            ...category,
            ...categorydata
        };

        return this.repository.save(newCategory);
    }

    public async delete(id: string) {
        return this.repository.deleteCategory(id);
    }
}
