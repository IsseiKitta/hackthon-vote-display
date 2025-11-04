import type { Metadata } from "next";
// 1. next/font から Noto_Sans_JP をインポート
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 2. フォントを設定 (必要なウェイトやサブセットを指定)
const notoSansJp = Noto_Sans_JP({
  subsets: ["japanese", "latin"], // 'latin' は欧文文字用に推奨されます
  weight: ["400", "600", "900"], // 必要なウェイトを配列で指定
  display: 'swap', // フォントの読み込み戦略
  preload: true, // フォントのプリロードを有効化
});

export const metadata: Metadata = {
  title: "My App",
  description: "...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* 3. <head>タグから<link>タグは削除する */}
      <head /> 
      {/* 4. bodyタグのclassNameにフォント変数を適用 */}
      <body className={notoSansJp.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}