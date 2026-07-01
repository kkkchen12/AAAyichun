# Stability Note - 2026-06-28

## What Was Fixed

- Reproduced the reported album issue: after hovering a photo, `pointerdown` could start on one moving photo while `pointerup` landed on another stacked photo or on `.photo-cards`, so the intro panel did not open.
- Each `.photo-tile` now captures the pointer on `pointerdown`. A light tap opens the photo from `pointerup`, and the later synthetic `click` is deduplicated.
- Drag still works, but it only starts after the pointer moves beyond the threshold. A normal tap is no longer treated as a drag.
- Hover no longer pushes the full photo queue. It now pauses/locks the queue briefly and keeps only local glow/ghost feedback, which makes clicking reliable.
- Auto morph is currently disabled in the animation loop. Manual double-click on blank album space still changes layout.
- Idle layout updates are throttled after the intro, while intro and drag remain responsive.
- Cached photo tile references, reduced pointer style writes, `touch-action: none`, and CSS `contain` were added to reduce stutter.

## Verification

- `npm run check` passed.
- `npm test` passed 6/6.
- Added regression coverage: `opens photo detail reliably after hovering over a moving tile`.
- New screenshot: `output/playwright/verified-hover-click-detail.png`.

## Important Decision

Do not reintroduce hover-driven queue movement unless click reliability is redesigned at the same time. The safer interaction model is:

- hover = highlight, glow, brief click-protection lock
- drag = queue movement
- double-click blank area = layout morph
- click photo = intro panel, then click image = full photo

## Cinematic Upgrade - 2026-06-28

- Added idle cinematic scene evolution for the default album: dense photo wall, flower-like cluster, crossed vertical/horizontal stack, then back to the main ribbon.
- Scene evolution is frozen during hover, drag, and photo lightbox states so it does not break pointer reliability.
- The default ribbon is denser and wider, with less over-dominance from a single center card.
- The intro is now longer and more scattered before assembling into the ribbon, closer to the reference video pacing.
- Added non-clickable stage veil layers for horizontal sweep and extra light-field depth.
- Updated regression coverage: `npm test` now has 7 tests, including `captures idle cinematic scene evolution`.
- New screenshot: `output/playwright/verified-album-auto-scene.png`.

## Cinematic Polish - 2026-06-28

- The canvas particle system now reacts to album scene evolution: automatic album scenes get more controlled horizontal star-dust and glint flow.
- The scene-aware particle increase remains bounded, so it improves movement without turning into a noisy overlay.
- Stage poem text is less like a permanent web heading and more like a cinematic subtitle: dim by default, stronger during intro and automatic scene evolution.
- Photo open/FLIP now pushes the album background farther into a darker defocused field, with a warmer halo around the flying photo.
- Latest verification: `npm run check` passed; `npm test` passed 7/7.

## Navigation Fix - 2026-06-28

- Added a global cinematic `返回封面` control outside the section stack, visible from album and letter views.
- Returning home now also closes the photo detail/fullscreen overlay and clears any in-progress photo flight clone.
- Added hash-route syncing so direct changes between `#home`, `#photoWall`, and `#letter` switch the active view correctly.
- Added regression coverage: `returns to the cover from routed pages and photo overlay`.
- Latest verification: `npm run check` passed; `npm test` passed 8/8.

## Album Flow Deepening - 2026-06-28

- Tightened the default `type === 0` album layout into a denser three-layer photo stream: smaller center dominance, closer side wings, and more vertical interleaving.
- Changed idle scene evolution from hard waiting/cutting into low-amplitude continuous blending, so the default queue breathes toward wall, flower, and cross formations before stronger scene transitions.
- Increased idle queue flow slightly and added subtle always-on layout-0 photo echoes, while keeping hover from pushing real `queueOffset`.
- Reduced central poem/title dominance so it reads more like a cinematic subtitle than a page headline.
- Preserved the pointer-capture photo click path and drag threshold logic.
- Latest verification: `npm run check` passed; `npm test` passed 8/8.

## Thick Wall Scene - 2026-06-29

