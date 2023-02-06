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

export class PpobService {
    private repository: IPpobRepo;

    orderRepo: OrderRepository;

    constructor(repository: IPpobRepo, orderRepo: OrderRepository) {
        this.repository = repository;
        this.orderRepo = orderRepo;
    }

    public async fetchDigiflazz(): Promise<any> {
        const digiflazz = new Digiflazz(DIGIFLAZZ_USERNAME, DIGIFLAZZ_API_KEY);
        const result = await digiflazz.daftarHarga();

        return result;
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
        let find: any = {};
        if (category) {
            find = {
                where: {
                    category
                }
            };
        }
        const data = await this.repository.find(find);

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

        let data: any[];
        let notRemovedBicartData: string[];

        const existingData = await this.findForAdmin();

        if (!existingData) {
            const datas: any[] = result;
            data = datas.map((v: any, k: number) => {
                return {
                    ...v,
                    sell_price: v.price,
                    active: false
                };
            });

            await Promise.all(
                data.map(async (v: any, k: number) => {
                    await this.repository.upsertData(v);
                })
            );
        } else {
            const datas: any[] = result;
            const bicartData = await this.repository.findWithExclusion();

            data = await Promise.all(
                datas.map(async (v: any, k: number) => {
                    const ppob = await this.repository.findOneWithOption({
                        buyer_sku_code: v.buyer_sku_code
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

            const checkDiff = _.difference(datas, bicartData);

            notRemovedBicartData = await Promise.all(
                checkDiff.map((v: any, k: number) => {
                    return v.buyer_sku_code;
                })
            );

            await this.repository.deleteSync(notRemovedBicartData);

            await Promise.all(
                data.map(async (v: any, k: number) => {
                    await this.repository.upsertData(v);
                })
            );
        }

        return { data, kept_data: notRemovedBicartData };
    }

    private hashCustomerName(name: string, len?: number): string {
        const nl = name.length;
        const initial = name.slice(0, 3);
        const ast = '*';
        return `${initial}${ast.repeat(nl - 3)}`;
    }

    public async checkoutForUser(customer_no: string, buyer_sku_code?: string): Promise<any> {
        const result = await axios({
            method: 'POST',
            url: 'https://api.digiflazz.com/v1/transaction',
            data: {
                commands: 'pln-subscribe',
                customer_no
            }
        });

        const inquiry = result.data.data;

        if (!inquiry) {
            throw new ErrorObject('404', 'Nomor Pelanggan tidak ditemukan');
        }

        const ppob = await this.repository.findOneWithOption({
            buyer_sku_code
        });

        const checkoutData = {
            product_name: ppob.product_name,
            customer_no: inquiry.customer_no,
            name: this.hashCustomerName(inquiry.name),
            segment_power: inquiry.segment_power,
            cost_ppn: 0,
            cost_ppj: 0,
            sell_price: ppob.sell_price
        };

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
