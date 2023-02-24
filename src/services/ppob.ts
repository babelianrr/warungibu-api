/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import Digiflazz from 'digiflazz';
import _ from 'lodash';
import { DIGIFLAZZ_USERNAME, DIGIFLAZZ_API_KEY } from 'src/config';
import { ErrorObject } from 'src/libs/error-object';
import { Ppob } from 'src/models/ppobs';
import { OrderRepository } from 'src/libs/database/repository/order';
import { generateTransactionNumber } from 'src/libs/helpers/generate-trx-number';
import { IPpobRepo } from 'src/libs/database/repository/ppob';
import md5 from 'md5';

export class PpobService {
    private repository: IPpobRepo;

    orderRepo: OrderRepository;

    constructor(repository: IPpobRepo, orderRepo: OrderRepository) {
        this.repository = repository;
        this.orderRepo = orderRepo;
    }

    public async fetchDigiflazz(): Promise<any> {
        // const digiflazz = new Digiflazz(DIGIFLAZZ_USERNAME, DIGIFLAZZ_API_KEY);
        const result = await axios.post('https://api.digiflazz.com/v1/price-list', {
            cmd: 'prepaid',
            username: DIGIFLAZZ_USERNAME,
            sign: md5(`${DIGIFLAZZ_USERNAME}${DIGIFLAZZ_API_KEY}depo`)
        });

        return result.data.data;
    }

    public async findForAdmin(): Promise<Ppob[]> {
        const data = await this.repository.find({
            order: {
                buyer_sku_code: 'DESC'
            }
        });

        return data;
    }

    public async findOne(buyer_sku_code: string): Promise<Ppob> {
        const data = await this.repository.findOneWithOption({
            buyer_sku_code
        });

        return data;
    }

    public async findForUser(category: string): Promise<Ppob[]> {
        const data = await this.repository.findForUser(category);

        return data;
    }

    public async findCategoryForUser(clause?: any): Promise<any[]> {
        const result = await this.repository.findCategory(clause);
        const data = result.map((v) => v.category);
        return data;
    }

    public async findOneByIdForAdmin(id: string): Promise<Ppob> {
        const data = await this.repository.findOne(id);

        return data;
    }

    public async syncDataAdmin(): Promise<any> {
        const result = await this.fetchDigiflazz();
        const data = _.filter(result, (o) => {
            return o.buyer_product_status === true;
        });

        const datas = await Promise.all(
            data.map(async (v: any) => {
                const ppob = await this.repository.findOneByOption({
                    product_name: v.product_name,
                    buyer_sku_code: v.buyer_sku_code,
                    seller_name: v.seller_name
                });

                if (!ppob) {
                    return {
                        ...v,
                        sell_price: v.price,
                        active: false
                    };
                }

                return ppob;
            })
        );

        await Promise.all(
            datas.map(async (v: any) => {
                await this.repository.upsertData(v);
            })
        );

        return datas;
    }

    private hashCustomerName(name: string, len?: number): string {
        const nl = name.length;
        if (nl !== 0) {
            const initial = name.slice(0, 3);
            const ast = '*';
            return `${initial}${ast.repeat(nl - 3)}`;
        }
        return '';
    }

    public async checkoutForUser(customer_no: string, buyer_sku_code?: string): Promise<any> {
        let checkoutData: {
            product_name: string;
            customer_no: any;
            subscriber_id: any;
            name: string;
            segment_power: any;
            cost_ppn: number;
            cost_ppj: number;
            sell_price: number;
        };

        if (buyer_sku_code.toUpperCase().includes('PLN')) {
            const result = await axios({
                method: 'POST',
                url: 'https://api.digiflazz.com/v1/transaction',
                data: {
                    commands: 'pln-subscribe',
                    customer_no
                }
            });

            const inquiry = result.data.data;

            if (!inquiry || inquiry.name === '') {
                throw new ErrorObject('404', 'Pelanggan tidak ditemukan');
            }

            const ppob = await this.repository.findOneWithOption({
                buyer_sku_code: buyer_sku_code.toUpperCase()
            });

            checkoutData = {
                product_name: ppob.product_name,
                customer_no: inquiry.customer_no,
                subscriber_id: inquiry.subscriber_id,
                name: this.hashCustomerName(inquiry.name),
                segment_power: inquiry.segment_power,
                cost_ppn: 0,
                cost_ppj: 0,
                sell_price: ppob.sell_price
            };
        } else {
            const ppob = await this.repository.findOneWithOption({
                buyer_sku_code: buyer_sku_code.toUpperCase()
            });

            checkoutData = {
                product_name: ppob.product_name,
                customer_no,
                subscriber_id: '',
                name: '',
                segment_power: '',
                cost_ppn: 0,
                cost_ppj: 0,
                sell_price: ppob.sell_price
            };
        }

        return checkoutData;
    }

    public async transactionByUser(customer_no: string, buyer_sku_code: string): Promise<any> {
        const digiflazz = new Digiflazz(DIGIFLAZZ_USERNAME, DIGIFLAZZ_API_KEY);
        const existingOrder = await this.orderRepo.countAll();
        const nextOrder = parseInt(existingOrder.totalOrder, 10) + 1;

        const result = await digiflazz.transaksi(buyer_sku_code, customer_no, generateTransactionNumber(nextOrder));

        return result;
    }

    public async checkTransactionByUser(payload: any): Promise<any> {
        const digiflazz = new Digiflazz(DIGIFLAZZ_USERNAME, DIGIFLAZZ_API_KEY);

        const result = await digiflazz.transaksi(payload.buyer_sku_code, payload.customer_no, payload.ref_id);

        return result;
    }

    public async update(payload: any, id: string): Promise<any> {
        const data = await this.repository.findOne(id);

        if (!data) {
            throw new ErrorObject('404', 'Data PPOB tidak ditemukan');
        }

        const update = await this.repository.updateData(payload, id);

        return update;
    }

    public async delete(id: string): Promise<any> {
        const data = await this.repository.findOne(id);

        if (!data) {
            throw new ErrorObject('404', 'Data PPOB tidak ditemukan');
        }

        return this.repository.delete(id);
    }
}
