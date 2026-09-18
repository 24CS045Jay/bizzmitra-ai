import { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import {
  getCurrentLanguage,
  setLanguage,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSelectorProps {
  variant?: "icon" | "button" | "compact";
  className?: string;
}

export function LanguageSelector({ variant = "button", className = "" }: LanguageSelectorProps) {
  const [current, setCurrent] = useState<SupportedLanguage>("en");

  useEffect(() => {
    setCurrent(getCurrentLanguage());
    const handler = (e: Event) => {
      const custom = e as CustomEvent<SupportedLanguage>;
      if (custom.detail) setCurrent(custom.detail);
    };
    window.addEventListener("bizzmitra:lang-changed", handler);
    return () => window.removeEventListener("bizzmitra:lang-changed", handler);
  }, []);

  const activeOption = SUPPORTED_LANGUAGES.find((l) => l.code === current) || SUPPORTED_LANGUAGES[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <button
            type="button"
            className={`grid size-9 place-items-center rounded-lg border border-border/60 bg-surface/80 text-foreground transition-colors hover:bg-muted active:scale-95 ${className}`}
            title={`Language: ${activeOption.name} (${activeOption.nativeName})`}
          >
            <Globe className="size-4 text-muted-foreground" />
          </button>
        ) : variant === "compact" ? (
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface/80 px-2 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95 ${className}`}
          >
            <span>{activeOption.flag}</span>
            <span className="text-[11px] font-semibold">{activeOption.code.toUpperCase()}</span>
          </button>
        ) : (
          <button
            type="button"
            className={`flex items-center gap-2 rounded-xl border border-border/80 bg-surface/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-muted active:scale-95 shadow-xs ${className}`}
          >
            <span>{activeOption.flag}</span>
            <span>{activeOption.nativeName}</span>
            <Globe className="ml-0.5 size-3.5 text-muted-foreground" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1.5 shadow-xl">
        <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Select Language / भाषा
        </div>
        {SUPPORTED_LANGUAGES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={() => setLanguage(item.code)}
            className="flex items-center justify-between gap-2 px-2.5 py-2 text-xs font-medium cursor-pointer rounded-lg hover:bg-primary/10"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{item.flag}</span>
              <span className="font-semibold text-foreground">{item.nativeName}</span>
              <span className="text-[10px] text-muted-foreground">({item.name})</span>
            </div>
            {item.code === current && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
