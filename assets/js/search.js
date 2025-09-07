export const filterProducts=(it,f)=>{
    const q=(f.q||'').toLowerCase(), min=Number.isFinite(f.priceMin)?f.priceMin:0, max=Number.isFinite(f.priceMax)?f.priceMax:Infinity;
    return it.filter(p=>{
      const okQ=!q||(p.nombre.toLowerCase().includes(q)||(p.descripcion||'').toLowerCase().includes(q));
      const okCat=!f.categoria||p.categoria===f.categoria, okForma=!f.forma||p.forma===f.forma;
      const okP=p.precio>=min&&p.precio<=max, tags=p.tags||[];
      const okT=(!f.sinAzucar||tags.includes('sin_azucar'))&&(!f.sinGluten||tags.includes('sin_gluten'))&&(!f.vegano||tags.includes('vegano'));
      return okQ&&okCat&&okForma&&okP&&okT;
    });
  };