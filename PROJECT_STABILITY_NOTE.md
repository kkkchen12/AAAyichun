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
