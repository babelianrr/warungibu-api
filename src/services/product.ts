/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
import {
    Products,
    IProductCreateRequest,
    ProductStatuses,
    IProductUpdateRequest,
    DiscountTypes
} from 'src/models/products';
import { Branches } from 'src/models/branches';
import { IQueryProducts } from 'src/libs/database/repository/product';
import { CategoryRepository } from 'src/libs/database/repository/category';
import { IUserRepo } from 'src/libs/database/repository/user';
import { DNR } from 'src/clients/dnr/dnr';
import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';
import { ProductImageRepository } from 'src/libs/database/repository/product_image';
import { BASE_URL } from 'src/config';
import { IProductReviewRepo } from 'src/libs/database/repository/product_review';
import { ERoleStatus } from 'src/models/Users';
import { IOrderService } from './order';
import { ICartRepo } from './cart';

export interface IProductRepo {
    findWithFilter(query: IQueryProducts, isAdmin: boolean): Promise<Products[]>;
    findOne(query: any): Promise<Products>;
    findTopProduct(limit?: number): Promise<Products[]>;
    findByProductSku(product_sku: string): Promise<Products>;
    findPpobByProductSku(product_sku: string): Promise<Products>;
    create(productData: any): Products;
    save(product: Products): Promise<Products>;
    countAll(isAdmin: boolean, query?: any): Promise<any>;
    findFavoritesForUser(userId: string, query: any): Promise<Products[]>;
    countAllFavorites(userId: string): Promise<any>;
    checkFavorite(productid: string, userId: string): Promise<Products>;
    checkOnSale(productid: string): Promise<Products>;
    findInactiveProducts(activeProductIds: string[]): Promise<Products[]>;
    deactivateProduct(inactiveProductId: string[]): Promise<any>;
    findPromotionForProductById(productid: string): Promise<any[]>;
    findProductImagesForProductById(productid: string): Promise<any[]>;
    findPromotionHeaderForProductById(productid: string): Promise<any[]>;
    deleteSync(payload: string[]): Promise<any>;
}

export class ProductService {
    private repository: IProductRepo;

    private categoryRepository: CategoryRepository;

    private orderService?: IOrderService;

    private imageRepository: ProductImageRepository;

    private userRepository: IUserRepo;

    private cartRepository: ICartRepo;

    private reviewRepository: IProductReviewRepo;

    private dnrClient: DNR;

    constructor(
        repository: IProductRepo,
        catRep: CategoryRepository,
        oSrv?: IOrderService,
        imageRepo?: ProductImageRepository,
        userRepo?: IUserRepo,
        cartRepo?: ICartRepo,
        reviewRepository?: IProductReviewRepo
    ) {
        this.repository = repository;
        this.categoryRepository = catRep;
        this.dnrClient = new DNR();
        this.orderService = oSrv;
        this.imageRepository = imageRepo;
        this.userRepository = userRepo;
        this.cartRepository = cartRepo;
        this.reviewRepository = reviewRepository;
    }

    public async findWithFilter(queryString: any, userId?: string): Promise<Products[]> {
        const products = await this.repository.findWithFilter(queryString, false);
        let ratings = [];

        if (products.length !== 0) {
            const ids = products.map((product) => product.id);
            ratings = await this.reviewRepository.averageIds(ids);
        }

        for (let i = 0; i < products.length; i += 1) {
            const product = products[i];
            const rating = ratings.find((data) => data.product_id === product.id);
            const productSold = await this.orderService.getNumberOfProductSold(product.id);
            const checkOnSale = await this.repository.checkOnSale(product.id);
            const promotions = await this.repository.findPromotionForProductById(product.id);

            products[i].sold = productSold;
            products[i].is_flash_sale = !!checkOnSale;
            products[i].average_rating = rating ? Number(rating.averageRating) : null;
            products[i].promotions = promotions;
            if (userId) {
                const fav = await this.repository.checkFavorite(product.id, userId);
                products[i].is_favorite = !!fav;
            } else {
                products[i].is_favorite = false;
                delete products[i].price;
                delete products[i].sap_price;
            }
        }

        return products;
    }

