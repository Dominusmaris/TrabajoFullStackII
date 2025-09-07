import { isBirthdayToday } from './utils/dates.js';
export const computeDiscount = u => ({ percent: u?(u.flags.age50?50:(u.flags.code10?10:0)):0, voucherToday: !!(u&&u.flags.isDuoc&&isBirthdayToday(u.fechaNacimiento)&&(u.birthdayVoucher?.lastRedeemedYear!==new Date().getFullYear())) });
export const applyDiscount = (subtotal,percent)=> Math.round(subtotal*(1-percent/100));