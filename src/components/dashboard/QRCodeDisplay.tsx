import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { cn } from "@/lib/utils";

type QRCodeDisplayProps = {
  className?: string;
  value: string;
};

export function QRCodeDisplay({ className, value }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function generate() {
      try {
        const next = await QRCode.toDataURL(value, {
          errorCorrectionLevel: "M",
          margin: 1,
          scale: 8,
          width: 256
        });

        if (active) {
          setDataUrl(next);
        }
      } catch {
        if (active) {
          setDataUrl("");
        }
      }
    }

    void generate();

    return () => {
      active = false;
    };
  }, [value]);

  return dataUrl ? (
    <div className={cn("rounded-xl bg-white p-3 shadow-line", className)}>
      <img src={dataUrl} alt="Visitor pass QR code" className="aspect-square w-full rounded-lg object-contain" />
    </div>
  ) : (
    <div className={cn("grid aspect-square w-full place-items-center rounded-xl bg-slate-100 p-3 text-xs text-slate-500 shadow-line", className)}>
      Generating QR...
    </div>
  );
}
