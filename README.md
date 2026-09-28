# 💰 我的記帳 App (Starry Tracker)

這是一款使用 React 18 開發的個人記帳 App，除了基本的收支管理，也加入了多國語言、即時匯率換算、夢想存錢目標和圖表分析等功能，希望讓記帳不只是記錄花了多少錢，也能更直觀地了解自己的消費與財務狀況。

## ✨ 核心特色 (Key Features)

- 📝 **動態明細與多元篩選**：支援即時關鍵字搜尋、分類過濾、收支切換、批次全選與一鍵清空功能。
- 📊 **視覺化財務分析**：整合預算控制進度條、每日消費趨勢圖（Bar Chart）與支出類別佔比圖（Pie Chart）。
- 🎯 **錢包與夢想存錢目標**：可自訂夢想儲蓄目標，支援存入資金與進度條百分比連動。
- 📅 **跨月趨勢與歷史月報**：提供近 6 個月收支走勢圖表，方便掌握長期財務健康度。
- 💱 **即時 API 匯率與多幣別切換**：串接外部匯率 API，支援 TWD, USD, JPY, EUR, GBP, HKD, KRW 等多國貨幣動態換算。
- 🌍 **多國語言介面 (i18n)**：內建繁體中文、English、日本語、한국어 四種語言。
- 🌙 **白天 / 夜間模式與 Excel 匯出**：提供舒適的主題切換與 CSV/Excel 報表匯出功能。
- 🛡️ **localStorage 安全防禦架構**：採用 `try...catch` 防護與 `useState` 惰性初始化，防止隱私模式或 JSON 損壞導致白畫面當機。

---

## 🛠️ 技術棧 (Tech Stack)

- **前端框架**：React 18, React Router
- **狀態管理**：React Context API (`useAppContext`) + Custom Hooks
- **圖表繪製**：Recharts
- **資料儲存**：Browser LocalStorage + Safe Storage Handler (`storage.js`)
- **API 串接**：Fetch API (即時匯率更新)

---

## 🚀 快速開始 (Getting Started)

### 前置需求
請確保電腦已安裝 [Node.js](https://nodejs.org/) (v16.0.0 以上)。

### 安裝與啟動步驟

**複製專案 (Clone)**
   ```bash
   git clone [https://github.com/czy2007/accounting-app.git](https://github.com/czy2007/accounting-app.git)
   cd accounting-app

**安裝套件 (Install Dependencies)
npm install

啟動開發伺服器 (Run Development)
npm run dev
瀏覽器開啟 http://localhost:5173 即可開始使用！

打包專案 (Build for Production)
npm run build

## 🗓️ 30 天開發歷程 (Development Journey)

- **第一階段：基礎建立與 UI 打造 (Day 1 - Day 5)**：環境建置、JSX/CSS 靜態介面、`useState` 新增刪除與驗證防呆。
- **第二階段：資料流與進階管理 (Day 6 - Day 10)**：`localStorage` 地區化儲存、收支類型、編輯功能與搜尋過濾。
- **第三階段：元件拆分與圖表分析 (Day 11 - Day 20)**：Recharts 圖表整合、預算警示、CSV 匯出、暗黑模式與多幣別換算。
- **第四階段：路由、API 與作品集打包 (Day 21 - Day 30)**：React Router 多頁面、歷史月報、匯率 API 串接、Toast 提示、Context 重構與邊界測試。

---

## 📄 授權條款 (License)

MIT License © 2026 我的記帳 App