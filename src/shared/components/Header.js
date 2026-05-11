"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import PropTypes from "prop-types";
import ProviderIcon from "@/shared/components/ProviderIcon";
import { useHeaderSearchStore } from "@/store/headerSearchStore";
import { OAUTH_PROVIDERS, APIKEY_PROVIDERS } from "@/shared/constants/config";
import { MEDIA_PROVIDER_KINDS, AI_PROVIDERS } from "@/shared/constants/providers";

const PAGE_MAP = {
  overview:          { title: "Dashboard",       icon: "dashboard"      },
  endpoint:          { title: "Endpoint",        icon: "api"            },
  providers:         { title: "Providers",       icon: "dns"            },
  combos:            { title: "Combos",          icon: "layers"         },
  models:            { title: "Models",          icon: "smart_toy"      },
  usage:             { title: "Usage",           icon: "bar_chart"      },
  quota:             { title: "Quota",           icon: "data_usage"     },
  pricing:           { title: "Pricing",         icon: "payments"       },
  "proxy-pools":     { title: "Proxy Pools",     icon: "lan"            },
  profile:           { title: "Settings",        icon: "settings"       },
  translator:        { title: "Translator",      icon: "translate"      },
  "console-log":     { title: "Console Log",     icon: "monitor"        },
  "auth-files":      { title: "Auth Files",      icon: "vpn_key"        },
  "basic-chat":      { title: "Chat",            icon: "chat"           },
  "media-providers": { title: "Media Providers", icon: "perm_media"     },
  embedding:         { title: "Embeddings",      icon: "data_array"     },
  image:             { title: "Image",           icon: "image"          },
  tts:               { title: "Text to Speech",  icon: "volume_up"      },
  stt:               { title: "Transcription",   icon: "mic"            },
  web:               { title: "Web Search",      icon: "travel_explore" },
};

function getPageInfo(pathname) {
  if (!pathname) return { title: "", icon: "", breadcrumbs: [] };

  const parts = pathname.split("/").filter(Boolean);
  // e.g. ["dashboard", "providers", "claude"]

  // ── Media provider detail: /dashboard/media-providers/tts/elevenlabs ──
  const mediaDetailMatch = pathname.match(/\/media-providers\/([^/]+)\/([^/]+)$/);
  if (mediaDetailMatch) {
    const kindId = mediaDetailMatch[1];
    const providerId = mediaDetailMatch[2];
    const kindConfig = MEDIA_PROVIDER_KINDS.find((k) => k.id === kindId);
    const provider = AI_PROVIDERS[providerId];
    return {
      title: provider?.name || providerId,
      icon: "",
      breadcrumbs: [
        { label: kindConfig?.label || kindId, href: `/dashboard/media-providers/${kindId}` },
        { label: provider?.name || providerId, image: `/providers/${providerId}.png` },
      ],
    };
  }

  // ── Media provider kind: /dashboard/media-providers/tts ──
  const mediaKindMatch = pathname.match(/\/media-providers\/([^/]+)$/);
  if (mediaKindMatch) {
    const kindId = mediaKindMatch[1];
    const kindConfig = MEDIA_PROVIDER_KINDS.find((k) => k.id === kindId);
    return {
      title: kindConfig?.label || kindId,
      icon: kindConfig?.icon || "perm_media",
      breadcrumbs: [],
    };
  }

  // ── Provider detail: /dashboard/providers/claude ──
  const providerDetailMatch = pathname.match(/\/providers\/([^/]+)$/);
  if (providerDetailMatch) {
    const providerId = providerDetailMatch[1];
    const providerInfo = OAUTH_PROVIDERS[providerId] || APIKEY_PROVIDERS[providerId];
    if (providerInfo) {
      return {
        title: providerInfo.name,
        icon: "",
        breadcrumbs: [
          { label: "Providers", href: "/dashboard/providers" },
          { label: providerInfo.name, image: `/providers/${providerInfo.id}.png` },
        ],
      };
    }
    // Custom node (UUID-like or known prefix)
    if (/^[0-9a-f-]{8,}|^(openai-compatible|anthropic-compatible)/.test(providerId)) {
      return {
        title: providerId,
        icon: "",
        breadcrumbs: [
          { label: "Providers", href: "/dashboard/providers" },
          { label: providerId },
        ],
      };
    }
  }

  // ── Standard pages ──
  // Find the deepest matching segment
  for (let i = parts.length - 1; i >= 0; i--) {
    const seg = parts[i];
    if (PAGE_MAP[seg]) {
      return { ...PAGE_MAP[seg], breadcrumbs: [] };
    }
  }

  // Fallback for /dashboard root
  if (pathname === "/dashboard") {
    return { title: "Dashboard", icon: "dashboard", breadcrumbs: [] };
  }

  return { title: "", icon: "", breadcrumbs: [] };
}

