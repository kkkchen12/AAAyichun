const { test, expect } = require("@playwright/test");

const unlock = async (page) => {
  await page.addInitScript(() => {
    localStorage.setItem("aaayichun-unlocked", "yes");
  });
};

test("guards the site behind a private entrance", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await expect(page.locator("#privacyGate")).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-view", "locked");
  await expect(page.locator(".photo-section")).not.toHaveClass(/is-active/);
  await page.screenshot({ path: "output/playwright/verified-private-entrance.png" });

  await page.locator("#gateCode").fill("wrong");
  await page.locator("#gateForm").evaluate((form) => form.requestSubmit());
  await expect(page.locator("#gateError")).toContainText("暗号不对");
  await expect(page.locator("#privacyGate")).toBeVisible();

  await page.locator("#gateCode").fill("20030518");
  await page.locator("#gateForm").evaluate((form) => form.requestSubmit());
  await expect(page.locator("#privacyGate")).toBeHidden();
  await expect(page.locator("body")).toHaveAttribute("data-view", "photoWall");
  await expect(page.locator(".photo-tile").first()).toBeVisible();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "output/playwright/verified-private-unlocked.png" });
});

test("captures album and two-step photo viewer", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(3600);
  await expect(page.locator(".photo-tile")).toHaveCount(24);
  await expect(page.locator(".photo-tile.is-hero-card").first()).toBeVisible();
  const desktopTileWidth = await page.locator(".photo-tile").first().evaluate((tile) => (
    Number.parseFloat(getComputedStyle(tile).width)
  ));
  expect(desktopTileWidth).toBeGreaterThan(135);
  expect(desktopTileWidth).toBeLessThan(205);
  const albumCoverage = await page.locator(".photo-tile").evaluateAll((tiles) => {
    const visibleBoxes = tiles
      .map((tile) => {
        const rect = tile.getBoundingClientRect();
        const style = getComputedStyle(tile);
        return Number.parseFloat(style.opacity) > 0.18 ? rect : null;
      })
      .filter(Boolean);
    const left = Math.min(...visibleBoxes.map((rect) => rect.left));
    const right = Math.max(...visibleBoxes.map((rect) => rect.right));
    const top = Math.min(...visibleBoxes.map((rect) => rect.top));
    const bottom = Math.max(...visibleBoxes.map((rect) => rect.bottom));
    return {
      width: right - left,
      height: bottom - top
    };
  });
  expect(albumCoverage.width).toBeGreaterThan(880);
  expect(albumCoverage.height).toBeGreaterThan(360);
  const heroBox = await page.locator(".photo-tile.is-hero-card").first().boundingBox();
  expect(heroBox).not.toBeNull();
  expect(heroBox.width).toBeLessThan(320);
  const motionState = await page.locator(".photo-tile").first().evaluate((tile) => {
    const tileStyle = getComputedStyle(tile);
    const wallStyle = getComputedStyle(document.querySelector(".photo-wall"));
    return {
      left: tileStyle.left,
      transform: tileStyle.transform,
      xPx: tile.style.getPropertyValue("--x-px"),
      sweepX: Number.parseFloat(wallStyle.getPropertyValue("--sweep-x")),
      sweepIntensity: Number.parseFloat(wallStyle.getPropertyValue("--sweep-intensity")),
      cameraX: wallStyle.getPropertyValue("--camera-x").trim(),
      cameraZ: Number.parseFloat(wallStyle.getPropertyValue("--camera-z")),
      cameraScale: Number.parseFloat(wallStyle.getPropertyValue("--camera-scale"))
    };
  });
  expect(motionState.left).toBe("0px");
  expect(motionState.transform).not.toBe("none");
  expect(motionState.xPx).toContain("px");
  expect(motionState.sweepX).toBeGreaterThanOrEqual(-20);
  expect(motionState.sweepX).toBeLessThanOrEqual(120);
  expect(motionState.sweepIntensity).toBeGreaterThanOrEqual(0);
  expect(motionState.sweepIntensity).toBeLessThan(0.2);
  expect(motionState.cameraX).toContain("px");
  expect(motionState.cameraZ).toBeGreaterThan(-90);
  expect(motionState.cameraZ).toBeLessThan(90);
  expect(motionState.cameraScale).toBeGreaterThan(0.96);
  expect(motionState.cameraScale).toBeLessThan(1.04);
  const materialState = await page.locator(".photo-tile.is-hero-card").first().evaluate((tile) => {
    const cardStyle = getComputedStyle(tile);
    const cardsStyle = getComputedStyle(document.querySelector(".photo-cards"));
    const flowStyle = getComputedStyle(document.querySelector(".stage-flow"));
    const cardsAfter = getComputedStyle(document.querySelector(".photo-cards"), "::after");
    const img = tile.querySelector("img");
    return {
      animationName: cardStyle.animationName,
      cardOpacity: Number.parseFloat(cardStyle.opacity),
      cardsAnimationName: cardsStyle.animationName,
      cardsFilter: cardsStyle.filter,
      cardsTransitionProperty: cardsStyle.transitionProperty,
      cardsTransitionDuration: cardsStyle.transitionDuration,
      tileTransitionProperty: cardStyle.transitionProperty,
      tileWillChange: cardStyle.willChange,
      stageFlowOpacity: Number.parseFloat(flowStyle.opacity),
      stageGlowOpacity: Number.parseFloat(cardsAfter.opacity),
      imgFilter: img ? getComputedStyle(img).filter : ""
    };
  });
  expect(materialState.animationName).toBe("none");
  expect(materialState.cardOpacity).toBeGreaterThan(0.82);
  expect(materialState.cardsAnimationName).toBe("none");
  expect(materialState.cardsFilter).toBe("none");
  expect(materialState.cardsTransitionProperty).toBe("none");
  expect(materialState.cardsTransitionDuration).toBe("0s");
  expect(materialState.tileTransitionProperty).not.toContain("opacity");
  expect(materialState.tileWillChange).not.toContain("opacity");
  expect(materialState.stageFlowOpacity).toBeGreaterThan(0.04);
  expect(materialState.stageGlowOpacity).toBeGreaterThan(0.6);
  expect(materialState.imgFilter).toContain("brightness");
  await page.screenshot({ path: "output/playwright/verified-album-desktop.png" });

  await page.evaluate(() => {
    const heroTile = document.querySelector(".photo-tile.is-hero-card") || document.querySelector(".photo-tile");
    heroTile?.click();
  });
  await expect(page.locator("#photoLightbox")).toBeVisible();
  await expect(page.locator(".photo-flight")).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({ path: "output/playwright/verified-photo-flight.png" });
  await page.waitForTimeout(560);
  await expect(page.locator("#photoLightbox")).not.toHaveClass(/is-full-image/);
  await expect(page.locator("#photoLightbox")).not.toHaveClass(/is-revealing/);
  await expect(page.locator(".lightbox-card")).toBeVisible();
  await page.screenshot({ path: "output/playwright/verified-photo-detail.png" });

  await page.locator("#viewFullPhoto").click();
  await expect(page.locator("#photoLightbox")).toHaveClass(/is-full-image/);
  await page.screenshot({ path: "output/playwright/verified-photo-full.png" });
  await page.mouse.click(40, 450);
  await expect(page.locator("#photoLightbox")).toBeHidden();
});

