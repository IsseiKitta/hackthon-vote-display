import PageShell from "@/components/PageShell";
import Link from "next/link";
import Button from "@/components/Button";
import FormField from "@/components/FormField";

export default function Home() {
  const left = (
    <div>
      <Link href="/">← 戻る</Link>
    </div>
  );

  return (
    <PageShell left={left}>
      <h1 className="title">ハッカソン投票ビジュアライザーにログイン</h1>
      <div className="content">
        <FormField title="ユーザーネーム" name="username" type="text" placeholder="ユーザー名を入力" />
        <FormField title="パスワード" name="password" type="password" placeholder="パスワードを入力" />
      </div>
      <Button>ログイン</Button>
    </PageShell>
  );
}