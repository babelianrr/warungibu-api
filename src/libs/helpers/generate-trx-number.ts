import { NODE_ENV } from 'src/config';

/* eslint-disable consistent-return */
export const generateTransactionNumber = (count: number): string => {
    const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z'
    ];

    const no =
        NODE_ENV === 'local' || NODE_ENV === 'development' ? Math.floor(count / 1000) : Math.floor(count / 10000);

    const setAlphabetRow = (n: number) => {
        if (n < 26) {
            const row = Math.floor(n);
            return alphabet[row];
        }
        if (n < 52) {
            const row = Math.floor(n - 26);
            return alphabet[row];
        }
        if (n < 78) {
            const row = Math.floor(n - 52);
            return alphabet[row];
        }
        if (n < 104) {
            const row = Math.floor(n - 78);
            return alphabet[row];
        }
        if (n < 130) {
            const row = Math.floor(n - 104);
            return alphabet[row];
        }
        if (n < 156) {
            const row = Math.floor(n - 130);
            return alphabet[row];
        }
        if (n < 182) {
            const row = Math.floor(n - 156);
            return alphabet[row];
        }
        if (n < 208) {
            const row = Math.floor(n - 182);
            return alphabet[row];
        }
        if (n < 234) {
            const row = Math.floor(n - 208);
            return alphabet[row];
        }
        if (n < 260) {
            const row = Math.floor(n - 234);
            return alphabet[row];
        }
        if (n < 286) {
            const row = Math.floor(n - 260);
            return alphabet[row];
        }
        if (n < 312) {
            const row = Math.floor(n - 286);
            return alphabet[row];
        }
        if (n < 338) {
            const row = Math.floor(n - 312);
            return alphabet[row];
        }
        if (n < 364) {
            const row = Math.floor(n - 338);
            return alphabet[row];
        }
        if (n < 390) {
            const row = Math.floor(n - 364);
            return alphabet[row];
        }
        if (n < 416) {
            const row = Math.floor(n - 390);
            return alphabet[row];
        }
        if (n < 442) {
            const row = Math.floor(n - 390);
            return alphabet[row];
        }
        if (n < 468) {
            const row = Math.floor(n - 442);
            return alphabet[row];
        }
        if (n < 494) {
            const row = Math.floor(n - 468);
            return alphabet[row];
        }
        if (n < 520) {
            const row = Math.floor(n - 494);
            return alphabet[row];
        }
        if (n < 546) {
            const row = Math.floor(n - 520);
            return alphabet[row];
        }
        if (n < 572) {
            const row = Math.floor(n - 546);
            return alphabet[row];
        }
        if (n < 598) {
            const row = Math.floor(n - 572);
            return alphabet[row];
        }
        if (n < 624) {
            const row = Math.floor(n - 598);
            return alphabet[row];
        }
        if (n < 650) {
            const row = Math.floor(n - 624);
            return alphabet[row];
        }
        if (n < 676) {
            const row = Math.floor(n - 650);
            return alphabet[row];
        }
    };

    function setAlphabetCol(n: number) {
        const col = Math.floor(n / 26);
        return alphabet[col];
    }

    return NODE_ENV === 'local' || NODE_ENV === 'development'
        ? `${setAlphabetCol(no)}${setAlphabetRow(no)}${`0000${count}`.slice(-3)}`
        : `${setAlphabetCol(no)}${setAlphabetRow(no)}${`0000${count}`.slice(-4)}`;
};
