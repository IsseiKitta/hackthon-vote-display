import React from "react";
import styles from "./FormField.module.css";

type FormFieldProps = {
  title?: React.ReactNode;
  type?: string; // 'text' | 'password' | 'email' | 'number' | 'textarea' etc.
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

export default function FormField({
  title,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
}: FormFieldProps) {
  const isTextarea = type === "textarea";

  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      {title && (
        <label className={styles.title} htmlFor={name}>
          {title}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          className={`${styles.input} ${inputClassName ?? ""}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className={`${styles.input} ${inputClassName ?? ""}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
