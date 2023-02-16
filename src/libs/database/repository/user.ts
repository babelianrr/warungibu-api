/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { EGender, ERoleStatus, Users } from 'src/models/Users';
import { EntityRepository, Repository, UpdateResult } from 'typeorm';

export interface IQueryUsers {
    search?: string;
    email?: string;
    name?: string;
    type?: string;
    role_status?: ERoleStatus;
    role?: 'ADMIN' | 'NON_ADMIN';
    limit?: string;
    page?: string;
    ids?: string[];
    client?: string;
}

export interface IRegisterUser {
    name: string;
    email: string;
    password?: string;
    ktp?: string;
    gender?: EGender;
    phone_number?: string;
    outlet_types_id?: any;
    role_status?: ERoleStatus;
    loan_limit?: number;
    loan_level?: number;
    verification_token?: string;
}

export interface ILoginEmail {
    email: string;
    password: string;
}

interface IFindOneQuery {
    where: { id: string };
    relations: string[];
}

export interface IUserRepo {
    save(registerPayload: Users): Promise<Users>;
    findUserByData(email: string, type: string): Promise<Users>;
    updatePassword(id: string, password: string): Promise<UpdateResult>;
    findOne(userId: string): Promise<Users>;
    findOneWithOutlets?: (option: IFindOneQuery) => Promise<Users>;
    findAllUser(query: IQueryUsers): Promise<Users[]>;
    countAll(query?: IQueryUsers, payload?: { exclude_admin: boolean }): Promise<any>;
    findByResetPasswordToken(userId: string, token: string): Promise<Users>;
    saveImportData(payload: any): Promise<any>;
    changeLoanLimit(id: string, nominal: number): Promise<any>;
}

@EntityRepository(Users)
export class UserRepository extends Repository<Users> {
    public async findUserByData(data: string, type: string) {
        return this.createQueryBuilder('users')
            .leftJoinAndSelect('users.outlet_types_id', 'outlet_types')
            .where(`users.${type} = :${type}`, { [type]: data })
            .getOne();
    }

    public async findByResetPasswordToken(userId: string, token: string): Promise<Users> {
        return this.createQueryBuilder('users')
            .where('users.id = :userId', { userId })
            .andWhere('users.reset_password_token = :token', { token })
            .andWhere('users.reset_password_expired_at >= :now', { now: new Date() })
            .getOne();
    }

    public async updatePassword(id: string, password: string) {
        return this.createQueryBuilder('users').update(Users).set({ password }).where('id = :id', { id }).execute();
    }

    public async updatePin(id: string, pin: string) {
        return this.createQueryBuilder('users').update(Users).set({ pin }).where('id = :id', { id }).execute();
    }

    public async findAllUser(query: IQueryUsers) {
        const ormQuery = this.createQueryBuilder('users')
            .leftJoinAndSelect('users.outlet_types_id', 'outlet_types')
            .orderBy('users.created', 'DESC');

        switch (query.role) {
            case 'NON_ADMIN':
                ormQuery.andWhere(`role_status IN ('AUTHORIZED_USER', 'AJP_USER', 'BASIC_USER', 'UNVERIFIED_USER')`);
                break;
            case 'ADMIN':
                ormQuery.andWhere(`role_status IN ('ADMIN', 'INACTIVE_ADMIN')`);
                break;
            default:
                return;
        }

        if (query.type && query.type.length) {
            if (query.search && query.search.length) {
                switch (query.type) {
                    case 'name':
                        ormQuery.andWhere(`users.name ilike :search`, { search: `%${query.search}%` });
                        break;
                    case 'email':
                        ormQuery.andWhere(`users.email ilike :search`, { search: `%${query.search}%` });
                        break;
                    case 'customer_id':
                        ormQuery.andWhere(`users.customer_id = :search`, { search: `${query.search}` });
                        break;
                    case 'client':
                        ormQuery.andWhere(`outlet_types.name ILIKE :search`, { search: `%${query.search}%` });
                        break;
                    default:
                        return;
                }
            }
        } else if (query.search && query.search.length) {
            ormQuery.andWhere(`users.name ilike :search`, { search: `%${query.search}%` });
            ormQuery.andWhere(`users.email ilike :search`, { search: `%${query.search}%` });
        }

        if (query.role_status && query.role_status.length) {
            ormQuery.andWhere(`users.role_status IN (:rs)`, { rs: query.role_status });
        }

        if (query.ids && query.ids.length !== 0) {
            ormQuery.andWhere(`users.id IN (${query.ids.map((id) => `'${id}'`).join(', ')})`);
        }

        if (query.page) {
            ormQuery.take(Number(query.limit));
            ormQuery.skip(Number(query.limit) * (Number(query.page) - 1));
        }
        console.log(ormQuery.getSql());
        return ormQuery.getMany();
    }

    public async findAllUserPagination(query: IQueryUsers) {
        const ormQuery = this.createQueryBuilder('users')
            .leftJoinAndSelect('users.outlet_types_id', 'outlet_types', 'users.outlet_types_id IS NOT NULL')
            .andWhere(`role_status IN ('AUTHORIZED_USER', 'AJP_USER', 'BASIC_USER', 'UNVERIFIED_USER')`);

        if (query.type && query.type.length) {
            if (query.search && query.search.length) {
                ormQuery.andWhere(`outlet_types.name ILIKE :search`, { search: `%${query.search}%` });
            }
        } else if (query.search && query.search.length) {
            ormQuery.andWhere(`outlet_types.name ilike :search`, { search: `%${query.search}%` });
        }

        return ormQuery.getMany();
    }

    public async findOneWithOutlets(option: IFindOneQuery) {
        return this.findOne(option);
    }

    public async countActiveUser() {
        return this.createQueryBuilder('')
            .where(`role_status IN ('AUTHORIZED_USER', 'AJP_USER')`)
            .select('count(1)', 'totalUser')
            .getRawOne();
    }

    countAll(query?: IQueryUsers) {
        const ormQuery = this.createQueryBuilder('users').select('count(1)', 'totalUsers');

        if (query.role === 'NON_ADMIN') {
            ormQuery.andWhere(`role_status IN ('AUTHORIZED_USER', 'AJP_USER', 'BASIC_USER', 'UNVERIFIED_USER')`);
        }

        if (query.role === 'ADMIN') {
            ormQuery.andWhere(`role_status IN ('ADMIN', 'INACTIVE_ADMIN')`);
        }

        if (query.email && query.email.length) {
            ormQuery.andWhere(`users.email ilike :email`, { email: `%${query.email}%` });
        }

        if (query.role_status && query.role_status.length) {
            ormQuery.andWhere(`users.role_status IN (:rs)`, { rs: query.role_status });
        }

        return ormQuery.getRawOne();
    }

    public async saveImportData(payload: any): Promise<any> {
        const query = this.createQueryBuilder().insert().into(Users).values(payload);

        return query.execute();
    }

    public async changeLoanLevel(id: string, nominal: number): Promise<any> {
        const query = this.createQueryBuilder()
            .update(Users)
            .set({ loan_limit: nominal, loan_level: nominal })
            .where('id = :id', { id });

        return query.execute();
    }

    public async changeLoanLimit(id: string, nominal: number): Promise<any> {
        const query = this.createQueryBuilder().update(Users).set({ loan_limit: nominal }).where('id = :id', { id });

        return query.execute();
    }

    public async findUsersByClient(client_id: string): Promise<Users[]> {
        return this.createQueryBuilder('users').where(`users.outlet_types_id = :cid`, { cid: client_id }).getMany();
    }
}
