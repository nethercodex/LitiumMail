import { Link } from "wouter";
import { Mail, Home, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Animated mail icon */}
        <div className="relative flex justify-center mb-8">
          <div className="relative">
            <Mail className="w-24 h-24 text-[#b9ff6a] animate-bounce" />
            <AlertTriangle className="w-8 h-8 text-red-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
        </div>

        {/* 404 with glow effect */}
        <div className="relative">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b9ff6a] to-green-400 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-[#b9ff6a] opacity-20 blur-lg">
            404
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Страница не найдена
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            Запрашиваемая страница может быть удалена, перемещена или временно недоступна в системе LITIUM.SPACE
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-medium text-[#b9ff6a] mb-4">Возможные решения:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#b9ff6a] rounded-full"></div>
              <span>Проверьте правильность URL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#b9ff6a] rounded-full"></div>
              <span>Вернитесь на главную страницу</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#b9ff6a] rounded-full"></div>
              <span>Проверьте подключение к интернету</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#b9ff6a] rounded-full"></div>
              <span>Обратитесь к администратору</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/">
            <Button className="bg-[#b9ff6a] hover:bg-[#a3e85a] text-black font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Главная страница
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-gray-700 text-gray-300 hover:text-white hover:border-[#b9ff6a] hover:bg-[#b9ff6a]/10 px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
        </div>

        {/* Footer info */}
        <div className="pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            LITIUM.SPACE - Надежная почтовая система
          </p>
        </div>
      </div>
    </div>
  );
}
