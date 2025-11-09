"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import styles from './Header.module.css'; // 専用のCSSを読み込む（例）

export default function Header() {
  const router = useRouter();
  const { isLoggedIn } = useContext(AuthContext);

  const handleTitleClick = () => {
    if (isLoggedIn) {
      router.push('/mypage');
    } else {
      router.push('/');
    }
  };

  return (
    <header className={styles.header}>
      <button
        type="button"
        onClick={handleTitleClick}
        className={styles.titleLink}
      >
        ハッカソン結果ビジュアライザー
      </button>
      <nav>
        <ul className={styles.navLinks}>
          <li className={styles.navItem}>
            <Link href="/createnewvote">Create New Vote</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/">Sign in</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/signup">Sign up</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}