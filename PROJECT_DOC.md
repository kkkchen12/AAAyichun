# 生日互动相册项目文档

## 项目定位

这是一个给女朋友生日使用的私人网页。打开后先看到封面，再进入互动相册，最后可以拆开一封信。整体风格偏深色、梦幻、浪漫，参考用户给的视频中的“星空粒子 + 照片卡片舞台”效果。

## 项目内关键素材

- 参考视频已保存到项目内：`assets/reference/reference-album-effect.mp4`。
- 后续调相册时优先对照这个视频，而不是凭感觉改。重点看：照片是否铺得够满、队列是否整体流动、照片是否有前后层次、背景是否高级暗场、交互是否不需要额外播放按钮。
- 参考视频抽帧和联系表仍在：`output/reference/video-contact-sheet.jpg`、`output/reference/video-frame-01.jpg` 到 `output/reference/video-frame-08.jpg`。
- 当前主要验收截图在：`output/playwright/verified-*.png`。其中最重要的是 `verified-album-desktop.png`、`verified-album-auto-scene.png`、`verified-hover-stability.png`、`verified-album-iphone-landscape.png`、`verified-photo-detail.png`、`verified-letter-envelope-polish.png`、`verified-letter-full-text.png`、`verified-letter-full-text-bottom.png`、`verified-letter-overview.png`。

## 页面结构

1. **封面**
   - 生日标题。
   - 简短开场文案。
   - 入口按钮：先看照片墙 / 直接拆信。
   - 音乐按钮在右上角。

2. **互动相册**
   - 深色星空背景。
   - 默认支持 24 张照片卡片，第一屏使用参考视频式横向动态照片队列：中心聚焦、左右照片流、上下三层错位照片。
   - 鼠标或手指移动时产生整体舞台视差；左右拖动时整条照片队列连续流动并带惯性。
   - 鼠标停在照片上时，照片卡片会有局部高光和残影反馈；真实队列不被 hover 推动，以保证点击照片稳定。
   - 双击相册空白处切换队形，不依赖底部按钮。
   - 点击照片后先打开介绍层；再点击图片区域进入单独纯照片模式。
   - 介绍层支持上一张/下一张。
   - 不使用播放按钮和进度条，本质是互动相册，不是视频播放器。

3. **一封信**
   - 信封按钮。
   - 点击后信封展开。
   - 信件正文逐字显示；信纸打开后双击信纸区域可立即显示全文。
   - 信纸上有 `全览截图` 按钮，用更小字号和多栏排版在一个画面里展示整封信，方便截图；点击面板外暗色空白可退出。

## 如何替换内容

### 替换照片

把照片放进：

```text
assets/photos/
```

默认文件名：

```text
photo-1.jpg
photo-2.jpg
photo-3.jpg
photo-4.jpg
photo-5.jpg
photo-6.jpg
photo-7.jpg
photo-8.jpg
...
photo-24.jpg
```

如果想改照片数量、标题或说明，编辑 `app.js` 里的：

```js
story.photos
```

当前项目已经导入 24 张正式相册文件：`photo-1.jpg` 到 `photo-24.jpg` 都在 `assets/photos/` 中作为页面使用的正式照片。根目录临时导入用的 `photos/` 文件夹不进入仓库。

### 替换信件

编辑 `app.js` 里的：

```js
story.letter
```

每一项是一段文字。

当前 `story.letter` 已从 `C:\Users\kkkchen\Desktop\11111.docx` 导入正式长信内容，并在最后单独追加署名 `永远爱你的陈熠`。页面保留逐字显示的仪式感；长信较长，所以信纸区域可滚动阅读，双击信纸可直接显示全文，`全览截图` 可一屏展示整封信。

### 替换音乐

音乐文件放到：

```text
assets/music/
```

当前已经导入两首歌：

```text
assets/music/until-you-arrive.mp3  # 相册页，直到你降临
assets/music/love-you.mp3          # 信件页，爱你
```

相册页会自动尝试循环播放《直到你降临》，信件页会自动尝试循环播放《爱你》。右上角音乐按钮已经移到全局层，封面显示完整导航，相册和信件页保留右上角音乐开关，用来暂停或恢复当前页面的歌曲。

