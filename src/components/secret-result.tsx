"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  Copy,
  Plus,
  Link,
  Share2,
  MessageCircle,
  Mail,
  Send,
  Trash2,
  QrCode,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";

interface SecretResultProps {
  url: string;
  onCreateAnother: () => void;
}

export function SecretResult({ url, onCreateAnother }: SecretResultProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [burnConfirm, setBurnConfirm] = useState(false);
  const [burning, setBurning] = useState(false);
  const [burned, setBurned] = useState(false);

  const secretId = url.split("/s/")[1]?.split("#")[0];

  const generateQr = useCallback(async () => {
    if (qrDataUrl) return;
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: { dark: "#fafafa", light: "#18181b" },
      });
      setQrDataUrl(dataUrl);
    } catch {
      // QR generation failed silently
    }
  }, [url, qrDataUrl]);

  useEffect(() => {
    if (showQr) generateQr();
  }, [showQr, generateQr]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBurn = async () => {
    if (!secretId) return;
    setBurning(true);
    try {
      const res = await fetch(`/api/secrets/${secretId}`, { method: "DELETE" });
      if (res.ok) {
        setBurned(true);
      }
    } catch {
      // Burn failed silently
    } finally {
      setBurning(false);
      setBurnConfirm(false);
    }
  };

  const shareText = "I sent you a secret. Open it before it self-destructs!";

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + url)}`,
      color: "hover:text-green-400",
    },
    {
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
      color: "hover:text-blue-400",
    },
    {
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent("Someone sent you a secret")}&body=${encodeURIComponent(shareText + "\n\n" + url)}`,
      color: "hover:text-orange-400",
    },
  ];

  if (burned) {
    return (
      <div className="w-full space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/25">
          <Flame className="h-7 w-7 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">
            Secret burned
          </h2>
          <p className="text-sm text-zinc-400">
            The secret has been permanently destroyed. The link is no longer valid.
          </p>
        </div>
        <Button onClick={onCreateAnother} variant="secondary" className="w-full">
          <Plus className="h-4 w-4" />
          Create another secret
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 ring-1 ring-orange-500/25">
        <Link className="h-7 w-7 text-orange-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-100">
          Your secret link is ready
        </h2>
        <p className="text-sm text-zinc-400">
          Share this link with your recipient. It will self-destruct after being viewed.
        </p>
      </div>

      <div className="group relative rounded-lg border border-zinc-700/50 bg-zinc-900/50 p-4">
        <p className="break-all font-mono text-sm text-zinc-300 pr-10">
          {url}
        </p>
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 cursor-pointer"
          title="Copy to clipboard"
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <Button onClick={handleCopy} className="w-full" size="lg">
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Link
          </>
        )}
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setShowShareMenu(!showShareMenu)}
          variant="secondary"
          className="w-full"
        >
          <Share2 className="h-4 w-4" />
          Share via...
        </Button>
        <Button
          onClick={() => setShowQr(!showQr)}
          variant="secondary"
          className="w-full"
        >
          <QrCode className="h-4 w-4" />
          {showQr ? "Hide QR" : "QR Code"}
        </Button>
      </div>

      {showShareMenu && (
        <div className="flex items-center justify-center gap-3">
          {shareOptions.map((opt) => (
            <a
              key={opt.label}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 ${opt.color}`}
              aria-label={`Share via ${opt.label}`}
            >
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </a>
          ))}
        </div>
      )}

      {showQr && qrDataUrl && (
        <div className="flex justify-center">
          <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/50 p-4">
            <img src={qrDataUrl} alt="QR code for secret link" className="mx-auto" width={200} height={200} />
            <p className="mt-2 text-xs text-zinc-500">Scan to open the secret link</p>
          </div>
        </div>
      )}

      <div className="relative">
        {!burnConfirm ? (
          <Button
            onClick={() => setBurnConfirm(true)}
            variant="ghost"
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Burn before anyone sees it
          </Button>
        ) : (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4" />
              This will permanently destroy the secret. Are you sure?
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setBurnConfirm(false)}
                variant="secondary"
                className="flex-1"
                disabled={burning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBurn}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={burning}
              >
                {burning ? "Burning..." : "Yes, burn it"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onCreateAnother}
        variant="ghost"
        className="w-full"
      >
        <Plus className="h-4 w-4" />
        Create another secret
      </Button>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 text-left">
        <h3 className="text-sm font-medium text-zinc-300 mb-2">
          How it works
        </h3>
        <ul className="space-y-1.5 text-xs text-zinc-500">
          <li>The encryption key is in the link fragment (#) and never reaches our servers</li>
          <li>Once viewed, the encrypted data is permanently deleted from our database</li>
          <li>Even we cannot decrypt or read your secret</li>
        </ul>
      </div>
    </div>
  );
}
