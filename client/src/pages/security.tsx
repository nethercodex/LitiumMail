import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Shield, Lock, Key, Phone, ArrowLeft, Eye, EyeOff, AlertTriangle, CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import type { UserSession } from "@shared/schema";

export default function Security() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load user sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<UserSession[]>({
    queryKey: ["/api/sessions"],
    enabled: !!user,
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("POST", "/api/auth/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Пароль изменен",
        description: "Ваш пароль успешно обновлен",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить пароль",
        variant: "destructive",
      });
    },
  });

  // Session management mutation
  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest("DELETE", `/api/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Сессия завершена",
        description: "Сессия успешно завершена",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось завершить сессию",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Новые пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Ошибка",
        description: "Пароль должен содержать минимум 8 символов",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Не авторизован",
        description: "Вы не авторизованы. Перенаправляем на страницу входа...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-[#b9ff6a]/20 animate-pulse">
            <Shield className="text-black h-8 w-8" />
          </div>
          <p className="text-gray-400 text-lg">Загрузка настроек безопасности...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800/60 bg-black/40 backdrop-blur-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-[#b9ff6a]/10 hover:text-[#b9ff6a] transition-colors"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                <Mail className="text-black h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] bg-clip-text text-transparent">LITIUM.SPACE</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-[#b9ff6a]" />
            <h1 className="text-xl font-semibold text-white">Безопасность</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Смена пароля */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-gray-800/60 backdrop-blur-lg shadow-xl shadow-black/20">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-white text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                    <Lock className="w-5 h-5 text-black" />
                  </div>
                  <span>Смена пароля</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="currentPassword" className="text-gray-200 text-sm font-medium">Текущий пароль</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Введите текущий пароль"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-gray-900/60 border border-gray-700/60 text-white placeholder:text-gray-400 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 pr-12 h-12 backdrop-blur-sm transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-[#b9ff6a]/10 hover:text-[#b9ff6a] transition-colors"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="newPassword" className="text-gray-200 text-sm font-medium">Новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Создайте новый пароль"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-900/60 border border-gray-700/60 text-white placeholder:text-gray-400 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 pr-12 h-12 backdrop-blur-sm transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-[#b9ff6a]/10 hover:text-[#b9ff6a] transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-gray-200 text-sm font-medium">Подтвердите новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Повторите новый пароль"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-900/60 border border-gray-700/60 text-white placeholder:text-gray-400 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 pr-12 h-12 backdrop-blur-sm transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-[#b9ff6a]/10 hover:text-[#b9ff6a] transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-[#b9ff6a]/10 to-[#a8e659]/10 border border-[#b9ff6a]/20 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-[#b9ff6a]" />
                    <p className="text-sm text-[#b9ff6a] font-medium">Требования к паролю:</p>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-1.5">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#b9ff6a] rounded-full"></div>
                      <span>Минимум 8 символов</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#b9ff6a] rounded-full"></div>
                      <span>Содержит заглавные и строчные буквы</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#b9ff6a] rounded-full"></div>
                      <span>Содержит цифры</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#b9ff6a] rounded-full"></div>
                      <span>Содержит специальные символы</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] text-black hover:from-[#a8e659] hover:to-[#97d548] font-semibold h-12 rounded-xl shadow-lg shadow-[#b9ff6a]/20 transition-all duration-200 disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? "Обновление..." : "Обновить пароль"}
                </Button>
              </CardContent>
            </Card>

            {/* Привязка номера телефона */}
            <Card className="bg-black/40 border-gray-800/60 backdrop-blur-lg shadow-xl shadow-black/20 mt-8">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-white text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                    <Phone className="w-5 h-5 text-black" />
                  </div>
                  <span>Номер телефона</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl backdrop-blur-sm">
                  <div>
                    <p className="text-white font-medium">Привязка номера телефона</p>
                    <p className="text-sm text-gray-300">Добавьте номер для восстановления доступа</p>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/40 px-3 py-1">
                    Не привязан
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-gray-200 text-sm font-medium">Номер телефона</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (900) 123-45-67"
                    className="bg-gray-900/60 border border-gray-700/60 text-white placeholder:text-gray-400 focus:border-[#b9ff6a] focus:ring-2 focus:ring-[#b9ff6a]/20 h-12 backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] text-black hover:from-[#a8e659] hover:to-[#97d548] font-semibold h-12 rounded-xl shadow-lg shadow-[#b9ff6a]/20 transition-all duration-200">
                  Привязать номер
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Статус безопасности */}
          <div>
            <Card className="bg-black/40 border-gray-800/60 backdrop-blur-lg shadow-xl shadow-black/20">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-white text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                    <Key className="w-5 h-5 text-black" />
                  </div>
                  <span>Статус безопасности</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white font-medium">Пароль</span>
                    </div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/40 px-3 py-1">
                      Установлен
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white font-medium">Email</span>
                    </div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/40 px-3 py-1">
                      Подтвержден
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-sm text-white font-medium">Телефон</span>
                    </div>
                    <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/40 px-3 py-1">
                      Не привязан
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-sm text-white font-medium">2FA</span>
                    </div>
                    <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/40 px-3 py-1">
                      Отключена
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-300" />
                    <p className="text-sm text-orange-300 font-medium">Рекомендации:</p>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-1.5">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
                      <span>Привяжите номер телефона</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
                      <span>Включите двухфакторную аутентификацию</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
                      <span>Регулярно меняйте пароль</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Сессии */}
            <Card className="bg-black/40 border-gray-800/60 backdrop-blur-lg shadow-xl shadow-black/20 mt-8">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-white text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] rounded-lg flex items-center justify-center shadow-lg shadow-[#b9ff6a]/20">
                    <Shield className="w-5 h-5 text-black" />
                  </div>
                  <span>Активные сессии</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {sessionsLoading ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/60 backdrop-blur-sm animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session: any, index: number) => (
                      <div key={session.id} className="p-4 bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/60 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${session.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-sm font-medium text-white">
                              {session.deviceInfo || 'Неизвестное устройство'}
                              {index === 0 && ' (Текущая сессия)'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`px-3 py-1 ${
                              session.isActive 
                                ? 'bg-green-500/20 text-green-300 border-green-500/40'
                                : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
                            }`}>
                              {session.isActive ? 'Активна' : 'Неактивна'}
                            </Badge>
                            {index !== 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => terminateSessionMutation.mutate(session.id)}
                                disabled={terminateSessionMutation.isPending}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-300">
                            {session.deviceInfo || 'Неизвестный браузер'} • {session.location || 'Неизвестное местоположение'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Последняя активность: {new Date(session.lastActivity || session.createdAt).toLocaleString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Активных сессий не найдено</p>
                  </div>
                )}

                {sessions.length > 1 && (
                  <Button 
                    variant="outline" 
                    className="w-full border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200 h-12 rounded-xl transition-all duration-200"
                    onClick={() => {
                      sessions.slice(1).forEach((session: any) => {
                        terminateSessionMutation.mutate(session.id);
                      });
                    }}
                    disabled={terminateSessionMutation.isPending}
                  >
                    {terminateSessionMutation.isPending ? 'Завершение...' : 'Завершить все остальные сессии'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}