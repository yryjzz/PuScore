import React from "react";
import "./Card.css";

const Card = ({
  children,
  title,
  className = "",
  variant = "default",
  ...props
}) => {
  const cardClass = `cyber-card cyber-card--${variant} ${className}`;

  return (
    <div className={cardClass} {...props}>
      {title && (
        <div className="cyber-card__header">
          <h2 className="cyber-card__title">{title}</h2>
        </div>
      )}
      <div className="cyber-card__content">{children}</div>
      <div className="cyber-card__glow"></div>
    </div>
  );
};

export default Card;
