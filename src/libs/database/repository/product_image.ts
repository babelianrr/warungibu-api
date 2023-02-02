import { ProductImages } from 'src/models/Product-Images';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ProductImages)
export class ProductImageRepository extends Repository<ProductImages> {}
