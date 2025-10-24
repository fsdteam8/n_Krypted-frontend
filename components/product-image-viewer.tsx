"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

interface ProductImageViewerProps {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  title?: string;
  showArrows?: boolean;
  showZoomControls?: boolean;
  showIndex?: boolean;
  /** Adjust to your layout; smaller on mobile by default */
  heightClass?: string; // e.g. "h-[340px] md:h-[391px]"
}

export default function ProductImageViewer({
  images,
  selectedIndex,
  onSelect,
  title = "Product Image",
  showArrows = false,
  showZoomControls = false,
  showIndex = false,
  // ↓ reduced mobile height
  heightClass = "h-[360px] md:h-[391px]",
}: ProductImageViewerProps) {
  const MIN_ZOOM = 1, MAX_ZOOM = 4, ZOOM_STEP = 0.2;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const panAtDownRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDist = useRef<number | null>(null);
  const [zoomUI, setZoomUI] = useState(1);
  const [embla, setEmbla] = useState<CarouselApi>();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const fsContainerRef = useRef<HTMLDivElement | null>(null);
  const fsImageWrapRef = useRef<HTMLDivElement | null>(null);
  const fsZoomRef = useRef(1);
  const fsPanRef = useRef({ x: 0, y: 0 });
  const fsPanAtDownRef = useRef({ x: 0, y: 0 });
  const fsDragStartRef = useRef({ x: 0, y: 0 });
  const fsIsPanningRef = useRef(false);
  const fsActivePointers = useRef(new Map<number, { x: number; y: number }>());
  const fsLastPinchDist = useRef<number | null>(null);
  const [fsZoomUI, setFsZoomUI] = useState(1);

  const currentImage = images?.[selectedIndex];
  const isSingle = !images || images.length <= 1;

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const applyTransform = (el: HTMLDivElement | null, pan: { x: number; y: number }, z: number) => {
    if (!el) return; el.style.transform = `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${z})`;
  };
  const getPanBounds = (container: HTMLDivElement, z: number) => {
    const r = container.getBoundingClientRect();
    return { maxX: ((z - 1) * r.width) / 2, maxY: ((z - 1) * r.height) / 2 };
  };

  const setZoomClamped = (z: number, fs = false) => {
    const next = clamp(z, MIN_ZOOM, MAX_ZOOM);
    if (fs) {
      fsZoomRef.current = next; setFsZoomUI(next);
      applyTransform(fsImageWrapRef.current, fsPanRef.current, next);
    } else {
      zoomRef.current = next; setZoomUI(next);
      applyTransform(imageWrapRef.current, panRef.current, next);
    }
    if (next === 1) {
      const wrap = fs ? fsImageWrapRef.current : imageWrapRef.current;
      const pan = fs ? fsPanRef.current : panRef.current;
      if (wrap) {
        wrap.style.transition = "transform 0.25s ease-out";
        pan.x = 0; pan.y = 0;
        requestAnimationFrame(() => applyTransform(wrap, pan, 1));
        setTimeout(() => { if (wrap) wrap.style.transition = ""; }, 250);
      }
    }
  };

  const resetZoomPan = React.useCallback((fs = false) => {
    if (fs) {
      fsZoomRef.current = 1; fsPanRef.current = { x: 0, y: 0 }; setFsZoomUI(1);
      applyTransform(fsImageWrapRef.current, fsPanRef.current, 1);
    } else {
      zoomRef.current = 1; panRef.current = { x: 0, y: 0 }; setZoomUI(1);
      applyTransform(imageWrapRef.current, panRef.current, 1);
    }
  }, []);

  useEffect(() => { if (embla && embla.selectedScrollSnap() !== selectedIndex) embla.scrollTo(selectedIndex, true); }, [embla, selectedIndex]);
  useEffect(() => {
    if (!embla) return;
    const onSel = () => onSelect(embla.selectedScrollSnap());
    embla.on("select", onSel);
    embla.on("reInit", onSel);
  }, [embla, onSelect]);

  useEffect(() => { resetZoomPan(false); if (isFullscreen) resetZoomPan(true); }, [selectedIndex, isFullscreen, resetZoomPan]);

  useEffect(() => { document.body.style.overflow = isFullscreen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isFullscreen]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    if (zoomRef.current > 1) e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.current.size === 1) {
      isPanningRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panAtDownRef.current = { ...panRef.current };
    } else if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values());
      lastPinchDist.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const map = activePointers.current;
    if (!map.has(e.pointerId)) return;
    map.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (map.size === 2 && lastPinchDist.current) {
      const pts = Array.from(map.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const scale = dist / lastPinchDist.current;
      lastPinchDist.current = dist;

      const next = clamp(zoomRef.current * scale, MIN_ZOOM, MAX_ZOOM);
      zoomRef.current = next; setZoomUI(next);

      const { maxX, maxY } = getPanBounds(containerRef.current, next);
      panRef.current = {
        x: clamp(panRef.current.x, -maxX, maxX),
        y: clamp(panRef.current.y, -maxY, maxY),
      };
      requestAnimationFrame(() => applyTransform(imageWrapRef.current, panRef.current, next));
      e.stopPropagation();
      return;
    }

    if (isPanningRef.current && zoomRef.current > 1) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const { maxX, maxY } = getPanBounds(containerRef.current, zoomRef.current);
      const nextPan = {
        x: clamp(panAtDownRef.current.x + dx, -maxX, maxX),
        y: clamp(panAtDownRef.current.y + dy, -maxY, maxY),
      };
      panRef.current = nextPan;
      requestAnimationFrame(() => applyTransform(imageWrapRef.current, nextPan, zoomRef.current));
      e.stopPropagation();
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) lastPinchDist.current = null;
    isPanningRef.current = false;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!el.contains(e.target as Node)) return;
      e.preventDefault();
      const d = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoomClamped(zoomRef.current + d, false);
    };
    el.addEventListener("wheel", handler, { passive: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => el.removeEventListener("wheel", handler as any);
  }, [selectedIndex]);

  const onDoubleClick = (fs = false) => (e: React.MouseEvent) => {
    const zr = fs ? fsZoomRef : zoomRef;
    const pr = fs ? fsPanRef : panRef;
    const wrap = fs ? fsImageWrapRef : imageWrapRef;
    const next = zr.current > 1 ? 1 : 2;
    zr.current = next;
    if (next === 1) pr.current = { x: 0, y: 0 };
    fs ? setFsZoomUI(next) : setZoomUI(next);
    applyTransform(wrap.current, pr.current, next);
    if (!fs && next > 1) e.stopPropagation();
  };

  useEffect(() => {
    if (!isFullscreen) return;
    const el = fsContainerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!fsContainerRef.current?.contains(e.target as Node)) return;
      e.preventDefault();
      const d = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoomClamped(fsZoomRef.current + d, true);
    };
    el.addEventListener("wheel", handler, { passive: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => el.removeEventListener("wheel", handler as any);
  }, [isFullscreen]);

  const thumbsVRef = useRef<HTMLDivElement | null>(null);

  const canPrev = !isSingle && zoomRef.current === 1 && selectedIndex > 0;
  const canNext = !isSingle && zoomRef.current === 1 && selectedIndex < images.length - 1;

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-lg">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="w-full select-none md:grid md:grid-cols-[88px_1fr] md:gap-4">
      {/* LEFT SIDEBAR (same height as hero; no horizontal scrollbar) */}
      <div
        ref={thumbsVRef}
        className={`hidden md:flex flex-col gap-2 pr-1 overflow-y-auto overflow-x-hidden no-scrollbar ${heightClass}`}
        aria-label="Thumbnails"
      >
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/60
              ${selectedIndex === i ? "border-white shadow-lg" : "border-white/20 hover:border-white/40"}`}
            aria-label={`View image ${i + 1}`}
            aria-current={selectedIndex === i}
          >
            <Image src={src || "/placeholder.svg"} alt={`Thumbnail ${i + 1}`} fill sizes="80px" className="object-cover object-center" />
          </button>
        ))}
      </div>

      {/* RIGHT: HERO */}
      <div className="w-full space-y-4">
        <Carousel opts={{ align: "start", loop: false }} setApi={setEmbla} className="w-full">
          <CarouselContent>
            {images.map((src, i) => (
              <CarouselItem key={i} className="basis-full">
                <div
                  ref={i === selectedIndex ? containerRef : null}
                  className={`group relative w-full ${heightClass} rounded-md overflow-hidden bg-transparent ring-1 ring-white/10`}
                  /* Allow page scroll on mobile when not zoomed; capture gestures when zoomed-in */
                  style={{ touchAction: zoomRef.current > 1 ? "none" : "pan-y pinch-zoom" as any }}
                  onPointerDown={i === selectedIndex ? onPointerDown : undefined}
                  onPointerMove={i === selectedIndex ? onPointerMove : undefined}
                  onPointerUp={i === selectedIndex ? onPointerUp : undefined}
                  onPointerCancel={i === selectedIndex ? onPointerUp : undefined}
                  onDoubleClick={i === selectedIndex ? onDoubleClick(false) : undefined}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div
                    ref={i === selectedIndex ? imageWrapRef : null}
                    className="absolute inset-0 flex items-center justify-center will-change-transform overflow-hidden rounded-md"
                    style={{ transform: `translate3d(${panRef.current.x}px, ${panRef.current.y}px, 0) scale(${zoomRef.current})` }}
                  >
                    <Image
                      src={src || "/placeholder.svg"}
                      alt={title}
                      fill
                      sizes="100vw"
                      className="object-cover object-center pointer-events-none"
                      priority={i === selectedIndex}
                    />
                  </div>

                  {showArrows && i === selectedIndex && (canPrev || canNext) && (
                    <>
                      {canPrev && (
                        <button
                          type="button"
                          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white/90 hover:text-white"
                          onClick={() => onSelect(Math.max(0, selectedIndex - 1))}
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                      )}
                      {canNext && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white/90 hover:text-white"
                          onClick={() => onSelect(Math.min(images.length - 1, selectedIndex + 1))}
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      )}
                    </>
                  )}

                  {i === selectedIndex && (
                    <button
                      onClick={() => { setIsFullscreen(true); resetZoomPan(true); }}
                      className="absolute bottom-3 right-3 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition"
                      aria-label="View fullscreen"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {(showZoomControls || showIndex) && (
          <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
            {showZoomControls ? (
              <div className="flex gap-2">
                <button onClick={() => setZoomClamped(zoomRef.current - ZOOM_STEP)} disabled={zoomRef.current <= MIN_ZOOM} className="p-1.5 rounded-md bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 hover:text-white transition border border-white/10" aria-label="Zoom out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="px-2.5 py-1.5 rounded-md bg-transparent text-white/90 text-sm font-medium min-w-[60px] text-center ring-1 ring-white/10">
                  {Math.round(zoomUI * 100)}%
                </div>
                <button onClick={() => setZoomClamped(zoomRef.current + ZOOM_STEP)} disabled={zoomRef.current >= MAX_ZOOM} className="p-1.5 rounded-md bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 hover:text-white transition border border-white/10" aria-label="Zoom in">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={() => resetZoomPan(false)} disabled={zoomRef.current === 1 && panRef.current.x === 0 && panRef.current.y === 0} className="p-1.5 rounded-md bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 hover:text-white transition border border-white/10" aria-label="Reset zoom">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ) : <div />}

            {showIndex && <div className="text-sm text-gray-400 font-medium">{selectedIndex + 1} / {images.length}</div>}
          </div>
        )}

        {/* MOBILE thumbnails */}
        <div className="md:hidden">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/60 ${selectedIndex === i ? "border-white shadow-lg" : "border-white/20 hover:border-white/40"}`}
                aria-label={`View image ${i + 1}`}
                aria-current={selectedIndex === i}
              >
                <Image src={src || "/placeholder.svg"} alt={`Thumbnail ${i + 1}`} fill sizes="80px" className="object-cover object-center" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FULLSCREEN (object-contain) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            {showIndex ? <div className="text-white text-sm font-medium">{selectedIndex + 1} / {images.length}</div> : <div />}
            <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-md hover:bg-white/10 text-white transition" aria-label="Close fullscreen" title="Close">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div
            ref={fsContainerRef}
            className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ touchAction: "none" }}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              fsActivePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
              if (fsActivePointers.current.size === 1) {
                fsIsPanningRef.current = true;
                fsDragStartRef.current = { x: e.clientX, y: e.clientY };
                fsPanAtDownRef.current = { ...fsPanRef.current };
              } else if (fsActivePointers.current.size === 2) {
                const pts = Array.from(fsActivePointers.current.values());
                fsLastPinchDist.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
              }
            }}
            onPointerMove={(e) => {
              if (!fsContainerRef.current) return;
              const map = fsActivePointers.current;
              if (!map.has(e.pointerId)) return;
              map.set(e.pointerId, { x: e.clientX, y: e.clientY });

              if (map.size === 2 && fsLastPinchDist.current) {
                const pts = Array.from(map.values());
                const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                const scale = dist / fsLastPinchDist.current;
                fsLastPinchDist.current = dist;
                const next = clamp(fsZoomRef.current * scale, MIN_ZOOM, MAX_ZOOM);
                fsZoomRef.current = next; setFsZoomUI(next);
                const { maxX, maxY } = getPanBounds(fsContainerRef.current, next);
                fsPanRef.current = { x: clamp(fsPanRef.current.x, -maxX, maxX), y: clamp(fsPanRef.current.y, -maxY, maxY) };
                requestAnimationFrame(() => applyTransform(fsImageWrapRef.current, fsPanRef.current, next));
                return;
              }

              if (fsIsPanningRef.current) {
                const dx = e.clientX - fsDragStartRef.current.x;
                const dy = e.clientY - fsDragStartRef.current.y;
                const { maxX, maxY } = getPanBounds(fsContainerRef.current, fsZoomRef.current);
                const nextPan = { x: clamp(fsPanAtDownRef.current.x + dx, -maxX, maxX), y: clamp(fsPanAtDownRef.current.y + dy, -maxY, maxY) };
                fsPanRef.current = nextPan;
                requestAnimationFrame(() => applyTransform(fsImageWrapRef.current, nextPan, fsZoomRef.current));
              }
            }}
            onPointerUp={(e) => { fsActivePointers.current.delete(e.pointerId); if (fsActivePointers.current.size < 2) fsLastPinchDist.current = null; fsIsPanningRef.current = false; }}
            onPointerCancel={(e) => { fsActivePointers.current.delete(e.pointerId); if (fsActivePointers.current.size < 2) fsLastPinchDist.current = null; fsIsPanningRef.current = false; }}
            onDoubleClick={onDoubleClick(true)}
          >
            <div
              ref={fsImageWrapRef}
              className="absolute inset-0 flex items-center justify-center will-change-transform overflow-hidden"
              style={{ transform: `translate3d(${fsPanRef.current.x}px, ${fsPanRef.current.y}px, 0) scale(${fsZoomRef.current})` }}
            >
              <Image
                src={currentImage || "/placeholder.svg"}
                alt={title}
                fill
                sizes="100vw"
                className="object-contain object-center pointer-events-none"
                priority
              />
            </div>

            {showZoomControls && fsZoomUI > 1 && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
                {Math.round(fsZoomUI * 100)}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
