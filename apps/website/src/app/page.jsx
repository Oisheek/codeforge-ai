export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          CodeForge AI
        </h1>
        <p className="text-xl text-slate-400 mb-8">
          The autonomous software engineering agent that works like Claude Code.
        </p>
        <button className="px-8 py-3 bg-forge-600 hover:bg-forge-700 text-white font-semibold rounded-lg transition-colors">
          Download for Windows
        </button>
      </div>
    </main>
  );
}