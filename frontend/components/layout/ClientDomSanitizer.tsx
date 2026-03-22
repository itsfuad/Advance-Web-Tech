"use client";

import { useEffect } from "react";

export default function ClientDomSanitizer() {
  useEffect(() => {
    const strip = (root: ParentNode) => {
      const nodes = root.querySelectorAll?.("[bis_skin_checked]");
      if (!nodes) return;
      nodes.forEach((node) => node.removeAttribute("bis_skin_checked"));
    };

    strip(document);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const el = node as Element;
            if (el.hasAttribute("bis_skin_checked")) {
              el.removeAttribute("bis_skin_checked");
            }
            strip(el);
          }
        });
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