    public async findAllForAdmin(queryString: any): Promise<Products[]> {
        const products = await this.repository.findWithFilter(queryString, true);
        let ratings = [];

        if (products.length !== 0) {
            const ids = products.map((product) => product.id);
            ratings = await this.reviewRepository.averageIds(ids);
        }

        for (let i = 0; i < products.length; i += 1) {
            const product = products[i];
            const rating = ratings.find((data) => data.product_id === product.id);
            const productSold = await this.orderService.getNumberOfProductSold(product.id);
            const checkOnSale = await this.repository.checkOnSale(product.id);
            const promotions = await this.repository.findPromotionForProductById(product.id);

            products[i].sold = productSold;
            products[i].average_rating = rating ? Number(rating.averageRating) : null;
            products[i].is_flash_sale = !!checkOnSale;
            products[i].promotions = promotions;
        }

        return products;
    }

    public async findById(id: string, userId?: string): Promise<Products> {
        let productId = id;
        let product = await this.repository.findOne({ where: { slug: id } });
        if (!product) {
            product = await this.repository.findOne(productId);
        } else {
            productId = product.id;
        }
        product.sold = await this.orderService.getNumberOfProductSold(productId);
        const { averageRating } = await this.reviewRepository.average(productId);
        const { totalReview } = await this.reviewRepository.countAll(productId);
        const checkOnSale = await this.repository.checkOnSale(product.id);
        const promotions = await this.repository.findPromotionForProductById(product.id);
        const promotionHeaders = await this.repository.findPromotionHeaderForProductById(product.id);
        product.promotions = promotions;
        product.promotion_headers = promotionHeaders;
        product.total_rating = Number(totalReview);
        product.is_flash_sale = !!checkOnSale;

        if (userId) {
            const fav = await this.repository.checkFavorite(product.id, userId);
            product.is_favorite = !!fav;
        } else {
            product.is_favorite = false;
            delete product.price;
            delete product.sap_price;
        }
        return product;
    }

    public async findTopProduct(userId: string, limit?: number): Promise<Products[]> {
        let products = await this.repository.findTopProduct(limit);
        if (products.length < 1) {
            products = await this.repository.findWithFilter({ page: '1', limit: '6' }, false);
        }

        const sums = await this.cartRepository.sumAllCompleteCartsByProduct(products.map((product) => product.id));
        const ids = products.map((product) => product.id);
        const ratings = await this.reviewRepository.averageIds(ids);
        const productWithSales = [];

        for (let i = 0; i < products.length; i += 1) {
            const product = products[i];
            // const rating = ratings.find((data) => data.product_id === product.id);
            const promotions = await this.repository.findPromotionForProductById(product.id);
            const images = await this.repository.findProductImagesForProductById(product.id);
            const favorite = await this.repository.checkFavorite(product.id, userId);
            const isFavorite = !userId ? false : !!favorite;

            productWithSales.push({
                ...product,
                is_favorite: isFavorite,
                // average_rating: rating ? Number(rating.averageRating) : null,
                promotions,
                images
            });
        }

        return productWithSales;
    }

    public async findProductStock(id: string): Promise<any> {
        const stocks = await this.dnrClient.getProductDetail(id);

        if (!stocks) {
            return [];
        }

        return stocks.map((stock) => {
            return {
                location: this.dnrClient.getBranch(stock.branch),
                branch_code: id,
                stock: stock.stock
            };
        });
    }

    public async findByProductSku(product_sku: string): Promise<Products> {
        return this.repository.findByProductSku(product_sku);
    }

    public async findPpobByProductSku(product_sku: string): Promise<Products> {
        return this.repository.findPpobByProductSku(product_sku);
    }

    public async countAll(isAdmin: boolean, query?: any): Promise<any> {
        return this.repository.countAll(isAdmin, query);
    }