- Reworked auto scene mode 1 from a flat regular grid into a thicker stacked photo wall.
- Added deterministic jitter, tighter column spacing, row shear, foreground pop cards, stronger z-depth, and scene-specific edge glints.
- Increased scene-1 ghost strength through CSS only; no hit-target or pointer event logic was changed.
- Latest verification: `npm run check` passed; `npm test` passed 8/8.

## Hover Flow Stabilization - 2026-06-29

- Addressed the reported issue where leaving the mouse on a photo made the album feel like it stopped rotating.
- The root cause was not hover-driven queue movement; it was the hover protection window staying active too long, plus CSS hover forcing the tile transform to `rotate(0deg)` and a fixed `translateZ(86px)` while JS kept updating the queue pose.
- Hover protection is now short and throttled: entering a photo gives only a brief lock, leaving gives a short settle window, and pressing a photo gives the longer lock needed for click reliability.
- The album loop now freezes queue movement only during the brief hover lock, not for the entire time the pointer remains over a tile.
- CSS hover now preserves the current `--rotate`, `--yaw`, `--pitch`, and `--depth` values, then adds a small lift/scale, so hover no longer fights the cinematic queue transform.
- Photo sizes were increased for desktop landscape and phone landscape/portrait media rules; the Playwright test now asserts desktop tile width does not regress.
- Added regression coverage: `keeps the album flowing while hovering a photo`.
- New screenshot: `output/playwright/verified-hover-stability.png`.
- Latest verification: `npm run check` passed; `npm test` passed 9/9.

## Hover Flicker And Frame Smoothness - 2026-06-29

- Addressed the follow-up report that animation still felt choppy and photos flickered when the mouse sat on a moving photo.
- Photo placement now uses `--x-px` / `--y-px` plus `translate3d(...)` instead of animating `left` and `top`. The loop still preserves the existing `%` variables for tests and reasoning, but the browser no longer has to do a layout pass for every queue movement.
- Removed `left/top` transitions from normal, dragging, morphing, and intro tile states; transform and opacity now carry the movement.
- Hover no longer changes the tile's real transform. The current card keeps its queue pose and hitbox; hover only changes brightness/shadow and the single-card ghost layer.
- Global hover ghosting was removed. `.photo-wall.is-hover-flow` no longer turns on strong ghosts, global `drop-shadow`, or heavy hover overlays for all 24 cards. Only `.photo-tile.is-hovered` gets the hover ghost treatment.
- The hover regression now also checks that non-hovered tiles do not receive strong ghost opacity while one photo is hovered.
- Latest verification: `npm run check` passed; focused hover tests passed 2/2; full `npm test` passed 9/9.

## RAF Motion And Focus Sweep - 2026-06-29

- After the transform-based placement change proved stable, the default album layout update interval was raised to one RAF frame so the main photo queue no longer presents as a lower-framerate step animation.
- Added `updateAlbumSweep()` as a purely visual focus-light pass. It computes `--sweep-x`, `--sweep-y`, and `--sweep-intensity` on the wall, then `applyLayout()` maps that into each tile's `--sweep` value.
- The sweep appears through `.stage-lightfields::before/::after` and `.photo-media::after`, plus a small edge-glow contribution on `.photo-tile::after`.
- The sweep does not change tile size, transform, z-index, pointer capture, or click thresholds, so it should not reintroduce hover flicker or click unreliability.
- Added regression coverage in the main album test: tile placement must remain transform-driven and sweep CSS variables must be present and in range.
- Latest verification: `npm run check` passed; full `npm test` passed 9/9.

## Cinematic Camera Layer - 2026-06-29

- Added `updateAlbumCamera()` as a restrained whole-album camera pass. It writes `--camera-x`, `--camera-y`, `--camera-z`, `--camera-roll`, `--camera-tilt-x`, `--camera-tilt-y`, and `--camera-scale` to `.photo-wall`.
- `.photo-cards` now combines manual pointer parallax with the automatic camera variables, so the album gains subtle dolly, pan, roll, and breathing motion without touching individual tile transforms.
- The camera pass follows queue velocity, drag motion, intro progress, and scene blend, but it remains small enough that it should not alter click intent.
- Do not use the camera layer to solve individual-card focus or hover behavior. Single-card click and hover reliability still belongs to pointer capture, `is-hovered`, and tile-level transform variables.
- Added camera-range assertions to the main album Playwright test.
- Latest verification: `npm run check` passed; full `npm test` passed 9/9.

