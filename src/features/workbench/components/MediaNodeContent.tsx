"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphNode, LabData, ParameterValue } from "@/lib/signal-engine";
import { tr, type Locale } from "@/lib/i18n";

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(blob);
  });
}

async function prepareImage(file: File) {
  if (!file.type.startsWith("image/"))
    throw new Error("Only image files are accepted");
  if (file.size > 12 * 1024 * 1024)
    throw new Error("Image must be smaller than 12 MB");
  const source = await blobToDataUrl(file);
  return new Promise<{
    payload: string;
    mimeType: string;
    fileName: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 128;
      const scale = Math.min(
        1,
        maxSide / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas is unavailable"));
        return;
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      resolve({
        payload: canvas.toDataURL("image/jpeg", 0.76),
        mimeType: "image/jpeg",
        fileName: file.name.replace(/\.[^.]+$/, "") + "-lab.jpg",
        width,
        height,
      });
    };
    image.onerror = () => reject(new Error("Image could not be decoded"));
    image.src = source;
  });
}

type SourceProps = {
  node: GraphNode;
  data?: LabData;
  locale: Locale;
  onChange: (params: Record<string, ParameterValue>) => void;
};

export function MediaSourceContent({
  node,
  data,
  locale,
  onChange,
}: SourceProps) {
  const kind = node.algorithmId.replace("source.", "");
  const [recording, setRecording] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef(0);
  const stopTimerRef = useRef<number | null>(null);
  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);
  useEffect(
    () => () => {
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
      if (recorderRef.current?.state === "recording")
        recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function startRecording() {
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw new Error(
          tr(
            locale,
            "ضبط صدا در این مرورگر در دسترس نیست.",
            "Audio recording is unavailable in this browser.",
          ),
        );
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      const preferred = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, {
        ...(preferred ? { mimeType: preferred } : {}),
        audioBitsPerSecond: 16000,
      });
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedRef.current = Date.now();
      setMessage("");
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const duration = Math.max(0, (Date.now() - startedRef.current) / 1000);
        const mimeType =
          recorder.mimeType || chunksRef.current[0]?.type || "audio/webm";
        try {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const payload = await blobToDataUrl(blob);
          onChange({
            payload,
            mimeType,
            fileName: `bitwave-${Date.now()}.${mimeType.includes("ogg") ? "ogg" : "webm"}`,
            duration,
          });
          setMessage(
            tr(
              locale,
              `${duration.toFixed(1)} ثانیه ضبط شد.`,
              `${duration.toFixed(1)} seconds recorded.`,
            ),
          );
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : tr(
                  locale,
                  "خواندن صدای ضبط‌شده ناموفق بود.",
                  "The recorded audio could not be read.",
                ),
          );
        } finally {
          if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
          stopTimerRef.current = null;
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          setRecording(false);
        }
      };
      recorder.start(160);
      setRecording(true);
      stopTimerRef.current = window.setTimeout(() => stopRecording(), 6000);
    } catch (error) {
      setRecording(false);
      setMessage(
        error instanceof Error
          ? error.message
          : tr(
              locale,
              "دسترسی میکروفون ممکن نشد.",
              "Microphone access failed.",
            ),
      );
    }
  }
  async function acceptImage(file?: File) {
    if (!file) return;
    try {
      setMessage(tr(locale, "در حال آماده‌سازی تصویر…", "Preparing image…"));
      onChange(await prepareImage(file));
      setMessage(
        tr(locale, "تصویر به بیت تبدیل شد.", "Image converted to bits."),
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : tr(locale, "خواندن تصویر ناموفق بود.", "Image read failed."),
      );
    }
  }

  const payload = String(node.params.payload ?? "");
  const bitCount = Number(data?.metrics.payloadBits ?? 0);
  if (kind === "microphone")
    return (
      <div className="grid min-h-0 grid-cols-[52px_minmax(0,1fr)] items-center gap-2 overflow-hidden p-2 [&>audio]:col-span-2 [&>audio]:h-7 [&>audio]:w-full [&>footer]:col-span-2 [&>footer]:flex [&>footer]:items-center [&>footer]:justify-between [&>footer]:gap-2 [&>footer]:border-t [&>footer]:border-white/[.06] [&>footer]:pt-1.5 [&>footer]:text-[6px] [&>footer]:text-slate-600 [&>footer>code]:font-mono [&>footer>code]:text-amber-300/70">
        <button
          type="button"
          className={`relative grid size-12 place-items-center rounded-full border text-lg transition ${recording ? "animate-pulse border-rose-400/50 bg-rose-400/15 shadow-[0_0_18px_rgba(251,113,133,.25)]" : "border-cyan-400/25 bg-cyan-400/[.07] hover:border-cyan-300/50 hover:bg-cyan-400/10"} [&>i]:absolute [&>i]:inset-1 [&>i]:rounded-full [&>i]:border [&>i]:border-current [&>i]:opacity-20`}
          onClick={recording ? stopRecording : startRecording}
          aria-label={
            recording
              ? tr(locale, "توقف ضبط", "Stop recording")
              : tr(locale, "شروع ضبط میکروفون", "Start microphone recording")
          }
        >
          <span>🎙</span>
          <i />
        </button>
        <div className="min-w-0">
          <b className="block truncate text-[8px] text-slate-200">
            {recording
              ? tr(locale, "در حال ضبط…", "Recording…")
              : payload
                ? tr(
                    locale,
                    "ضبط آماده ارسال است",
                    "Recording ready to transmit",
                  )
                : tr(locale, "برای ضبط کلیک کن", "Click to record")}
          </b>
          <small className="mt-1 block text-[6px] leading-3 text-slate-600">
            {tr(
              locale,
              "حداکثر ۶ ثانیه · فشرده‌سازی کم‌حجم آزمایشگاهی",
              "Up to 6 seconds · compact lab recording",
            )}
          </small>
        </div>
        {payload && <audio controls preload="metadata" src={payload} />}
        <footer>
          <span>
            {message || tr(locale, "ورودی واقعی صوت", "Real audio input")}
          </span>
          <code>{bitCount.toLocaleString()} bit</code>
        </footer>
      </div>
    );
  if (kind === "image")
    return (
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_20px] overflow-hidden p-2 [&>footer]:flex [&>footer]:items-end [&>footer]:justify-between [&>footer]:gap-2 [&>footer]:text-[6px] [&>footer]:text-slate-600 [&>footer>code]:font-mono [&>footer>code]:text-amber-300/70">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          aria-label={tr(locale, "انتخاب فایل تصویر", "Choose image file")}
          onChange={(event) => void acceptImage(event.target.files?.[0])}
        />
        <button
          type="button"
          className={`grid min-h-0 grid-cols-[56px_minmax(0,1fr)] grid-rows-[1fr_1fr] items-center gap-x-2 overflow-hidden rounded-lg border border-dashed p-2 text-start transition ${dragging ? "border-cyan-300 bg-cyan-400/10" : "border-white/15 bg-black/15 hover:border-cyan-400/35 hover:bg-cyan-400/[.04]"}`}
          onClick={() => fileRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragging(false);
            void acceptImage(event.dataTransfer.files?.[0]);
          }}
        >
          {payload ? (
            <span
              className="row-span-2 size-14 rounded-md bg-cover bg-center shadow-inner"
              style={{ backgroundImage: `url(${payload})` }}
              role="img"
              aria-label={tr(locale, "تصویر انتخاب‌شده", "Selected image")}
            />
          ) : (
            <span className="row-span-2 grid size-14 place-items-center rounded-md bg-white/5 text-xl text-slate-600">▧</span>
          )}
          <b className="self-end truncate text-[8px] text-slate-300">
            {payload
              ? tr(
                  locale,
                  "برای تعویض کلیک یا Drop کن",
                  "Click or drop to replace",
                )
              : tr(locale, "تصویر را اینجا رها کن", "Drop image here")}
          </b>
          <small className="self-start text-[6px] text-slate-600">
            {tr(locale, "یا برای انتخاب فایل کلیک کن", "or click to browse")}
          </small>
        </button>
        <footer>
          <span>
            {message ||
              tr(
                locale,
                "تصویر به ۱۲۸ پیکسل محدود می‌شود",
                "Image is limited to 128 px",
              )}
          </span>
          <code>{bitCount.toLocaleString()} bit</code>
        </footer>
      </div>
    );
  return (
    <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_20px] overflow-hidden p-2 [&>footer]:flex [&>footer]:items-end [&>footer]:justify-between [&>footer]:gap-2 [&>footer]:text-[6px] [&>footer]:text-slate-600 [&>footer>code]:font-mono [&>footer>code]:text-amber-300/70">
      <label className="grid min-h-0 grid-rows-[16px_minmax(0,1fr)]">
        <span className="text-[7px] text-slate-500">{tr(locale, "متن ورودی UTF-8", "UTF-8 input text")}</span>
        <textarea
          className="min-h-0 resize-none rounded-lg border border-white/10 bg-black/20 p-2 text-[8px] leading-4 text-slate-200 outline-none placeholder:text-slate-700 focus:border-cyan-400/25"
          value={String(node.params.text ?? "")}
          maxLength={2000}
          dir="auto"
          placeholder={tr(locale, "پیام خود را بنویس…", "Type your message…")}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </label>
      <footer>
        <span>
          {tr(
            locale,
            "فقط همین متن به بیت تبدیل می‌شود",
            "Only this text is encoded as bits",
          )}
        </span>
        <code>{bitCount.toLocaleString()} bit</code>
      </footer>
    </div>
  );
}

