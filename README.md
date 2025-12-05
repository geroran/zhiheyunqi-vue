# 智合云契 - WeiXin Mini Program / UniApp Project

## 项目简介
面向大学生和初入职场者的合同知识科普与智能工具平台。
基于 Vue 3 + Vite + UniApp 开发。

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **运行开发服务器**
   - 微信小程序模式:
     ```bash
     npm run dev:mp-weixin
     ```
     然后打开微信开发者工具，导入 `dist/dev/mp-weixin` 目录。
   
   - H5 预览模式:
     ```bash
     npm run dev:h5
     ```

## 目录结构
- `src/pages/`: 四大核心板块页面 (Knowledge, Tools, Practice, Profile)
- `src/mock/`: 数据模拟 (Mock Data)
- `src/static/`: 静态资源 (Icon等)

## 注意事项
- **TabBar 图标**: 项目默认配置了 TabBar 图标路径（`src/static/tabbar/`），但由于无法直接生成图片文件，请您自行在该目录下添加对应的 PNG 图片：
    - `book.png` / `book-active.png`
    - `tool.png` / `tool-active.png`
    - `game.png` / `game-active.png`
    - `user.png` / `user-active.png`
- **Mock数据**: 所有数据目前均为纯前端模拟，位于 `src/mock/index.js`，可按需修改。