iPhone/Safari 仍可能因为浏览器自动播放策略拦截第一次播放；这种情况下，用户点右上角音乐按钮即可手动启动当前页面歌曲。

## 部署方案

推荐：

```text
私有 GitHub 仓库 + Vercel
```

原因：

- 私有仓库更适合放私人照片和情书。
- Vercel 会生成 HTTPS 链接，适合发给异地的她。
- 后续改内容后重新推送即可自动更新。

建议先在本地把框架、横屏交互、私密入口和基础视觉验收完成，再部署。照片、照片介绍、生日信正文和两首背景音乐已经完成正式替换。

## 本地运行和验收

```powershell
npm run dev
npm run check
npm test
```

- `npm run dev` 启动本地静态服务：`http://127.0.0.1:5173`
- `npm run check` 检查 `app.js` 语法。
- `npm test` 运行项目本地 `@playwright/test` 视觉验收，覆盖桌面横屏相册、手机横屏相册、照片介绍层和纯照片模式。
- 当前还额外覆盖私密入口、照片点击 FLIP、hover 后点击可靠性、hover 不长期卡住队列、返回封面、入场聚合、自动场景演化、拖动响应光效、双击空白变阵，以及封面按钮文案和信封视觉截图，截图包括 `output/playwright/verified-private-entrance.png`、`output/playwright/verified-private-unlocked.png`、`output/playwright/verified-photo-flight.png`、`output/playwright/verified-hover-stability.png`、`output/playwright/verified-album-intro-gather.png`、`output/playwright/verified-album-auto-scene.png`、`output/playwright/verified-album-drag-motion.png`、`output/playwright/verified-album-doubleclick-morph.png`、`output/playwright/verified-cover-polish.png`、`output/playwright/verified-letter-envelope-polish.png`、`output/playwright/verified-letter-full-text.png`、`output/playwright/verified-letter-full-text-bottom.png`、`output/playwright/verified-letter-overview.png`。
- 主相册用例现在会断言桌面照片宽度、可见照片集合覆盖宽度和覆盖高度，避免后续调整又退回“照片小、空隙大”的状态；同时继续检查 transform 定位、扫光变量和 camera 变量。
- 验收截图会生成到 `output/playwright/verified-*.png`，用于快速判断相册是否仍然符合参考视频方向。

## 当前相册动态

- 默认相册是横向 coverflow 式动态队列：中心照片聚焦但不再过分巨大，左右照片压暗并形成纵深，上下三层照片穿插，整体更接近参考视频的“整团动态相册集”。
- 最新一轮把默认照片卡片和左右队列整体放大、拉宽和加密，桌面横屏画面更接近铺满全屏的动态相册集，不再保留太多空白。
- 首次进入相册会先出现暗场聚合状态，照片从远处/中心散布再展开落到横向队列。
- 相册空闲时有更明显的低速连续流动；自动场景不再完全等到长时间静止才变化，而是带有低幅度常驻混合，逐步过渡到照片墙、花束和交叉队形。
- 自动照片墙不再是平整网格，已经改成更厚的照片堆：局部错位、前后遮挡、前景照片更突出，边缘有轻微闪光和残影。
- 鼠标或触摸拖动会驱动队列惯性，同时触发椭圆轨道光、扫光、方向性残影和每张照片自己的细微拖影。
- hover 照片只做局部高光、残影和短暂点击保护锁定；真实队列不会由 hover 推动，也不会因为鼠标停在照片上长期卡住。
- 双击空白处切换队形时会触发同一套光效反馈。
- 点击照片时会从原照片位置做 FLIP 镜头推进，再显现介绍层；再点图片或按钮进入纯照片模式。
- 纯照片模式里点击真实图片外侧的黑色区域可关闭返回，相当于给原图查看补了明确的退出路径。
- 单张照片可以从相册队列里手动拖出来查看位置关系，底部文字区和照片边缘也能起拖；双击空白切换队形时，拖出的照片会回到队列。
- 常态粒子以星尘和细光屑为主，变阵/打开照片时使用更克制的光片 burst，避免大面积花瓣造成卡通感。
- 中央诗句被压低为电影字幕感，不再像网页大标题长期抢相册主体。

## 2026-06-28 今天完成的工作