export function MediaOutputContent({
  algorithmId,
  data,
  locale,
}: {
  algorithmId: string;
  data?: LabData;
  locale: Locale;
}) {
  const kind = algorithmId.replace("output.", "");
  const ready = Boolean(data?.metadata.mediaReady);
  const url = String(data?.metadata.reconstructedDataUrl ?? "");
  const text = String(data?.metadata.reconstructedText ?? "");
  const integrity = Number(data?.metrics.mediaIntegrity ?? 0);
  const errors = Number(data?.metrics.mediaBitErrors ?? 0);
  const trace = ready
    ? String(data?.metadata.reconstructedFrom ?? "")
    : tr(locale, "در انتظار بیت ورودی", "Waiting for input bits");
  const reconstructedUrl = ready ? url : "";
  return (
    <div className={`grid min-h-0 grid-rows-[38px_minmax(0,1fr)_20px] overflow-hidden p-2 ${ready ? "text-emerald-300" : "text-slate-600"} [&>audio]:h-8 [&>audio]:w-full [&>textarea]:min-h-0 [&>textarea]:resize-none [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-white/10 [&>textarea]:bg-black/20 [&>textarea]:p-2 [&>textarea]:text-[8px] [&>textarea]:text-slate-200 [&>footer]:flex [&>footer]:items-end [&>footer]:justify-between [&>footer]:gap-2 [&>footer]:text-[6px] [&>footer]:text-slate-600 [&>footer>code]:font-mono`}>
      <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 border-b border-white/[.06] pb-1.5">
        <span className={`grid size-6 place-items-center rounded-full ${ready ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-slate-600"}`}>{ready ? "✓" : "…"}</span>
        <div className="min-w-0">
          <b className="block truncate text-[7px] text-slate-300">
            {tr(locale, "بازسازی از مسیر اجرا", "Rebuilt from execution path")}
          </b>
          <small className="mt-0.5 block truncate text-[6px] text-slate-600">
            {trace} · {data?.stages.length ?? 0} stage
          </small>
        </div>
        <em className={`font-mono text-[7px] not-italic ${errors ? "text-rose-300" : "text-emerald-300"}`}>
          {ready ? `${Math.round(integrity * 100)}%` : "—"}
        </em>
      </div>
      {kind === "audio" &&
        (reconstructedUrl ? (
          <audio controls preload="metadata" src={reconstructedUrl} />
        ) : (
          <div className="grid place-items-center content-center gap-2 rounded-lg border border-dashed border-white/10 p-3 text-center text-[7px] leading-4 text-slate-600">
            <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>{" "}
            {tr(
              locale,
              "پس از رسیدن بیت‌ها فایل صوتی اینجا پخش می‌شود.",
              "The reconstructed audio will play here after bits arrive.",
            )}
          </div>
        ))}
      {kind === "image" &&
        (reconstructedUrl ? (
          <div
            className="min-h-20 rounded-lg bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${reconstructedUrl})` }}
            role="img"
            aria-label={tr(
              locale,
              "تصویر بازسازی‌شده از بیت‌ها",
              "Image reconstructed from received bits",
            )}
          />
        ) : (
          <div className="grid place-items-center content-center gap-2 rounded-lg border border-dashed border-white/10 p-3 text-center text-[7px] leading-4 text-slate-600">
            <span className="text-xl">▧</span>
            {tr(
              locale,
              "تصویر فقط از بیت‌های دریافتی ساخته می‌شود.",
              "The image is built only from received bits.",
            )}
          </div>
        ))}
      {kind === "text" && (
        <textarea
          readOnly
          dir="auto"
          value={ready ? text : ""}
          placeholder={tr(
            locale,
            "متن بازسازی‌شده اینجا دیده می‌شود…",
            "Reconstructed text appears here…",
          )}
        />
      )}
      <footer>
        <span>
          {!ready
            ? tr(
                locale,
                "منتظر داده واقعی در ابتدای مسیر",
                "Waiting for real source data",
              )
            : errors
              ? tr(
                  locale,
                  `${errors} خطای بیت باقی مانده`,
                  `${errors} residual bit errors`,
                )
              : tr(locale, "مسیر بیت سالم است", "Bit path is intact")}
        </span>
        <code>
          {ready
            ? String(data?.metadata.reconstructedDigest ?? "--------")
            : "--------"}
        </code>
      </footer>
    </div>
  );
}
