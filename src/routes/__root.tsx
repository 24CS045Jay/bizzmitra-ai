import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { PageTransition } from "@/components/motion/primitives";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentLanguage, triggerGoogleTranslate } from "@/lib/i18n";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BizzMitra-AI — Business problem to blueprint" },
      {
        name: "description",
        content:
          "BizzMitra-AI turns a business problem into an implementation-ready blueprint in one AI-guided workspace.",
      },
      { property: "og:title", content: "BizzMitra-AI" },
      {
        property: "og:description",
        content: "From business problem to implementation-ready blueprint, in one AI-guided workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter+Tight:ital,wght@0,300..700;1,400&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try{
                var t=localStorage.getItem("bizzmitra-theme");
                if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){
                  document.documentElement.classList.add("dark");
                }else{
                  document.documentElement.classList.remove("dark");
                }
              }catch(e){}

              try{
                var l=localStorage.getItem("bizzmitra.language");
                if(l){
                  document.documentElement.setAttribute("lang", l);
                  if(l==="ar") document.documentElement.setAttribute("dir", "rtl");
                  if(l!=="en"){
                    var h=window.location.hostname;
                    document.cookie="googtrans=/en/"+l+"; path=/;";
                    document.cookie="googtrans=/en/"+l+"; domain="+h+"; path=/;";
                    document.cookie="googtrans=/en/"+l+"; domain=."+h+"; path=/;";
                  }
                }
              }catch(e){}

              if(typeof Node==='function' && Node.prototype){
                var origRemove=Node.prototype.removeChild;
                Node.prototype.removeChild=function(child){
                  if(child.parentNode!==this) return child;
                  return origRemove.apply(this,arguments);
                };
                var origInsert=Node.prototype.insertBefore;
                Node.prototype.insertBefore=function(newNode,refNode){
                  if(refNode && refNode.parentNode!==this) return newNode;
                  return origInsert.apply(this,arguments);
                };
              }
            })();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.googleTranslateElementInit = function() {
              if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,hi,gu,es,fr,de,ja,ar',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            };`,
          }}
        />
        <script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer />
      </head>
      <body>
        <div id="google_translate_element" style={{ display: "none" }} />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const cur = getCurrentLanguage();
    if (cur !== "en") {
      triggerGoogleTranslate(cur);
    }
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <PageTransition key={location}>
            <Outlet />
          </PageTransition>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

