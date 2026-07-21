import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(1);
  const [tipoServicio, setTipoServicio] = useState('Local'); // Local o Llevar

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find(i => (i.id_producto && i.id_producto === item.id_producto) || (i.id_combo && i.id_combo === item.id_combo));
      if (existing) {
        return prev.map(i => 
          ((i.id_producto && i.id_producto === item.id_producto) || (i.id_combo && i.id_combo === item.id_combo))
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const removeFromCart = (id, isCombo = false) => {
    setCart((prev) => prev.filter(i => isCombo ? i.id_combo !== id : i.id_producto !== id));
  };

  const updateQuantity = (id, delta, isCombo = false) => {
    setCart((prev) => {
      return prev.map(i => {
        const matches = isCombo ? i.id_combo === id : i.id_producto === id;
        if (matches) {
          const newQty = i.cantidad + delta;
          return newQty > 0 ? { ...i, cantidad: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCart = cart.reduce((acc, item) => {
    const price = item.precio || item.precio_combo || item.precio_unitario || 0;
    return acc + (price * item.cantidad);
  }, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalCart,
      selectedMesa,
      setSelectedMesa,
      tipoServicio,
      setTipoServicio
    }}>
      {children}
    </CartContext.Provider>
  );
};
