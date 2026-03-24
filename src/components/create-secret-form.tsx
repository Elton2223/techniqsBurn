"use client";

import { useState } from "react";
import { Flame, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SecretResult } from "@/components/secret-result";
import { generateKey, exportKey, encryptSecret, hashPassphrase } from "@/lib/crypto";
import {
  EXPIRY_OPTIONS,
  VIEW_OPTIONS,
  MAX_SECRET_LENGTH,
  CUSTOM_EXPIRY_VALUE,
  CUSTOM_EXPIRY_LIMITS,
  EXPIRY_UNITS,
} from "@/lib/constants";

export function CreateSecretForm() {
  const [secret, setSecret] = useState("");
  const [expiresIn, setExpiresIn] = useState(EXPIRY_OPTIONS[3].value.toString());
  const [maxViews, setMaxViews] = useState(VIEW_OPTIONS[0].value.toString());
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [customAmount, setCustomAmount] = useState(1);
  const [customUnitIdx, setCustomUnitIdx] = useState(1);

  const isCustom = expiresIn === CUSTOM_EXPIRY_VALUE.toString();

  const getExpiryMs = (): number => {
    if (!isCustom) return Number(expiresIn);
    const ms = customAmount * EXPIRY_UNITS[customUnitIdx].multiplier;
    return Math.max(CUSTOM_EXPIRY_LIMITS.minMs, Math.min(ms, CUSTOM_EXPIRY_LIMITS.maxMs));
  };

  const getCustomError = (): string | null => {
    if (!isCustom) return null;
    const ms = customAmount * EXPIRY_UNITS[customUnitIdx].multiplier;
    if (ms < CUSTOM_EXPIRY_LIMITS.minMs) return "Minimum expiry is 5 minutes";
    if (ms > CUSTOM_EXPIRY_LIMITS.maxMs) return "Maximum expiry is 30 days";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    if (getCustomError()) return;

    setIsLoading(true);
    setError(null);

    try {
      const key = await generateKey();
      const { encryptedData, iv } = await encryptSecret(secret, key);
      const keyBase64 = await exportKey(key);

      let passphraseHashValue: string | undefined;
      if (passphrase.trim()) {
        passphraseHashValue = await hashPassphrase(passphrase.trim());
      }

      const response = await fetch("/api/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedData,
          iv,
          expiresIn: getExpiryMs(),
          maxViews: Number(maxViews),
          passphraseHash: passphraseHashValue,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create secret");
      }

      const { id } = await response.json();
      const url = `${window.location.origin}/s/${id}#${keyBase64}`;
      setResultUrl(url);
      setSecret("");
      setPassphrase("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (resultUrl) {
    return (
      <SecretResult url={resultUrl} onCreateAnother={() => setResultUrl(null)} />
    );
  }

  const customError = getCustomError();

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="secret"
          className="text-sm font-medium text-muted-foreground"
        >
          Your secret
        </label>
        <Textarea
          id="secret"
          placeholder="Paste your password, API key, or sensitive text here..."
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          maxLength={MAX_SECRET_LENGTH}
          className="min-h-[160px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground text-right">
          {secret.length.toLocaleString()} / {MAX_SECRET_LENGTH.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="expiry"
            className="text-sm font-medium text-muted-foreground"
          >
            Expires after
          </label>
          <Select
            id="expiry"
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value)}
          >
            {EXPIRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="views"
            className="text-sm font-medium text-muted-foreground"
          >
            Max views
          </label>
          <Select
            id="views"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
          >
            {VIEW_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isCustom && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="custom-amount" className="sr-only">Amount</label>
              <input
                id="custom-amount"
                type="number"
                min={1}
                max={999}
                value={customAmount}
                onChange={(e) => setCustomAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-card-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent-border transition-colors"
              />
            </div>
            <div>
              <label htmlFor="custom-unit" className="sr-only">Unit</label>
              <Select
                id="custom-unit"
                value={customUnitIdx.toString()}
                onChange={(e) => setCustomUnitIdx(parseInt(e.target.value))}
              >
                {EXPIRY_UNITS.map((unit, idx) => (
                  <option key={unit.label} value={idx}>
                    {unit.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {customError && (
            <p className="text-xs text-red-400">{customError}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowPassphrase(!showPassphrase)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <KeyRound className="h-3.5 w-3.5" />
          {showPassphrase ? "Remove passphrase" : "Add passphrase (optional)"}
        </button>
        {showPassphrase && (
          <input
            type="password"
            placeholder="Enter a passphrase the recipient must know..."
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full rounded-lg border border-card-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent-border transition-colors"
          />
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!secret.trim() || isLoading || !!customError}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Encrypting...
          </>
        ) : (
          <>
            <Flame className="h-4 w-4" />
            Burn After Reading
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your secret is encrypted in your browser before it reaches our servers.
        <br />
        We can never read your secrets. Ever.
      </p>
    </form>
  );
}
