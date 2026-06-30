# AAAYichun Project Memory

## Current Goal

给女朋友生日用的私人网页，最终走 **私有 GitHub 仓库 + Vercel 部署**。网页应能在 Mac/Windows 电脑横屏、iPhone 横屏和竖屏打开，重点是表达爱意，而不是做成工具型页面。

## Product Direction

当前确认的核心功能只有两个：

1. **互动相册**
   - 横屏优先。
   - 参考用户提供的视频效果：深色梦幻背景、星光/爱心粒子、照片卡片聚拢成舞台队形。
   - 不要播放按钮，不要播放进度条，不做“视频播放器”感。
   - 鼠标或触摸移动时，照片卡片要有轻微视差和 3D 倾斜。
   - 默认第一屏改为更接近参考视频的横向动态照片队列：中间大照片、左右密集照片流、上下竖向交错照片。
   - 鼠标或触摸左右拖动时，整条照片队列会连续流动，并带惯性。
   - 鼠标停在照片上时，照片卡片会有局部高光、残影和短暂锁定；真实队列暂不由 hover 推动，避免再次出现点不开照片的问题。
   - 双击相册空白处切换队形，不再依赖底部按钮。
   - 点击任意照片后，先打开照片介绍层；再点击图片区域进入单独纯照片模式。
   - 支持上一张、下一张。
   - 保留隐藏的“切换队形”按钮作为备用，不作为主要交互。

2. **一封信**
   - 保留信封拆开效果。
   - 信件正文逐字出现。
   - 可配音乐，但音乐应该是辅助，不要抢主视觉。

## Current Implementation

- 纯静态网页，无后端。
- 主文件：
  - `index.html`
  - `styles.css`
  - `app.js`
  - `assets/hero-letter.png`
  - `assets/photos/`
- 当前本地预览服务：
  - `http://localhost:5173`
- 已生成视觉检查截图：
  - `output/final-fullpage.png`
  - `output/final-desktop-album.png`
  - `output/final-iphone-landscape-album.png`
- 项目内参考视频：
  - `assets/reference/reference-album-effect.mp4`
- 参考视频抽帧：
  - `output/reference/video-contact-sheet.jpg`
  - `output/reference/video-frame-01.jpg` 到 `output/reference/video-frame-08.jpg`

## Design Decisions