1. **确定实现方案**
   - 选择纯静态网页，而不是微信小程序或纯视频。
   - 确定最终发布路线是 **私有 GitHub 仓库 + Vercel 部署**。
   - 明确电脑横屏优先，手机横屏可用，手机竖屏作为兼容。

2. **搭建核心页面**
   - 完成封面、互动相册、一封信三个主页面。
   - 加入音乐入口；当前已经按页面分配两首音乐。
   - 信件区保留信封拆开和逐字显示正文的结构。

3. **导入照片并扩展相册数量**
   - 已把用户提供的真实照片复制进 `assets/photos/`。
   - 当前相册按 24 张设计；早期曾用重复照片补齐队列密度，现在已替换为 24 张正式照片。
   - 照片标题和说明已经完成正式内容替换，并做过一轮更浪漫的表达润色。

4. **按参考视频重做相册方向**
   - 从早期偏卡通/简单照片墙，改成暗色电影感、暗金玻璃、星尘粒子的视觉方向。
   - 相册从普通网格改成横向动态照片队列。
   - 加入中心照片、左右照片流、上下错层、照片墙、花束/漩涡、交叉队形等形态。
   - 加入拖拽惯性、自动场景演化、双击空白变阵。

5. **增强照片打开体验**
   - 点击照片先打开介绍层。
   - 再点击图片区域或按钮进入纯照片模式。
   - 支持上一张/下一张。
   - 加入 FLIP 镜头推进：照片从原位置飞到介绍层位置，减少普通网页弹窗感。

6. **修稳定性问题**
   - 修复 hover 或移动照片后点不开介绍层的问题。
   - 每张照片使用 pointer capture，轻点和拖拽分开判断。
   - hover 不再推动真实队列，只保留高光、残影和短暂锁定。
   - 保留拖拽推动队列、空闲低速流动和自动场景演化。

7. **补返回主页功能**
   - 加了左上角 `返回封面`。
   - 相册、信件、照片介绍层、纯照片层都可以回到封面。
   - 补了 `#home`、`#photoWall`、`#letter` 的 hash 路由同步。

8. **建立验证体系**
   - 已安装项目本地 `@playwright/test`。
   - `npm test` 当前 10 项，覆盖桌面相册、手机横屏、照片两段式查看、hover 后点击、hover 不长期卡住队列、返回封面、入场聚合、自动场景、拖拽、双击变阵，以及封面/信封视觉状态。
   - 最新验证：`npm run check` 通过，`npm test` 10/10 通过。

## 后续推荐路线

1. **先做内容终稿检查**
   - 当前 24 张照片和每张照片的标题、说明都已替换为正式内容，并做了一轮更浪漫的表达润色。
   - 后续只需要按用户口味微调个别措辞，不再把 `photo-15` 到 `photo-24` 当作重复补位。
   - 正式长信已导入，后续只需要按用户口吻微调个别表达。

2. **再继续对照视频调相册质感**
   - 继续微调默认三层照片流的密度、中心照片比例和侧翼纵深。
   - 继续优化自动场景的连续变形；照片墙已经改成厚照片堆，下一步更适合继续加强花束/漩涡和交叉队形的高级感。
   - 重点加强细粒子、照片边缘微闪、照片残影，不建议再加卡通心形或大花瓣。
   - 不建议恢复 hover 推动真实队列；如果一定要做，需要先重新设计点击命中逻辑。

3. **检查音乐和私密入口**
   - 当前相册页音乐为《直到你降临》，信件页音乐为《爱你》。
   - 右上角音乐按钮可暂停或恢复当前页面歌曲。
   - 私密入口已完成；正式部署后要用真实手机再测一次暗号和音乐按钮。

4. **做最终设备验收**
   - 电脑横屏：重点看相册震撼感和照片点击。
   - iPhone 横屏：重点看照片大小、返回封面、拖拽。
   - iPhone 竖屏：只要求可打开、可看信、可看照片，不追求最炫效果。

5. **最后再部署**
   - 初始化 Git。
   - 创建私有 GitHub 仓库。
   - 推送代码。
   - 用 Vercel 连接私有仓库部署。
   - 拿到 HTTPS 链接后再做最终手机打开测试。

## 明天继续时的优先级

