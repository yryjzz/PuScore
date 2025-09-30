import React, { useState, useEffect } from "react";
import { teamAPI } from "../../utils/api";
import Button from "../Button/Button";
import Input from "../Input/Input";
import "./Team.css";

const Team = ({ onTeamSuccess }) => {
  const [teamStatus, setTeamStatus] = useState({
    hasCreatedToday: false,
    hasJoinedToday: false,
    canCreateToday: true,
    canJoinToday: true,
    todayTeam: null,
  });
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamCode, setTeamCode] = useState("");

  useEffect(() => {
    checkTeamStatus();
  }, []);

  const checkTeamStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // 检查今日是否已创建组队
      const createdResponse = await teamAPI.checkCreatedToday();

      // 检查今日是否已参与组队
      const joinedResponse = await teamAPI.checkJoinedToday();

      setTeamStatus({
        hasCreatedToday: createdResponse.data.hasCreatedTeamToday || false,
        canCreateToday: !createdResponse.data.hasCreatedTeamToday,
        hasJoinedToday: joinedResponse.data.hasJoinedTeamToday || false,
        canJoinToday: !joinedResponse.data.hasJoinedTeamToday,
        createdTeam: createdResponse.data.team || null,
        joinedTeam: joinedResponse.data.team || null,
        createdTeamCode: createdResponse.data.teamCode || null,
        joinedTeamCode: joinedResponse.data.teamCode || null,
      });
    } catch (err) {
      setError(err.message || "获取组队状态失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      setCreateLoading(true);
      setError(null);

      const response = await teamAPI.create();

      if (response.code === 201) {
        await checkTeamStatus(); // 刷新状态

        if (onTeamSuccess) {
          onTeamSuccess(response.data);
        }

        alert(
          `组队创建成功！\n团队码：${response.data.team_code}\n已复制到剪贴板`
        );

        // 复制团队码到剪贴板
        try {
          await navigator.clipboard.writeText(response.data.team_code);
        } catch (clipboardError) {
          console.warn("无法复制到剪贴板:", clipboardError);
        }
      } else {
        setError(response.message || "创建组队失败");
      }
    } catch (err) {
      setError(err.message || "创建组队失败");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!teamCode.trim()) {
      setError("请输入团队码");
      return;
    }

    if (teamCode.trim().length !== 8) {
      setError("团队码应为8位字符");
      return;
    }

    try {
      setJoinLoading(true);
      setError(null);

      const response = await teamAPI.join(teamCode.trim());

      if (response.code === 200) {
        await checkTeamStatus(); // 刷新状态

        if (onTeamSuccess) {
          onTeamSuccess(response.data);
        }

        // 检查是否有奖励
        if (response.data.rewards) {
          alert(
            `🎉 ${response.message}\n队长获得 ${response.data.rewards.captain.points} 朴分\n每位队员获得 10 朴分`
          );
        } else {
          alert(
            `✅ ${response.message}\n当前队伍人数：${response.data.team.member_count}/4`
          );
        }

        setTeamCode(""); // 清空输入框
      } else {
        setError(response.message || "加入组队失败");
      }
    } catch (err) {
      setError(err.message || "加入组队失败");
    } finally {
      setJoinLoading(false);
    }
  };

  const copyTeamCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert("团队码已复制到剪贴板");
    } catch (err) {
      console.warn("复制失败:", err);
      alert(`团队码：${code}\n请手动复制`);
    }
  };

  if (loading) {
    return (
      <div className="team-container">
        <div className="team-loading">
          <div className="loading-spinner"></div>
          <span>加载组队信息中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="team-container">
      {error && (
        <div className="team-error">
          <span className="error-message">{error}</span>
          <Button variant="secondary" size="small" onClick={checkTeamStatus}>
            重试
          </Button>
        </div>
      )}

      <div className="team-actions">
        {/* 创建组队区域 */}
        <div className="team-action-section">
          <h4 className="action-title">创建组队</h4>
          {!teamStatus.hasCreatedToday && teamStatus.canCreateToday ? (
            <Button
              variant="primary"
              size="medium"
              loading={createLoading}
              onClick={handleCreateTeam}
              className="team-btn create-btn"
            >
              {createLoading ? "创建中..." : "今日创建组队"}
            </Button>
          ) : (
            <div className="team-status">
              <span className="status-text">今日已创建组队</span>
            </div>
          )}
        </div>

        {/* 加入组队区域 */}
        <div className="team-action-section">
          <h4 className="action-title">加入组队</h4>
          {!teamStatus.hasJoinedToday && teamStatus.canJoinToday ? (
            <div className="join-section">
              <Input
                type="text"
                placeholder="请输入8位团队码 (如: sR4CjzNN)"
                value={teamCode}
                onChange={(e) => {
                  // 允许输入大小写字母和数字，保持原始大小写
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                  if (value.length <= 8) {
                    setTeamCode(value);
                  }
                }}
                maxLength={8}
                className="team-code-input"
              />
              <Button
                variant="secondary"
                size="medium"
                loading={joinLoading}
                onClick={handleJoinTeam}
                className="team-btn join-btn"
                disabled={!teamCode.trim()}
              >
                {joinLoading ? "加入中..." : "加入队伍"}
              </Button>
            </div>
          ) : (
            <div className="team-status">
              <span className="status-text">今日已参与组队</span>
            </div>
          )}
        </div>
      </div>

      {/* 显示已创建或已加入的队伍信息 */}
      {(teamStatus.createdTeam || teamStatus.joinedTeam) && (
        <div className="team-info-section">
          <div className="team-info-header">
            <span className="team-info-title">我的队伍</span>
            <span
              className={`team-info-status ${
                (teamStatus.createdTeam || teamStatus.joinedTeam)?.status
              }`}
            >
              {(teamStatus.createdTeam || teamStatus.joinedTeam)?.status ===
              "completed"
                ? "已完成"
                : (teamStatus.createdTeam || teamStatus.joinedTeam)?.status ===
                  "pending"
                ? "进行中"
                : (teamStatus.createdTeam || teamStatus.joinedTeam)?.status ===
                  "expired"
                ? "已过期"
                : "未知"}
            </span>
          </div>
          <div className="team-info-details">
            <div className="team-info-item">
              <span className="team-info-label">团队码：</span>
              <span
                className="team-info-value clickable"
                onClick={() =>
                  copyTeamCode(
                    teamStatus.createdTeamCode || teamStatus.joinedTeamCode
                  )
                }
              >
                {teamStatus.createdTeamCode || teamStatus.joinedTeamCode}
              </span>
            </div>
            <div className="team-info-item">
              <span className="team-info-label">创建时间：</span>
              <span className="team-info-value">
                {new Date(
                  (
                    teamStatus.createdTeam || teamStatus.joinedTeam
                  )?.created_time
                ).toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
            {(teamStatus.createdTeam || teamStatus.joinedTeam)?.expire_time && (
              <div className="team-info-item">
                <span className="team-info-label">过期时间：</span>
                <span className="team-info-value">
                  {new Date(
                    (
                      teamStatus.createdTeam || teamStatus.joinedTeam
                    )?.expire_time
                  ).toLocaleString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            )}
            {(teamStatus.createdTeam || teamStatus.joinedTeam)
              ?.completed_time && (
              <div className="team-info-item">
                <span className="team-info-label">完成时间：</span>
                <span className="team-info-value">
                  {new Date(
                    (
                      teamStatus.createdTeam || teamStatus.joinedTeam
                    )?.completed_time
                  ).toLocaleString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
