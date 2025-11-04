import React from "react";
import styles from "./PageShell.module.css";

type PageShellProps = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function PageShell({ left, right, children, className }: PageShellProps) {
  return (
    <div className={`${styles.shell} ${className ?? ""}`}>
      <aside className={styles.left}>{left}</aside>
      <main className={styles.main}>{children}</main>
      <aside className={styles.right}>{right}</aside>
    </div>
  );
}
