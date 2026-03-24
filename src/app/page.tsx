import { Flame, Shield, Eye, Zap } from "lucide-react";
import { CreateSecretForm } from "@/components/create-secret-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-card-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-muted">
              <Flame className="h-4 w-4 text-accent" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Techniqs <span className="text-accent">Burn</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">by Official Techniqs</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Share secrets that{" "}
              <span className="text-accent">self-destruct</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Paste a password, API key, or any sensitive text. Get an encrypted
              link that permanently destroys itself after being viewed.
            </p>
          </div>

          <CreateSecretForm />
        </div>
      </main>

      <section className="border-t border-card-border bg-muted/20">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold">
                Zero-knowledge
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Encryption happens in your browser. The decryption key never
                touches our servers. We literally cannot read your secrets.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted">
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold">
                View once, gone forever
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Once the recipient views the secret, the encrypted data is
                permanently deleted from our database. No traces left.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold">
                No account needed
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create and share encrypted secrets instantly. No sign-up, no
                tracking, no logs. Just pure, ephemeral security.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-card-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Official Techniqs. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            AES-256-GCM &middot; Client-side encryption
          </p>
        </div>
      </footer>
    </div>
  );
}
