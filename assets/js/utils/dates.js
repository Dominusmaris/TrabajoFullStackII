// edad y check cumpleaños en 2 helpers simples
export const yearsBetween = d => { const x=new Date(d),t=new Date(); let a=t.getFullYear()-x.getFullYear(); return (t.getMonth()<x.getMonth()||t.getMonth()===x.getMonth()&&t.getDate()<x.getDate())?a-1:a; };
export const isBirthdayToday = d => { const x=new Date(d),t=new Date(); return x.getDate()===t.getDate() && x.getMonth()===t.getMonth(); };