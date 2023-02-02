/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable class-methods-use-this */
import axios, { AxiosInstance } from 'axios';
import { formatToTimeZone } from 'date-fns-timezone';
import { DNR_HOST, DNR_USERNAME, DNR_PASSWORD } from 'src/config';
import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';

import branch from './branch.json';
import branchLookup from './branch_lookup.json';

export interface IDnrProduct {
    product_id: string;
    product_name: string;
    company_name: string;
    satuan: string;
    branch: string;
    price: string;
    stock: string;
    validto: string | null;
}

export interface IDnrCustomerData {
    kdcab: string;
    kdcust: string;
    custname: string;
    custgrp: string;
    top: any;
    credit_limit: string;
    alamat: string;
    city: string;
    tgl_create: string;
    tgl_update: string;
    status_blokir: string;
    no_hp: string;
    izin_cust: string;
    tgl_izin: string;
    izin_apj: string;
    tgl_izin_apj: string;
    tgl_data: string;
}

export interface IOrderData {
    id: string;
    customer_id: string;
    transaction_number: string;
    branch_location: string;
    payment_type: string;
    products: IProductOrderList[];
}

export interface IProductOrderList {
    product_sku: string;
    quantity: number;
    discount: number;
    dpf?: string;
}

export interface IOrderResponse {
    order_id?: string;
    status: 'SUCCESS' | 'FAILED';
}

export interface ISapCustomer {
    noref_dplus: string;
    nama_outlet: string;
    alamat: string;
    telp: string;
    email: string;
    jenis_outlet: string;
    npwp: string;
}

const paytermLookup = {
    CASH_ON_DELIVERY: 'X000',
    DIRECT: 'X000',
    LOAN: 'X030'
};

const paymentStatusLookup = {
    CASH_ON_DELIVERY: 'COD',
    DIRECT: 'PAID',
    LOAN: 'TEMPO',
    FAILED: 'FAILED',
    PENDING: 'PENDING'
};

export class DNR {
    protected readonly instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: DNR_HOST
        });
    }

    async getProducts() {
        const response = await this.instance.get('/product/', {
            data: {
                username: DNR_USERNAME,
                password: DNR_PASSWORD,
                param: '',
                param2: ''
            }
        });

        const { data } = response.data;

        return data;
    }

    async getProductDetail(sku: string): Promise<IDnrProduct[]> {
        const response = await this.instance.get('/product/', {
            data: {
                username: DNR_USERNAME,
                password: DNR_PASSWORD,
                param: sku,
                param2: ''
            }
        });

        const { data } = response.data;

        return data;
    }

    async getBranches() {
        return branch;
        // try {
        //     const response = await this.instance.get('/branch/', {
        //         data: {
        //             username: DNR_USERNAME,
        //             password: DNR_PASSWORD,
        //             param: ''
        //         }
        //     });

        //     return response.data.branch;
        // } catch (err) {
        //     return branch;
        // }
    }

    async getCustomerDetail(customerId: string) {
        const response = await this.instance.get('/customer/', {
            data: {
                username: DNR_USERNAME,
                password: DNR_PASSWORD,
                request: 'customer_detail',
                param: customerId
            }
        });

        const [customer] = response.data.customer;

        return customer as IDnrCustomerData;
    }

    getBranch(code: string): string {
        return branchLookup[code] || 'not found';
    }

    async getStockInBranch(branchLocation: string, productSku: string): Promise<number> {
        try {
            const response = await this.instance.get('/product/', {
                data: {
                    username: DNR_USERNAME,
                    password: DNR_PASSWORD,
                    param: productSku,
                    param2: branch.find((b) => b.nama.toLowerCase() === branchLocation.toLowerCase()).kdcab
                }
            });

            return Number(response.data.data[0].stock);
        } catch (error) {
            throw new ErrorObject(
                ErrorCodes.CREATE_ORDER_ERROR,
                `Tidak Bisa Membuat Order Stock tidak tersedia untuk product ${productSku}.`,
                error
            );
        }
    }

    async postOrder(order: IOrderData): Promise<IOrderResponse> {
        const details = order.products.map((product) => {
            return {
                materialno: product.product_sku,
                qty: product.quantity,
                disc: product.discount,
                dpf: product.dpf || ''
            };
        });

        const header = {
            order_id: order.transaction_number,
            branch: branch.find((b) => b.nama.toLowerCase() === order.branch_location.toLowerCase()).kdcab,
            salesno: '00012114',
            custid: order.customer_id,
            payterm: paytermLookup[order.payment_type],
            custpo: order.transaction_number,
            salestext: '-',
            order_date: formatToTimeZone(new Date(), 'YYYY-MM-D HH:mm:ss', { timeZone: 'Asia/Jakarta' }),
            payment_status: paymentStatusLookup[order.payment_type]
        };

        console.log('SAP POST ORDER HEADER', header);

        console.log('SAP POST ORDER DETAIL', details);

        const response = await this.instance.post('/order/', {
            data: {
                username: DNR_USERNAME,
                password: DNR_PASSWORD,
                data: {
                    header,
                    detail: details
                }
            }
        });

        console.info('Response SAP post order:', response.data);

        if (response.data.message && response.data.message === 'Order successfull received') {
            return {
                status: 'SUCCESS',
                order_id: response.data.order.order_id
            };
        }

        return { status: 'FAILED' };
    }

    async registerCustomer(customer: ISapCustomer) {
        const { data } = await this.instance.post('/customer/', {
            username: DNR_USERNAME,
            password: DNR_PASSWORD,
            param: '1207', // Hardcoded Cakung??
            ...customer
        });

        return data;
    }
}
