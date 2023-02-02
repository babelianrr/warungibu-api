export const ProductTestSeed = [
    {
        name: 'Dummy product 1',
        picture_url: '/product/crd.jpeg',
        sku_number: 'dummy-sku-1',
        company_name: 'PT.Laniros Dian Pharma',
        description: 'Some product for testing',
        unit: 'PC',
        price: 7000,
        categories: ['medicine', 'other'],
        valid_to: '20230421',
        branches: [
            {
                branch_code: '00001',
                stock: 1222,
                location: 'jakarta-1',
                product_sku: 'dummy-sku-1'
            },
            {
                branch_code: '00002',
                stock: 1206,
                location: 'jakarta-2',
                product_sku: 'dummy-sku-1'
            }
        ]
    },
    {
        name: 'dummy-product-2',
        picture_url: '/product/green-pastilles.jpeg',
        sku_number: 'dummy-sku-1',
        company_name: 'PT. AFIAT INDUSTRI',
        description: 'Some product for testing',
        unit: 'PC',
        price: 5200,
        categories: ['personal-care', 'other'],
        valid_to: null,
        branches: [
            {
                branch_code: '00001',
                stock: 165,
                location: 'jakarta-1',
                product_sku: 'dummy-sku-1'
            }
        ]
    }
];
