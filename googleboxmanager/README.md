# 智能收纳箱助手 (SmartBox Inventory)

这是一个基于 AI 的家庭物品收纳管理系统。支持二维码扫描、物品属性自动生成和智能语义搜索。

## 📥 如何使用

### 1. 准备环境
确保您的电脑上安装了 **Node.js** (推荐 v18 或更高版本)。

### 2. 安装依赖
打开终端（命令行），进入本项目文件夹，运行：
```bash
npm install
```

### 3. 设置 API Key
为了使用 AI 功能（Gemini），您需要在系统环境变量中设置 `API_KEY`。

**Linux/Mac:**
```bash
export API_KEY="你的_GOOGLE_GENAI_API_KEY"
npm run dev
```

**Windows (PowerShell):**
```powershell
$env:API_KEY="你的_GOOGLE_GENAI_API_KEY"
npm run dev
```

### 4. 启动项目
运行以下命令启动本地开发服务器：
```bash
npm run dev
```
启动后，浏览器会自动打开 `http://localhost:5173`。

---

## 🚀 部署到 GitHub Pages / Vercel

1. **GitHub**: 将所有文件上传到您的 GitHub 仓库。
2. **Vercel**: 
   - 登录 [Vercel](https://vercel.com)。
   - 点击 "Add New Project" 并导入您的 GitHub 仓库。
   - 在 "Environment Variables" (环境变量) 设置中，添加名为 `API_KEY` 的变量，填入您的 Key。
   - 点击 "Deploy"。

## 📱 手机使用注意事项
- 摄像头功能需要 **HTTPS** 环境。如果您在本地网络测试（如 `http://192.168.1.x`），摄像头可能会因浏览器安全策略被禁用。
- 建议使用 **ngrok** 或 **Vercel** 部署来获得 HTTPS 链接进行手机测试。
