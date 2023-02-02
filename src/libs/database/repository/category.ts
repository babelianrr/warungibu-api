import { Categories } from 'src/models/categories';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Categories)
export class CategoryRepository extends Repository<Categories> {
    findByName(name: string) {
        return this.findOne({ name });
    }

    findAllSorted() {
        return this.createQueryBuilder('categories').orderBy('created_at').getMany();
    }

    deleteCategory(id: string) {
        return this.delete(id);
    }
}