test("opens photo detail reliably after hovering over a moving tile", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(2800);

  const hero = page.locator(".photo-tile.is-hero-card").first();
  await expect(hero).toBeVisible();
  const box = await hero.boundingBox();
  expect(box).not.toBeNull();

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  await page.mouse.move(centerX, centerY);
  await page.waitForTimeout(520);
  await page.mouse.click(centerX, centerY);

  await expect(page.locator("#photoLightbox")).toBeVisible();
  await expect(page.locator("#photoLightbox")).not.toHaveClass(/is-full-image/);
  await expect(page.locator(".lightbox-card")).toBeVisible();
  await page.screenshot({ path: "output/playwright/verified-hover-click-detail.png" });

  await page.locator(".lightbox-image-wrap").click();
  await expect(page.locator("#photoLightbox")).toHaveClass(/is-full-image/);
});

test("keeps the album flowing while hovering a photo", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(3600);

  const tile = await page.locator(".photo-tile.is-hero-card").first().elementHandle();
  expect(tile).not.toBeNull();
  const box = await tile.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(760);
  const hoveredCount = await page.locator(".photo-tile.is-hovered").count();
  expect(hoveredCount).toBeLessThanOrEqual(1);
  const hoverZIndex = await tile.evaluate((element) => getComputedStyle(element).zIndex);
  expect(hoverZIndex).not.toBe("160");
  const strongestNonHoveredGhost = await page.locator(".photo-tile:not(.is-hovered) .tile-ghost").evaluateAll((ghosts) => (
    ghosts.reduce((max, ghost) => Math.max(max, Number.parseFloat(getComputedStyle(ghost).opacity) || 0), 0)
  ));
  expect(strongestNonHoveredGhost).toBeLessThan(0.08);
  const before = await tile.evaluate((element) => ({
    x: Number.parseFloat(element.style.getPropertyValue("--x")),
    y: Number.parseFloat(element.style.getPropertyValue("--y"))
  }));

  await page.waitForTimeout(900);
  const after = await tile.evaluate((element) => ({
    x: Number.parseFloat(element.style.getPropertyValue("--x")),
    y: Number.parseFloat(element.style.getPropertyValue("--y"))
  }));
  const drift = Math.hypot(after.x - before.x, after.y - before.y);
  expect(drift).toBeGreaterThan(0.04);
  await expect(page.locator("#photoLightbox")).toBeHidden();
  await page.screenshot({ path: "output/playwright/verified-hover-stability.png" });
});

