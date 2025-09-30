import React, { useState, useEffect } from "react";
import { authAPI, pointAPI } from "../../utils/api";
import Button from "../Button/Button";
import "./Checkin.css";

const Checkin = ({ onCheckinSuccess }) => {
  const [checkinData, setCheckinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCheckinInfo();
  }, []);

  const fetchCheckinInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getCheckinInfo();
      if (response.code === 200) {
        setCheckinData(response.data);
      } else {
        setError(response.message || "获取签到信息失败");
      }
    } catch (err) {
      setError(err.message || "获取签到信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    try {
      setCheckinLoading(true);
      const response = await pointAPI.checkin();

      if (response.code === 200) {
        // 签到成功，刷新签到信息
        await fetchCheckinInfo();

        // 通知父组件刷新用户信息
        if (onCheckinSuccess) {
          onCheckinSuccess(response.data);
        }

        // 显示成功消息
        alert(response.data.message || "签到成功！");
      } else {
        setError(response.message || "签到失败");
      }
    } catch (err) {
      setError(err.message || "签到失败");
    } finally {
      setCheckinLoading(false);
    }
  };

  const getDayName = (dayOfWeek) => {
    const dayNames = [
      "",
      "周一",
      "周二",
      "周三",
      "周四",
      "周五",
      "周六",
      "周日",
    ];
    return dayNames[dayOfWeek] || "未知";
  };

  const getSurpriseDisplay = (surpriseInfo) => {
    if (!surpriseInfo) return null;

    if (surpriseInfo.type === "coupon") {
      return (
        <div className="surprise-coupon">
          <span className="surprise-icon">券</span>
          <span className="surprise-text">{surpriseInfo.coupon_name}</span>
        </div>
      );
    } else if (surpriseInfo.type === "lottery") {
      return (
        <div className="surprise-lottery">
          <span className="surprise-icon">瓜分</span>
          <span className="surprise-text">{surpriseInfo.pool_name}</span>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="checkin-container">
        <div className="checkin-loading">
          <div className="loading-spinner"></div>
          <span>加载签到信息中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkin-container">
        <div className="checkin-error">
          <span className="error-message">{error}</span>
          <Button variant="secondary" size="small" onClick={fetchCheckinInfo}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  if (!checkinData) {
    return (
      <div className="checkin-container">
        <div className="checkin-error">
          <span className="error-message">暂无签到数据</span>
        </div>
      </div>
    );
  }

  const todayData = checkinData.checkin_data.find((day) => day.is_today);
  const canCheckinToday = todayData && !todayData.is_checked_in;

  return (
    <div className="checkin-container">
      <div className="checkin-header">
        <div className="checkin-title">
          <h3>每日签到</h3>
          <span className="checkin-period">
            {checkinData.week_range.start_date} ~{" "}
            {checkinData.week_range.end_date}
          </span>
        </div>
      </div>

      <div className="checkin-calendar">
        {checkinData.checkin_data.map((day) => (
          <div
            key={day.day_of_week}
            className={`checkin-day ${day.is_today ? "today" : ""} ${
              day.is_checked_in ? "checked" : ""
            }`}
          >
            <div className="day-header">
              <span className="day-name">{getDayName(day.day_of_week)}</span>
              {day.is_checked_in && <div className="check-mark">✓</div>}
            </div>

            <div className="day-reward">
              <div className="points-reward">+{day.points}</div>

              {day.is_surprise &&
                day.surprise_info &&
                getSurpriseDisplay(day.surprise_info)}
            </div>

            {day.is_today && !day.is_checked_in && (
              <div className="today-indicator">今天</div>
            )}
          </div>
        ))}
      </div>

      {canCheckinToday && (
        <div className="checkin-action">
          <Button
            variant="primary"
            size="medium"
            loading={checkinLoading}
            onClick={handleCheckin}
            className="checkin-btn"
          >
            {checkinLoading ? "签到中..." : "立即签到"}
          </Button>
        </div>
      )}

      {todayData && todayData.is_checked_in && (
        <div className="checkin-completed">
          <span className="completed-text">今日已签到</span>
          <span className="completed-points">获得 {todayData.points} 朴分</span>
        </div>
      )}
    </div>
  );
};

export default Checkin;
