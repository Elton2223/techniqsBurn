"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BurnAnimation } from "@/components/burn-animation";
import { Toast } from "@/components/toast";
import { importKey, decryptSecret, hashPassphrase } from "@/lib/crypto";

interface ViewSecretProps {
  secretId: string;
}

type ViewState =
  | "ready"
  | "loading"
  | "revealed"
  | "burned"
  | "error"
  | "not-found"
  | "tampered";

export function ViewSecret({ secretId }: ViewSecretProps) {
  const [state, setState] = useState<ViewState>("ready");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [keyFragment, setKeyFragment] = useState<string | null>(null);
  const [secretLength, setSecretLength] = useState(0);
  const [peeking, setPeeking] = useState(false);
  const [secretConsumed, setSecretConsumed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const [passphraseRequired, setPassphraseRequired] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [passphraseError, setPassphraseError] = useState(false);
  const [checkingPassphrase, setCheckingPassphrase] = useState(true);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const plaintextRef = useRef<string | null>(null);
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      setError("No decryption key found in URL. The link may be incomplete.");
      setState("error");
      setCheckingPassphrase(false);
      return;
    }
    setKeyFragment(hash);
  }, []);

  // Check if passphrase is required (HEAD request, doesn't consume a view)
  useEffect(() => {
    if (!keyFragment) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/secrets/${secretId}`, { method: "HEAD" });
        if (cancelled) return;
        if (res.status === 404) {
          setState("not-found");
        } else if (res.ok) {
          const required = res.headers.get("x-passphrase-required") === "true";
          setPassphraseRequired(required);
        }
      } catch {
        // Non-critical; will fail gracefully on reveal
      } finally {
        if (!cancelled) setCheckingPassphrase(false);
      }
    })();
    return () => { cancelled = true; };
  }, [secretId, keyFragment]);

  // Detect touch device for mobile-friendly peek
  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // DevTools detection: window size check
  useEffect(() => {
    const threshold = 160;
    const check = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        plaintextRef.current = null;
        setSecretLength(0);
        setState("tampered");
      }
    };
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, []);

  // DevTools detection: console.log getter trap
  useEffect(() => {
    const devtoolsProbe = new Image();
    Object.defineProperty(devtoolsProbe, "id", {
      get() {
        plaintextRef.current = null;
        setSecretLength(0);
        setState("tampered");
        return "";
      },
    });
    const interval = setInterval(() => {
      console.debug("%c", devtoolsProbe);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Window blur detection: force peeking off when user switches away
  useEffect(() => {
    const handleBlur = () => setPeeking(false);
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      plaintextRef.current = null;
      setSecretLength(0);
      setSecretConsumed(true);
    }
  }, [countdown]);

  const handleReveal = useCallback(async () => {
    if (!keyFragment) return;

    setState("loading");

    try {
      const headers: Record<string, string> = {};
      if (passphraseRequired && passphrase.trim()) {
        headers["x-passphrase-hash"] = await hashPassphrase(passphrase.trim());
      }

      const response = await fetch(`/api/secrets/${secretId}`, { headers });

      if (response.status === 404) {
        setState("not-found");
        return;
      }

      if (response.status === 403) {
        setPassphraseError(true);
        setState("ready");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to retrieve secret");
      }

      const { encryptedData, iv } = await response.json();

      const key = await importKey(keyFragment);
      const decrypted = await decryptSecret(encryptedData, iv, key);

      plaintextRef.current = decrypted;
      setSecretLength(decrypted.length);

      let didAutoCopy = false;
      try {
        await navigator.clipboard.writeText(decrypted);
        didAutoCopy = true;
        setToastMessage("Secret copied to clipboard");
        setToastVisible(true);
      } catch {
        // Clipboard may be blocked; user can still use the Copy button
      }

      setState("revealed");
      setTimeout(() => {
        setState("burned");
        if (didAutoCopy) {
          setCountdown(5);
        }
      }, 500);
    } catch {
      setError(
        "Failed to decrypt the secret. The link may be invalid or corrupted."
      );
      setState("error");
    }
  }, [secretId, keyFragment, passphraseRequired, passphrase]);

  const handleCopy = async () => {
    if (!plaintextRef.current) return;
    await navigator.clipboard.writeText(plaintextRef.current);
    setCopied(true);
    plaintextRef.current = null;
    setSecretLength(0);
    setPeeking(false);
    setSecretConsumed(true);
  };

  const handlePeekToggle = () => {
    if (!plaintextRef.current) return;

    if (isTouchDevice) {
      if (peeking) {
        setPeeking(false);
        if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
      } else {
        setPeeking(true);
        peekTimeoutRef.current = setTimeout(() => setPeeking(false), 3000);
      }
    }
  };

  const startPeek = () => {
    if (isTouchDevice) return;
    if (plaintextRef.current) setPeeking(true);
  };
  const stopPeek = () => {
    if (isTouchDevice) return;
    setPeeking(false);
  };

  if (state === "tampered") {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/25">
          <ShieldAlert className="h-7 w-7 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">
            Secret wiped
          </h2>
          <p className="text-sm text-zinc-400">
            Developer tools were detected. The secret has been wiped from memory
            for your protection.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/")}
          className="w-full"
        >
          Go to homepage
        </Button>
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700">
          <AlertTriangle className="h-7 w-7 text-zinc-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">
            Secret not found
          </h2>
          <p className="text-sm text-zinc-400">
            This secret has already been viewed, expired, or was burned by its
            creator.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/")}
          className="w-full"
        >
          Create a new secret
        </Button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/25">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">
            Something went wrong
          </h2>
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/")}
          className="w-full"
        >
          Go to homepage
        </Button>
      </div>
    );
  }

  if (state === "ready") {
    if (checkingPassphrase) {
      return (
        <div className="w-full max-w-lg mx-auto text-center space-y-6">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" />
          <p className="text-sm text-zinc-400">Loading...</p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 ring-1 ring-orange-500/25">
          <Eye className="h-7 w-7 text-orange-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">
            You received a secret
          </h2>
          <p className="text-sm text-zinc-400">
            Someone shared a self-destructing secret with you. Once you view it,
            it will be permanently deleted.
          </p>
        </div>

        {passphraseRequired && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-sm text-zinc-400">
              <KeyRound className="h-3.5 w-3.5" />
              This secret requires a passphrase
            </div>
            <input
              type="password"
              placeholder="Enter passphrase..."
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setPassphraseError(false);
              }}
              className={`w-full rounded-lg border bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-colors ${
                passphraseError
                  ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/25"
                  : "border-zinc-700/50 focus:border-orange-500/50 focus:ring-orange-500/25"
              }`}
            />
            {passphraseError && (
              <p className="text-xs text-red-400">
                Incorrect passphrase. Please try again.
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleReveal}
          size="lg"
          className="w-full"
          disabled={passphraseRequired && !passphrase.trim()}
        >
          <Eye className="h-4 w-4" />
          Reveal Secret
        </Button>
        <p className="text-xs text-zinc-500">
          This action cannot be undone. The secret will be destroyed after
          viewing.
        </p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-6">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" />
        <p className="text-sm text-zinc-400">Decrypting your secret...</p>
      </div>
    );
  }

  if (secretConsumed) {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/25">
          <Check className="h-7 w-7 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">
            Secret copied
          </h2>
          <p className="text-sm text-zinc-400">
            The secret has been copied to your clipboard and wiped from memory.
            It is no longer accessible.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => (window.location.href = "/")}
          className="w-full"
        >
          Create your own secret
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto text-center space-y-6">
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

      <BurnAnimation />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-100">
          Secret revealed
        </h2>
        <p className="text-xs text-zinc-500">
          This secret has been permanently destroyed from our servers.
        </p>
        {countdown !== null && countdown > 0 && (
          <p className="text-xs text-orange-400 font-medium">
            Wiping from memory in {countdown}s...
          </p>
        )}
      </div>

      <div
        className="secret-content relative rounded-lg border border-zinc-700/50 bg-zinc-900/50 p-4 text-left"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
      >
        <pre
          className={`whitespace-pre-wrap break-all font-mono text-sm pr-10 select-none transition-[filter] duration-200 ${
            peeking ? "text-zinc-200 blur-none" : "text-zinc-500 blur-0"
          }`}
        >
          {peeking && plaintextRef.current
            ? plaintextRef.current
            : "•".repeat(Math.min(secretLength, 80))}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 cursor-pointer"
          title="Copy to clipboard"
          aria-label="Copy secret to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <Button onClick={handleCopy} className="w-full" size="lg" aria-label="Copy secret to clipboard">
        <Copy className="h-4 w-4" />
        Copy Secret
      </Button>

      <Button
        variant="secondary"
        className="w-full"
        aria-label={peeking ? "Hide secret" : "Peek at secret"}
        onClick={isTouchDevice ? handlePeekToggle : undefined}
        onMouseDown={startPeek}
        onMouseUp={stopPeek}
        onMouseLeave={stopPeek}
        onTouchStart={isTouchDevice ? undefined : startPeek}
        onTouchEnd={isTouchDevice ? undefined : stopPeek}
      >
        {peeking ? (
          <>
            <EyeOff className="h-4 w-4" />
            {isTouchDevice ? "Tap to hide" : "Release to hide"}
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            {isTouchDevice ? "Tap to Peek" : "Hold to Peek"}
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        onClick={() => (window.location.href = "/")}
        className="w-full"
      >
        Create your own secret
      </Button>
    </div>
  );
}
