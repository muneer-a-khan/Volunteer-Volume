import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  noShadow = false,
  noPadding = false,
  bordered = false,
  rounded = true,
}) => {
  // Base card styles
  const cardClasses = `
    bg-white
    ${rounded ? 'rounded-lg' : ''}
    ${!noShadow ? 'shadow' : ''}
    ${bordered ? 'border border-gray-200' : ''}
    overflow-hidden
    ${className}
  `;

  // Body padding
  const bodyClasses = `
    ${!noPadding ? 'p-6' : ''}
    ${bodyClassName}
  `;

  return (
    <div className={cardClasses}>
      {/* Optional card header */}
      {(title || subtitle) && (
        <div className={`px-6 py-5 border-b border-gray-200 ${headerClassName}`}>
          {title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      {/* Card body */}
      <div className={bodyClasses}>
        {children}
      </div>
      
      {/* Optional card footer */}
      {footer && (
        <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  noShadow: PropTypes.bool,
  noPadding: PropTypes.bool,
  bordered: PropTypes.bool,
  rounded: PropTypes.bool,
};

export default Card;