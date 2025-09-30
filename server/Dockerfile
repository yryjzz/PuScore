# 使用官方的 Node.js 基础镜像
FROM node:22-alpine

# 设置工作目录为 /app
WORKDIR /app

# 将本地的 package.json 和 package-lock.json 文件复制到容器中
COPY package*.json ./
RUN npm ci

# 安装项目依赖
RUN npm install

# 将本地的源代码复制到容器中
COPY . .

# 暴露端口，这里假设你的应用运行在 3000 端口
EXPOSE 3000

# 定义环境变量，如果需要的话
ENV NODE_ENV=production

# 启动应用，这里假设你的应用入口文件是 src/app.js
CMD ["node", "src/app.js"]