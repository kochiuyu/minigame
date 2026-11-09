import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type ClassJoinQrProps = {
  defaultOpen: boolean;
};

export function ClassJoinQr({ defaultOpen }: ClassJoinQrProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copyMessage, setCopyMessage] = useState('');
  const joinUrl = new URL('?join=live', window.location.href).toString();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyMessage('Join link copied.');
    } catch {
      setCopyMessage('Copy the link shown above.');
    }
  };

  return <>
    <details open={defaultOpen} className="rounded-xl border border-blue-700 bg-blue-950/30 p-4">
      <summary className="cursor-pointer font-bold text-blue-100">Student join QR code</summary>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="shrink-0 rounded-lg bg-white p-2">
          <QRCodeSVG value={joinUrl} size={176} level="M" marginSize={4} title="Scan to open the Live Class join page" />
        </div>
        <div className="min-w-0 space-y-3 text-center sm:text-left">
          <p className="font-semibold">Students scan, choose an alias, then tap Join as student.</p>
          <a href={joinUrl} className="block break-all text-sm text-blue-200 underline underline-offset-2">{joinUrl}</a>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <button type="button" onClick={() => dialogRef.current?.showModal()} className="rounded-lg bg-blue-600 px-3 py-2 font-bold text-white hover:bg-blue-500">Display large QR</button>
            <button type="button" onClick={copyLink} className="rounded-lg border border-blue-400 px-3 py-2 font-semibold text-blue-100 hover:bg-blue-900">Copy join link</button>
          </div>
          {copyMessage && <p role="status" className="text-sm text-slate-200">{copyMessage}</p>}
        </div>
      </div>
    </details>
    <dialog ref={dialogRef} aria-label="Student join QR code" className="m-auto max-h-[95vh] w-[min(95vw,36rem)] overflow-y-auto rounded-2xl bg-slate-900 p-6 text-center text-white shadow-2xl backdrop:bg-slate-950/85">
      <h2 className="text-2xl font-black">Join Live Class</h2>
      <p className="mt-2 text-slate-300">Scan with your phone, choose an alias, and join.</p>
      <div className="mx-auto mt-5 w-fit max-w-full rounded-xl bg-white p-3">
        <QRCodeSVG value={joinUrl} size={400} level="M" marginSize={4} title="Scan to open the Live Class join page" className="h-auto max-w-full" />
      </div>
      <p className="mt-4 break-all text-sm text-blue-200">{joinUrl}</p>
      <button type="button" onClick={() => dialogRef.current?.close()} className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500">Close QR</button>
    </dialog>
  </>;
}
