"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
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
// アニメーション定数
// ============================================
const ANIMATION_CONFIG = {
  // リストアニメーション
  LIST_INITIAL_DELAY: 0.5,          // 最初のカードが表示されるまでの遅延（秒）
  LIST_STAGGER_INTERVAL: 0.4,       // 各カードの表示間隔（秒）
  LIST_BAR_DURATION: 2.0,           // バーアニメーションの時間（秒）
  LIST_CARD_DELAY_MULTIPLIER: 0.4,  // カード遅延の係数
  
  // 表彰台アニメーション
  PODIUM_TITLE_DELAY: 0.3,          // タイトル表示の遅延（秒）
  PODIUM_SECOND_DELAY: 0.6,         // 2位登場の遅延（秒）
  PODIUM_THIRD_DELAY: 0.8,          // 3位登場の遅延（秒）
  PODIUM_FIRST_DELAY: 1.0,          // 1位登場の遅延（秒）
  PODIUM_BASE_SECOND_DELAY: 1.0,    // 2位台座の遅延（秒）
  PODIUM_BASE_THIRD_DELAY: 1.2,     // 3位台座の遅延（秒）
  PODIUM_BASE_FIRST_DELAY: 1.4,     // 1位台座の遅延（秒）
  
  // カウントアップ
  COUNT_UP_DURATION: 2,             // カウントアップの時間（秒）
  
  // バーグラフ
  BAR_ANIMATION_DURATION: 1.5,      // バー伸びる時間（秒）
  
  // トランジション
  HEADER_ANIMATION_DURATION: 0.6,   // ヘッダーアニメーションの時間（秒）
  TOGGLE_BUTTON_DELAY: 1.0,         // 切り替えボタンの表示遅延（秒）
  MODE_EXIT_DURATION: 0.5,          // モード切り替え時のフェードアウト時間（秒）
  
  // 表彰台のサイズ
  PODIUM_HEIGHT_FIRST: 240,         // 1位の台座の高さ（px）
  PODIUM_HEIGHT_SECOND: 180,        // 2位の台座の高さ（px）
  PODIUM_HEIGHT_THIRD: 140,         // 3位の台座の高さ（px）
  
  // スプリングアニメーション
  SPRING_DAMPING: 15,               // スプリングの減衰
  CARD_SPRING_DAMPING: 20,          // カードスプリングの減衰
  CARD_SPRING_STIFFNESS: 100,       // カードスプリングの硬さ
  BADGE_SPRING_DAMPING: 12,         // バッジスプリングの減衰
  BADGE_SPRING_STIFFNESS: 150,      // バッジスプリングの硬さ
  TROPHY_SPRING_DAMPING: 10,        // トロフィースプリングの減衰
  TROPHY_SPRING_STIFFNESS: 200,     // トロフィースプリングの硬さ
  
  // 追加の遅延
  TROPHY_ADDITIONAL_DELAY: 0.5,     // トロフィーの追加遅延（秒）
  BADGE_ADDITIONAL_DELAY: 0.2,      // バッジの追加遅延（秒）
  BAR_ADDITIONAL_DELAY: 0.3,        // バーの追加遅延（秒）
  COUNT_ADDITIONAL_DELAY: 0.5,      // カウントの追加遅延（秒）
} as const;