## Premium UI And Particle Pass - 2026-06-29

- Updated the cover labels to the user's requested short wording: `相册`, `信`, `回忆`, and `祝福`.
- Reworked the cover, album background, global controls, and letter page toward a darker wine/gold cinematic palette; avoid returning to blue, cute pink, large hearts, or cartoon petals as the main style.
- The particle system now favors seeded ambient dust and fine glints. Non-album pages no longer rely on obvious heart/petal particles, and the extra density remains bounded by page-specific particle limits.
- Rebuilt the envelope styling as a gold paper envelope with wax seal, paper texture, and retained open-paper animation.
- Added regression coverage: `captures polished cover labels and envelope`, with screenshots `verified-cover-polish.png` and `verified-letter-envelope-polish.png`.
- Latest verification: `npm run check` passed; full `npm test` passed 10/10.

## Fuller Album Layout And Hover Scene Continuity - 2026-06-30

- Addressed the follow-up visual issue that the album still had too much empty space and the photos felt too small compared with the reference video.
- The reference video has been copied into the project at `assets/reference/reference-album-effect.mp4`; use this local file as the visual baseline for future album layout and motion decisions.
- The default `type === 0` ribbon was widened and made denser: side lanes now retain more scale, opacity, depth, and vertical spread, so the album reads more like a full-screen moving photo collection instead of small cards in the center.
- CSS photo sizes were raised for desktop, low-height landscape, and portrait-compatible rules. Future layout changes should not shrink the album back into small tiles with large gaps.
- The main Playwright album test now asserts a larger desktop tile width and a minimum visible album coverage width/height. This is now a regression guard for the user's "bigger and fuller" requirement.
- `pointerenter` no longer refreshes the long interaction timer. Hover still gives a short protection window for click reliability, but it should not make the album feel stuck just because the cursor rests on a photo.
- `updateAlbumScene()` no longer treats hover as a scene-evolution pause condition. Automatic scene evolution now pauses for drag and open lightbox states, while hover only affects short queue damping and visual feedback.
- The ambient scene blend was raised so wall/flower/cross formations become visible sooner during idle time. This makes the album feel alive without requiring a manual style button.
- Low-height landscape reduces the stage poem further so the enlarged photos remain the visual subject.
- Non-hovered ghost layers are kept very faint during hover flow to avoid whole-screen flicker when the cursor crosses photo edges.
- Latest verification before this documentation update: `npm run check` passed; full `npm test` passed 10/10.

## Hover Stability And Photo Material Pass - 2026-06-30

- Addressed the follow-up report that hover still felt unstable or buggy, animation could feel inconsistent, and photos looked too transparent or low-texture.
- Hover state is now tracked as a single active tile through `hoveredPhotoTile`. Entering a new tile removes `is-hovered` from the previous one, leaving a tile uses a shorter settle window, and drag start clears hover state immediately.
- Pointer-move style writes are now throttled by both time and actual pointer delta. Casual mouse movement no longer rewrites parallax variables on all 24 photo cards every tiny movement, while drag still stays responsive.
- CSS no longer lets hover jump a card to fixed `z-index: 160`; this avoids reordering overlapped moving cards during hit-testing. Hover remains a visual treatment, not a layout or queue ownership change.
- Removed the high-cost always-on `.photo-cards` `drop-shadow` and disabled per-card `cardFloat`/filter animation. Whole-album motion continues through the RAF layout/camera loop, which is easier to reason about and less prone to hover stutter.
- Photo material was pushed toward solid, premium photo cards: higher card opacity, less normal-state blur, brighter and more saturated image filters, stronger edge material, and lighter global ghosting.
- Intro ghost opacity was reduced separately, and `getIntroPoint()` start blur was reduced from 7.5 to 2.8 so the opening still gathers dynamically without turning into a large blurred photo mass.
- Regression coverage was expanded: the main album test now asserts `animation-name: none`, no global `.photo-cards` filter, sufficiently opaque hero photo material, and image filter presence; the hover test asserts no fixed `z-index: 160` and stricter non-hover ghost opacity.
- Latest verification: `npm run check` passed; full `npm test` passed 10/10.