- 不做微信小程序，原因是审核和配置成本高，浪漫感弱。
- 不做纯视频，原因是用户需要互动照片墙和单张照片介绍。
- 不使用播放按钮和进度条，避免误导成视频播放器。
- 最终部署选择 **private GitHub repo + Vercel**，比 GitHub Pages 更适合私密照片和情书。
- 真实照片不要引用微信临时目录，要复制到 `assets/photos/`。
- 照片文案和信件正文可以后补，当前优先级是先把框架、横屏互动和视觉质感做稳定。
- 不建议先部署再大改；更稳的顺序是本地框架验收 -> 填照片/音乐/口令 -> 私有 GitHub -> Vercel。
- 当前相册默认支持 24 张照片，通过 `story.photoCount` 控制。
- 2026-06-28 已把视觉方向从卡通生日海报改为暗色电影感/暗金玻璃风格：封面、相册、信件区都压低饱和度，减少可爱粉色元素。
- 2026-06-28 默认相册排版再次调整为参考视频式横向照片队列，包含中心大卡、左右照片流、上下竖向交错照片；自动变阵已取消，改为双击空白切换。
- 2026-06-28 相册交互已改为队列相位 `queueOffset/queueVelocity`：拖拽、空闲低速流动和惯性会推动同一条照片流；hover 只做视觉反馈和短暂锁定，不能直接推动真实队列，除非同时重做点击可靠性。
- 2026-06-28 照片打开流程已改为两段式：单击照片先看介绍，再点击图片区域进入纯图模式；缺图占位也能触发这个流程。
- 2026-06-28 已将用户提供的 14 张真实照片复制到 `assets/photos/photo-1.jpg` 到 `photo-14.jpg`，并重复补齐 `photo-15.jpg` 到 `photo-24.jpg`。相册已经不再依赖微信临时路径。
- 2026-06-28 真实照片导入后，继续把相册风格压成暗场电影感：中心照片更大，左右队列更密，卡片底部只保留低调 `MEMORY XX` 编号，减少网页卡片感。
- 2026-06-28 照片详情层已对齐“两段式”要求：点击照片先打开左图右文介绍面板，点击图像区域进入纯照片模式；左右切换按钮改为两侧悬浮。
- 2026-06-28 已安装 `@playwright/test`，新增 `npm run dev`、`npm run check`、`npm test`，并加入 `tests/visual-album.spec.js` 做桌面相册、手机横屏、照片介绍层、纯照片模式的视觉验收。
- 2026-06-28 继续按参考视频方向增强相册动态：新增舞台光效层 `stage-lightfields`，包含椭圆轨道光、扫光、拖动方向残影；JS 将拖动速度、hover 流动和队列方向映射到 `--drag-motion`、`--flow-direction`、`--pointer-x/y` 等 CSS 变量。
- 2026-06-28 默认队列算法继续强化 coverflow/视频队列感：中心照片更大更亮，侧向照片更暗更有纵深，竖向交错照片保持队列穿插感。
- 2026-06-28 相册常态粒子改成细星尘/光屑，避免大花瓣造成卡通感；打开照片或变阵时改为更克制的星尘和光片 burst。
- 2026-06-28 为每张照片新增真实图片残影层：拖拽、hover 和双击变阵时根据队列方向生成细微运动拖影；当前 `layout-0` 常态保留极弱照片残影，增强连续照片流感觉，但真实队列仍不由 hover 推动。
- 2026-06-28 详情层按钮已改为“打开完整照片”，流程保持：单击照片先看介绍，再点图片或按钮进入纯照片模式。
- 2026-06-28 `@playwright/test` 已作为项目本地依赖可用，不需要依赖全局安装；本轮 `npm run check` 和 `npm test` 均通过。
- 2026-06-28 新增相册入场时间线：首次进入 `#photoWall` 时照片先从暗场/远处聚合，再展开落到横向 coverflow 队列，截图验收为 `verified-album-intro-gather.png`。
- 2026-06-28 拖拽速度改为平滑队列速度并延长惯性，舞台新增 `stage-flow` 光带和 `stage-aperture` 暗场幕，强化“整束照片被推动”的流动感。
- 2026-06-28 详情层视觉继续压低网页 modal 感：降低圆角和紫色卡片感，改成暗场薄描边、低饱和玻璃质感。
- 2026-06-28 照片点击已加入 FLIP 镜头推进：从原始 `photo-tile` 克隆一张飞行照片推进到详情层图片位置，再显现介绍卡；中间截图为 `verified-photo-flight.png`。
- 2026-06-28 `npm test` 现在包含 5 项视觉验收并输出多张截图：桌面相册+照片 FLIP+两段式照片查看、手机横屏相册、入场聚合、拖动响应光效、双击空白变阵。
- 2026-06-28 新增全局 `返回封面` 控件：相册、信件、照片介绍层和纯照片层都能回到封面；同时补了 hash 路由同步，直接访问或切换 `#home`、`#photoWall`、`#letter` 都会切到对应页面。
- 2026-06-28 当前 `npm test` 已扩展到 8 项，新增 `returns to the cover from routed pages and photo overlay`，验证返回封面不会破坏相册点击和照片弹层关闭。
- 2026-06-28 本轮继续按参考视频优化默认相册：`type === 0` 从单条 coverflow 改为更密的三层照片流，中心照片略缩小，侧翼照片收紧到中心区域，上下错层更像整团动态相册集。
- 2026-06-28 自动场景演化从“等待后切换”改为带低幅常驻混合：默认队列会持续混入照片墙、花束、交叉队形的轻微变形，再逐步过渡到高强度 scene。
- 2026-06-28 提升相册空闲低速流动和默认光流强度，新增常态微弱照片残影；中央诗句进一步压成电影字幕感，不再长期抢相册主体。
- 2026-06-28 最新验证：`npm run check` 通过；`npm test` 8/8 通过。最新重点截图仍是 `verified-album-desktop.png`、`verified-album-auto-scene.png`、`verified-album-drag-motion.png`。
- 2026-06-29 继续优化自动照片墙 scene：`mode === 1` 从规整网格改为厚照片堆，列距收紧，加入局部错位、前景 pop、z 轴深度、边缘微闪和更强 scene 残影，目标是更接近参考视频里的密集相册云。
- 2026-06-29 本轮仍未改照片点击链路；hover 继续只做视觉反馈。最新验证：`npm run check` 通过；`npm test` 8/8 通过。
- 2026-06-29 照片尺寸已整体放大：桌面横屏默认照片宽度、iPhone 横屏宽度和竖屏兼容宽度都上调；后续再调布局时要注意不要把中心照片重新压回偏小状态。
- 2026-06-29 修复 hover 后相册旋转像卡住的问题：hover 只保留短暂点击保护锁定并加节流，鼠标停在照片上不会长期冻结 `queueOffset`；真正按下照片时才临时锁住，保证点击介绍层稳定。
- 2026-06-29 CSS hover 不再强制 `rotate(0deg)` 或固定 `translateZ(86px)`，改为保留当前 `--rotate`、`--yaw`、`--pitch`、`--depth` 后轻微放大，避免 hover 和 JS 队列姿态抢控制权。
- 2026-06-29 `npm test` 已扩展到 9 项，新增 `keeps the album flowing while hovering a photo`；最新验证：`npm run check` 通过，`npm test` 9/9 通过。新增截图：`verified-hover-stability.png`。
- 2026-06-29 进一步修复 hover 闪烁和动画卡顿：照片定位从频繁写 `left/top` 改为写 `--x-px/--y-px` 并用 `translate3d` 合成层移动；后续不要再恢复 `left/top` 动画。
- 2026-06-29 hover 视觉只允许作用到当前 `.photo-tile.is-hovered`：不要再用 `.photo-wall.is-hover-flow` 给全相册照片一起开强残影、全局 drop-shadow 或重滤镜，否则会造成鼠标边缘闪烁和帧率下降。
- 2026-06-29 在 transform 定位稳定后，相册主循环的布局更新节奏已提升到每帧 RAF；当前测试会确认照片使用 `--x-px`/`translate3d`，不要再回退到 `left/top`。
- 2026-06-29 新增焦点扫光系统：`updateAlbumSweep()` 每帧计算 `--sweep-x`、`--sweep-y`、`--sweep-intensity`，舞台光效层和每张照片的 `--sweep` 做掠光；它只做视觉，不影响照片 hitbox、hover 或点击链路。
- 2026-06-29 新增自动镜头推拉系统：`updateAlbumCamera()` 每帧输出 camera 位移、z 推拉、roll、tilt 和 scale，挂在 `.photo-cards` 整组层；幅度必须保持克制，不要改照片单卡 hitbox、pointer capture、点击阈值或详情打开链路。
- 2026-06-29 主相册测试已加入 camera 变量范围断言，防止后续镜头推拉过强导致画面漂移或点击变差；最新验证仍为 `npm run check` 通过，`npm test` 9/9 通过。
- 2026-06-29 按用户浏览器标注完成一轮全局高级质感修正：导航文案改为 `相册` / `信`，封面按钮改为 `回忆` / `祝福`，`HAPPY BIRTHDAY` 改成更大的暗金渐变标题。
- 2026-06-29 封面、相册背景和信件页继续从偏蓝/偏卡通转向深酒红、暗金、低饱和电影感；按钮、导航、返回封面和相册备用按钮统一增加玻璃质感、暗金描边和细扫光 hover。
- 2026-06-29 粒子系统改成更密的光尘/细闪，并预填充初始粒子；非 album 页面不再生成明显心形/大花瓣，后续继续避免卡通粒子。
- 2026-06-29 信封视觉从简单平面按钮重做为暗金纸质信封，保留拆信和信纸抽出动画；新增测试 `captures polished cover labels and envelope`，最新验证：`npm run check` 通过，`npm test` 10/10 通过。用户反馈“这种感觉不错”，后续所有 UI 优化继续按参考视频的高级暗金电影感推进。
- 2026-06-30 按用户继续反馈“照片小、空隙多”再次放大相册：默认 `type === 0` 横向队列跨度拉宽，侧翼照片 scale/opacity/depth 增强，桌面和低高度横屏媒体规则同步上调；后续不能把相册重新改回小照片、大空白。
- 2026-06-30 主相册 Playwright 用例新增照片宽度和可见覆盖面积断言，要求桌面照片宽度保持在较大状态，并保证整组照片覆盖足够宽和高；这是防止视觉回退的重要测试。
- 2026-06-30 hover 稳定性继续修正：`pointerenter` 不再当作长交互刷新，自动 scene 演化不再因为 hover 暂停；只有拖拽和照片弹层会暂停 scene，hover 只保留短暂点击保护，避免鼠标停在照片上就卡旋转。
- 2026-06-30 默认自动 scene 常驻混合强度提高，空闲时会更快混入照片墙、花束/漩涡和交叉队形的轻微变形；这条路继续服务“动态整团相册集”，不是静态墙。
- 2026-06-30 低高度横屏下舞台诗句进一步减弱，防止照片放大后遮挡主体；hover 非当前照片残影透明度压低，避免鼠标扫边缘时整屏闪烁。
- 2026-06-30 最新验证：`npm run check` 通过，`npm test` 10/10 通过。后续所有视觉调整仍需同时守住照片点击两段式、pointer capture、transform/translate3d 定位、hover 不长暂停、桌面铺屏覆盖和手机横屏可用。
- 2026-06-30 用户要求今天收尾并方便明天重开对话继续。项目文档已补充 `assets/reference/reference-album-effect.mp4`、参考截图路径、明天接续步骤、不可回退的交互和技术约束。
- 2026-06-30 参考视频已从微信临时目录复制进项目，后续不要再依赖原始微信路径；每次大改相册前应对照项目内视频，看照片是否足够铺满、队列是否整体流动、是否有前后层次和暗金电影感。
- 2026-06-30 按最新反馈“稳定性不行、鼠标 hover 卡顿、动画不稳、照片太透明没有质感”完成一轮稳定性和材质修正：hover 改为单一当前卡片 `hoveredPhotoTile`，离开时更短保护窗口，拖拽开始会清空 hover 状态；墙面 pointermove 写样式节流到明显位移后再更新，避免鼠标轻动时连续写 24 张照片的视差变量。
- 2026-06-30 CSS 删除相册整组 `.photo-cards` 的常驻 `drop-shadow`，照片卡片取消独立 `cardFloat`/filter 动画，`hover` 不再把照片固定跳到 `z-index: 160`；后续不要恢复这些高成本效果，否则容易重新出现 hover 闪烁、命中抖动和帧率下降。
- 2026-06-30 照片材质从“透明玻璃卡”往“实体照片”推进：提高默认队列、场景和侧翼照片 opacity，降低常态 blur，提高真实图片亮度/对比/饱和，减少大范围残影强度；入场阶段的 ghost 残影单独压低，`getIntroPoint()` 起始 blur 从 7.5 降到 2.8，避免入场时糊成一团。
- 2026-06-30 Playwright 回归已补充稳定性和质感断言：主相册验证照片卡 `animation-name: none`、`.photo-cards` 无全局 filter、主照片 opacity 足够高、图片滤镜存在；hover 测试验证当前 hover 不固定跳层到 160、非 hover 照片残影低于 0.08。最新验证：`npm run check` 通过，`npm test` 10/10 通过。
- 2026-06-30 按用户要求重新完整对照参考视频，相册视频已抽取 1fps 时间线和中心裁切时间线，路径为 `output/reference/video-timeline-1fps-contact-sheet.jpg`、`output/reference/video-timeline-crop-contact-sheet.jpg`，逐帧重点确认了散开照片、密集墙、横向 ribbon、环形/花束、竖向矩阵、单张照片抽出和复位这些阶段。
- 2026-06-30 新增自动单张照片抽出/复位机制：`updateAlbumSpotlight()` 在空闲且非拖拽、非 hover 视觉、非照片弹层时自动选择一张照片抽到前景；`applySpotlightPoint()` 让选中照片变大、变清晰、显示标题，其他照片退到背景弧形队列；切换队形、拖拽或打开弹层都会清空 `.is-spotlight` / `.is-spotlight-card`，对应用户提到的“照片可以单独拿出来，换样式再重置过去”的创意。
- 2026-06-30 新增自动 scene 4 竖向矩阵/帘幕队形，服务参考视频里竖排照片墙/幕布式变阵；`getAutoSceneMode()` 现在会在横向队列、照片墙、交叉/花束、scene 4 和重置状态之间循环，后续不要只保留单一队形。
- 2026-06-30 spotlight 视觉已做成实体高级照片材质：前景卡片使用更强边缘光、暗金 halo、清晰图片滤镜和 caption，背景照片降低 opacity/blur 形成景深；重点截图为 `output/playwright/verified-album-spotlight-extract.png`。
- 2026-06-30 低高度横屏进一步处理标题叠压：`.stage-poem` 在横屏低高度下更靠上、更小、更淡，并在 `captures phone landscape album` 用例中断言 opacity、bottom 和字体大小，防止以后又盖住照片主体。重点截图为 `output/playwright/verified-album-iphone-landscape.png`。
- 2026-06-30 Playwright 新增 `extracts a single photo during automatic scene evolution and then resets`，验证 spotlight 强度、前景照片尺寸、opacity、z-index、caption 显示和自动复位；本轮最终验证：`npm run check` 通过，`npm test` 11/11 通过。
- 2026-06-30 开始建立 Git/GitHub 部署路线：原 `.git` 是空目录导致 `git status` 识别失败，已重新初始化本地 Git 仓库，分支为 `main`，初始提交为 `a73b01d chore: initialize birthday album project`；`.gitignore` 已排除 `node_modules/`、测试输出、Codex 临时目录、`.env*` 和普通截图输出，但保留 `output/reference/**` 作为参考视频对照资料。
- 2026-06-30 `gh` 初次创建远程仓库时曾被 token 权限挡住：`Resource not accessible by personal access token (createRepository)`；用户完成 `gh auth refresh -h github.com -s repo` 后，已创建并推送 private repo `https://github.com/kkkchen12/AAAyichun`。
- 2026-06-30 用户明确反馈上一轮自动效果“完全不如之前，一堆问题，整体照片不停闪烁，动画不受控制”。本轮稳定性回收：默认关闭自动 spotlight 抽出（保留代码但 `AUTO_SPOTLIGHT_ENABLED = false`），避免空闲时突然把单张照片和全部背景照片大幅重排；自动 scene 延迟到更久空闲后才低强度混入，最高强度从接近 0.92 降到 0.36。
- 2026-06-30 同步降低扫光、相机推拉、stage veil 和照片 ghost 强度：`--sweep-intensity` 上限降到 0.58，camera 位移/roll/tilt/dolly 降幅，scene/spotlight 相关残影不再在空闲时大面积叠加；后续要做单张抽出必须做成手动或更稳定的低频触发，不能再让它自动强抢主动画。
- 2026-06-30 Playwright 测试改成稳定性导向：不再要求自动 spotlight 出现，而是新增/调整 `captures restrained idle cinematic motion` 与 `keeps automatic album motion restrained without spotlight flicker`，验证空闲队列仍然轻微流动，但 scene blend 受限、spotlight strength 低于 0.04、无 `.is-spotlight-card`、非 hover ghost 低于 0.08。最新验证：`npm run check` 通过，`npm test` 11/11 通过。

