# 生日信网页

这是一个纯静态 H5 页面，iPhone、iPad、Mac 都可以用浏览器打开。核心功能是横屏优先的互动相册和一封生日信。推荐部署方式是私有 GitHub 仓库 + Vercel。

## 修改内容

- 信件正文：改 `app.js` 里的 `story.letter`
- 她的称呼：改 `story.herName`
- 开场文案：改 `story.heroTitle` 和 `story.heroText`
- 照片：把图片放到 `assets/photos/`，默认文件名是 `photo-1.jpg` 到 `photo-24.jpg`
- 照片说明：改 `story.photos`
- 背景音乐：放入 `assets/song.mp3`

## 两个主要功能

- 互动相册：横屏优先，默认支持 24 张照片；第一屏是参考视频式横向动态照片队列，包含中心大照片、左右照片流和上下交错照片。支持鼠标/触摸视差、左右拖动惯性、hover 持续流动、双击空白切换队形。点击照片先打开介绍面板，再点击图片进入纯照片模式。
- 一封信：点击信封后展开，正文会逐字出现；如果放了 `assets/song.mp3`，拆信时会播放音乐。

## 推荐推进顺序

先把框架和视觉效果在本地做稳定，再部署。照片文案、信件正文、音乐都可以后补；部署太早会导致每次大改都要重新检查线上版本。

更多当前决策和明天 TODO 见 `PROJECT_MEMORY.md` 和 `PROJECT_DOC.md`。

## 本地预览

建议使用本地服务预览：

```powershell
npm run dev
```

然后打开 `http://127.0.0.1:5173`。

## 检查

```powershell
npm run check
npm test
```

`npm test` 使用项目本地 `@playwright/test`，会生成桌面横屏、手机横屏、相册入场聚合、照片点击 FLIP、照片介绍层、纯照片模式、拖动动态光效和双击空白变阵截图，位置在 `output/playwright/verified-*.png`。
