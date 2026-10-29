import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { Download, GripVertical, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { downloadAttachment } from '@/lib/downloadAttachment';
import { Button } from '@/components/ui/button';
import { clampDocumentPreviewWidth } from '@/lib/documentPreviewLayout';
import { getFileBlob } from '@/lib/fileBlobStore';
import { cn } from '@/utils/cn';

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.15;

type DocumentPreviewPanelProps = {
  fileId: string;
  fileName: string;
  mimeType: string;
  width: number;
  onWidthChange: (width: number) => void;
  onClose: () => void;
};

function isPdfFile(mimeType: string, fileName: string) {
  return mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
}

function isTextFile(mimeType: string, fileName: string) {
  const lower = fileName.toLowerCase();
  return (
    mimeType.startsWith('text/') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.md') ||
    mimeType === 'text/markdown'
  );
}

function PdfPages({ blob, zoom }: { blob: Blob; zoom: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    container.replaceChildren();

    const render = async () => {
      try {
        const data = await blob.arrayBuffer();
        const pdf = await getDocument({ data }).promise;
        if (cancelled) return;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = zoom;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'mx-auto max-w-full rounded-md border border-primary/10 bg-white shadow-sm';
          canvas.style.width = `${baseViewport.width * scale}px`;
          canvas.style.height = `${baseViewport.height * scale}px`;

          const context = canvas.getContext('2d');
          if (!context) continue;

          await page.render({ canvasContext: context, viewport, canvas }).promise;
          if (cancelled) return;

          const wrap = document.createElement('div');
          wrap.className = 'flex justify-center py-2';
          wrap.appendChild(canvas);
          container.appendChild(wrap);
        }
      } catch {
        if (!cancelled) setError('load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [blob, zoom]);

  const { t } = useTranslation();

  if (error) {
    return <p className="px-4 text-sm text-muted-foreground">{t('documentPreview.loadError')}</p>;
  }

  return (
    <>
      {loading && (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground animate-pulse">
          {t('documentPreview.loading')}
        </p>
      )}
      <div ref={containerRef} className={cn('space-y-1 px-3 pb-4', loading && 'hidden')} />
    </>
  );
}

export function DocumentPreviewPanel({
  fileId,
  fileName,
  mimeType,
  width,
  onWidthChange,
  onClose,
}: DocumentPreviewPanelProps) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobLoading, setBlobLoading] = useState(true);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    setZoom(1);
    setBlob(null);
    setTextPreview(null);
    setBlobLoading(true);

    let cancelled = false;
    void (async () => {
      const file = await getFileBlob(fileId);
      if (cancelled) return;
      if (!file) {
        setBlobLoading(false);
        return;
      }
      setBlob(file);
      if (isTextFile(mimeType, fileName) && !isPdfFile(mimeType, fileName)) {
        const text = await file.text();
        if (!cancelled) setTextPreview(text);
      }
      setBlobLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [fileId, fileName, mimeType]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      resizeRef.current = { startX: e.clientX, startWidth: width };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [width],
  );

  const onResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeRef.current) return;
      const delta = resizeRef.current.startX - e.clientX;
      onWidthChange(clampDocumentPreviewWidth(resizeRef.current.startWidth + delta));
    },
    [onWidthChange],
  );

  const onResizePointerUp = useCallback(() => {
    resizeRef.current = null;
  }, []);

  const pdf = isPdfFile(mimeType, fileName);
  const showText = !pdf && textPreview !== null;

  return (
    <aside
      className={cn(
        'document-preview-panel-enter fixed z-50 flex h-full flex-col border-primary/20 bg-background/95 shadow-xl shadow-primary/10 backdrop-blur-md',
        isMobile
          ? 'inset-0 w-full max-w-none border-0'
          : 'right-0 top-0 border-l',
      )}
      style={isMobile ? undefined : { width }}
      aria-label={t('documentPreview.title')}
    >
      {!isMobile ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t('documentPreview.resize')}
          className="absolute -left-1.5 top-0 z-10 flex h-full w-3 cursor-ew-resize items-center justify-center touch-none"
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          onPointerCancel={onResizePointerUp}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/80" aria-hidden />
        </div>
      ) : null}

      <header className="brand-shell-header flex shrink-0 items-center gap-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{fileName}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {t('documentPreview.title')}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label={t('documentPreview.download')}
          onClick={() => void downloadAttachment(fileId, fileName)}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label={t('documentPreview.close')}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col bg-muted/20">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto pb-20">
        {blobLoading && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground animate-pulse">
            {t('documentPreview.loading')}
          </p>
        )}
        {!blobLoading && !blob && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {t('documentPreview.unavailable')}
          </p>
        )}
        {!blobLoading && blob && pdf && <PdfPages blob={blob} zoom={zoom} />}
        {!blobLoading && blob && showText && (
          <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed">
            {textPreview}
          </pre>
        )}
        {!blobLoading && blob && !pdf && !showText && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {t('documentPreview.unsupportedType')}
          </p>
        )}
        </div>

        {pdf && blob && !blobLoading && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-3"
            role="toolbar"
            aria-label={t('documentPreview.zoomToolbar')}
          >
            <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-primary/20 bg-background/90 px-2 py-1 shadow-lg shadow-primary/10 backdrop-blur-md">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                aria-label={t('documentPreview.zoomOut')}
                disabled={zoom <= MIN_ZOOM}
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                aria-label={t('documentPreview.zoomIn')}
                disabled={zoom >= MAX_ZOOM}
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                aria-label={t('documentPreview.resetZoom')}
                onClick={() => setZoom(1)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
