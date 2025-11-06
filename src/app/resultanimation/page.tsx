"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import PageShell from "@/components/PageShell";
import styles from "./page.module.css";

// 型定義（Swagger に基づく）
type VoteResult = {
  id: number;
  teamName: string;
  projectName: string;
  description: string;
  votes: number;
  rank: number;
};

// サンプルデータ（API が使えない場合のフォールバック）
const mockResults: VoteResult[] = [
  { id: 1, rank: 1, teamName: "チームA", projectName: "革新的AIアプリ", description: "", votes: 150 },
  { id: 2, rank: 2, teamName: "チームB", projectName: "スマート投票システム", description: "", votes: 120 },
  { id: 3, rank: 3, teamName: "チームC", projectName: "エコ管理ツール", description: "", votes: 95 },
  { id: 4, rank: 4, teamName: "チームD", projectName: "タスク最適化アプリ", description: "", votes: 80 },
  { id: 5, rank: 5, teamName: "チームE", projectName: "教育支援プラットフォーム", description: "", votes: 65 },
  { id: 6, rank: 6, teamName: "チームF", projectName: "健康管理アプリ", description: "", votes: 55 },
  { id: 7, rank: 7, teamName: "チームG", projectName: "コミュニティプラットフォーム", description: "", votes: 45 },
  { id: 8, rank: 8, teamName: "チームH", projectName: "レシピ共有サービス", description: "", votes: 38 },
  { id: 9, rank: 9, teamName: "チームI", projectName: "学習支援ツール", description: "", votes: 30 },
  { id: 10, rank: 10, teamName: "チームJ", projectName: "イベント管理システム", description: "", votes: 1 },
];

// ============================================
// カウントアップ用カスタムフック
// ============================================
function useCountUp(target: number, duration: number = 2) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, target, { duration });
    return controls.stop;
  }, [count, target, duration]);

  return rounded;
}

// ============================================
// アニメーションバリアント定義
// ここを変更することでアニメーションをカスタマイズできます
// ============================================

// コンテナ全体のアニメーション（下位から順番に表示）
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // 🎨 各カードの表示間隔（秒）
      delayChildren: 0.5,   // 🎨 最初のカードが表示されるまでの遅延（秒）
    },
  },
};

// 各結果カードのアニメーション（右からフェードイン）
const cardVariants = {
  hidden: {
    opacity: 0,
    x: 50,  // 🎨 右から登場
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 100,
    },
  },
};

