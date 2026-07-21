import React from 'react';

const Input = ({ label, error, allowType, className = '', onChange, ...props }) => {
  const handleCustomChange = (e) => {
    let val = e.target.value;
    if (allowType === 'letters') {
      // Solo letras y espacios (Nombres y Apellidos)
      val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (allowType === 'alphanumeric') {
      // Solo letras y números (Usuario / Código)
      val = val.replace(/[^a-zA-Z0-9._-]/g, '');
    } else if (allowType === 'numeric') {
      // Solo números (Teléfono, DNI, Montos)
      val = val.replace(/[^0-9]/g, '');
    }
    
    // Asignar el valor sanitizado
    e.target.value = val;
    if (onChange) onChange(e);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-zinc-300">{label}</label>}
      <input
        className={`bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all ${className}`}
        onChange={handleCustomChange}
        {...props}
      />
      {error && <span className="text-xs text-rose-400 mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