// ============================================
// カウントアップ用カスタムフック
// ============================================
function useCountUp(target: number, duration: number = ANIMATION_CONFIG.COUNT_UP_DURATION) {
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
      staggerChildren: ANIMATION_CONFIG.LIST_STAGGER_INTERVAL,
      delayChildren: ANIMATION_CONFIG.LIST_INITIAL_DELAY,
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
      damping: ANIMATION_CONFIG.CARD_SPRING_DAMPING,
      stiffness: ANIMATION_CONFIG.CARD_SPRING_STIFFNESS,
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
  const [showConfetti, setShowConfetti] = useState(false);    // 紙吹雪表示フラグ
  const [particlesInit, setParticlesInit] = useState(false);  // Particles初期化フラグ

  // ============================================
  // tsParticles の初期化（公式デモに従う）
  // ============================================
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log("Particles loaded:", container);
  };

  // 紙吹雪の設定（公式デモの形式に従う）
  const particlesOptions: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      fullScreen: {
        enable: false,
      },
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
          },
        },
        color: {
          value: ["#fbbf24", "#94a3b8", "#fb923c", "#ef4444", "#3b82f6", "#10b981"],
        },
        shape: {
          type: ["circle", "square"],
        },
        opacity: {
          value: { min: 0.5, max: 1 },
        },
        size: {
          value: { min: 4, max: 10 },
        },
        move: {
          enable: true,
          speed: { min: 3, max: 6 },
          direction: MoveDirection.bottom,
          random: true,
          straight: false,
          outModes: {
            default: OutMode.out,
            bottom: OutMode.out,
            left: OutMode.out,
            right: OutMode.out,
            top: OutMode.none,
          },
        },
        rotate: {
          value: { min: 0, max: 360 },
          direction: "random",
          animation: {
            enable: true,
            speed: 15,
          },
        },
        wobble: {
          enable: true,
          distance: 30,
          speed: { min: 10, max: 20 },
        },
      },
      detectRetina: true,
      emitters: {
        direction: MoveDirection.bottom,
        rate: {
          delay: 0.1,
          quantity: 2,
        },
        size: {
          width: 100,
          height: 0,
        },
        position: {
          x: 50,
          y: 0,
        },
      },
    }),
    [],
  );

  // ============================================
  // アニメーション自動切り替え
  // ============================================
  useEffect(() => {
    if (!loading && results.length > 0) {
      // リストアニメーションの総時間を計算
      const totalListAnimationTime = 
        ANIMATION_CONFIG.LIST_INITIAL_DELAY + 
        (results.length * ANIMATION_CONFIG.LIST_STAGGER_INTERVAL) + 
        ANIMATION_CONFIG.LIST_BAR_DURATION;
      
      // リストアニメーション終了後、表彰台モードに切り替え
      const timer = setTimeout(() => {
        setAnimationMode("podium");
        setShowConfetti(true); // 紙吹雪を表示
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
        {/* 🎊 紙吹雪エフェクト（表彰台モード時のみ） */}
        {showConfetti && particlesInit && (
          <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={particlesOptions}
            className={styles.particlesContainer}
          />
        )}

        {/*  タイトルのアニメーション */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION_CONFIG.HEADER_ANIMATION_DURATION, ease: "easeOut" }}
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
            transition={{ delay: ANIMATION_CONFIG.TOGGLE_BUTTON_DELAY, duration: 0.5 }}
          >
            <button
              className={`${styles.toggleButton} ${animationMode === "list" ? styles.active : ""}`}
              onClick={() => {
                setAnimationMode("list");
                setShowConfetti(false); // 一覧表示では紙吹雪を非表示
              }}
            >
              📋 一覧表示
            </button>
            <button
              className={`${styles.toggleButton} ${animationMode === "podium" ? styles.active : ""}`}
              onClick={() => {
                setAnimationMode("podium");
                setShowConfetti(true); // 表彰台表示では紙吹雪を表示
              }}
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
              exit={{ opacity: 0, y: -50, transition: { duration: ANIMATION_CONFIG.MODE_EXIT_DURATION } }}
            >
              {sortedResults.map((result, index) => {
                // 🎨 アニメーション順序: 下位(10位)から上位(1位)へ
                const totalResults = sortedResults.length;
                const reverseIndex = totalResults - 1 - index;
                const animationDelay = reverseIndex * ANIMATION_CONFIG.LIST_CARD_DELAY_MULTIPLIER;
                
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
  const count = useCountUp(result.votes, ANIMATION_CONFIG.COUNT_UP_DURATION);
  
  // 棒グラフの幅（パーセンテージ）
  const barWidth = (result.votes / maxVotes) * 100;

  return (
    <motion.div
      className={`${styles.resultCard} ${
        result.rank <= 3 ? styles[`rank${result.rank}`] : ""
      }`}
      variants={cardVariants}
      // whileHover={{ scale: 1.01, x: -2.5 }}
      // whileHover={{ scale: 1.0, x: -0 }}
    >
      {/* トロフィー（1-3位のみ） */}
      {result.rank <= 3 && (
        <motion.div
          className={styles.trophy}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring" as const,
            damping: ANIMATION_CONFIG.TROPHY_SPRING_DAMPING,
            stiffness: ANIMATION_CONFIG.TROPHY_SPRING_STIFFNESS,
            delay: delay + ANIMATION_CONFIG.TROPHY_ADDITIONAL_DELAY,
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
          damping: ANIMATION_CONFIG.BADGE_SPRING_DAMPING,
          stiffness: ANIMATION_CONFIG.BADGE_SPRING_STIFFNESS,
          delay: delay + ANIMATION_CONFIG.BADGE_ADDITIONAL_DELAY,
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
            duration: ANIMATION_CONFIG.BAR_ANIMATION_DURATION,
            ease: "easeOut",
            delay: delay + ANIMATION_CONFIG.BAR_ADDITIONAL_DELAY,
          }}
        >
          {/* カウントアップする得票数 */}
          <motion.div 
            className={styles.voteCount}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + ANIMATION_CONFIG.COUNT_ADDITIONAL_DELAY }}
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
        transition={{ delay: ANIMATION_CONFIG.PODIUM_TITLE_DELAY, duration: 0.6 }}
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
            transition={{ delay: ANIMATION_CONFIG.PODIUM_SECOND_DELAY, duration: 0.8, type: "spring", damping: ANIMATION_CONFIG.SPRING_DAMPING }}
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
              style={{ height: `${ANIMATION_CONFIG.PODIUM_HEIGHT_SECOND}px`, background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' }}
              initial={{ height: 0 }}
              animate={{ height: `${ANIMATION_CONFIG.PODIUM_HEIGHT_SECOND}px` }}
              transition={{ delay: ANIMATION_CONFIG.PODIUM_BASE_SECOND_DELAY, duration: 0.6 }}
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
            transition={{ delay: ANIMATION_CONFIG.PODIUM_FIRST_DELAY, duration: 0.8, type: "spring", damping: ANIMATION_CONFIG.SPRING_DAMPING }}
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
              style={{ height: `${ANIMATION_CONFIG.PODIUM_HEIGHT_FIRST}px`, background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
              initial={{ height: 0 }}
              animate={{ height: `${ANIMATION_CONFIG.PODIUM_HEIGHT_FIRST}px` }}
              transition={{ delay: ANIMATION_CONFIG.PODIUM_BASE_FIRST_DELAY, duration: 0.6 }}
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
            transition={{ delay: ANIMATION_CONFIG.PODIUM_THIRD_DELAY, duration: 0.8, type: "spring", damping: ANIMATION_CONFIG.SPRING_DAMPING }}
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
              style={{ height: `${ANIMATION_CONFIG.PODIUM_HEIGHT_THIRD}px`, background: 'linear-gradient(135deg, #fb923c 0%, #d97706 100%)' }}
              initial={{ height: 0 }}
              animate={{ height: `${ANIMATION_CONFIG.PODIUM_HEIGHT_THIRD}px` }}
              transition={{ delay: ANIMATION_CONFIG.PODIUM_BASE_THIRD_DELAY, duration: 0.6 }}
            >
              <span className={styles.podiumLabel}>3位</span>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
