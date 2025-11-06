import Link from 'next/link';
import styles from './Header.module.css'; // 専用のCSSを読み込む（例）

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">My Site Logo</Link>
      <nav>
        <ul className={styles.navLinks}>
          <li className={styles.navItem}>
            <Link href="/create-new-vote">Create New Vote</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/signin">Sign in</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/signup">Sign up</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}