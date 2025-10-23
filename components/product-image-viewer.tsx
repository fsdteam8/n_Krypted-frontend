"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

interface ProductImageViewerProps {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  title?: string;
}

export default function ProductImageViewer({ images, selectedIndex, onSelect, title = "Product Image" }: ProductImageViewerProps) {
  // ---- zoom/pan refs ----
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

  // fullscreen
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
    fsZoomRef.current = next;
    setFsZoomUI(next);
    applyTransform(fsImageWrapRef.current, fsPanRef.current, next);
  } else {
    zoomRef.current = next;
    setZoomUI(next);
    applyTransform(imageWrapRef.current, panRef.current, next);
  }

  // 🧩 Auto-center when zooming back to 1
  if (next === 1) {
    const wrap = fs ? fsImageWrapRef.current : imageWrapRef.current;
    const pan = fs ? fsPanRef.current : panRef.current;
    if (wrap) {
      wrap.style.transition = "transform 0.25s ease-out";
      pan.x = 0;
      pan.y = 0;
      requestAnimationFrame(() => applyTransform(wrap, pan, 1));
      setTimeout(() => {
        if (wrap) wrap.style.transition = "";
      }, 250);
    }
  }
};

  const resetZoomPan = useCallback((fs = false) => {
    if (fs) { fsZoomRef.current = 1; fsPanRef.current = { x: 0, y: 0 }; setFsZoomUI(1); applyTransform(fsImageWrapRef.current, fsPanRef.current, 1); }
    else { zoomRef.current = 1; panRef.current = { x: 0, y: 0 }; setZoomUI(1); applyTransform(imageWrapRef.current, panRef.current, 1); }
  }, []);

  // sync embla <-> selectedIndex
  useEffect(() => { if (embla && embla.selectedScrollSnap() !== selectedIndex) embla.scrollTo(selectedIndex, true); }, [embla, selectedIndex]);
  useEffect(() => { if (!embla) return; const onSel = () => onSelect(embla.selectedScrollSnap()); embla.on("select", onSel); embla.on("reInit", onSel); }, [embla, onSelect]);

  // reset on slide change
  useEffect(() => { resetZoomPan(false); if (isFullscreen) resetZoomPan(true); }, [selectedIndex, isFullscreen, resetZoomPan]);

  // body scroll
  useEffect(() => { document.body.style.overflow = isFullscreen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isFullscreen]);

  // pointer handlers (main)
  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    if (zoomRef.current > 1) e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.current.size === 1) { isPanningRef.current = true; dragStartRef.current = { x: e.clientX, y: e.clientY }; panAtDownRef.current = { ...panRef.current }; }
    else if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values());
      fsLastPinchDist.current = null; // ensure FS pinch state clean
      lastPinchDist.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return; const map = activePointers.current; if (!map.has(e.pointerId)) return; map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (map.size === 2 && lastPinchDist.current) {
      const pts = Array.from(map.values()); const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y); const scale = dist / lastPinchDist.current; lastPinchDist.current = dist;
      const next = clamp(zoomRef.current * scale, MIN_ZOOM, MAX_ZOOM); zoomRef.current = next; setZoomUI(next);
      const { maxX, maxY } = getPanBounds(containerRef.current, next); panRef.current = { x: clamp(panRef.current.x, -maxX, maxX), y: clamp(panRef.current.y, -maxY, maxY) };
      requestAnimationFrame(() => applyTransform(imageWrapRef.current, panRef.current, next)); e.stopPropagation(); return;
    }
    if (isPanningRef.current && zoomRef.current > 1) {
      const dx = e.clientX - dragStartRef.current.x, dy = e.clientY - dragStartRef.current.y; const { maxX, maxY } = getPanBounds(containerRef.current, zoomRef.current);
      const nextPan = { x: clamp(panAtDownRef.current.x + dx, -maxX, maxX), y: clamp(panAtDownRef.current.y + dy, -maxY, maxY) }; panRef.current = nextPan;
      requestAnimationFrame(() => applyTransform(imageWrapRef.current, nextPan, zoomRef.current)); e.stopPropagation();
    }
  };
  const onPointerUp = (e: React.PointerEvent) => { activePointers.current.delete(e.pointerId); if (activePointers.current.size < 2) lastPinchDist.current = null; isPanningRef.current = false; };

  // wheel zoom (bind to current slide container)
  useEffect(() => {
    const el = containerRef.current; if (!el) return; const handler = (e: WheelEvent) => { if (!el.contains(e.target as Node)) return; e.preventDefault(); const d = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP; setZoomClamped(zoomRef.current + d, false); };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    el.addEventListener("wheel", handler, { passive: false }); return () => el.removeEventListener("wheel", handler as any);
  }, [selectedIndex, setZoomClamped]);

  // double click/tap zoom toggle
  const onDoubleClick = (fs = false) => (e: React.MouseEvent) => { const zr = fs ? fsZoomRef : zoomRef; const pr = fs ? fsPanRef : panRef; const wrap = fs ? fsImageWrapRef : imageWrapRef; const next = zr.current > 1 ? 1 : 2; zr.current = next; if (next === 1) pr.current = { x: 0, y: 0 }; if (fs) { setFsZoomUI(next); } else { setZoomUI(next); } applyTransform(wrap.current, pr.current, next); if (!fs && next > 1) e.stopPropagation(); };

  // FS handlers + wheel
  useEffect(() => {
    if (!isFullscreen) return; const el = fsContainerRef.current; if (!el) return; const handler = (e: WheelEvent) => { if (!fsContainerRef.current?.contains(e.target as Node)) return; e.preventDefault(); const d = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP; setZoomClamped(fsZoomRef.current + d, true); };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    el.addEventListener("wheel", handler, { passive: false }); return () => el.removeEventListener("wheel", handler as any);
  }, [isFullscreen, setZoomClamped]);

  

  // thumbs ref
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  if (!images || images.length === 0) return (
    <div className="w-full h-full flex items-center justify-center rounded-lg"><p className="text-gray-400">No images available</p></div>
  );

  const prevDisabled = selectedIndex === 0 || zoomRef.current > 1;
  const nextDisabled = selectedIndex === images.length - 1 || zoomRef.current > 1;

  return (
    <div className="w-full space-y-4 select-none">
      {/* HERO: rounded container w/ cover + centered image */}
      <Carousel opts={{ align: "start", loop: false }} setApi={setEmbla} className="w-full">
        <CarouselContent>
          {images.map((src, i) => (
            <CarouselItem key={i} className="basis-full">
              <div
                ref={i === selectedIndex ? containerRef : null}
                className="group relative w-full aspect-[4/3] md:aspect-[16/10] rounded-md overflow-hidden touch-none bg-transparent ring-1 ring-white/10"
                style={{ touchAction: "none" }}
                onPointerDown={i === selectedIndex ? onPointerDown : undefined}
                onPointerMove={i === selectedIndex ? onPointerMove : undefined}
                onPointerUp={i === selectedIndex ? onPointerUp : undefined}
                onPointerCancel={i === selectedIndex ? onPointerUp : undefined}
                onDoubleClick={i === selectedIndex ? onDoubleClick(false) : undefined}
              >
                <div
                  ref={i === selectedIndex ? imageWrapRef : null}
                  className="absolute inset-0 flex items-center justify-center will-change-transform overflow-hidden rounded-md"
                  style={{ transform: `translate3d(${panRef.current.x}px, ${panRef.current.y}px, 0) scale(${zoomRef.current})` }}
                >
                  <Image src={src || "/placeholder.svg"} alt={title} fill priority sizes="100vw" className="object-cover object-center pointer-events-none" />
                </div>

                {/* minimal hover-only white arrows inside the image */}
                <button
                  type="button"
                  className={`absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white/90 hover:text-white ${prevDisabled ? "pointer-events-none opacity-0" : ""}`}
                  onClick={() => onSelect(Math.max(0, selectedIndex - 1))}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white/90 hover:text-white ${nextDisabled ? "pointer-events-none opacity-0" : ""}`}
                  onClick={() => onSelect(Math.min(images.length - 1, selectedIndex + 1))}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Fullscreen toggle (ghost, small) */}
                {i === selectedIndex && (
                  <button
                    onClick={() => { setIsFullscreen(true); resetZoomPan(true); }}
                    className="absolute top-3 left-3 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition"
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

      {/* Controls (ghost, smaller) */}
      <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          <button onClick={() => setZoomClamped(zoomRef.current - ZOOM_STEP)} disabled={zoomRef.current <= MIN_ZOOM} className="p-1.5 rounded-md bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 hover:text-white transition border border-white/10" aria-label="Zoom out" title="Zoom out"><ZoomOut className="w-4 h-4" /></button>
          <div className="px-2.5 py-1.5 rounded-md bg-transparent text-white/90 text-sm font-medium min-w-[60px] text-center ring-1 ring-white/10">{Math.round(zoomUI * 100)}%</div>
          <button onClick={() => setZoomClamped(zoomRef.current + ZOOM_STEP)} disabled={zoomRef.current >= MAX_ZOOM} className="p-1.5 rounded-md bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 hover:text-white transition border border-white/10" aria-label="Zoom in" title="Zoom in"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => resetZoomPan(false)} disabled={zoomRef.current === 1 && panRef.current.x === 0 && panRef.current.y === 0} className="p-1.5 rounded-md bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white/90 hover:text-white transition border border-white/10" aria-label="Reset zoom" title="Reset zoom"><RotateCcw className="w-4 h-4" /></button>
        </div>
        <div className="text-sm text-gray-400 font-medium">{selectedIndex + 1} / {images.length}</div>
      </div>

      {/* Bottom nav + thumbnails */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onSelect(Math.max(0, selectedIndex - 1))} disabled={selectedIndex === 0} className="shrink-0 p-1.5 rounded-md bg-transparent text-white/70 hover:text-white border border-white/10 disabled:opacity-30" aria-label="Previous image">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div ref={thumbsRef} className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {images.map((src, i) => (
            <button key={i} onClick={() => onSelect(i)} className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/60 ${selectedIndex === i ? "border-white shadow-lg" : "border-white/20 hover:border-white/40"}`} aria-label={`View image ${i + 1}`} aria-current={selectedIndex === i}>
              <Image src={src || "/placeholder.svg"} alt={`Thumbnail ${i + 1}`} fill sizes="80px" className="object-cover object-center" />
            </button>
          ))}
        </div>

        <button type="button" onClick={() => onSelect(Math.min(images.length - 1, selectedIndex + 1))} disabled={selectedIndex === images.length - 1} className="shrink-0 p-1.5 rounded-md bg-transparent text-white/70 hover:text-white border border-white/10 disabled:opacity-30" aria-label="Next image">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Fullscreen */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="text-white text-sm font-medium">{selectedIndex + 1} / {images.length}</div>
            <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-md hover:bg-white/10 text-white transition" aria-label="Close fullscreen" title="Close"><X className="w-6 h-6" /></button>
          </div>

          <div
            ref={fsContainerRef}
            className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing touch-none"
            style={{ touchAction: "none" }}
            onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); fsActivePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (fsActivePointers.current.size === 1) { fsIsPanningRef.current = true; fsDragStartRef.current = { x: e.clientX, y: e.clientY }; fsPanAtDownRef.current = { ...fsPanRef.current }; } else if (fsActivePointers.current.size === 2) { const pts = Array.from(fsActivePointers.current.values()); fsLastPinchDist.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y); } }}
            onPointerMove={(e) => { if (!fsContainerRef.current) return; const map = fsActivePointers.current; if (!map.has(e.pointerId)) return; map.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (map.size === 2 && fsLastPinchDist.current) { const pts = Array.from(map.values()); const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y); const scale = dist / fsLastPinchDist.current; fsLastPinchDist.current = dist; const next = clamp(fsZoomRef.current * scale, MIN_ZOOM, MAX_ZOOM); fsZoomRef.current = next; setFsZoomUI(next); const { maxX, maxY } = getPanBounds(fsContainerRef.current, next); fsPanRef.current = { x: clamp(fsPanRef.current.x, -maxX, maxX), y: clamp(fsPanRef.current.y, -maxY, maxY) }; requestAnimationFrame(() => applyTransform(fsImageWrapRef.current, fsPanRef.current, next)); return; } if (fsIsPanningRef.current) { const dx = e.clientX - fsDragStartRef.current.x, dy = e.clientY - fsDragStartRef.current.y; const { maxX, maxY } = getPanBounds(fsContainerRef.current, fsZoomRef.current); const nextPan = { x: clamp(fsPanAtDownRef.current.x + dx, -maxX, maxX), y: clamp(fsPanAtDownRef.current.y + dy, -maxY, maxY) }; fsPanRef.current = nextPan; requestAnimationFrame(() => applyTransform(fsImageWrapRef.current, nextPan, fsZoomRef.current)); } }}
            onPointerUp={(e) => { fsActivePointers.current.delete(e.pointerId); if (fsActivePointers.current.size < 2) fsLastPinchDist.current = null; fsIsPanningRef.current = false; }}
            onPointerCancel={(e) => { fsActivePointers.current.delete(e.pointerId); if (fsActivePointers.current.size < 2) fsLastPinchDist.current = null; fsIsPanningRef.current = false; }}
            onDoubleClick={onDoubleClick(true)}
          >
            <div ref={fsImageWrapRef} className="absolute inset-0 flex items-center justify-center will-change-transform overflow-hidden rounded-md" style={{ transform: `translate3d(${fsPanRef.current.x}px, ${fsPanRef.current.y}px, 0) scale(${fsZoomRef.current})` }}>
              <Image src={currentImage || "/placeholder.svg"} alt={title} fill priority sizes="100vw" className="object-contain object-center pointer-events-none" />

            </div>
            {fsZoomUI > 1 && (<div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">{Math.round(fsZoomUI * 100)}%</div>)}
          </div>
        </div>
      )}
    </div>
  );
}

// .no-scrollbar::-webkit-scrollbar { display: none; }
// .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