    public async createOrUpdateFromSAP(productInput: IProductCreateRequest): Promise<Products> {
        const product = await this.repository.findByProductSku(productInput.sku_number);

        let result;
        const branches = [];
        if (!product) {
            productInput.branches.forEach((brc) => {
                const branch = brc as Branches;
                branches.push(branch);
            });

            const newProductData = {
                ...productInput,
                slug: this.generateSlug(productInput.name),
                status: ProductStatuses.ACTIVE
            };

            const newProduct = this.repository.create(newProductData);
            newProduct.branches = branches;
            result = this.repository.save(newProduct);
        } else {
            productInput.branches.forEach((brc) => {
                let branchExists = false;
                for (let i = 0; i < product.branches.length; i += 1) {
                    if (product.branches[i].branch_code === brc.branch_code) {
                        branches.push({
                            ...product.branches[i],
                            location: brc.location,
                            stock: Number(brc.stock)
                        });
                        branchExists = true;
                    } else {
                        branches.push({
                            ...product.branches[i]
                        });
                    }
                }

                if (!branchExists) {
                    const newBranch = {
                        branch_code: brc.branch_code,
                        stock: brc.stock,
                        location: brc.location,
                        product_sku: product.sku_number
                    };
                    branches.push(newBranch);
                }
            });

            const updatedProduct = {
                ...product,
                ...productInput,
                branches,
                categories: product.categories,
                slug: this.generateSlug(productInput.name)
            };
            result = this.repository.save(updatedProduct);
        }

        return result;
    }

    public async createNewProduct(productInput: IProductCreateRequest, role: string): Promise<Products> {
        const product = await this.repository.findByProductSku(productInput.sku_number);

        if (product) {
            throw new ErrorObject(ErrorCodes.PRODUCT_SKU_EXIST, 'Sku Number Telah terdaftar.');
        }

        const newCategories = [];
        if (productInput.categories) {
            console.log('input categories', productInput.categories);
            for (let i = 0; i < productInput.categories.length; i += 1) {
                // if (!categories.find((c) => c.name === input.categories[i]) || categories.length === 0) {
                const cat = await this.categoryRepository.findByName(productInput.categories[i]);
                if (cat) {
                    newCategories.push(cat);
                }
                // }
            }
        }

        const newProductData = {
            ...productInput,
            slug: this.generateSlug(productInput.name),
            categories: newCategories
        };

        const newProduct = this.repository.create(newProductData);

        return this.repository.save(newProduct);
    }

    public async updateProduct(input: IProductUpdateRequest, role: string): Promise<Products> {
        const product = await this.repository.findOne(input.id);

        if (!product) {
            throw new ErrorObject(ErrorCodes.PRODUCT_NOT_FOUND_ERROR, 'Produk tidak ditemukan');
        }

        if (input.discount_percentage) {
            input.discount_type = DiscountTypes.PERCENTAGE;
            input.discount_price = Math.floor((input.discount_percentage / 100) * product.price);
        } else if (input.discount_price) {
            input.discount_type = DiscountTypes.PRICE;
            input.discount_percentage = Math.floor((input.discount_price / product.price) * 100);
        } else if (role === ERoleStatus.SUPER_ADMIN) {
            input.discount_type = null;
            input.discount_price = 0;
            input.discount_percentage = 0;
        }

        const { categories } = product;
        const newCategories = [];
        if (input.categories) {
            console.log('input categories', input.categories);
            for (let i = 0; i < input.categories.length; i += 1) {
                // if (!categories.find((c) => c.name === input.categories[i]) || categories.length === 0) {
                const cat = await this.categoryRepository.findByName(input.categories[i]);
                if (cat) {
                    newCategories.push(cat);
                }
                // }
            }
        }

        const newProductData = {
            ...product,
            ...input,
            categories: newCategories
        };

        console.log('New Product to save =>', newProductData);

        return this.repository.save(newProductData);
    }

    public async updateProductImage(id: string, images: any): Promise<Products> {
        const product = await this.repository.findOne(id);
        const { files } = images;

        if (!product) {
            throw new ErrorObject(ErrorCodes.PRODUCT_NOT_FOUND_ERROR, 'Produk tidak ditemukan');
        }
        for (let i = 0; i < files.length; i += 1) {
            const image = await this.imageRepository.create({
                url: `${BASE_URL}/product_images/${files[i].filename}`,
                product_id: product.id
            });

            product.images.push(image);
        }

        return this.repository.save(product);
    }

