import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card component for displaying content in a bordered container
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.title - Card title (optional)
 * @param {node} props.footer - Footer content (optional)
 */
const Card = ({ 
  children,
  className = '',
  title = null,
  footer = null,
  ...rest
}) => {
  return (
    <div className={`card ${className}`} {...rest}>
      {title && (
        <div className="card-header">
          <h3>{title}</h3>
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer p-4 border-top">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  footer: PropTypes.node,
};

export default Card;
