# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 🚀 React 學習筆記 - Day 12：Props 傳遞與元件溝通機制[cite: 1]

## 📌 核心概念總覽[cite: 1]

在 React 中，元件間的資料傳遞與溝通遵循嚴格的架構規範，以維護程式碼的可預測性與易維護性。[cite: 1]

---

## 💡 三大黃金法則[cite: 1]

1. **單向資料流（Unidirectional Data Flow）**[cite: 1]
   - 資料只能 **由上往下**（父元件 ➔ 子元件）透過 `Props` 傳遞。[cite: 1]
2. **Props 是唯讀的（Read-Only）**[cite: 1]
   - 子元件絕對 **不能直接修改** 傳進來的 `props`。[cite: 1] 嘗試直接賦值（如 `props.title = 'New'`）會引發錯誤。[cite: 1]
3. **狀態提升與函數回傳（State Hoisting）**[cite: 1]
   - 若子元件需要改變父元件或全域的狀態，必須由父元件傳遞 **修改狀態的函數（Callback Function）** 給子元件呼叫。[cite: 1]

---

## 🔄 元件間溝通的三種情境[cite: 1]

### 1. 父傳子（向下傳遞資料）[cite: 1]
- **用途**：父元件將 State 當作屬性傳給子元件，供子元件讀取與渲染畫面。[cite: 1]
- **特點**：單向傳遞，子元件不會回傳資料給父元件。[cite: 1]

```jsx
// 父元件 App.jsx
<Header currentMonth="2026-08"/>

// 子元件 Header.jsx
function Header({ currentMonth }) {
  return <h2>目前月份：{currentMonth}</h2>;
}
```[cite: 1]

---

### 2. 子傳父（向上通知 / 觸發變更）[cite: 1]
- **用途**：子元件透過呼叫父元件傳進來的 Callback 函數，通知父元件變更 State。[cite: 1]

```jsx
// 父元件 App.jsx
const handleDelete = (id) => {
  // 修改 App 狀態的邏輯
};
<ExpenseList onDelete="{handleDelete}"/>

// 子元件 ExpenseList.jsx
function ExpenseList({ onDelete }) {
  return <button onClick={() => onDelete(123)}>刪除</button>;
}
```[cite: 1]

---

### 3. 兄弟元件溝通（透過共同父元件）[cite: 1]
- **用途**：兩個子元件無法直接傳遞資料，必須將 State 提升至共同父元件 (`App.jsx`) 進行統一管理與同步。[cite: 1]

---

## 🎯 狀態（State）擺放位置判定法則[cite: 1]

- **放在子元件自己（私有 State）**：
  - 資料僅有該子元件自身使用（例：輸入框正在打字的草稿、選單開關狀態）。[cite: 1]
- **提升至共同父元件（共用 State）**：
  - 資料會影響兩個以上的元件，或需要統一同步儲存（例：記帳明細清單 `items`、目前選取的月份 `currentMonth`）。[cite: 1]

---

## 🛠️ 延伸技巧[cite: 1]

### 1. Props 預設值（Default Props）[cite: 1]
在解構 Props 時設定預設值，防止未傳遞參數時畫面壞掉：[cite: 1]
```jsx
function Header({ title = "預設標題" }) {
  return <h1>{title}</h1>;
}
```[cite: 1]

### 2. 組合元件（Children Props）[cite: 1]
使用 `children` 打造高重複利用性的通用外框元件：[cite: 1]
```jsx
function Card({ children }) {
  return <div className="card-box">{children}</div>;
}
```[cite: 1]