## Video Timeline Spotlight And Compact Landscape Pass - 2026-06-30

- Re-inspected the full local reference video instead of relying only on the earlier 8-frame sheet. New reference artifacts are `output/reference/video-timeline-1fps-contact-sheet.jpg`, `output/reference/video-timeline-crop-contact-sheet.jpg`, and the per-frame folders under `output/reference/timeline/` and `output/reference/timeline-crop/`.
- The key motion contract copied from the video is now explicit: the album can pull one photo out as an independent foreground memory, keep the remaining photos receded in a flowing background formation, then reset the pulled photo when the scene changes or user interaction takes over.
- Added `updateAlbumSpotlight()` and `applySpotlightPoint()`. Spotlight only runs while the album is idle and no lightbox/drag/hover visual state is active. It writes bounded CSS variables and class names instead of changing the photo click pipeline.
- `triggerLayoutMorph()` and drag start now clear spotlight state. This protects the user's requested "change style, reset back" behavior and avoids stale foreground cards after manual interaction.
- Added automatic scene mode 4 for a vertical matrix/curtain formation, matching the reference video's vertical photo-wall phases more closely than the previous wall/flower/cross set alone.
- Spotlight foreground cards use a more solid material treatment: clearer image filter, stronger dark-gold edge light, visible `MEMORY XX` plus title caption, and restrained background depth blur. The key screenshot is `output/playwright/verified-album-spotlight-extract.png`.
- Low-height landscape now suppresses `.stage-poem` further: smaller, higher, and lower-opacity so it reads as atmosphere rather than a title covering the album. The phone landscape test asserts opacity, vertical position, and title size to prevent regression.
- Added regression coverage: `extracts a single photo during automatic scene evolution and then resets`, plus stronger compact landscape checks in `captures phone landscape album`.
- Latest verification after this pass: `npm run check` passed; full `npm test` passed 11/11.

## Automatic Motion Stabilization After Flicker Feedback - 2026-06-30

- User rejected the previous automatic album behavior because the whole photo group kept flickering and the animation felt uncontrolled.
- The strongest cause was the combination of automatic spotlight extraction, high automatic scene blend, active sweep light, camera movement, and ghost layers all affecting the same 24 tiles at once.
- Automatic spotlight extraction is now disabled by default through `AUTO_SPOTLIGHT_ENABLED = false`. The code remains available for a future manual or lower-frequency interaction, but it no longer pulls a foreground photo automatically during idle time.
- Automatic scene evolution was reduced from a high-intensity transformation to a restrained background motion: it waits longer after interaction, caps idle blend at `IDLE_SCENE_BLEND_MAX = 0.36`, and uses `REST_SCENE_BLEND = 0.1` instead of a strong reset pulse.
- Camera movement was reduced across drift, dolly, roll, tilt, and scale so it reads as a calm cinematic layer instead of fighting individual card motion.
- Sweep light, stage veil, and ghost opacity were reduced. The sweep intensity is capped lower, spotlight/scene ghost multipliers are smaller, and background veil movement is slower and less opaque.
- Regression coverage was changed to match the new stability contract: automatic motion must continue subtly, but spotlight strength must stay below `0.04`, no `.is-spotlight-card` may appear automatically, scene blend must stay below `0.44`, and non-hover ghost opacity must remain below `0.08`.
- Latest verification: `npm run check` passed; full `npm test` passed 11/11.

## Private Entrance Gate - 2026-06-30

- Added a full-screen private entrance before the cover, album, letter, music, and photo actions. Unlocked state is stored in `localStorage` under `aaayichun-unlocked`.
- Hash routes are guarded: visiting `/#photoWall` or `/#letter` while locked keeps `body[data-view="locked"]`; after a correct code, routing resumes to the originally requested hash.
- Main sections and the global return control are pointer-disabled while locked, so the album cannot be manipulated behind the gate.
- The gate is static-site friendly and does not add a backend. It is a privacy/romance entrance, not encryption or real authentication.
- Added regression coverage: `guards the site behind a private entrance`, with screenshots `verified-private-entrance.png` and `verified-private-unlocked.png`.

## Single Photo Drag And Full-Image Close - 2026-06-30

