import { convertToTimeZone } from 'date-fns-timezone';

export const returnLocalTime = (date: Date): Date => {
    return convertToTimeZone(date, { timeZone: 'Asia/Jakarta' });
};

// will get date only from date1 and date2 then convert as local time
// return -1, 0, 1 => date1 before date2, date1 = date2, date1 after date2
export const compareDate = (date1: Date, date2: Date): number => {
    let updatedDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    let updatedDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    updatedDate1 = returnLocalTime(updatedDate1);
    updatedDate2 = returnLocalTime(updatedDate2);

    if (updatedDate1.getTime() < updatedDate2.getTime()) {
        return -1;
    }

    if (updatedDate1.getTime() > updatedDate2.getTime()) {
        return 1;
    }

    return 0;
};
