/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-useless-catch */
import { IOutletAddressRepo, OutletAddressRepository } from 'src/libs/database/repository/outlet_address';
import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';
import { EAddressStatus, IOutletAddressRequest, OutletAddresses } from 'src/models/Outlet-address';

export interface IOutletAddressUpdate {
    id?: string;
    label?: string;
    receiver_name?: string;
    mobile_phone?: string;
    province?: string;
    city?: string;
    full_address?: string;
    district?: string;
    subdistrict?: string;
    user_id?: string;
    is_main?: boolean;
    status?: EAddressStatus;
    notes?: string;
}

export interface IOutletAddressService {
    createOutletAddress(payload: IOutletAddressRequest): Promise<OutletAddresses>;
    getAddressByUserId(userId: string, status: EAddressStatus): Promise<OutletAddresses[]>;
    getAddressByAddressId(addressId: string, userId: string): Promise<OutletAddresses>;
    getOneAddressByUserId(userId: string): Promise<boolean>;
    updateAddressByUserIdAndId(
        userId: string,
        addressId: string,
        payload: IOutletAddressUpdate
    ): Promise<OutletAddresses>;
}

export class OutletAddressService implements IOutletAddressService {
    private repository: IOutletAddressRepo;

    constructor(repository: IOutletAddressRepo) {
        this.repository = repository;
    }

    public async createOutletAddress(payload: IOutletAddressRequest) {
        try {
            const outletAddress = await this.repository.save({ ...payload }, { reload: true });
            return outletAddress;
        } catch (error) {
            throw error;
        }
    }

    public async updateAddressByUserIdAndId(userId: string, addressId: string, payload: IOutletAddressUpdate) {
        const updatedPayload = JSON.parse(JSON.stringify(payload));
        const addressUser = await this.repository.findOutletAddressById(addressId);
        if (addressUser.user_id !== userId) {
            throw new ErrorObject(ErrorCodes.ADDRESS_NOT_FOUND, 'Alamat Tidak Terdaftar', {
                user_id: userId,
                address_id: addressId,
                address_by_user_id: addressUser,
                payload
            });
        }

        const result = await this.repository.save(
            {
                ...addressUser,
                ...updatedPayload
            },
            { reload: true }
        );

        return result;
    }

    public async setMainAddress(userId: string, addressId: string, payload: IOutletAddressUpdate) {
        const addressUser = await this.repository.findOutletAddressById(addressId);

        if (addressUser.user_id !== userId) {
            throw new ErrorObject(ErrorCodes.ADDRESS_NOT_FOUND, 'Alamat Tidak Terdaftar', {
                user_id: userId,
                address_id: addressId,
                address_by_user_id: addressUser,
                payload
            });
        }
        await this.repository.setFalseIsMainAddress(userId);

        const result = await this.repository.save({
            ...addressUser,
            ...payload
        });
        return result;
    }

    public async getAddressByUserId(userId: string, status: EAddressStatus) {
        const addresses = await this.repository.findOutletAddressByUserId(userId, status);
        return addresses;
    }

    public async getOneAddressByUserId(userId: string) {
        const address = await this.repository.findOneAddressByUserId(userId);
        console.log(address);

        if (!address) {
            return false;
        }

        return true;
    }

    public async getAddressByAddressId(addressId: string, userId: string) {
        const address = await this.repository.findOutletAddressById(addressId);
        if (address === undefined || address === null) {
            throw new ErrorObject(ErrorCodes.ADDRESS_NOT_FOUND, 'Address Not Found', {
                addressId,
                userId
            });
        }

        if (address.user_id !== userId) {
            throw new ErrorObject(ErrorCodes.UNAUTHORIZED_ACTION, 'Address User not Found', {
                userId,
                address
            });
        }
        return address;
    }
}
