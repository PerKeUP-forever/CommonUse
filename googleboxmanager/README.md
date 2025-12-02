# 智能收纳箱助手 (SmartBox Inventory)

这是一个基于 React + Vite + Google Gemini AI 的物品收纳管理系统。

## 🛠️ 本地运行 (开发模式)

1.  **下载代码**：将所有文件保存到一个文件夹中。
2.  **安装依赖**：
    ```bash
    npm install
    ```
3.  **设置 API Key** (Windows PowerShell 示例)：
    ```powershell
    $env:API_KEY="你的_GOOGLE_GENAI_API_KEY"
    npm run dev
    ```
    (Mac/Linux 使用 `export API_KEY="..."`)
4.  **访问**：打开浏览器访问 `http://localhost:5173`

---

## ☁️ 方案 A：部署到云端 (Vercel) - 推荐 🔥

**优点**：完全免费，自动获得 HTTPS（**手机摄像头必须**），无需维护服务器。

1.  **上传代码到 GitHub**：
    *   在 GitHub 上创建一个新仓库（Repository）。
    *   在本地文件夹运行：
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin <你的仓库地址>
        git push -u origin main
        ```
2.  **在 Vercel 导入**：
    *   访问 [vercel.com](https://vercel.com) 并注册/登录。
    *   点击 **"Add New Project"** -> 导入刚才的 GitHub 仓库。
3.  **配置环境变量**：
    *   在 Vercel 的部署页面，找到 **"Environment Variables"** 部分。
    *   Key 填写：`API_KEY`
    *   Value 填写：`你的_GOOGLE_GEMINI_API_KEY` (注意：这是把 Key 暴露给前端构建，对于个人小项目通常可接受，严格生产环境建议使用后端代理)。
    *   **重要**：如果不设置这个，AI 功能将无法使用。
4.  **点击 Deploy**。
5.  **完成**：Vercel 会给你一个 `https://your-app.vercel.app` 的网址，在手机浏览器打开即可完美使用摄像头。

---

## 🏠 方案 B：部署到本地 NAS (Docker)

**优点**：数据隐私，运行在内网。
**缺点**：**由于没有 HTTPS，手机浏览器可能会默认禁用摄像头**。你需要配置 SSL 反向代理（如 Nginx Proxy Manager）才能在手机上正常使用。

### 步骤：

1.  **构建镜像**：
    将代码文件夹上传到 NAS（假设支持 SSH）或在电脑上构建好镜像导出。
    ```bash
    # 在代码目录下运行
    docker build -t smartbox-app .
    ```

2.  **运行容器**：
    ```bash
    docker run -d -p 8080:80 \
      --name smartbox \
      smartbox-app
    ```
    *注意：Docker 部署模式下，环境变量注入比较复杂，因为这是静态前端。最简单的方法是直接在 `services/geminiService.ts` 中硬编码 API Key，或者在构建时通过构建参数传入。*

3.  **解决摄像头问题 (NAS)**：
    由于通过 `http://192.168.x.x:8080` 访问时，Chrome 认为不安全。
    *   **方法 1 (推荐)**: 在 NAS 上配置反向代理（如群晖自带的反向代理），申请 Let's Encrypt 证书，通过 `https://box.yourdomain.com` 访问。
    *   **方法 2**: 使用电脑浏览器测试（电脑浏览器通常允许手动放行不安全内容，但没有后置摄像头体验不好）。

---

## 📦 备份与数据

目前系统使用浏览器 `LocalStorage` 存储数据。
*   **云端部署**：数据存在你手机的浏览器里。如果你换手机或清除缓存，数据会丢失。
*   **进阶改造**：如果要永久保存数据，需要开发一个简单的后端 API 来读写数据库（MongoDB/MySQL），并修改 `services/storageService.ts` 中的逻辑。