    public async removeProductImage(imageId: string): Promise<void> {
        const image = await this.imageRepository.findOne(imageId);

        if (!image) {
            throw new ErrorObject(ErrorCodes.PRODUCT_NOT_FOUND_ERROR, 'Gambar produk tidak ditemukan');
        }

        await this.imageRepository.delete(imageId);
    }

    public async addProductToFavorites(productId: string, userId: string): Promise<Products> {
        const product = await this.repository.findOne(productId);
        const user = await this.userRepository.findOne(userId);

        if (!product) {
            throw new ErrorObject(ErrorCodes.PRODUCT_NOT_FOUND_ERROR, 'Produk tidak ditemukan');
        }

        if (!user) {
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, 'Pengguna tidak ditemukan');
        }

        const favBy = await product.fav_by;
        favBy.push(user);
        product.fav_by = Promise.resolve(favBy);

        return this.repository.save(product);
    }

    public async getFavoritesForUser(userId: string, query: any): Promise<Products[]> {
        const user = await this.userRepository.findOne(userId);

        if (!user) {
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, 'Pengguna tidak ditemukan');
        }

        return this.repository.findFavoritesForUser(userId, query);
    }

    public async countAllFavorites(userId: string): Promise<number> {
        return this.repository.countAllFavorites(userId);
    }

    public async removeProductFavorites(productId: string, userId: string): Promise<Products> {
        const product = await this.repository.findOne(productId);
        const user = await this.userRepository.findOne(userId);

        if (!product) {
            throw new ErrorObject(ErrorCodes.PRODUCT_NOT_FOUND_ERROR, 'Produk tidak ditemukan');
        }

        if (!user) {
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, 'Pengguna tidak ditemukan');
        }

        let favBy = await product.fav_by;
        favBy = favBy.filter((u) => {
            return u.id !== userId;
        });
        product.fav_by = Promise.resolve(favBy);

        return this.repository.save(product);
    }

    public async removeInactiveProduct(activeProductIds: string[]): Promise<Products[]> {
        const inactiveProduct = this.repository.findInactiveProducts(activeProductIds);
        console.log(
            'file: product.ts ~ line 387 ~ ProductService ~ removeInactiveProduct ~ inactiveProduct',
            inactiveProduct
        );

        return inactiveProduct;
    }

    public async syncProduct(): Promise<any> {
        const productResponse = await this.dnrClient.getProducts();
        const branchesResponse = await this.dnrClient.getBranches();

        const activeSku = [];
        for (let i = 0; i < productResponse.length; i += 1) {
            activeSku.push(productResponse[i].product_id);

            const productData = {
                name: productResponse[i].product_name,
                sku_number: productResponse[i].product_id,
                company_name: productResponse[i].company_name,
                unit: productResponse[i].satuan,
                price: Number(productResponse[i].price),
                sap_price: Number(productResponse[i].price),
                valid_to: productResponse[i].validto,
                branches: [
                    {
                        branch_code: productResponse[i].branch,
                        stock: Number(productResponse[i].stock),
                        location: branchesResponse.find((b) => b.kdcab === productResponse[i].branch).nama,
                        product_sku: productResponse[i].product_id
                    }
                ]
            };

            const product = await this.createOrUpdateFromSAP(productData);
        }

        const inActive = await this.repository.findInactiveProducts(activeSku);
        if (inActive.length > 0) {
            await this.repository.deactivateProduct(inActive.map((product) => product.id));
        }

        return {
            active_product: activeSku.length,
            inactive_product: inActive.length
        };
    }

    // eslint-disable-next-line class-methods-use-this
    generateSlug(product_name: string): string {
        const slug = product_name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
        return `${slug}-${new Date().getTime()}`;
    }

    public async deleteSync(payload: string[]): Promise<any> {
        return this.repository.deleteSync(payload);
    }
}
