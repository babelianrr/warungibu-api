/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { EAddressStatus, IOutletAddressRequest, OutletAddresses } from 'src/models/Outlet-address';
import { Brackets, EntityRepository, Repository, UpdateQueryBuilder } from 'typeorm';

export interface IOutletAddressRepo extends OutletAddressRepository {
    findOutletAddressByUserId(userId: string, status?: EAddressStatus): Promise<OutletAddresses[]>;
    findOneAddressByUserId(userId: string): Promise<OutletAddresses>;
    findOutletAddressById(addressId: string): Promise<OutletAddresses>;
    setFalseIsMainAddress(userId: string): Promise<UpdateQueryBuilder<OutletAddresses>>;
}

@EntityRepository(OutletAddresses)
export class OutletAddressRepository extends Repository<OutletAddresses> {
    public async findOutletAddressByUserId(userId: string, status?: any) {
        return this.createQueryBuilder('outlet_addresses')
            .andWhere(
                new Brackets((qb) => {
                    qb.where('outlet_addresses.status = :status1', this.statusQueryHelper(status)).orWhere(
                        'outlet_addresses.status = :status2',
                        this.statusQueryHelper(status)
                    );
                })
            )
            .andWhere('outlet_addresses.user_id = :userId', { userId })
            .getMany();
    }

    public async setFalseIsMainAddress(userId: string) {
        return this.createQueryBuilder('outlet_addresses')
            .update({ is_main: false })
            .where('outlet_addresses.user_id = :userId', { userId })
            .where('outlet_addresses.is_main = :isMain', { isMain: true });
    }

    public async findOutletAddressById(addressId: string) {
        return this.createQueryBuilder('outlet_addresses')
            .where('outlet_addresses.id = :addressId', { addressId })
            .getOne();
    }

    public async findOneAddressByUserId(userId: string) {
        return this.createQueryBuilder('outlet_addresses')
            .where('outlet_addresses.user_id = :userId', { userId })
            .getOne();
    }

    private statusQueryHelper(status: EAddressStatus) {
        const statusQuery: any = {};
        if (status) {
            statusQuery.status1 = status;
            statusQuery.status2 = status;
        } else {
            statusQuery.status1 = EAddressStatus.ACTIVE;
            statusQuery.status2 = EAddressStatus.INACTIVE;
        }
        return statusQuery;
    }
}