test("captures phone landscape album", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 932, height: 430 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(1400);
  await expect(page.locator(".photo-tile.is-hero-card").first()).toBeVisible();
  const compactPoem = await page.locator(".stage-poem").evaluate((poem) => {
    const rect = poem.getBoundingClientRect();
    const strong = poem.querySelector("strong");
    return {
      opacity: Number.parseFloat(getComputedStyle(poem).opacity),
      bottom: rect.bottom,
      strongFontSize: strong ? Number.parseFloat(getComputedStyle(strong).fontSize) : 0
    };
  });
  expect(compactPoem.opacity).toBeLessThan(0.24);
  expect(compactPoem.bottom).toBeLessThan(112);
  expect(compactPoem.strongFontSize).toBeLessThan(18);
  await page.screenshot({ path: "output/playwright/verified-album-iphone-landscape.png" });
});

test("returns to the cover from routed pages and photo overlay", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/#photoWall");
  await expect(page.locator("body")).toHaveAttribute("data-view", "photoWall");
  await expect(page.locator(".home-return")).toHaveCSS("pointer-events", "auto");
  await page.locator(".home-return").click();
  await expect(page.locator("body")).toHaveAttribute("data-view", "home");
  await expect(page.locator("#home")).toHaveClass(/is-active/);
  await page.screenshot({ path: "output/playwright/verified-return-home.png" });

  await page.goto("/#letter");
  await expect(page.locator("body")).toHaveAttribute("data-view", "letter");
  await page.locator(".home-return").click();
  await expect(page.locator("body")).toHaveAttribute("data-view", "home");

  await page.goto("/#photoWall");
  await page.waitForTimeout(1400);
  await expect(page.locator(".photo-tile.is-hero-card").first()).toBeVisible();
  await page.evaluate(() => {
    const heroTile = document.querySelector(".photo-tile.is-hero-card") || document.querySelector(".photo-tile");
    heroTile?.click();
  });
  await expect(page.locator("#photoLightbox")).toBeVisible();
  await page.locator(".home-return").click();
  await expect(page.locator("body")).toHaveAttribute("data-view", "home");
  await expect(page.locator("#photoLightbox")).toBeHidden();
});

test("captures cinematic album intro gather", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(900);
  await expect(page.locator(".photo-wall")).toHaveClass(/is-intro/);
  await page.screenshot({ path: "output/playwright/verified-album-intro-gather.png" });
});

