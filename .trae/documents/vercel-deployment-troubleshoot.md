# Vercel 部署失败深度排查计划

## 问题现状
- GitHub 代码已更新（包含 vercel.json）
- Vercel 预览消失，主域名无法访问
- 自动部署可能未触发或失败

## 排查步骤

### 步骤 1：确认 GitHub 代码状态
访问 https://github.com/bikhn/lvjing 确认：
- 根目录有 `vercel.json` 文件
- 根目录有 `index.html`、`package.json`、`vite.config.js`
- `src/` 目录存在且完整

### 步骤 2：在 Vercel 控制台检查部署状态
1. 登录 https://vercel.com/dashboard
2. 进入 lvjing 项目
3. 点击 **"Deployments"** 标签
4. 查看最新部署状态

### 步骤 3：手动触发新部署（关键步骤）
1. 在 Vercel 控制台点击 **"Deployments"**
2. 点击右侧的 **"..."** 菜单
3. 选择 **"Create New Deployment"**
4. 确保选择 `main` 分支
5. 点击 **"Deploy"**

### 步骤 4：查看构建日志
部署过程中点击 **"View Logs"** 查看：
- `npm install` 是否成功
- `npm run build` 是否成功
- 是否有任何错误信息

### 步骤 5：检查 Domains 配置
1. 在 Vercel 控制台点击 **"Domains"**
2. 确认 `lvjing.vercel.app` 状态为 "Valid"
3. 如果状态异常，点击刷新按钮

## 如果构建失败的常见修复

### 问题 A：npm install 失败
- 可能是 Node.js 版本问题
- 在 `package.json` 添加：
```json
"engines": {
  "node": ">=18.0.0"
}
```

### 问题 B：构建命令找不到
- 确保 `package.json` 有 build 脚本：
```json
"scripts": {
  "build": "vite build"
}
```

### 问题 C：vercel.json 配置错误
- 简化配置：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## 紧急备选方案：重新连接 GitHub

如果以上步骤都无效：
1. 在 Vercel 控制台点击 **"Settings"**
2. 找到 **"Git"** 部分
3. 点击 **"Disconnect"** 断开连接
4. 重新点击 **"Connect Git Repository"**
5. 选择 GitHub 的 lvjing 仓库

## 预期结果
完成后 Vercel 应该能成功构建并部署网站。