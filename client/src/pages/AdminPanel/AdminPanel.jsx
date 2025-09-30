import React, { useState, useEffect } from "react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { adminAPI } from "../../utils/api";
import "./AdminPanel.css";

const AdminPanel = () => {
  console.log("AdminPanel 组件渲染");

  // 时间控制相关状态
  const [timeStatus, setTimeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [setTimeValue, setSetTimeValue] = useState("");
  const [fastForwardHours, setFastForwardHours] = useState("");

  // 系统信息相关状态
  const [systemStats, setSystemStats] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);

  // 签到管理相关状态
  const [currentWeekCycles, setCurrentWeekCycles] = useState(null);
  const [checkinProducts, setCheckinProducts] = useState(null);
  const [generatingConfig, setGeneratingConfig] = useState(false);

  // 朴分管理相关状态
  const [expireInfo, setExpireInfo] = useState(null);
  const [expiringPoints, setExpiringPoints] = useState(false);
  const [expiringProducts, setExpiringProducts] = useState(false);

  // 加载时间状态
  const loadTimeStatus = async () => {
    try {
      const response = await adminAPI.getTimeStatus();
      if (response.code === 200) {
        setTimeStatus(response.data);
      }
    } catch (error) {
      console.error("加载时间状态失败:", error);
    }
  };

  // 加载系统统计信息
  const loadSystemStats = async () => {
    try {
      const response = await adminAPI.getSystemStats();
      if (response.code === 200) {
        setSystemStats(response.data);
      }
    } catch (error) {
      console.error("加载系统统计失败:", error);
    }
  };

  // 加载系统信息
  const loadSystemInfo = async () => {
    try {
      const response = await adminAPI.getSystemInfo();
      if (response.code === 200) {
        setSystemInfo(response.data);
      }
    } catch (error) {
      console.error("加载系统信息失败:", error);
    }
  };

  // 加载当前周签到配置
  const loadCurrentWeekCycles = async () => {
    try {
      const response = await adminAPI.getCurrentWeekCycles();
      if (response.code === 200) {
        setCurrentWeekCycles(response.data);
      }
    } catch (error) {
      console.error("加载当前周签到配置失败:", error);
    }
  };

  // 加载签到商品券
  const loadCheckinProducts = async () => {
    try {
      const response = await adminAPI.getCheckinProducts({ status: 2 }); // 签到专用商品券
      if (response.code === 200) {
        setCheckinProducts(response.data);
      }
    } catch (error) {
      console.error("加载签到商品券失败:", error);
    }
  };

  // 手动生成签到配置
  const handleGenerateConfig = async () => {
    if (generatingConfig) return;

    if (!confirm("确定要生成新的签到配置吗？")) return;

    setGeneratingConfig(true);
    try {
      const response = await adminAPI.generateCheckinCycles();
      if (response.code === 200) {
        alert("签到配置生成成功！");
        await loadCurrentWeekCycles();
      }
    } catch (error) {
      alert("生成签到配置失败: " + error.message);
    } finally {
      setGeneratingConfig(false);
    }
  };

  // 加载朴分过期信息
  const loadExpireInfo = async () => {
    try {
      const response = await adminAPI.checkExpireDate();
      if (response.code === 200) {
        setExpireInfo(response.data);
      }
    } catch (error) {
      console.error("加载过期信息失败:", error);
    }
  };

  // 手动执行朴分过期
  const handleExpirePoints = async () => {
    if (expiringPoints) return;

    if (!confirm("确定要手动执行朴分过期吗？这将清零所有用户的朴分！")) return;

    setExpiringPoints(true);
    try {
      const response = await adminAPI.expirePoints();
      if (response.code === 200) {
        alert(`朴分过期执行成功！影响用户: ${response.data.expiredUsers} 人`);
        await loadSystemStats(); // 刷新系统统计
        await loadExpireInfo(); // 刷新过期信息
      }
    } catch (error) {
      alert("执行朴分过期失败: " + error.message);
    } finally {
      setExpiringPoints(false);
    }
  };

  // 手动执行商品券过期
  const handleExpireProducts = async () => {
    if (expiringProducts) return;

    if (!confirm("确定要手动执行商品券过期检查吗？")) return;

    setExpiringProducts(true);
    try {
      const response = await adminAPI.expireProducts();
      if (response.code === 200) {
        alert(
          `商品券过期检查完成！过期商品券: ${
            response.data.expiredCount || 0
          } 个`
        );
      }
    } catch (error) {
      alert("执行商品券过期失败: " + error.message);
    } finally {
      setExpiringProducts(false);
    }
  }; // 设置系统时间
  const handleSetTime = async () => {
    if (loading) return;

    if (!setTimeValue.trim()) {
      alert("请输入时间");
      return;
    }

    setLoading(true);
    try {
      const payload = { dateString: setTimeValue };
      const response = await adminAPI.setTime(payload);
      if (response.code === 200) {
        alert("系统时间设置成功");
        setSetTimeValue("");
        await loadTimeStatus();
      }
    } catch (error) {
      alert("设置时间失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 快进时间
  const handleFastForward = async () => {
    if (loading) return;

    if (!fastForwardHours || isNaN(fastForwardHours)) {
      alert("请输入有效的小时数");
      return;
    }

    setLoading(true);
    try {
      const payload = { fastForwardHours: parseInt(fastForwardHours) };
      const response = await adminAPI.setTime(payload);
      if (response.code === 200) {
        alert(`时间已快进${fastForwardHours}小时`);
        setFastForwardHours("");
        await loadTimeStatus();
      }
    } catch (error) {
      alert("快进时间失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 重置系统时间
  const handleResetTime = async () => {
    if (loading) return;

    if (!confirm("确定要重置系统时间到真实时间吗？")) return;

    setLoading(true);
    try {
      const response = await adminAPI.resetTime();
      if (response.code === 200) {
        alert("系统时间已重置");
        await loadTimeStatus();
      }
    } catch (error) {
      alert("重置时间失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取所有数据
  useEffect(() => {
    loadTimeStatus();
    loadSystemStats();
    loadSystemInfo();
    loadCurrentWeekCycles();
    loadCheckinProducts();
    loadExpireInfo();
  }, []);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>管理员控制面板</h1>
        <p>系统管理和配置工具（开发环境）</p>
      </div>

      <div className="admin-grid">
        {/* 时间控制 */}
        <Card className="admin-card time-control-card">
          <h2>🕐 时间控制</h2>
          <div className="time-status">
            <div className="status-item">
              <label>当前时间:</label>
              <span className="value">
                {timeStatus
                  ? new Date(timeStatus.currentTime).toLocaleString()
                  : "加载中..."}
              </span>
            </div>
            <div className="status-item">
              <label>时间控制:</label>
              <span
                className={`status ${
                  timeStatus?.controlled ? "enabled" : "disabled"
                }`}
              >
                {timeStatus?.controlled ? "已控制" : "真实时间"}
              </span>
            </div>
          </div>

          <div className="time-controls">
            <div className="control-group">
              <Input
                type="text"
                placeholder="格式: 2025-09-30 或 2025-09-30 15:30"
                value={setTimeValue}
                onChange={(e) => setSetTimeValue(e.target.value)}
                className="time-input"
              />
              <Button
                variant="primary"
                onClick={handleSetTime}
                loading={loading}
              >
                设置时间
              </Button>
            </div>

            <div className="control-group">
              <Input
                type="number"
                placeholder="快进小时数"
                value={fastForwardHours}
                onChange={(e) => setFastForwardHours(e.target.value)}
                className="hours-input"
              />
              <Button
                variant="secondary"
                onClick={handleFastForward}
                loading={loading}
              >
                快进时间
              </Button>
            </div>

            <Button
              variant="danger"
              onClick={handleResetTime}
              loading={loading}
            >
              重置到真实时间
            </Button>
          </div>
        </Card>

        {/* 系统信息 */}
        <Card className="admin-card system-info-card">
          <div className="card-header">
            <h2>💻 系统信息</h2>
          </div>

          <div className="system-info-section">
            <div className="info-group">
              <h3 className="group-title">🌐 环境信息</h3>
              <div className="info-row">
                <span className="info-label">运行环境</span>
                <span className="info-value env-badge">
                  {systemInfo?.environment || "development"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Node.js版本</span>
                <span className="info-value">
                  {systemInfo?.nodeVersion || "加载中..."}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">运行平台</span>
                <span className="info-value">
                  {systemInfo?.platform || "加载中..."}
                </span>
              </div>
            </div>

            <div className="info-group">
              <h3 className="group-title">📊 运行状态</h3>
              <div className="info-row">
                <span className="info-label">服务器启动时间</span>
                <span className="info-value">
                  {systemStats?.serverStartTime
                    ? new Date(systemStats.serverStartTime).toLocaleString(
                        "zh-CN"
                      )
                    : "加载中..."}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">运行时长</span>
                <span className="info-value uptime">
                  {systemInfo?.uptime
                    ? `${Math.floor(systemInfo.uptime / 3600)}时 ${Math.floor(
                        (systemInfo.uptime % 3600) / 60
                      )}分 ${Math.floor(systemInfo.uptime % 60)}秒`
                    : "加载中..."}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">内存使用</span>
                <span className="info-value memory">
                  {systemInfo?.memoryUsage?.rss
                    ? `${(systemInfo.memoryUsage.rss / 1024 / 1024).toFixed(
                        1
                      )} MB`
                    : "加载中..."}
                </span>
              </div>
            </div>

            <div className="info-group">
              <h3 className="group-title">📈 业务统计</h3>
              <div className="info-row">
                <span className="info-label">用户总数</span>
                <span className="info-value count">
                  {systemStats?.userCount || 0} 人
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">总朴分</span>
                <span className="info-value count">
                  {systemStats?.totalPoints || 0} 分
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">时间控制</span>
                <span className="info-value">
                  {systemInfo?.timeControlEnabled ? "已启用" : "未启用"}
                </span>
              </div>
            </div>
          </div>

          <div className="system-actions">
            <Button
              variant="secondary"
              onClick={() => {
                loadSystemStats();
                loadSystemInfo();
              }}
            >
              🔄 刷新数据
            </Button>
          </div>
        </Card>

        {/* 签到管理 */}
        <Card className="admin-card checkin-management-card">
          <div className="card-header">
            <h2>📅 签到管理</h2>
          </div>

          <div className="checkin-info-section">
            <div className="info-group">
              <h3 className="group-title">📊 当前周期信息</h3>
              <div className="info-row">
                <span className="info-label">周期时间</span>
                <span className="info-value">
                  {currentWeekCycles?.week_range
                    ? `${currentWeekCycles.week_range.monday} ~ ${currentWeekCycles.week_range.sunday}`
                    : "加载中..."}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">配置数量</span>
                <span className="info-value count">
                  {currentWeekCycles?.count || 0} 个
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">周期状态</span>
                <span className="info-value">
                  {currentWeekCycles?.cycles?.length > 0 ? "已生成" : "未生成"}
                </span>
              </div>
            </div>

            <div className="info-group">
              <h3 className="group-title">🎁 签到商品券</h3>
              <div className="products-list">
                {checkinProducts && checkinProducts.products ? (
                  checkinProducts.products.map((product) => (
                    <div key={product.id} className="product-item">
                      <div className="product-info">
                        <span className="product-name">{product.name}</span>
                        <span className="product-desc">
                          {product.description}
                        </span>
                      </div>
                      <span className="product-status">签到专享</span>
                    </div>
                  ))
                ) : (
                  <div className="loading-text">加载中...</div>
                )}
              </div>
            </div>
          </div>

          <div className="checkin-actions">
            <Button
              variant="primary"
              onClick={handleGenerateConfig}
              loading={generatingConfig}
            >
              🔧 生成新签到配置
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                loadCurrentWeekCycles();
                loadCheckinProducts();
              }}
            >
              🔄 刷新数据
            </Button>
          </div>
        </Card>

        {/* 朴分管理 */}
        <Card className="admin-card point-management-card">
          <div className="card-header">
            <h2>💰 朴分管理</h2>
          </div>

          <div className="point-info-section">
            <div className="info-group">
              <h3 className="group-title">📅 过期信息</h3>
              <div className="info-row">
                <span className="info-label">当前日期</span>
                <span className="info-value">
                  {expireInfo?.currentDate ||
                    new Date().toLocaleDateString("zh-CN")}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">是否过期日</span>
                <span
                  className={`status-badge ${
                    expireInfo?.isExpireDate ? "expire" : "normal"
                  }`}
                >
                  {expireInfo?.isExpireDate ? "是 - 今日朴分将过期" : "否"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">下次过期日</span>
                <span className="info-value">
                  {expireInfo?.nextExpireDates?.[0]?.date
                    ? `${expireInfo.nextExpireDates[0].date} (${expireInfo.nextExpireDates[0].name})`
                    : "加载中..."}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">过期时间</span>
                <span className="info-value">
                  {expireInfo?.config?.time || "23:59"}
                </span>
              </div>
            </div>

            <div className="info-group">
              <h3 className="group-title">⚠️ 过期规则</h3>
              <div className="expire-rules">
                <div className="rule-item">
                  <span className="rule-date">3月31日</span>
                  <span className="rule-desc">第一季度朴分过期</span>
                </div>
                <div className="rule-item">
                  <span className="rule-date">6月30日</span>
                  <span className="rule-desc">第二季度朴分过期</span>
                </div>
                <div className="rule-item">
                  <span className="rule-date">9月30日</span>
                  <span className="rule-desc">第三季度朴分过期</span>
                </div>
                <div className="rule-item">
                  <span className="rule-date">12月31日</span>
                  <span className="rule-desc">第四季度朴分过期</span>
                </div>
              </div>
            </div>

            <div className="info-group">
              <h3 className="group-title">📊 统计信息</h3>
              <div className="info-row">
                <span className="info-label">系统总朴分</span>
                <span className="info-value count">
                  {systemStats?.totalPoints || 0} 分
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">用户总数</span>
                <span className="info-value count">
                  {systemStats?.userCount || 0} 人
                </span>
              </div>
            </div>
          </div>

          <div className="point-actions">
            <Button
              variant="danger"
              onClick={handleExpirePoints}
              loading={expiringPoints}
              className="danger-action"
            >
              ⚡ 手动执行朴分过期
            </Button>
            <Button
              variant="warning"
              onClick={handleExpireProducts}
              loading={expiringProducts}
              className="warning-action"
            >
              🎫 手动执行商品券过期
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                loadExpireInfo();
                loadSystemStats();
              }}
            >
              🔄 刷新数据
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
