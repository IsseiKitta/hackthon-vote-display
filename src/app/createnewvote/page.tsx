"use client";

import { useState } from "react";
import FormField from "@/components/FormField";
import PageShell from "@/components/PageShell";
import Button from "@/components/Button";
import styles from "./page.module.css";

type Team = {
  id: number;
  name: string;
  workName: string;
  votes: number;
};

export default function CreateNewVote() {
  const [eventName, setEventName] = useState("");
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: "", workName: "", votes: 0 },
  ]);
  const [nextId, setNextId] = useState(2);

  const handleAddTeam = () => {
    setTeams([...teams, { id: nextId, name: "", workName: "", votes: 0 }]);
    setNextId(nextId + 1);
  };

  const handleRemoveTeam = (id: number) => {
    setTeams(teams.filter((team) => team.id !== id));
  };

  const handleTeamChange = (
    id: number,
    field: keyof Team,
    value: string | number
  ) => {
    setTeams(
      teams.map((team) =>
        team.id === id ? { ...team, [field]: value } : team
      )
    );
  };

  const handleSubmit = async () => {
    // バリデーション
    if (!eventName.trim()) {
      alert("イベント名を入力してください");
      return;
    }

    const invalidTeams = teams.filter(
      (team) => !team.name.trim() || !team.workName.trim()
    );
    if (invalidTeams.length > 0) {
      alert("すべてのチーム名と作品名を入力してください");
      return;
    }

    // Swagger spec に合わせて payload を作成
    const payload = {
      title: eventName,
      projects: teams.map((team) => ({
        teamName: team.name,
        projectName: team.workName,
        description: "", // 任意項目（将来的に追加可能）
        vote: team.votes,
      })),
    };

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "投票の作成に失敗しました");
      }

      const result = await response.json();
      console.log("投票作成成功:", result);
      alert(`投票を作成しました！ (ID: ${result.voteId})`);

      // フォームをリセット（オプション）
      setEventName("");
      setTeams([{ id: 1, name: "", workName: "", votes: 0 }]);
      setNextId(2);
    } catch (error) {
      console.error("エラー:", error);
      alert(error instanceof Error ? error.message : "投票の作成に失敗しました");
    }
  };

  return (
    <PageShell>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className="title">投票を作成する</h1>
        </div>

        <FormField
          title="イベント名"
          name="eventName"
          type="text"
          placeholder="イベント名を入力"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />

        <h2 className={styles.sectionTitle}>チーム一覧</h2>

        {teams.map((team, index) => (
          <div key={team.id} className={styles.teamCard}>
            <div className={styles.teamHeader}>
              <h3 className={styles.teamTitle}>チーム {index + 1}</h3>
              {teams.length > 1 && (
                <button
                  onClick={() => handleRemoveTeam(team.id)}
                  className={styles.deleteButton}
                >
                  削除
                </button>
              )}
            </div>

            <FormField
              title="チーム名"
              name={`team-${team.id}-name`}
              type="text"
              placeholder="チーム名を入力"
              value={team.name}
              onChange={(e) => handleTeamChange(team.id, "name", e.target.value)}
            />

            <FormField
              title="作品名"
              name={`team-${team.id}-workName`}
              type="text"
              placeholder="作品名を入力"
              value={team.workName}
              onChange={(e) => handleTeamChange(team.id, "workName", e.target.value)}
            />

            <FormField
              title="得票数"
              name={`team-${team.id}-votes`}
              type="number"
              placeholder="得票数を入力"
              value={team.votes.toString()}
              onChange={(e) =>
                handleTeamChange(team.id, "votes", parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
        ))}
        <div className={styles.buttonGroup}>
        <Button onClick={handleAddTeam}>
          ＋ チームを追加
        </Button>

        <Button onClick={handleSubmit}>
          投票を作成
        </Button>
          </div>
      </div>
    </PageShell>
  );
}
