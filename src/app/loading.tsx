export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="flex items-center gap-2">
        <p className="text-gray-700 text-lg font-medium">Processando</p>
        <span className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </span>
      </div>
    </div>
  );
}