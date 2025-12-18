import QRCodeGenerator from "@/app/components/QRCodeGenerator";
import LinkShortener from "@/app/components/LinkShortener";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-2">
          QR Gen
        </h1>
        <p className="text-gray-600">Personal utilities for links and codes.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl">
        {/* Tool 1 */}
        <QRCodeGenerator />

        {/* Tool 2 */}
        <LinkShortener />
      </div>
      <div className="mt-8">
        <p className="text-gray-600">
          Generate and manage your QR codes easily.
        </p>
        <p className="text-gray-600">
          Shorten your links with ease and efficiency.
        </p>
      </div>
    </main>
  );
}