- Fixed the detail-panel `查看完整照片` button by stopping both `pointerdown` and `click` propagation. Entering full-image mode now also clears any active FLIP flight/reveal state, so the same click cannot be cancelled by the outer lightbox.
- Full-image mode now closes when the user clicks the dark area outside the rendered image. The check uses the real rendered `object-fit: contain` bounds, so clicking the image itself keeps the photo open.
- Replaced per-tile drag continuation with a document-level photo press controller. Once a photo press starts, movement past the threshold drags that specific photo even if the pointer leaves the card.
- The user-facing drag range problem was caused by hover/parallax and stacked cards changing the hit target between mouse move and mouse down. Directly hit photos now win first; nearby photo lookup is distance-first, not layer-first.
- While the pointer is over a photo and no drag is active, the stage parallax resets instead of shifting all cards. This keeps the selected photo from sliding away before the user presses, which was the source of the "only a small area can drag" feeling.
- Free photos get `.is-free-photo`, high z-index, solid material, and reset when the user double-clicks blank space or switches layout. Whole-album dragging still works from true blank space.
- Regression coverage now verifies: button-to-full-image, outside-click close, bottom/caption-area single-photo drag, free-photo reset on layout switch, and blank-area whole-album drag. Latest verification: `npm run check` passed; full `npm test` passed 13/13.

## Reference-Video Lightfield And Material Pass - 2026-06-30

- The latest visual pass deliberately keeps the fixed button, full-image close, and document-level single-photo drag pipeline unchanged. It only adjusts layout density, lightfields, and material styling.
- The default `type === 0` ribbon is slightly wider, deeper, and lower on the stage. Side lanes keep more scale, focus, and depth so the desktop album reads as a fuller cinematic photo group.
- The album background, `.photo-cards::before/::after`, `.stage-flow`, `.stage-trail`, and `.stage-veil` now provide stronger low-frequency wine/gold light without using a global `.photo-cards` filter.
- Photo cards use a more solid premium material treatment: stronger border, shadow, edge light, inner media glow, and a restrained image sweep. This should improve texture without returning to transparent glass cards.
- Do not use this pass as permission to restore unstable effects. Keep `.photo-cards` global filter/drop-shadow disabled, keep per-card `cardFloat`/filter animation disabled, and keep automatic spotlight disabled by default.
- Regression coverage now also guards the stage lightfield visibility in the main album test by checking `.stage-flow` and `.photo-cards::after`, while the existing interaction tests continue to guard the full-image button and single-photo drag range.

## Manual Spotlight Focus - 2026-06-30

- Added a user-controlled `在相册中聚焦` action in the photo detail panel. It closes the detail panel, returns to the album, and uses the existing spotlight layout to pull the current photo into the foreground.
- This is the stable version of the reference-video "single photo extracted from the album" idea. Automatic spotlight remains disabled by default; no idle timer is allowed to pull photos out unexpectedly.
- Manual spotlight state is tracked with `manualSpotlightIndex` and cleared through `clearPhotoSpotlight()`. Dragging a single photo, dragging the whole album, leaving the album page, starting the album intro, or switching layout clears it.
- Clicking the foreground spotlight photo again cancels manual spotlight without opening the detail panel; clicking dark blank stage space also cancels when the hit target is clear. Double-clicking blank space still changes layout and resets the spotlight photo back into the queue.
- Regression coverage now verifies the detail-panel button, spotlight foreground class/layer/caption, foreground-click cancel, and double-click layout reset. The screenshot is `output/playwright/verified-manual-spotlight.png`.

## Manual Scene Pulse On Layout Morph - 2026-06-30

- Added a bounded manual scene pulse for user-triggered layout morphs. It is started only by `triggerLayoutMorph(true)`, not by idle time.
- The pulse uses `manualScenePulseMode`, `manualScenePulseStartedAt`, `MANUAL_SCENE_PULSE_MS = 1550`, and `MANUAL_SCENE_PULSE_MAX = 0.38` to briefly blend toward one of the existing scene layouts, then decay back to scene 0.
- `AUTO_SCENE_ENABLED` remains `false`. This does not restore automatic scene evolution, automatic spotlight, or any idle forced rearrangement.
- Dragging, opening photos, leaving the album, and restarting the intro clear the manual pulse. This keeps user control and prevents scene state from sticking after interactions.
- Regression coverage in `captures blank-area double click layout morph` now checks that scene blend appears during manual morph, remains below `0.44`, and settles back to scene 0 / low blend after the pulse window.