export default function ResultPage() {
  // ============================================
  // State 管理（通信とデータ管理）
  // ============================================
  const [results, setResults] = useState<VoteResult[]>([]);  // 投票結果データ
  const [loading, setLoading] = useState(true);               // 読み込み中フラグ
  const [error, setError] = useState<string | null>(null);    // エラーメッセージ
  const [useMock, setUseMock] = useState(false);              // モックデータ使用フラグ

  // ============================================
  // API通信処理（データ取得）
  // ============================================
  // URLパラメータから vote_id を取得（例: /resultanimation?voteId=1）
  useEffect(() => {
    const fetchResults = async () => {
      // URLパラメータから voteId を取得
      const params = new URLSearchParams(window.location.search);
      const voteId = params.get("voteId");

      // voteId がない、または "mock" の場合はモックデータを使用
      if (!voteId || voteId === "mock") {
        console.log("モックデータを使用します");
        setResults(mockResults);
        setUseMock(true);
        setLoading(false);
        return;
      }

      try {
        console.log(`API から投票結果を取得中... (voteId: ${voteId})`);
        
        // 🌐 API リクエスト（Swagger の GET /api/vote/{vote_id} に対応）
        const response = await fetch(`/api/vote/${voteId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Cookie を送信（JWT 認証用）
        });

        // レスポンスのエラーチェック
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("投票結果が見つかりませんでした");
          } else if (response.status === 401) {
            throw new Error("認証が必要です。ログインしてください");
          }
          throw new Error("投票結果の取得に失敗しました");
        }

        // JSONデータを取得してStateにセット
        const data: VoteResult[] = await response.json();
        console.log("API から取得したデータ:", data);
        setResults(data);
        setUseMock(false);
      } catch (err) {
        console.error("エラー:", err);
        setError(err instanceof Error ? err.message : "不明なエラー");
        // エラー時はモックデータにフォールバック
        console.log("エラーのため、モックデータにフォールバックします");
        setResults(mockResults);
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // ============================================
  // ローディング画面（通信中）
  // ============================================
  if (loading) {
    return (
      <PageShell>
        <div className={styles.container}>
          {/* 🎬 ローディング時のアニメーション */}
          <motion.div
            className={styles.header}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h1 className="title">読み込み中...</h1>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  // ============================================
  // メイン画面（結果表示とアニメーション）
  // ============================================
  
  // 最大票数を計算（棒グラフの幅計算用）
  const maxVotes = Math.max(...results.map(r => r.votes));
  
  // 🎨 表示順序のカスタマイズポイント
  // 下位から順に表示 → 逆順ソート: (a, b) => b.rank - a.rank
  // 🎨 表示順序のカスタマイズポイント
  // 上位から順に表示 → 昇順ソート: (a, b) => a.rank - b.rank
  const sortedResults = [...results].sort((a, b) => a.rank - b.rank);  // 表示順: 1位→10位

  return (
    <PageShell>
      <div className={styles.container}>
        {/* 🎬 タイトルのアニメーション */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="title">🎉 投票結果発表 🎉</h1>
          {useMock && (
            <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "0.5rem" }}>
              ※ モックデータを表示中（URLに ?voteId=1 を追加すると API からデータを取得します）
            </p>
          )}
          {error && (
            <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "0.5rem" }}>
              エラー: {error} （モックデータにフォールバックしました）
            </p>
          )}
        </motion.div>

        {/* 🎬 結果カード全体のコンテナ（下位から順次アニメーション） */}
        <motion.div
          className={styles.resultGrid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedResults.map((result, index) => {
            // 🎨 アニメーション順序: 下位(10位)から上位(1位)へ
            const totalResults = sortedResults.length;
            const reverseIndex = totalResults - 1 - index;  // 逆順のインデックス
            const animationDelay = reverseIndex * 0.4;  // 遅延時間を0.3秒→0.4秒に
            
            return (
              <ResultCard 
                key={result.id} 
                result={result} 
                maxVotes={maxVotes}
                delay={animationDelay}
              />
            );
          })}
        </motion.div>
      </div>
    </PageShell>
  );
}

// ============================================
// 個別の結果カードコンポーネント
// ============================================
type ResultCardProps = {
  result: VoteResult;
  maxVotes: number;
  delay: number;
};

function ResultCard({ result, maxVotes, delay }: ResultCardProps) {
  // カウントアップアニメーション
  const count = useCountUp(result.votes, 2);
  
  // 棒グラフの幅（パーセンテージ）
  const barWidth = (result.votes / maxVotes) * 100;

  return (
    <motion.div
      className={`${styles.resultCard} ${
        result.rank <= 3 ? styles[`rank${result.rank}`] : ""
      }`}
      variants={cardVariants}
      // whileHover={{ scale: 1.01, x: -2.5 }}
      whileHover={{ scale: 1.0, x: -0 }}
    >
      {/* トロフィー（1-3位のみ） */}
      {result.rank <= 3 && (
        <motion.div
          className={styles.trophy}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring" as const,
            damping: 10,
            stiffness: 200,
            delay: delay + 0.5,
          }}
        >
          {result.rank === 1 && "🏆"}
          {result.rank === 2 && "🥈"}
          {result.rank === 3 && "🥉"}
        </motion.div>
      )}

      {/* ランクバッジ */}
      <motion.div
        className={`${styles.rankBadge} ${
          result.rank <= 3 ? styles[`rank${result.rank}`] : ""
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring" as const,
          damping: 12,
          stiffness: 150,
          delay: delay + 0.2,
        }}
      >
        {result.rank}
      </motion.div>

      {/* チーム情報 */}
      <div className={styles.teamInfo}>
        <h2 className={styles.teamName}>{result.teamName}</h2>
        <p className={styles.projectName}>{result.projectName}</p>
      </div>
      
      {/* スペーサー（チーム情報とバーの間の空白） */}
      <div className={styles.spacer}></div>
      
      {/* 🎬 棒グラフ（右から伸びる） */}
      <div className={styles.barContainer}>
        <motion.div
          className={`${styles.bar} ${
            result.rank === 1 ? styles.rank1 :
            result.rank === 2 ? styles.rank2 :
            result.rank === 3 ? styles.rank3 :
            styles.rankOther
          }`}
          // 🎨 棒グラフの伸びる方向のカスタマイズポイント
          // 右から伸ばす（現在の設定）:
          initial={{ width: 0 }}              // 幅0から開始
          animate={{ width: `${barWidth}%` }}  // 最終幅まで伸びる
          // 
          // 左から伸ばす場合は以下に変更:
          // initial={{ width: 0, marginLeft: `${barWidth}%` }}
          // animate={{ width: `${barWidth}%`, marginLeft: 0 }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: delay + 0.3,
          }}
        >
          {/* カウントアップする得票数 */}
          <motion.div 
            className={styles.voteCount}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
          >
            <motion.span>{count}</motion.span>
            <span className={styles.voteLabel}>票</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
