export default function Loader({ loading, fullScreen }) {
  if (!loading) return null;

  const LoaderSVG = () => (
    <div className="animate-spin rounded-full border-t-2 border-b-2 border-blue-500 h-12 w-12"></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/80 p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <LoaderSVG />
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <LoaderSVG />
    </div>
  );
}
