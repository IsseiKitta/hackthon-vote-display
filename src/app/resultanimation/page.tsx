"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
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

// アニメーションモード
type AnimationMode = "list" | "podium";

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
  const [animationMode, setAnimationMode] = useState<AnimationMode>("list"); // アニメーションモード

  // ============================================
  // アニメーション自動切り替え
  // ============================================
  useEffect(() => {
    if (!loading && results.length > 0) {
      // リストアニメーションの総時間を計算
      // 初期遅延 + (項目数 × 表示間隔) + バーアニメーション時間
      const totalListAnimationTime = 0.5 + (results.length * 0.4) + 2.0;
      
      // リストアニメーション終了後、表彰台モードに切り替え
      const timer = setTimeout(() => {
        setAnimationMode("podium");
      }, totalListAnimationTime * 1000); // ミリ秒に変換

      return () => clearTimeout(timer);
    }
  }, [loading, results]);

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
  // 上位から順に表示 → 昇順ソート: (a, b) => a.rank - b.rank
  const sortedResults = [...results].sort((a, b) => a.rank - b.rank);  // 表示順: 1位→10位
  
  // トップ3を抽出
  const topThree = sortedResults.filter(r => r.rank <= 3);

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
          
          {/* 表示切り替えボタン */}
          <motion.div
            className={styles.viewToggle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <button
              className={`${styles.toggleButton} ${animationMode === "list" ? styles.active : ""}`}
              onClick={() => setAnimationMode("list")}
            >
              📋 一覧表示
            </button>
            <button
              className={`${styles.toggleButton} ${animationMode === "podium" ? styles.active : ""}`}
              onClick={() => setAnimationMode("podium")}
            >
              🏆 表彰台
            </button>
          </motion.div>
        </motion.div>

        {/* 🎬 アニメーションモード切り替え */}
        <AnimatePresence mode="wait">
          {animationMode === "list" ? (
            // リスト表示モード
            <motion.div
              key="list"
              className={styles.resultGrid}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -50, transition: { duration: 0.5 } }}
            >
              {sortedResults.map((result, index) => {
                // 🎨 アニメーション順序: 下位(10位)から上位(1位)へ
                const totalResults = sortedResults.length;
                const reverseIndex = totalResults - 1 - index;
                const animationDelay = reverseIndex * 0.4;
                
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
          ) : (
            // 表彰台モード
            <PodiumView key="podium" topThree={topThree} />
          )}
        </AnimatePresence>
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

// ============================================
// 表彰台コンポーネント
// ============================================
type PodiumViewProps = {
  topThree: VoteResult[];
};

function PodiumView({ topThree }: PodiumViewProps) {
  const first = topThree.find(r => r.rank === 1);
  const second = topThree.find(r => r.rank === 2);
  const third = topThree.find(r => r.rank === 3);

  return (
    <motion.div
      className={styles.podiumContainer}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.h2
        className={styles.podiumTitle}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        🏆 トップ3 🏆
      </motion.h2>

      <div className={styles.podiumStage}>
        {/* 2位（左） */}
        {second && (
          <motion.div
            className={styles.podiumItem}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, type: "spring", damping: 15 }}
          >
            <motion.div
              className={styles.podiumCard}
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <div className={styles.podiumRank} style={{ background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' }}>
                🥈
              </div>
              <h3 className={styles.podiumTeamName}>{second.teamName}</h3>
              <p className={styles.podiumProjectName}>{second.projectName}</p>
              <div className={styles.podiumVotes}>{second.votes} 票</div>
            </motion.div>
            <motion.div
              className={styles.podiumBase}
              style={{ height: '180px', background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' }}
              initial={{ height: 0 }}
              animate={{ height: '180px' }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <span className={styles.podiumLabel}>2位</span>
            </motion.div>
          </motion.div>
        )}

        {/* 1位（中央） */}
        {first && (
          <motion.div
            className={styles.podiumItem}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8, type: "spring", damping: 15 }}
          >
            <motion.div
              className={styles.podiumCard}
              whileHover={{ scale: 1.05, rotate: -2 }}
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  repeatDelay: 0.5
                }
              }}
            >
              <motion.div
                className={styles.podiumRank}
                style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                🏆
              </motion.div>
              <h3 className={styles.podiumTeamName}>{first.teamName}</h3>
              <p className={styles.podiumProjectName}>{first.projectName}</p>
              <div className={styles.podiumVotes}>{first.votes} 票</div>
            </motion.div>
            <motion.div
              className={styles.podiumBase}
              style={{ height: '240px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
              initial={{ height: 0 }}
              animate={{ height: '240px' }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <span className={styles.podiumLabel}>1位</span>
            </motion.div>
          </motion.div>
        )}

        {/* 3位（右） */}
        {third && (
          <motion.div
            className={styles.podiumItem}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, type: "spring", damping: 15 }}
          >
            <motion.div
              className={styles.podiumCard}
              whileHover={{ scale: 1.05, rotate: -2 }}
            >
              <div className={styles.podiumRank} style={{ background: 'linear-gradient(135deg, #fb923c 0%, #d97706 100%)' }}>
                🥉
              </div>
              <h3 className={styles.podiumTeamName}>{third.teamName}</h3>
              <p className={styles.podiumProjectName}>{third.projectName}</p>
              <div className={styles.podiumVotes}>{third.votes} 票</div>
            </motion.div>
            <motion.div
              className={styles.podiumBase}
              style={{ height: '140px', background: 'linear-gradient(135deg, #fb923c 0%, #d97706 100%)' }}
              initial={{ height: 0 }}
              animate={{ height: '140px' }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <span className={styles.podiumLabel}>3位</span>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* 紙吹雪エフェクト */}
      <motion.div
        className={styles.confetti}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.confettiPiece}
            style={{
              left: `${Math.random() * 100}%`,
              background: ['#fbbf24', '#94a3b8', '#fb923c', '#ef4444', '#3b82f6'][i % 5],
            }}
            initial={{ y: -100, rotate: 0, opacity: 1 }}
            animate={{
              y: window.innerHeight + 100,
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              opacity: 0,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
