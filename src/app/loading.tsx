import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-30 h-30  flex items-center justify-center ">
        <Image src={"/logoType.png"} alt="logo" width={150} height={150}/>
      </div>

      <div className="flex items-center gap-1">
        <p className="text-gray-600 text-base font-normal">Processando</p>
        <span className="flex gap-1">
          <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
          <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </span>
      </div>
    </div>
  );
}