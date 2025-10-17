export default function JuegoPage() {
  return (
    <div className="min-h-screen bg-black">
      <iframe
        src="game/index.html"
        title="Mexsana Endless Runner"
        className="h-screen w-full border-0"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