1. 先打开 `assets/reference/reference-album-effect.mp4` 和 `output/playwright/verified-album-desktop.png` 对照，继续判断相册是否够满、够动态、够高级。
2. 继续微调横向照片队列的纵深、密度、光效、hover 视觉反馈和拖拽手感；照片要保持大、密、铺屏，不要退回小卡片和大空隙。
3. 检查每张照片的浪漫介绍是否符合用户口吻；当前 24 张照片已有正式标题和一句话说明。
4. 检查最终信件的个别表达；当前长信正文已导入网页。
5. 背景音乐已导入：相册页《直到你降临》，信件页《爱你》。
6. 添加私密入口，例如输入昵称、生日或纪念日才能进入。
7. 每次视觉调整后运行 `npm run check` 和 `npm test`，并看 `output/playwright/verified-*.png`。
8. 最后做私有 GitHub 仓库 + Vercel 部署。

## 2026-06-29 进展

- 自动照片墙 scene 从规整网格改成更有厚度的照片堆。
- 具体实现包括：收紧列距、增加局部错位、部分照片向前突出、z 轴深度拉开、边缘微闪和更强 scene 残影。
- 继续调整花束/漩涡和交叉队形的 JS 布局参数，让自动场景不只是平面网格，而是有更明显的前后层次、旋转角度和照片遮挡。
- 照片基础尺寸整体放大：桌面横屏的默认照片宽度上调，iPhone 横屏和竖屏兼容尺寸同步上调，最新截图为 `output/playwright/verified-album-desktop.png` 和 `output/playwright/verified-album-iphone-landscape.png`。
- 修复“鼠标放到照片上后相册旋转像卡住”的稳定性问题：hover 锁定从长时间冻结改为短暂点击保护并加节流，真正按下照片时才短暂锁住点击窗口；CSS hover 不再强行把照片旋转归零，而是保留当前队列姿态后轻微放大。
- 继续修复 hover 闪烁和动画卡顿：照片位置从 `left/top` 改为 `translate3d` 变量驱动，避免频繁布局重算；hover 不再改变卡片真实 transform 和 hitbox，只提亮当前照片。
- hover 残影从“全相册 24 张照片一起开启”改为只作用在当前 `is-hovered` 照片，避免鼠标移动到照片边缘时全局滤镜反复闪烁。
- 在 transform 定位稳定后，把相册主队列更新节奏提升到每帧 RAF，减少之前偏 30fps 的队列抖动感。
- 新增视频参考方向的焦点扫光：JS 计算 `--sweep-x/y/intensity`，CSS 在舞台光效层和照片玻璃层做横向掠光；它只影响视觉，不改变照片 hitbox 和点击逻辑。
- Playwright 首个相册用例现在检查照片确实走 transform 定位、`--x-px` 可用、扫光变量处于合理范围，避免后续改动退回 `left/top` 动画。
- 新增自动镜头推拉：`updateAlbumCamera()` 每帧输出 `--camera-x/y/z`、`--camera-roll`、`--camera-tilt-x/y`、`--camera-scale`，让整组照片有轻微推近、横移、滚转和呼吸感，方向跟随队列速度和自动 scene 强度。
- 镜头运动只加在 `.photo-cards` 整体层，幅度受测试约束；它不改单张照片的 pointer capture、点击阈值、hover 状态或照片详情打开流程。
- 新增 Playwright 回归 `keeps the album flowing while hovering a photo`，验证鼠标停在照片上后照片队列仍然继续位移；截图为 `output/playwright/verified-hover-stability.png`。
- 按浏览器标注完成封面和全局 UI 质感修正：顶部导航改为 `相册`、`信`，封面按钮改为 `回忆`、`祝福`，`HAPPY BIRTHDAY` 加大并改成暗金渐变标题感。
- 封面、相册、信件区从偏蓝/偏卡通改成深酒红、暗金、低饱和电影感；全局按钮和导航加入暗金描边、玻璃质感、细扫光和更克制的 hover 反馈。
- 粒子系统从偏花瓣/爱心改成更密的光尘和细闪，并在页面打开时预填充一批粒子，让封面和信件区第一眼更有动态氛围。
- 信封从简单平面按钮重做成更精致的暗金纸质信封，保留点击拆信和信纸抽出动画。新增截图：`output/playwright/verified-cover-polish.png`、`output/playwright/verified-letter-envelope-polish.png`。
- 最新验证：`npm run check` 通过，`npm test` 10/10 通过。

