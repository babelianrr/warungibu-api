export const isAddresJabodetabek = (address: any): boolean => {
    const city = address.city.toLowerCase();
    const jabodetabekCity = [
        'jakarta utara',
        'jakarta selatan',
        'jakarta timur',
        'jakarta barat',
        'jakarta pusat',
        'bogor',
        'depok',
        'tangerang',
        'tangerang selatan',
        'bekasi',
        'kepulauan seribu',
        'jakarta'
    ];

    return jabodetabekCity.includes(city);
};

export const mapJabodetabekToProvince = (user: any): string => {
    const city = user.city.toLowerCase();
    switch (city) {
        case 'jakarta utara':
        case 'jakarta selatan':
        case 'jakarta timur':
        case 'jakarta barat':
        case 'jakarta pusat':
        case 'jakarta':
        case 'kepulauan seribu':
            return 'DKI JAKARTA';
        case 'bogor':
        case 'bekasi':
        case 'depok':
            return 'JAWA BARAT';
        case 'tangerang':
        case 'tangerang selatan':
            return 'BANTEN';
        default:
            return '-';
    }
};
