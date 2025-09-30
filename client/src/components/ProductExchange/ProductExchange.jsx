import React, { useState, useEffect } from "react";
import { productAPI } from "../../utils/api";
import Button from "../Button/Button";
import Card from "../Card/Card";
import "./ProductExchange.css";

const ProductExchange = ({ onExchangeSuccess }) => {
  const [products, setProducts] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exchangeLoading, setExchangeLoading] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productAPI.getExchangeable();

      if (response.code === 200) {
        setProducts(response.data.products || []);
        setUserPoints(response.data.user_total_points || 0);
      } else {
        setError(response.message || "获取商品券失败");
      }
    } catch (err) {
      setError(err.message || "获取商品券失败");
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async (product) => {
    try {
      setExchangeLoading({ ...exchangeLoading, [product.id]: true });
      setError(null);

      const response = await productAPI.exchange(product.id);

      if (response.code === 200) {
        // 更新用户朴分
        setUserPoints(response.data.point_change.new_points);

        // 重新加载商品列表以更新可兑换状态
        await loadProducts();

        if (onExchangeSuccess) {
          onExchangeSuccess(response.data);
        }

        alert(
          `🎉 兑换成功！\n` +
            `商品：${product.name}\n` +
            `消耗朴分：${product.points}\n` +
            `剩余朴分：${response.data.point_change.new_points}\n` +
            `过期时间：${response.data.exchange.expire_at}`
        );
      } else {
        setError(response.message || "兑换失败");
      }
    } catch (err) {
      setError(err.message || "兑换失败");
    } finally {
      setExchangeLoading({ ...exchangeLoading, [product.id]: false });
    }
  };

  // 默认商品券图片
  const getProductImage = (product) => {
    if (product.image_url) {
      return product.image_url;
    }

    // 根据商品名称或朴分数量生成不同的默认图片
    const defaultImages = {
      "1元": "💰",
      "5元": "💵",
      "10元": "💸",
      "20元": "💳",
      免邮: "🚚",
      优惠: "🎫",
    };

    // 查找匹配的图标
    for (const [keyword, icon] of Object.entries(defaultImages)) {
      if (product.name.includes(keyword)) {
        return icon;
      }
    }

    // 根据朴分数量决定图标
    if (product.points <= 5) return "💰";
    if (product.points <= 20) return "💵";
    if (product.points <= 50) return "💸";
    return "💎";
  };

  if (loading) {
    return (
      <div className="product-exchange-container">
        <div className="exchange-loading">
          <div className="loading-spinner"></div>
          <span>加载商品券中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="product-exchange-container">
      <div className="exchange-header">
        <h3 className="exchange-title">商品券兑换</h3>
        <div className="user-points">
          <span className="points-label">我的朴分：</span>
          <span className="points-value">{userPoints}</span>
        </div>
      </div>

      {error && (
        <div className="exchange-error">
          <span className="error-message">{error}</span>
          <Button variant="secondary" size="small" onClick={loadProducts}>
            重试
          </Button>
        </div>
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            <span>暂无可兑换的商品券</span>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="product-card">
              <div className="product-image">
                <span className="product-icon">{getProductImage(product)}</span>
              </div>

              <div className="product-info">
                <h4 className="product-name">{product.name}</h4>
                <p className="product-description">{product.description}</p>

                <div className="product-meta">
                  <div className="product-points">
                    <span className="points-required">{product.points}</span>
                    <span className="points-unit">朴分</span>
                  </div>

                  <div
                    className={`exchangeable-status ${
                      product.exchangeable ? "available" : "unavailable"
                    }`}
                  >
                    {product.exchangeable ? "可兑换" : "朴分不足"}
                  </div>
                </div>

                <Button
                  variant={product.exchangeable ? "primary" : "disabled"}
                  size="medium"
                  disabled={
                    !product.exchangeable || exchangeLoading[product.id]
                  }
                  loading={exchangeLoading[product.id]}
                  onClick={() => handleExchange(product)}
                  className="exchange-btn"
                >
                  {exchangeLoading[product.id]
                    ? "兑换中..."
                    : product.exchangeable
                    ? "立即兑换"
                    : "朴分不足"}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductExchange;
