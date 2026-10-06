"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        if (typeof IntersectionObserver === "undefined") {
            const id = window.setTimeout(() => setVisible(true), 0);
            return () => window.clearTimeout(id);
        }
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.12 },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}>
            {children}
        </div>
    );
}
