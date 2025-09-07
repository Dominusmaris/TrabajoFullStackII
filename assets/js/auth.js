import { yearsBetween,isBirthdayToday } from './utils/dates.js';
const KUS='users', KSE='session', J = JSON, R=(k,f)=>J.parse(localStorage.getItem(k)||f), W=(k,v)=>localStorage.setItem(k,J.stringify(v));
export const currentUser = ()=>{ const s=R(KSE,'null'); if(!s) return null; return (R(KUS,'[]').find(u=>u.id===s.userId)||null); };
export const logout=()=>localStorage.removeItem(KSE);

export function registerUser(d){
  const U=R(KUS,'[]'); if(U.some(u=>u.email.toLowerCase()===d.email.toLowerCase())) throw Error('Email ya registrado');
  const age=yearsBetween(d.fechaNacimiento), duoc=/@duoc(\.cl|uc\.cl)$/i.test(d.email), code=(d.codigoPromo||'').trim().toUpperCase()==='FELICES50';
  const user={ id:crypto.randomUUID(), nombre:d.nombre?.trim()||'', apellido:d.apellido?.trim()||'', email:d.email.trim(), pass:d.password,
    fechaNacimiento:d.fechaNacimiento, direccion:d.direccion||'', telefono:d.telefono||'', preferencias:d.preferencias||'',
    flags:{ age50:age>=50, code10:code, isDuoc:duoc }, birthdayVoucher:{ lastRedeemedYear:null } };
  U.push(user); W(KUS,U); W(KSE,{userId:user.id}); return user;
}

export function login(email,pass){ const u=R(KUS,'[]').find(x=>x.email.toLowerCase()===email.toLowerCase()&&x.pass===pass); if(!u) throw Error('Credenciales inválidas'); W(KSE,{userId:u.id}); return u; }

export function updateProfile(p){ const u=currentUser(); if(!u) throw Error('No hay sesión'); const U=R(KUS,'[]'),i=U.findIndex(x=>x.id===u.id); U[i]={...u,...p}; W(KUS,U); return U[i]; }

export const describeBenefits = (u)=>{
  if(!u) return { discount:'0%', notes:[] };
  const pct = u.flags.age50?50:(u.flags.code10?10:0), notes=[];
  if(pct===50) notes.push('50% por edad ≥ 50'); else if(pct===10) notes.push('10% código FELICES50');
  if(u.flags.isDuoc && isBirthdayToday(u.fechaNacimiento)) notes.push('Voucher torta gratis (cumpleaños)');
  return { discount:`${pct}%`, notes };
};