## Free Photo Drag Range And No-Zoom Guard - 2026-06-30

- Free-photo dragging now uses `FREE_PHOTO_DRAG_GAIN` plus pointer-center tracking, so the selected photo can be moved close to the visible stage edge instead of feeling trapped in a small local region.
- `FREE_PHOTO_LIMITS` intentionally allows a small overscan past the stage edge. This gives the interaction room without changing whole-album blank-space dragging.
- Dragging a single photo no longer boosts the whole stage: `startFreePhotoDrag()` clears manual scene pulse, zeroes queue/orbit velocity, caps `stageMotion`, and keeps the dragged photo scale at `1`.
- Regression coverage asserts that free-photo drag does not enter `.is-dragging`, does enter `.is-free-dragging`, keeps `--drag-motion` low, keeps `--camera-scale` below zoom territory, and leaves the dragged photo at scale 1.

## Low-Cost Stage Volume And Photo Paper Material - 2026-06-30

- Added persistent low-strength volume and reflection light through `.stage-aperture::before/::after`. This gives the album a grounded dark-gold stage plane after the intro without adding global filters or changing layout math.
- Strength is tied to existing `--drag-motion` and `--scene-blend` variables, but the baseline is intentionally low. It should enrich the scene, not become another uncontrolled automatic effect.
- Photo material was thickened through `.photo-media` and `.photo-tile::after`: stronger inset edge light, subtle top sheen, darker bottom edge, warmer sweep, and a restrained external shadow.
- Do not replace this with `.photo-cards` filter/drop-shadow or per-card animation. The point of this pass is premium material using cheap pseudo-elements that do not perturb hit testing.
- Regression coverage in the main album test now checks aperture visibility and photo-media inset shadow while continuing to assert no `.photo-cards` global filter, no card animation, and no opacity animation.

## Depth Rail And Compact Photo Density - 2026-06-30

- Added a non-interactive `.photo-depth-rail` behind the main `.photo-cards` layer. It renders a small fixed set of real photo thumbnails as a distant cinematic track, closer to the reference video's dense background album flow.
- The depth rail is pointer-disabled and only uses `transform` plus bounded opacity variables. It does not participate in photo hit testing, pointer capture, detail opening, single-photo drag, or layout switching.
- Depth rail DOM nodes are cached after render, so the RAF layout loop does not need to query the document every frame.
- Default desktop photo card size was pulled back from the previous oversized pass. The album now reads as a denser group of photos instead of one large card wall, while keeping enough coverage and strong central focus.
- Photo paper material was strengthened with side-edge inset light and darker opposite-edge pressure, still through `.photo-tile`/`.photo-tile::after` rather than global filters or per-card animations.
- Regression coverage now asserts the depth rail exists, is pointer-disabled, has visible bounded opacity, uses transform positioning, remains smaller than the main photos, and still keeps the existing no-global-filter/no-card-animation guards.

## Romantic Copy Pass - 2026-06-30

- Rewrote the photo-facing copy for a girlfriend birthday gift: all 24 photo titles and captions now read as romantic memories instead of casual placeholders or notes.
- Updated surrounding album labels only at the content layer: `LOVE NOTE XX` card labels, romantic stage poems, layout status copy, album heading, private-gate copy, full-photo button text, and manual spotlight button text.
- No animation, pointer, hover, drag, lightbox, RAF layout, or spotlight mechanics changed in this pass. The same stability constraints remain: no global `.photo-cards` filter/drop-shadow, no per-card animation, no default automatic spotlight, and no hover-driven queue movement.

## Long Letter Import And Reveal Control - 2026-07-01