## Next Session TODO

1. 明天先运行 `npm run dev`，打开 `http://127.0.0.1:5173/#photoWall`，同时打开 `assets/reference/reference-album-effect.mp4` 对照。
2. 优先继续优化相册视觉：照片要继续保持更大、更满、更铺屏，队列要像视频里一整团动态相册集，而不是小卡片墙；但不要恢复自动 spotlight 强抽出，后续单张抽出应改成手动触发或更稳定的低频展示。
3. 继续对照参考视频微调横向照片队列的纵深、密度、光效、hover 视觉反馈和拖拽手感；后续所有 UI 继续沿用深色电影感、暗金、细光尘、不卡通的方向。
4. 不要破坏已稳定的交互：单击照片先开介绍层，再点击图片进入纯照片；双击空白切换队形；拖拽推动照片流；hover 不长时间暂停、不闪烁；返回封面可用。
5. 不要回退已修好的技术路径：照片定位继续用 `--x-px`/`--y-px` + `translate3d`，不要恢复 `left/top` 动画；hover 不推动真实队列；不要用全局强残影覆盖全部照片。
6. 不要回退本轮稳定性修正：不要恢复 `.photo-cards` 常驻 `drop-shadow`，不要恢复照片独立 `cardFloat`/filter 动画，hover 不要固定跳到高 z-index；残影只能克制地服务拖拽、入场、变阵和当前 hover 卡片。
6.1 不要回退本轮动画回收：不要把自动 scene blend 再拉回 0.9 左右，不要默认开启自动 spotlight，不要让扫光/ghost/camera 同时大幅叠加，否则会重新出现整体照片闪烁和动画失控。
7. 把占位照片标题和说明替换成真实回忆；当前 `photo-15` 到 `photo-24` 是重复补位。
8. 把信件正文替换成用户最终想写的内容。
9. 放入背景音乐 `assets/song.mp3`。
10. 添加一个简单私密入口，例如输入她的昵称、生日或纪念日才能进入。
11. 每次视觉调整后运行 `npm run check` 和 `npm test`，查看 `output/playwright/verified-*.png`，特别是 `verified-album-desktop.png`、`verified-album-auto-scene.png`、`verified-album-spotlight-extract.png`、`verified-hover-stability.png`、`verified-album-drag-motion.png`、`verified-album-iphone-landscape.png`。
12. 做最终浏览器检查：电脑横屏、iPhone 横屏、iPhone 竖屏。
13. Git 本地仓库已初始化，私有 GitHub 仓库 `https://github.com/kkkchen12/AAAyichun` 已创建并推送 `main`；后续每次大改先测试再 commit/push。
14. 用 Vercel 从私有 GitHub 仓库部署，拿到 HTTPS 链接；正式发送前先加私密入口。