## 2026-06-30 进展

- 根据“照片小、空隙多”的反馈，继续放大默认相册：扩大横向队列跨度，提高侧翼照片的 scale、opacity 和 depth，增强三层照片流的铺屏感。
- 桌面默认照片、低高度横屏照片、手机横屏照片和竖屏兼容照片尺寸都同步上调；后续再改布局时不能把这些尺寸重新压小。
- 为防止放大后又被文字遮挡，低高度横屏下把舞台诗句进一步压成更轻的电影字幕，不让它长期盖住照片主体。
- 修复鼠标放在照片上导致动画卡住/闪烁的后续问题：`pointerenter` 不再刷新长交互时间，自动场景不再因为 hover 直接暂停，只在拖拽和照片弹层时停止演化。
- hover 仍保留很短的点击保护窗口，但它只用于防止点击误判；鼠标停在照片上时，相册队列和自动 scene 仍会继续流动。
- 默认自动 scene 的常驻混合强度提高，空闲时更快出现照片墙、花束/漩涡和交叉队形的轻微变形，不再像静态照片墙。
- hover 残影继续保持克制，非 hover 照片的残影透明度被压低，避免鼠标扫过照片边缘时出现整屏闪烁。
- Playwright 主相册测试增加照片宽度和可见覆盖面积断言；重点保证桌面横屏画面足够大、足够满，同时不破坏照片点击、hover 稳定性、手机横屏和自动场景。
- 继续按最新反馈修稳定性和照片质感：hover 现在只保留一个 `hoveredPhotoTile`，进入新照片会清掉上一张的 hover 状态，拖拽开始也会清空 hover，避免重叠照片反复抢状态。
- 鼠标移动时的相册视差写入改为按位移和时间节流，普通轻微移动不会持续给 24 张照片写变量；拖拽仍然保持及时响应。
- 删除 `.photo-cards` 的常驻大范围 `drop-shadow`，并取消每张照片独立 `cardFloat`/filter 动画；整体运动继续由 RAF 队列、扫光和镜头层负责，避免 hover 时重新引发 GPU/滤镜卡顿。
- hover 不再把照片固定提升到 `z-index: 160`，减少重叠照片流里因为层级突然改变导致的命中抖动。
- 照片视觉从透明玻璃片继续改成实体照片：提高主队列和场景照片 opacity，降低常态 blur，提高图片亮度/对比/饱和，减轻全局残影；入场 ghost 单独压低，避免聚合阶段糊成一团。
- Playwright 增加质感/稳定性断言：主相册检查照片卡无独立动画、整组照片无全局 filter、主照片 opacity 足够高；hover 测试检查不固定跳层到 160、非 hover 残影更低。
- 按最新要求重新完整观看参考视频并抽帧：新增 `output/reference/video-timeline-1fps-contact-sheet.jpg`、`output/reference/video-timeline-crop-contact-sheet.jpg`，以及 `output/reference/timeline/`、`output/reference/timeline-crop/` 下的逐秒帧，后续继续改相册时优先对照这些图，而不是只凭印象调效果。
- 相册新增自动单张照片抽出机制：空闲时一张照片会从队列中被单独拿到前景，背景照片退成有景深的弧形/队列；抽出的照片更大、更清晰、显示编号和标题，截图为 `output/playwright/verified-album-spotlight-extract.png`。当前卡片编号样式已改为 `LOVE NOTE XX`。
- 抽出机制会在拖拽、打开照片弹层、双击空白切换队形或自动进入下一段时复位，符合“单张照片拿出来，换样式再重置过去”的方向；后续不要把它改成一直固定在前景的普通弹窗。
- 自动 scene 循环新增第 4 种竖向矩阵/帘幕队形，用来贴近参考视频里竖排照片墙和幕布式变化；当前相册已经不只是横向 coverflow、照片墙、花束/漩涡、交叉队形。
- 手机低高度横屏再次修正：上方诗句更小、更淡、更靠上，避免覆盖主照片；`captures phone landscape album` 现在会断言诗句透明度、底部位置和标题字号。
- Playwright 新增 `extracts a single photo during automatic scene evolution and then resets`，验证前景照片尺寸、清晰度、层级、标题显示和自动复位。
- 最新验证：`npm run check` 通过，`npm test` 11/11 通过。
- 已开始建立 GitHub/Vercel 路线：本地 Git 仓库已重新初始化到 `main`，初始提交为 `a73b01d chore: initialize birthday album project`。`.gitignore` 已避免提交 `node_modules/`、测试截图、Codex 临时目录和 `.env*`。
- 远程 private repo 已在用户刷新 `gh` 权限后创建并推送成功：`https://github.com/kkkchen12/AAAyichun`。
- 用户反馈上一版自动相册效果不如之前，主要问题是照片整体闪烁、动画不受控制。本轮已回收自动效果：默认关闭自动 spotlight 抽出，自动 scene 只保留低强度背景混合，扫光、相机推拉、stage veil 和照片残影全部降幅。
- 测试同步改成稳定性约束：`captures restrained idle cinematic motion` 和 `keeps automatic album motion restrained without spotlight flicker` 会验证空闲时相册仍有轻微流动，但不会自动出现 spotlight 卡片、不会强残影闪烁、scene blend 不会过强。最新验证：`npm run check` 通过，`npm test` 11/11 通过。
- GitHub private repo 已创建并推送：`https://github.com/kkkchen12/AAAyichun`。后续每次大改相册动效都要先本地验证，再 commit/push，避免不可控版本覆盖稳定状态。
- 部署前私密入口已加入：任何 hash 路由进入前都会先显示暗金玻璃质感口令门，暗号配置在 `app.js` 的 `story.privateCodes`，当前暗号为 `20030518`。正确输入后解锁状态会保存在本机 `localStorage`，并回到原本想打开的相册或信件路由。
- 私密入口只是一层前端口令门，不是后端鉴权或照片加密。它适合正式链接发给她之前增加私密感和基础防误开，但 Vercel 链接本身仍然是公开 URL；正式发送前页面上不要显示开发提示或暗号配置说明。
- Playwright 已新增私密入口回归：`guards the site behind a private entrance` 会验证未解锁状态、错误暗号提示、正确暗号解锁和 hash 路由恢复，并生成 `verified-private-entrance.png`、`verified-private-unlocked.png`。
- 修复照片介绍页完整照片按钮无效的问题：按钮当前显示为 `看见完整的你`，会拦截 `pointerdown/click`，并在切到纯照片模式时清理未完成的照片飞入/reveal 状态。
- 修复原图打开后不好返回的问题：纯照片模式点击图片外侧黑色区域关闭照片层，Escape 仍然可用。
- 单张照片拖动重做为更稳定的 pointer 控制器：从照片整体、底部文字区或边缘起拖都能把这张照片拖出队列；拖动中由 document 级事件继续跟随，不会因为鼠标离开小区域就中断。
- 为避免 hover 和重叠层级抢命中，照片上方不再触发会推开卡片的舞台视差；单张拖动近邻命中按距离优先，整面相册拖动则从真实空白区域开始。
- Playwright 当前扩展到 13 项：新增/收紧完整照片按钮、纯照片外侧关闭、单张照片底部区域拖出、切换队形复位、真实空白区拖动整面相册等回归。最新验证：`npm run check` 通过，`npm test` 13/13 通过。
- 在不改动上述交互链路的前提下，继续按参考视频加强相册舞台：默认横向 ribbon 略微拉宽、下沉并增加纵深，照片队列更像铺开的整团相册，背景低频光场、底部暗金椭圆光、舞台流光和照片边缘材质都进一步加强。
- 这轮质感增强仍然避开会重新导致闪烁的路径：不恢复 `.photo-cards` 全局 filter/drop-shadow，不恢复单卡 `cardFloat` 动画，不开启默认自动 spotlight；主相册测试新增 `.stage-flow` 和 `.photo-cards::after` 可见度断言，防止后续把舞台光感又改没。
- 照片介绍页新增手动聚焦动作：按钮当前显示为 `放到星河中央`，它不是自动动画，而是用户主动把当前照片放回相册舞台前景，背景照片形成景深队列，贴近参考视频里“单张照片抽出再复位”的效果。再次点击前景照片或点击暗场空白会取消聚焦，双击暗场会切换队形并让聚焦照片复位。
- Playwright 新增手动聚焦回归，截图为 `output/playwright/verified-manual-spotlight.png`；后续改 spotlight 时要守住：默认自动 spotlight 关闭、手动入口可用、再次点击前景照片可取消、切换队形可复位。
- 双击空白切换队形现在会触发短促的手动 scene pulse：在用户主动变阵时短暂混入照片墙/花束/交叉/竖幕的高级光场和深度感，约 1.55 秒后回到稳定队列。它不等同于自动 scene，默认空闲自动 scene 仍然关闭。
- Playwright 已加强 `captures blank-area double click layout morph`：变阵瞬间必须有受控 scene blend，但强度不能超过稳定阈值；等待后必须回到 scene 0，避免再次出现整体照片闪烁或动画不受控制。
- 单张照片拖动继续扩大可移动范围：拖动时用跟手中心点和放大位移增益计算位置，允许照片接近舞台外沿；同时把拖出照片 `scale` 固定为 1，并压低 `--drag-motion`，避免拖单张时整面相册跟着放大或触发整组舞台动效。
- Playwright 已收紧 `allows a single photo to be dragged out and reset by layout switch`：拖动距离加大，测试会确认没有进入整面相册拖动、`--drag-motion` 保持低值、`--camera-scale` 不放大、拖出照片本身不被 scale 放大。
- 继续按参考视频补舞台体积感：`stage-aperture` 入场后也保留低强度底部体积光和横向反射光带，让照片像站在暗金舞台上，而不是悬在纯黑背景里；这只走 CSS 光层，不恢复全局 `.photo-cards` filter。
- 照片材质继续往实体相纸推：增强 `.photo-media` 内缘光、顶部微反光、暗部压边和扫光，让真实照片更厚、更亮、更有边缘质感；Playwright 主相册用例新增 aperture 光层和相纸 `box-shadow` 断言，防止后续把这一层质感删掉。
- 新增 `.photo-depth-rail` 远景照片轨道：它位于主照片层后方，使用真实照片生成一组更小、更暗、更远的相纸缩略图，补足参考视频里“远处仍有照片群在流动”的密度和纵深。
- 远景轨道完全不参与点击和拖动，`pointer-events: none`，只跟随现有 RAF 布局写入 `transform` 和受控 opacity；DOM 节点会在渲染后缓存，避免每帧全局查询。
- 默认桌面照片尺寸从上一轮偏大的状态收回到更克制的区间，让相册更像一整团密集照片队列，而不是一张巨大的中心卡片；手机横屏和竖屏规则同步收窄，避免小屏拥挤。
- 相纸材质继续加厚但仍走低成本路径：通过 `.photo-tile`、`.photo-tile::after` 和 `.photo-media` 的内侧边缘光、侧边压暗和暗金外缘光实现，不恢复全局 filter/drop-shadow 或单卡浮动动画。
- Playwright 主相册用例新增远景轨道断言：验证 `.depth-photo` 数量、不可命中、透明度范围、transform 定位、尺寸小于主照片，同时继续守住无 `.photo-cards` 全局 filter、无单卡动画、无 opacity 动画。
- 按用户要求把相册相关文字整体改成更适合送给女朋友的浪漫语气：24 张照片标题和一句话介绍已重写，舞台诗句、队形状态、相册说明、完整照片按钮、手动聚焦按钮和卡片编号也统一改成更柔和的礼物表达。
- 本轮是内容文案改动，没有改变相册 RAF 布局、hover、拖拽、手动聚焦、纯照片关闭或队形切换复位等稳定交互路径。
- 从 `C:\Users\kkkchen\Desktop\11111.docx` 导入正式生日信正文到 `story.letter`，并在末尾另起一段署名 `永远爱你的陈熠`，当前共 51 段页面正文；继续保留逐字显示效果。
- 为长信补充双击信纸立即显示全文的交互，并让信纸在打开后置于前景、信封退到背景；Playwright 新增全文顶部和底部截图，确认长信可滚动读到右下角署名。
- 新增 `全览截图` 面板：它不是阅读模式，而是截图模式，会用自动缩小字号和多栏排版把整封信压进一个画面，点击面板旁边暗色空白退出。Playwright 会断言全览内容无横向/纵向溢出，并输出 `verified-letter-overview.png`。
- 导入两首正式歌曲：`assets/music/until-you-arrive.mp3` 用于相册页自动循环播放《直到你降临》，`assets/music/love-you.mp3` 用于信件页自动循环播放《爱你》；右上角音乐按钮可手动暂停/恢复当前页面歌曲。
- 顶部导航已移到全局层，封面显示 `相册` / `信` / 音乐，相册和信件页隐藏文字导航但保留右上角音乐按钮，避免按钮被当前页面 section 拦截。
- 修复 `再把爱读一遍`：按钮现在直接重启信件逐字显示，清空正文、移除完成态并把信纸滚动回顶部，不再复用已经打开后的信封动画流程。
- Vercel 生产链接为 `https://aaayichun.vercel.app`，项目名 `aaayichun`，已连接私有 GitHub 仓库 `https://github.com/kkkchen12/AAAyichun`。`.vercelignore` 会排除测试输出、参考视频和开发目录，但保留正式页面、照片、音乐和主视觉资源。

