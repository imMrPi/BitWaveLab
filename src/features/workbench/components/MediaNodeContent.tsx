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
      <div className="media-source-content microphone-source">
        <button
          type="button"
          className={`microphone-orb ${recording ? "recording" : ""}`}
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
        <div className="media-source-copy">
          <b>
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
          <small>
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
      <div className="media-source-content image-source">
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
          className={`image-drop-zone ${dragging ? "dragging" : ""}`}
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
              className="image-source-preview"
              style={{ backgroundImage: `url(${payload})` }}
              role="img"
              aria-label={tr(locale, "تصویر انتخاب‌شده", "Selected image")}
            />
          ) : (
            <span className="image-placeholder">▧</span>
          )}
          <b>
            {payload
              ? tr(
                  locale,
                  "برای تعویض کلیک یا Drop کن",
                  "Click or drop to replace",
                )
              : tr(locale, "تصویر را اینجا رها کن", "Drop image here")}
          </b>
          <small>
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
    <div className="media-source-content text-source">
      <label>
        <span>{tr(locale, "متن ورودی UTF-8", "UTF-8 input text")}</span>
        <textarea
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
    <div className={`media-output-content ${ready ? "ready" : ""}`}>
      <div className="media-output-head">
        <span>{ready ? "✓" : "…"}</span>
        <div>
          <b>
            {tr(locale, "بازسازی از مسیر اجرا", "Rebuilt from execution path")}
          </b>
          <small>
            {trace} · {data?.stages.length ?? 0} stage
          </small>
        </div>
        <em className={errors ? "damaged" : "clean"}>
          {ready ? `${Math.round(integrity * 100)}%` : "—"}
        </em>
      </div>
      {kind === "audio" &&
        (reconstructedUrl ? (
          <audio controls preload="metadata" src={reconstructedUrl} />
        ) : (
          <div className="media-output-empty">
            <svg className="play-icon" viewBox="0 0 24 24" aria-hidden="true">
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
            className="image-output-preview"
            style={{ backgroundImage: `url(${reconstructedUrl})` }}
            role="img"
            aria-label={tr(
              locale,
              "تصویر بازسازی‌شده از بیت‌ها",
              "Image reconstructed from received bits",
            )}
          />
        ) : (
          <div className="media-output-empty">
            <span>▧</span>
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
