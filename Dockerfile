FROM electronuserland/builder:wine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 设置淘宝镜像源并安装依赖
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm config set ELECTRON_MIRROR https://registry.npmmirror.com/-/binary/electron/ && \
    npm config set ELECTRON_BUILDER_BINARIES_MIRROR https://registry.npmmirror.com/-/binary/electron-builder-binaries/ && \
    npm install

# 复制其他项目文件
COPY . .

# 构建 Windows 版本
CMD ["npm", "run", "electron:build:win"] 