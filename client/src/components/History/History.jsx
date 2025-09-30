import React, { useState, useEffect, useCallback } from "react";
import { pointAPI, productAPI, teamAPI } from "../../utils/api";
import Button from "../Button/Button";
import "./History.css";

const History = () => {
  const [activeTab, setActiveTab] = useState("points");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 各类记录数据
  const [pointRecords, setPointRecords] = useState([]);
  const [exchangeRecords, setExchangeRecords] = useState([]);
  const [teamRecords, setTeamRecords] = useState([]);

  // 分页信息
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      let response;
      switch (activeTab) {
        case "points":
          response = await pointAPI.getRecords(params);
          if (response.code === 200) {
            setPointRecords(response.data.records || []);
            setPagination((prev) => ({
              ...prev,
              total: response.data.total || 0,
            }));
          }
          break;

        case "exchanges":
          response = await productAPI.getExchanges(params);
          if (response.code === 200) {
            setExchangeRecords(response.data.records || []);
            setPagination((prev) => ({
              ...prev,
              total: response.data.total || 0,
            }));
          }
          break;

        case "teams":
          response = await teamAPI.getRecords(params);
          if (response.code === 200) {
            setTeamRecords(response.data.records || []);
            setPagination((prev) => ({
              ...prev,
              total: response.data.total || 0,
            }));
          }
          break;

        default:
          break;
      }
    } catch (err) {
      setError(err.message || "获取历史记录失败");
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getChangeTypeLabel = (changeType) => {
    const types = {
      checkin: "签到",
      team: "组队",
      exchange: "兑换",
      expire: "过期",
    };
    return types[changeType] || "其他";
  };

  const getChangeReason = (record) => {
    try {
      if (record.related_info) {
        const info =
          typeof record.related_info === "string"
            ? JSON.parse(record.related_info)
            : record.related_info;

        switch (record.change_type) {
          case "checkin":
            return info.reason || info.message || "每日签到奖励";
          case "team":
            return info.reason || info.message || "组队活动奖励";
          case "exchange":
            return `兑换 ${info.product_name || "商品券"}`;
          case "expire":
            return info.reason || info.message || "朴分过期扣除";
          default:
            return info.reason || info.message || "朴分变动";
        }
      }
      return record.description || record.reason || "朴分变动";
    } catch {
      return record.description || record.reason || "朴分变动";
    }
  };

  const renderPointRecords = () => {
    if (!pointRecords || pointRecords.length === 0) {
      return (
        <div className="no-data">
          <p>暂无朴分记录</p>
        </div>
      );
    }

    return (
      <div className="records-list">
        {pointRecords.map((record, index) => (
          <div key={record.id || index} className="record-item point-record">
            <div className="record-header">
              <span className="record-type">
                {getChangeTypeLabel(record.change_type)}
              </span>
              <span
                className={`record-points ${
                  record.points >= 0 ? "positive" : "negative"
                }`}
              >
                {record.points >= 0 ? "+" : ""}
                {record.points}
              </span>
            </div>
            <div className="record-body">
              <p className="record-description">{getChangeReason(record)}</p>
              <div className="record-details">
                <p className="record-balance">
                  余额: {record.total_points} 朴分
                </p>
                <p className="record-time">
                  {formatDate(record.created_time || record.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderExchangeRecords = () => {
    if (!exchangeRecords || exchangeRecords.length === 0) {
      return (
        <div className="no-data">
          <p>暂无兑换记录</p>
        </div>
      );
    }

    return (
      <div className="records-list">
        {exchangeRecords.map((record, index) => (
          <div key={record.id || index} className="record-item exchange-record">
            <div className="record-header">
              <span className="record-type">商品券兑换</span>
              <span className="record-status">{record.status || "已兑换"}</span>
            </div>
            <div className="record-body">
              <p className="record-description">
                {record.product?.name || record.product_name || "商品券"} - 消耗{" "}
                {record.points || 0} 朴分
              </p>
              <p className="record-time">
                {formatDate(record.created_at || record.exchange_time)}
              </p>
              {record.expire_at && (
                <p className="record-expire">
                  到期时间: {formatDate(record.expire_at)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTeamRecords = () => {
    if (!teamRecords || teamRecords.length === 0) {
      return (
        <div className="no-data">
          <p>暂无组队记录</p>
        </div>
      );
    }

    return (
      <div className="records-list">
        {teamRecords.map((record, index) => (
          <div key={record.id || index} className="record-item team-record">
            <div className="record-header">
              <span className="record-type">
                {record.user_role === "captain" ? "队长" : "队员"} -{" "}
                {record.team_code}
              </span>
              <span className={`record-status ${record.status}`}>
                {record.status === "completed"
                  ? "已完成"
                  : record.status === "expired"
                  ? "已过期"
                  : record.status === "pending"
                  ? "进行中"
                  : record.status}
              </span>
            </div>
            <div className="record-body">
              <p className="record-description">
                {record.user_role === "captain"
                  ? `创建组队 - 队员数: ${record.member_count || 0}/4`
                  : `加入组队 - 队长: ${
                      record.captain?.username ||
                      record.captain_username ||
                      "未知"
                    }`}
              </p>
              <p className="record-time">
                {record.user_role === "captain" ? "创建时间" : "加入时间"}:{" "}
                {formatDate(
                  record.created_time || record.join_time || record.created_at
                )}
              </p>
              {record.expire_time && (
                <p className="record-expire">
                  到期时间: {formatDate(record.expire_time)}
                </p>
              )}
              {record.completed_time && (
                <p className="record-complete">
                  完成时间: {formatDate(record.completed_time)}
                </p>
              )}
              {record.reward_points > 0 && (
                <p className="record-reward">
                  获得奖励: +{record.reward_points} 朴分
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <Button
          variant="secondary"
          size="small"
          disabled={pagination.page <= 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          上一页
        </Button>
        <span className="page-info">
          {pagination.page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="small"
          disabled={pagination.page >= totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          下一页
        </Button>
      </div>
    );
  };

  return (
    <div className="history-container">
      {/* 标签页导航 */}
      <div className="history-tabs">
        <button
          className={`tab-button ${activeTab === "points" ? "active" : ""}`}
          onClick={() => handleTabChange("points")}
        >
          朴分记录
        </button>
        <button
          className={`tab-button ${activeTab === "exchanges" ? "active" : ""}`}
          onClick={() => handleTabChange("exchanges")}
        >
          兑换记录
        </button>
        <button
          className={`tab-button ${activeTab === "teams" ? "active" : ""}`}
          onClick={() => handleTabChange("teams")}
        >
          组队记录
        </button>
      </div>

      {/* 内容区域 */}
      <div className="history-content">
        {error && (
          <div className="error-message">
            <p>错误: {error}</p>
            <Button variant="secondary" size="small" onClick={fetchData}>
              重试
            </Button>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : (
          <>
            {activeTab === "points" && renderPointRecords()}
            {activeTab === "exchanges" && renderExchangeRecords()}
            {activeTab === "teams" && renderTeamRecords()}
          </>
        )}
      </div>

      {/* 分页 */}
      {!loading && !error && renderPagination()}
    </div>
  );
};

export default History;
