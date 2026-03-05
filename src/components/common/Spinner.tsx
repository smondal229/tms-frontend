export default function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-600 animate-spin"></div>
      </div>
    </div>
  );
}
