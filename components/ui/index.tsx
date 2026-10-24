"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "primary",
  small = false,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  small?: boolean;
}) {
  const cls = [
    "btn",
    variant === "secondary" ? "secondary" : "",
    small ? "small" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <span className="toggle">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
      />
      <i />
    </span>
  );
}

export function Option({
  pressed,
  onClick,
  children,
  className = "",
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`opt ${className}`}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Pill({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "due";
  children: ReactNode;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function Meter({
  label,
  shown,
  value,
  target,
}: {
  label: string;
  shown: string;
  value: number;
  target: number;
}) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const met = value >= target;
  return (
    <div className="meter">
      <div className="top">
        <b>{label}</b>
        <span>{shown}</span>
      </div>
      <div className="bar">
        <i className={met ? "ok" : ""} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Callout({
  pin,
  due = false,
  title,
  children,
  extra,
}: {
  pin: number;
  due?: boolean;
  title: string;
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className={`callout ${due ? "due" : ""}`}>
      <span className={`pin ${due ? "due" : ""}`}>{pin}</span>
      <b>
        {title} {extra}
      </b>
      <p>{children}</p>
    </div>
  );
}