test("captures restrained idle cinematic motion", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(9600);

  const before = await page.locator(".photo-tile.is-hero-card").first().evaluate((tile) => ({
    x: Number.parseFloat(tile.style.getPropertyValue("--x")),
    y: Number.parseFloat(tile.style.getPropertyValue("--y"))
  }));
  await page.waitForTimeout(900);
  const idleState = await page.locator(".photo-wall").evaluate((wall) => {
    const style = getComputedStyle(wall);
    const hero = document.querySelector(".photo-tile.is-hero-card") || document.querySelector(".photo-tile");
    const heroPoint = hero ? {
      x: Number.parseFloat(hero.style.getPropertyValue("--x")),
      y: Number.parseFloat(hero.style.getPropertyValue("--y"))
    } : { x: 0, y: 0 };
    return {
      scene: wall.dataset.scene,
      blend: Number.parseFloat(style.getPropertyValue("--scene-blend")),
      spotlightStrength: Number.parseFloat(style.getPropertyValue("--spotlight-strength")),
      sweepIntensity: Number.parseFloat(style.getPropertyValue("--sweep-intensity")),
      spotlightCards: document.querySelectorAll(".photo-tile.is-spotlight-card").length,
      heroPoint
    };
  });
  const idleDrift = Math.hypot(idleState.heroPoint.x - before.x, idleState.heroPoint.y - before.y);
  expect(idleDrift).toBeGreaterThan(0.005);
  expect(idleDrift).toBeLessThan(0.42);
  expect(idleState.scene).toBe("0");
  expect(idleState.blend).toBeLessThan(0.24);
  expect(idleState.spotlightStrength).toBeLessThan(0.04);
  expect(idleState.sweepIntensity).toBeLessThan(0.08);
  expect(idleState.spotlightCards).toBe(0);
  await page.screenshot({ path: "output/playwright/verified-album-auto-scene.png" });
});

test("keeps automatic album motion restrained without spotlight flicker", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(11600);

  await page.waitForTimeout(1800);
  const stableMotionState = await page.locator(".photo-wall").evaluate((wall) => {
    const style = getComputedStyle(wall);
    const strongestGhost = Array.from(document.querySelectorAll(".photo-tile:not(.is-hovered) .tile-ghost"))
      .reduce((max, ghost) => Math.max(max, Number.parseFloat(getComputedStyle(ghost).opacity) || 0), 0);
    const strongestSpotlight = Array.from(document.querySelectorAll(".photo-tile"))
      .reduce((max, tile) => Math.max(max, Number.parseFloat(tile.style.getPropertyValue("--spotlight")) || 0), 0);
    return {
      scene: wall.dataset.scene,
      sceneBlend: Number.parseFloat(style.getPropertyValue("--scene-blend")),
      spotlightStrength: Number.parseFloat(style.getPropertyValue("--spotlight-strength")),
      isSpotlight: wall.classList.contains("is-spotlight"),
      spotlightCards: document.querySelectorAll(".photo-tile.is-spotlight-card").length,
      strongestGhost,
      strongestSpotlight
    };
  });
  expect(stableMotionState.sceneBlend).toBeLessThan(0.24);
  expect(stableMotionState.scene).toBe("0");
  expect(stableMotionState.spotlightStrength).toBeLessThan(0.04);
  expect(stableMotionState.strongestSpotlight).toBeLessThan(0.04);
  expect(stableMotionState.isSpotlight).toBe(false);
  expect(stableMotionState.spotlightCards).toBe(0);
  expect(stableMotionState.strongestGhost).toBeLessThan(0.04);
  await page.screenshot({ path: "output/playwright/verified-album-restrained-motion.png" });
});

