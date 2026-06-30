const { test, expect } = require("@playwright/test");

test("captures album and two-step photo viewer", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(1400);
  await expect(page.locator(".photo-tile")).toHaveCount(24);
  await expect(page.locator(".photo-tile.is-hero-card").first()).toBeVisible();
  const desktopTileWidth = await page.locator(".photo-tile").first().evaluate((tile) => (
    Number.parseFloat(getComputedStyle(tile).width)
  ));
  expect(desktopTileWidth).toBeGreaterThan(170);
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
  expect(albumCoverage.height).toBeGreaterThan(420);
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
  expect(motionState.sweepIntensity).toBeGreaterThan(0.25);
  expect(motionState.cameraX).toContain("px");
  expect(motionState.cameraZ).toBeGreaterThan(-90);
  expect(motionState.cameraZ).toBeLessThan(90);
  expect(motionState.cameraScale).toBeGreaterThan(0.96);
  expect(motionState.cameraScale).toBeLessThan(1.04);
  const materialState = await page.locator(".photo-tile.is-hero-card").first().evaluate((tile) => {
    const cardStyle = getComputedStyle(tile);
    const cardsStyle = getComputedStyle(document.querySelector(".photo-cards"));
    const img = tile.querySelector("img");
    return {
      animationName: cardStyle.animationName,
      cardOpacity: Number.parseFloat(cardStyle.opacity),
      cardsFilter: cardsStyle.filter,
      imgFilter: img ? getComputedStyle(img).filter : ""
    };
  });
  expect(materialState.animationName).toBe("none");
  expect(materialState.cardOpacity).toBeGreaterThan(0.82);
  expect(materialState.cardsFilter).toBe("none");
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

  await page.locator(".lightbox-image-wrap").click();
  await expect(page.locator("#photoLightbox")).toHaveClass(/is-full-image/);
  await page.screenshot({ path: "output/playwright/verified-photo-full.png" });
});

test("opens photo detail reliably after hovering over a moving tile", async ({ page }) => {
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
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(900);
  await expect(page.locator(".photo-wall")).toHaveClass(/is-intro/);
  await page.screenshot({ path: "output/playwright/verified-album-intro-gather.png" });
});

test("captures idle cinematic scene evolution", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForFunction(() => {
    const wall = document.querySelector(".photo-wall");
    if (!wall) return false;
    const blend = Number.parseFloat(getComputedStyle(wall).getPropertyValue("--scene-blend"));
    return wall.dataset.scene !== "0" && blend > 0.55;
  }, null, { timeout: 22000 });

  const sceneState = await page.locator(".photo-wall").evaluate((wall) => ({
    scene: wall.dataset.scene,
    blend: Number.parseFloat(getComputedStyle(wall).getPropertyValue("--scene-blend"))
  }));
  expect(sceneState.scene).not.toBe("0");
  expect(sceneState.blend).toBeGreaterThan(0.55);
  await page.screenshot({ path: "output/playwright/verified-album-auto-scene.png" });
});

test("extracts a single photo during automatic scene evolution and then resets", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForFunction(() => {
    const wall = document.querySelector(".photo-wall");
    const spotlightCard = document.querySelector(".photo-tile.is-spotlight-card");
    if (!wall || !spotlightCard) return false;
    const strength = Number.parseFloat(getComputedStyle(wall).getPropertyValue("--spotlight-strength"));
    return wall.classList.contains("is-spotlight") && strength > 0.68;
  }, null, { timeout: 22000 });

  const spotlightState = await page.locator(".photo-tile.is-spotlight-card").first().evaluate((tile) => {
    const rect = tile.getBoundingClientRect();
    const style = getComputedStyle(tile);
    const caption = tile.querySelector(".tile-caption span");
    return {
      width: rect.width,
      height: rect.height,
      opacity: Number.parseFloat(style.opacity),
      zIndex: Number.parseInt(style.zIndex, 10),
      captionDisplay: caption ? getComputedStyle(caption).display : "none"
    };
  });
  expect(spotlightState.width).toBeGreaterThan(260);
  expect(spotlightState.height).toBeGreaterThan(340);
  expect(spotlightState.opacity).toBeGreaterThan(0.88);
  expect(spotlightState.zIndex).toBeGreaterThan(100);
  expect(spotlightState.captionDisplay).toBe("block");
  await page.screenshot({ path: "output/playwright/verified-album-spotlight-extract.png" });

  await page.waitForFunction(() => {
    const wall = document.querySelector(".photo-wall");
    if (!wall) return false;
    const strength = Number.parseFloat(getComputedStyle(wall).getPropertyValue("--spotlight-strength"));
    return !wall.classList.contains("is-spotlight") && strength < 0.07 && !document.querySelector(".photo-tile.is-spotlight-card");
  }, null, { timeout: 12000 });
});

test("captures drag-responsive cinematic light state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#photoWall");
  await page.waitForTimeout(2800);

  await page.mouse.move(1080, 485);
  await page.mouse.down();
  for (const x of [1020, 950, 880, 810, 740, 680, 620]) {
    await page.mouse.move(x, 500, { steps: 6 });
    await page.waitForTimeout(18);
  }
  await page.waitForTimeout(220);
  await expect(page.locator(".photo-wall")).toHaveCSS("cursor", "grabbing");
  await expect(page.locator(".photo-wall")).toHaveClass(/layout-0/);
  await expect(page.locator(".photo-tile.is-hero-card").first()).toBeVisible();
  await page.screenshot({ path: "output/playwright/verified-album-drag-motion.png" });
  await page.mouse.up();
});

test("captures blank-area double click layout morph", async ({ page }) => {
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
