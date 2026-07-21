import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variantClass = variant === 'secondary' ? 'btn-secondary' 
                     : variant === 'danger' ? 'btn-danger' 
                     : 'btn-primary';
  return (
    <button className={`${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