export default function Header({ onMenuClick, showMenuButton = true }) {
  const pathname = usePathname();
  const router = useRouter();
  const { title, icon, breadcrumbs } = useMemo(() => getPageInfo(pathname || ""), [pathname]);

  // Show back button on sub-pages (provider detail, media detail, etc.)
  const showBack = breadcrumbs.length > 0;

  return (
    <header
      className="shrink-0 flex items-center gap-3 px-5 lg:px-6 h-[64px] z-20 relative"
      style={{
        background: "rgba(8,10,14,0.92)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Mobile menu button */}
      {showMenuButton && (
        <button
          onClick={onMenuClick}
          className="flex lg:hidden items-center justify-center size-8 rounded-[8px] transition-all duration-150 shrink-0"
          style={{ color: "rgba(255,255,255,0.38)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.background = "transparent"; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>menu</span>
        </button>
      )}

      {/* Back button */}
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center size-8 rounded-[8px] transition-all duration-150 shrink-0"
          style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 0, 'wght' 300" }}>arrow_back</span>
        </button>
      )}

      {/* Title / breadcrumbs */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {breadcrumbs.length > 0 ? (
          /* Breadcrumb mode */
          <div className="flex items-center gap-1.5 min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && (
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: 12, color: "rgba(255,255,255,0.15)" }}>
                    chevron_right
                  </span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="transition-colors shrink-0"
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#2cb3d8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    {crumb.image && (
                      <ProviderIcon
                        src={crumb.image}
                        alt={crumb.label}
                        size={18}
                        className="object-contain rounded shrink-0"
                        fallbackText={crumb.label.slice(0, 2).toUpperCase()}
                      />
                    )}
                    <span
                      className="font-semibold text-white tracking-tight truncate"
                      style={{ fontSize: 15 }}
                    >
                      {crumb.label}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : title ? (
          /* Simple title mode */
          <div className="flex items-center gap-2">
            {icon && (
              <span
                className="material-symbols-outlined shrink-0"
                style={{ fontSize: 16, color: "rgba(255,255,255,0.2)", fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                {icon}
              </span>
            )}
            <h1
              className="font-semibold text-white tracking-tight truncate"
              style={{ fontSize: 15 }}
            >
              {title}
            </h1>
          </div>
        ) : null}
      </div>

      {/* Search */}
      <HeaderSearch />
    </header>
  );
}

function HeaderSearch() {
  const visible = useHeaderSearchStore((s) => s.visible);
  const query = useHeaderSearchStore((s) => s.query);
  const placeholder = useHeaderSearchStore((s) => s.placeholder);
  const setQuery = useHeaderSearchStore((s) => s.setQuery);

  if (!visible) return null;

  return (
    <div className="relative w-[160px] sm:w-[210px]">
      <span
        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}
      >
        search
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[34px] pl-8 pr-6 rounded-[9px] text-white outline-none transition-all duration-150"
        style={{
          fontSize: 13,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        onFocus={(e) => {
          e.target.style.border = "1px solid rgba(11,124,143,0.4)";
          e.target.style.background = "rgba(255,255,255,0.06)";
          e.target.style.boxShadow = "0 0 0 3px rgba(11,124,143,0.08)";
        }}
        onBlur={(e) => {
          e.target.style.border = "1px solid rgba(255,255,255,0.06)";
          e.target.style.background = "rgba(255,255,255,0.04)";
          e.target.style.boxShadow = "none";
        }}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "rgba(255,255,255,0.22)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.22)"; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
        </button>
      )}
    </div>
  );
}

Header.propTypes = {
  onMenuClick: PropTypes.func,
  showMenuButton: PropTypes.bool,
};