test("captures drag-responsive cinematic light state", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(2800);

  const blankPoint = await page.evaluate(() => {
    const wall = document.querySelector(".photo-wall").getBoundingClientRect();
    const candidates = [
      [0.84, 0.78],
      [0.16, 0.78],
      [0.86, 0.24],
      [0.14, 0.24],
      [0.5, 0.86]
    ];
    for (const [xRatio, yRatio] of candidates) {
      const x = wall.left + wall.width * xRatio;
      const y = wall.top + wall.height * yRatio;
      if (!document.elementFromPoint(x, y)?.closest(".photo-tile")) return { x, y };
    }
    return { x: wall.left + wall.width * 0.08, y: wall.top + wall.height * 0.88 };
  });
  await page.mouse.move(blankPoint.x, blankPoint.y);
  await page.mouse.down();
  for (const x of [blankPoint.x - 60, blankPoint.x - 130, blankPoint.x - 200, blankPoint.x - 270, blankPoint.x - 340]) {
    await page.mouse.move(x, blankPoint.y + 15, { steps: 6 });
    await page.waitForTimeout(18);
  }
  await page.waitForTimeout(220);
  await expect(page.locator(".photo-wall")).toHaveCSS("cursor", "grabbing");
  await expect(page.locator(".photo-wall")).toHaveClass(/layout-0/);
  await expect(page.locator(".photo-tile.is-hero-card").first()).toBeVisible();
  await page.screenshot({ path: "output/playwright/verified-album-drag-motion.png" });
  await page.mouse.up();
});

test("allows a single photo to be dragged out and reset by layout switch", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(3600);

  const hero = page.locator(".photo-tile.is-hero-card").first();
  await expect(hero).toBeVisible();
  const box = await hero.boundingBox();
  expect(box).not.toBeNull();
  const startX = box.x + box.width * 0.72;
  const startY = box.y + box.height * 0.86;
  const targetNumber = await page.evaluate(({ x, y }) => (
    document.elementFromPoint(x, y)?.closest(".photo-tile")?.dataset.number
  ), { x: startX, y: startY });
  expect(targetNumber).toBeTruthy();
  const dragged = page.locator(`.photo-tile[data-number="${targetNumber}"]`);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 210, startY - 95, { steps: 12 });
  await page.mouse.up();

  await expect(dragged).toHaveClass(/is-free-photo/);
  const freeState = await dragged.evaluate((tile) => ({
    x: Number.parseFloat(tile.style.getPropertyValue("--x")),
    y: Number.parseFloat(tile.style.getPropertyValue("--y")),
    zIndex: Number.parseInt(getComputedStyle(tile).zIndex, 10),
    opacity: Number.parseFloat(getComputedStyle(tile).opacity)
  }));
  expect(freeState.x).toBeGreaterThan(58);
  expect(freeState.y).toBeLessThan(49);
  expect(freeState.zIndex).toBeGreaterThan(240);
  expect(freeState.opacity).toBeGreaterThan(0.98);
  await page.screenshot({ path: "output/playwright/verified-single-photo-drag.png" });

  await page.mouse.dblclick(220, 730);
  await expect(dragged).not.toHaveClass(/is-free-photo/);
  await expect(page.locator(".photo-wall")).toHaveClass(/layout-1/);
});

test("captures blank-area double click layout morph", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(900);

  await expect(page.locator(".photo-wall")).toHaveClass(/layout-0/);
  await page.mouse.dblclick(220, 730);
  await expect(page.locator(".photo-wall")).toHaveClass(/layout-1/);
  await expect(page.locator(".photo-wall")).toHaveClass(/is-morphing/);
  await page.screenshot({ path: "output/playwright/verified-album-doubleclick-morph.png" });
});

test("captures polished cover labels and envelope", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".top-nav a").nth(0)).toHaveText("相册");
  await expect(page.locator(".top-nav a").nth(1)).toHaveText("信");
  await expect(page.locator(".primary-action").first()).toHaveText("回忆");
  await expect(page.locator("#jumpLetter")).toHaveText("祝福");
  await expect(page.locator("#heroKicker")).toHaveCSS("font-weight", "900");
  await page.waitForTimeout(900);
  await page.screenshot({ path: "output/playwright/verified-cover-polish.png" });

  await page.goto("/#letter");
  await expect(page.locator("body")).toHaveAttribute("data-view", "letter");
  await expect(page.locator("#openLetter")).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "output/playwright/verified-letter-envelope-polish.png" });
});
