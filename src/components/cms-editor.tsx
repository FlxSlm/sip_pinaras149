"use client";

import { useCallback, useEffect, useState } from "react";

type SiteSection = "hero" | "profil" | "lokasi" | "kontak";
type ListSection = "statistics" | "potentials" | "facilities";

type Statistic = { id?: string; label: string; value: string; unit?: string; source: string; sourceYear?: string };
type Potential = { id?: string; title: string; description: string; sourceNote?: string };
type Facility = { id?: string; name: string; category: string; description?: string; sourceNote?: string };

type Data = {
    hero: Record<string, string>;
    profil: Record<string, string>;
    lokasi: Record<string, string>;
    kontak: Record<string, string>;
    statistics: Statistic[];
    potentials: Potential[];
    facilities: Facility[];
    gallery: Array<{ id: string; storageKey: string; caption: string | null }>;
};

const sections: Array<{ key: SiteSection | ListSection; label: string }> = [
    { key: "hero", label: "Hero" },
    { key: "profil", label: "Profil" },
    { key: "statistics", label: "Statistik" },
    { key: "potentials", label: "Potensi" },
    { key: "facilities", label: "Fasilitas" },
    { key: "lokasi", label: "Lokasi" },
    { key: "kontak", label: "Kontak" },
];

const emptyData: Data = {
    hero: { title: "", subtitle: "", ctaText: "", ctaSecondaryText: "", image: "" },
    profil: { shortDesc: "", longDesc: "" },
    lokasi: { alamat: "", koordinat: "", deskripsi: "" },
    kontak: { alamat: "", telepon: "", whatsapp: "", email: "" },
    statistics: [],
    potentials: [],
    facilities: [],
    gallery: [],
};

function field(value: string | undefined): string {
    return value ?? "";
}