- Imported the final long birthday letter from `C:\Users\kkkchen\Desktop\11111.docx` into `story.letter`, then added a separate closing signature `永远爱你的陈熠`. It is now 51 webpage paragraphs, so the letter panel must remain scrollable.
- Preserved the slow typewriter reveal by default. Added a double-click reveal on `.letter-paper` for the user's requested shortcut to show the full letter immediately.
- The double-click path cancels any active typing loop through `letterTypingToken`, then renders the full escaped letter text and clears browser text selection so the page does not show accidental blue selection highlights.
- Opened-letter visuals were adjusted for readability: the envelope moves to a dim background layer, the paper moves to the foreground, and completed long-letter text gets brighter color and more comfortable line height.
- Regression coverage now verifies the full text appears, the paragraph count is correct, the signature is present, the letter paper becomes visible, and the panel scrolls to the bottom with the signature in view.

## Letter Screenshot Overview - 2026-07-01

- Added a `全览截图` action beside the replay button. This is explicitly for screenshot capture, not comfortable reading.
- The overview opens a full-screen `.letter-overview` panel with a compact dark-gold sheet, small multi-column text, and the signature in the lower-right flow.
- `fitLetterOverview()` chooses 2/3/4 columns by viewport width and shrinks `--overview-font` until the overview body has no horizontal or vertical overflow. This keeps the whole letter in one screenshot frame where possible.
- Clicking the dark blank area outside `.letter-overview-sheet` closes the overview. Escape also closes it through the shared keydown handler.
- Regression coverage verifies the overview is visible, contains the signature, fits within its viewport without overflow, uses a non-tiny minimum font, screenshots `verified-letter-overview.png`, and closes when the outside blank area is clicked.

## Two-Track Page Music - 2026-07-01

- Added two real MP3 assets under `assets/music/`: `until-you-arrive.mp3` for the album page and `love-you.mp3` for the letter page.
- Replaced the old single `story.musicPath` path with `story.music.album` and `story.music.letter`. `handleViewMusic()` starts the album track on `#photoWall`, starts the letter track on `#letter`, and stops music on non-music views.
- The right-top music button now controls the current page track. Manual pause records `musicSuppressedView` so the app does not immediately restart the same page's music; manual play clears that suppression and retries the current page track.
- Browser autoplay rejection no longer starts the synthetic fallback tone. If the browser blocks autoplay, the button remains available for a user-gesture retry with the real track.
- The top navigation was moved outside the hero section into a global layer. Non-home views hide the text nav links but keep the music button visible and clickable above album/letter sections.
- Regression coverage stubs `HTMLMediaElement.play()` in Playwright, verifies album entry requests `until-you-arrive.mp3`, verifies letter entry requests `love-you.mp3`, and checks the right-top button can pause and resume the letter track.

## Letter Replay And Vercel Deployment - 2026-07-01

- Fixed the `#replayLetter` action. It no longer reuses the envelope-opening path after the letter is already open; it now cancels active typing, clears the body, resets the paper scroll position, removes the completed state, and restarts the typewriter directly.
- `openLetter()` now removes `is-letter-opening` once the letter is fully open, preventing stale opening state from blocking later letter actions.
- Regression coverage now clicks `#replayLetter` after the full letter is shown, verifies the completed state is cleared, verifies the paper scroll returns to the top, then double-clicks to reveal the full letter again.
- Vercel production deployment is configured under the project name `aaayichun` and aliased at `https://aaayichun.vercel.app`.
- `.vercelignore` keeps deployment output focused on the static app and final assets. It excludes local test artifacts, reference video material, development folders, and project notes, but keeps `index.html`, `app.js`, `styles.css`, `assets/photos`, `assets/music`, and `assets/hero-letter.png` available for the public site.

## EdgeOne Music Cache Stabilization - 2026-07-02

- EdgeOne production deploy succeeded, but verification showed the preset domain could still serve an older cached `app.js` when the resource URL had no version query.
- Added versioned static references in `index.html` for `styles.css` and `app.js` so CDN/browser cache cannot mask newly pushed music-entry fixes.
- Preserved the current music interaction contract: album gestures request `until-you-arrive.mp3`, letter gestures request `love-you.mp3`, and the top-right button toggles the active view's track.
- Music switching now rebuilds the audio element for a new track and uses `musicRequestToken`, so stale play rejections, old `currentSrc`, or delayed old-source state cannot turn off or overwrite the newly requested page track.
- Added regression coverage for the cross-module path from album back to cover and then into the letter, preventing the letter entry from accidentally continuing the album track.
