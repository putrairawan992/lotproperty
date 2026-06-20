import React from "react";
import { T } from "../types";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = "", style = {}, ...props }: CardProps) {
  return (
    <div className={`border card-hover ${className}`}
      style={{ backgroundColor: T.card, borderColor: T.border, borderRadius: 20, ...style }}
      {...props}>
      {children}
    </div>
  );
}