export function CmsEditor() {
    const [data, setData] = useState<Data>(emptyData);
    const [active, setActive] = useState<SiteSection | ListSection>("hero");
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);

    useEffect(() => {
        void fetch("/api/admin/cms")
            .then((response) => response.json())
            .then((result: { siteContent: Array<{ key: string; value: Record<string, unknown> }>; statistics: Statistic[]; potentials: Potential[]; facilities: Facility[]; gallery: Data["gallery"] }) => {
                const content = Object.fromEntries(result.siteContent.map((row) => [row.key, row.value]));
                setData({
                    hero: { ...emptyData.hero, ...(content.hero as Record<string, string> | undefined) },
                    profil: { ...emptyData.profil, ...(content.profil as Record<string, string> | undefined) },
                    lokasi: { ...emptyData.lokasi, ...(content.lokasi as Record<string, string> | undefined) },
                    kontak: { ...emptyData.kontak, ...(content.kontak as Record<string, string> | undefined) },
                    statistics: result.statistics,
                    potentials: result.potentials,
                    facilities: result.facilities,
                    gallery: result.gallery,
                });
            });
    }, []);

    const updateSingle = (section: SiteSection, key: string, value: string) => {
        setData((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
    };

    const saveSingle = async (section: SiteSection) => {
        setPending(true);
        setMessage("");
        const response = await fetch("/api/admin/cms", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section, value: data[section] }),
        });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? (response.ok ? "Tersimpan." : "Gagal menyimpan."));
        setPending(false);
    };

    const saveList = async (section: ListSection) => {
        setPending(true);
        setMessage("");
        const value = section === "statistics" ? data.statistics : section === "potentials" ? data.potentials : data.facilities;
        const response = await fetch("/api/admin/cms", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section, value }),
        });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? (response.ok ? "Tersimpan." : "Gagal menyimpan."));
        setPending(false);
    };

    const updateListItem = useCallback((section: ListSection, index: number, patch: Record<string, string>) => {
        setData((current) => {
            const list = current[section] as Array<Record<string, string>>;
            return { ...current, [section]: list.map((item, i) => (i === index ? { ...item, ...patch } : item)) };
        });
    }, []);

    const addListItem = (section: ListSection) => {
        setData((current) => {
            if (section === "statistics") return { ...current, statistics: [...current.statistics, { label: "", value: "", unit: "", source: "", sourceYear: "" }] };
            if (section === "potentials") return { ...current, potentials: [...current.potentials, { title: "", description: "", sourceNote: "" }] };
            return { ...current, facilities: [...current.facilities, { name: "", category: "", description: "", sourceNote: "" }] };
        });
    };

    const removeListItem = (section: ListSection, index: number) => {
        setData((current) => ({ ...current, [section]: (current[section] as unknown[]).filter((_, i) => i !== index) }));
    };

    const inputClass = "w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]";

    const fields: Record<SiteSection, Array<{ key: string; label: string; textarea?: boolean }>> = {
        hero: [
            { key: "title", label: "Judul hero", textarea: true },
            { key: "subtitle", label: "Subtitle", textarea: true },
            { key: "ctaText", label: "Teks tombol utama" },
            { key: "ctaSecondaryText", label: "Teks tombol kedua" },
            { key: "image", label: "URL gambar hero" },
        ],
        profil: [
            { key: "shortDesc", label: "Deskripsi singkat", textarea: true },
            { key: "longDesc", label: "Deskripsi lengkap", textarea: true },
        ],
        lokasi: [
            { key: "alamat", label: "Alamat" },
            { key: "koordinat", label: "Koordinat" },
            { key: "deskripsi", label: "Deskripsi", textarea: true },
        ],
        kontak: [
            { key: "alamat", label: "Alamat", textarea: true },
            { key: "telepon", label: "Telepon" },
            { key: "whatsapp", label: "WhatsApp" },
            { key: "email", label: "Email" },
        ],
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <nav className="flex gap-1 overflow-x-auto lg:flex-col">
                {sections.map((section) => (
                    <button
                        key={section.key}
                        type="button"
                        onClick={() => setActive(section.key)}
                        className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-semibold ${active === section.key ? "bg-[var(--brand)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-2)]"}`}
                    >
                        {section.label}
                    </button>
                ))}
            </nav>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                {message && <p className="mb-4 text-sm text-[var(--muted)]" role="status">{message}</p>}

                {active === "statistics" || active === "potentials" || active === "facilities" ? (
                    <ListEditor
                        section={active}
                        items={data[active] as Array<Record<string, string>>}
                        inputClass={inputClass}
                        onUpdate={(index, patch) => updateListItem(active, index, patch)}
                        onAdd={() => addListItem(active)}
                        onRemove={(index) => removeListItem(active, index)}
                        onSave={() => saveList(active)}
                        pending={pending}
                    />
                ) : (
                    <div>
                        <div className="space-y-4">
                            {fields[active as SiteSection].map((item) => (
                                <label key={item.key} className="block text-sm font-semibold text-[var(--ink)]">
                                    {item.label}
                                    {item.textarea ? (
                                        <textarea value={data[active as SiteSection][item.key]} onChange={(event) => updateSingle(active as SiteSection, item.key, event.target.value)} rows={3} className={`mt-1.5 ${inputClass}`} />
                                    ) : (
                                        <input value={field(data[active as SiteSection][item.key])} onChange={(event) => updateSingle(active as SiteSection, item.key, event.target.value)} className={`mt-1.5 ${inputClass}`} />
                                    )}
                                </label>
                            ))}
                        </div>
                        <button type="button" disabled={pending} onClick={() => saveSingle(active as SiteSection)} className="mt-6 rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                            {pending ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ListEditor({ section, items, inputClass, onUpdate, onAdd, onRemove, onSave, pending }: { section: ListSection; items: Array<Record<string, string>>; inputClass: string; onUpdate: (index: number, patch: Record<string, string>) => void; onAdd: () => void; onRemove: (index: number) => void; onSave: () => void; pending: boolean }) {
    const columns: Record<ListSection, Array<{ key: string; label: string }>> = {
        statistics: [
            { key: "label", label: "Label" },
            { key: "value", label: "Nilai" },
            { key: "unit", label: "Satuan" },
            { key: "source", label: "Sumber" },
            { key: "sourceYear", label: "Tahun" },
        ],
        potentials: [
            { key: "title", label: "Judul" },
            { key: "description", label: "Deskripsi" },
            { key: "sourceNote", label: "Sumber" },
        ],
        facilities: [
            { key: "name", label: "Nama" },
            { key: "category", label: "Kategori" },
            { key: "description", label: "Deskripsi" },
            { key: "sourceNote", label: "Sumber" },
        ],
    };

    return (
        <div>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="rounded-xl border border-[var(--line)] p-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                            {columns[section].map((column) => (
                                <input
                                    key={column.key}
                                    value={item[column.key] ?? ""}
                                    onChange={(event) => onUpdate(index, { [column.key]: event.target.value })}
                                    placeholder={column.label}
                                    className={inputClass}
                                />
                            ))}
                        </div>
                        <button type="button" onClick={() => onRemove(index)} className="mt-2 text-sm font-semibold text-[var(--danger)]">
                            Hapus
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex gap-3">
                <button type="button" onClick={onAdd} className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-[var(--ink)]">
                    Tambah baris
                </button>
                <button type="button" disabled={pending} onClick={onSave} className="rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    {pending ? "Menyimpan..." : "Simpan"}
                </button>
            </div>
        </div>
    );
}