## 明天重开对话快速接续

明天继续时，可以直接从下面这几件事开始：

1. 运行 `npm run dev`，打开 `http://127.0.0.1:5173/#photoWall`。
2. 同时打开参考视频 `assets/reference/reference-album-effect.mp4`，也打开 `output/reference/video-timeline-crop-contact-sheet.jpg`，重点对照相册整体铺屏感、照片队列流动、前后层次和背景质感。
3. 当前可继续优化相册视觉，也可以开始 Vercel 预部署：照片还可以继续变得更满、更像一整团动态相册集；UI 继续沿用深酒红、暗金、玻璃、细光尘的方向，但不要再默认开启自动 spotlight 单张抽出。
4. 不能破坏的交互：单击照片先开介绍层，再点击图片进入纯照片；双击空白切换队形；拖拽推动照片流；hover 不应该让相册卡住或闪烁；左上角返回封面必须可用。
4.1. 不能破坏的单张照片交互：介绍页按钮必须能进入纯照片；纯照片点击图片外黑色区域必须关闭；照片底部文字区/边缘也必须能起拖；单张拖动范围要接近舞台外沿，且不能触发整面相册放大；切换队形必须让拖出的照片复位。
4.2. 手动聚焦交互不能破坏：介绍页 `放到星河中央` 必须能把当前照片抽回相册前景；再次点击前景照片或点击暗场取消；双击暗场切换队形并复位。
4.3. 手动变阵脉冲不能破坏：双击空白时可以短暂出现 scene 光场/深度，但必须自动回落；不要重新打开空闲自动 scene。
4.4. 舞台体积光和相纸材质可以继续增强，但必须保持低强度、CSS 光层和单卡伪元素路径；不要用全局 filter/drop-shadow 或独立卡片动画换质感。
4.5. 信件交互不能破坏：点击信封后仍然逐字显示；双击信纸必须立即显示全文；长信信纸必须可滚动到底部并看到右下角署名；`全览截图` 必须在一个画面里显示整封信，并且点击外侧空白能退出。
4.6. 音乐交互不能破坏：进入相册页应尝试播放《直到你降临》，进入信件页应尝试播放《爱你》；右上角音乐按钮在相册和信件页都必须可点击，用来暂停或恢复当前页面歌曲。
5. 不能回退的技术约束：照片定位继续用 `--x-px`/`--y-px` + `translate3d`，不要恢复 `left/top` 动画；hover 不要推动真实队列；不要用全局强残影覆盖 24 张照片；不要恢复全局 filter/drop-shadow、单卡浮动动画或默认自动 spotlight。
6. GitHub private repo 已是 `https://github.com/kkkchen12/AAAyichun`；Vercel 生产链接是 `https://aaayichun.vercel.app`。
7. 私密入口已经可用，当前暗号为 `20030518`；正式发给她前在部署 URL 上重新测一次错误暗号、正确暗号、相册音乐、信件音乐、右上角音乐开关和 `再把爱读一遍`。
8. 继续改完后运行 `npm run check` 和 `npm test`。重点查看 `output/playwright/verified-private-entrance.png`、`verified-single-photo-drag.png`、`verified-photo-full.png`、`verified-album-auto-scene.png`、`verified-hover-stability.png` 和 `verified-album-iphone-landscape.png`。
