import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Mail, User, Package, CheckCircle, XCircle, Settings, Edit, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { format, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import { getPlanDisplayName } from "@shared/plans";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AvatarUploadModal from "@/components/avatar-upload-modal";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Неавторизован",
        description: "Вы вышли из системы. Выполняется вход...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Real-time user data fetching
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    refetchInterval: 1000, // Обновляем каждую секунду
    enabled: isAuthenticated
  });

  const changePlanMutation = useMutation({
    mutationFn: async (newPlan: string) => {
      await apiRequest(`/api/users/${user?.id}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ plan: newPlan }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Тарифный план изменен",
        description: "Ваш тарифный план успешно обновлен",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить тарифный план",
        variant: "destructive",
      });
    }
  });

  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-[#b9ff6a] text-lg">Загрузка профиля...</div>
      </div>
    );
  }

  if (!user || !profileData) {
    return null;
  }

  // Generate initials for avatar
  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  const userInitials = getInitials(profileData?.firstName, profileData?.lastName, profileData?.username);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Back Button */}
      <div className="relative z-10 p-6">
        <Button
          variant="outline"
          size="sm"
          className="border-[#b9ff6a]/30 text-white hover:bg-[#b9ff6a]/10 hover:border-[#b9ff6a]/50"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
      </div>

      {/* Hero Section with Avatar */}
      <div className="relative bg-gradient-to-r from-black/50 via-gray-900/30 to-black/50 backdrop-blur-sm border-b border-[#b9ff6a]/20 -mt-20 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#b9ff6a]/5 via-transparent to-[#b9ff6a]/5"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#b9ff6a]/20 to-[#b9ff6a]/5 rounded-full blur-xl"></div>
              <Avatar className="relative w-36 h-36 border-4 border-[#b9ff6a] shadow-2xl shadow-[#b9ff6a]/25">
                <AvatarImage src={profileData?.profileImageUrl || ''} alt={profileData?.username} />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-[#b9ff6a] to-[#a8e659] text-black">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] text-black hover:from-[#a8e659] hover:to-[#96d147] w-12 h-12 p-0 shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => setIsAvatarModalOpen(true)}
              >
                <Edit className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left space-y-4">
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-2">
                  {profileData?.firstName && profileData?.lastName 
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : profileData?.username
                  }
                </h1>
                <p className="text-2xl text-[#b9ff6a] font-mono font-semibold">@{profileData?.username}</p>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Badge variant="secondary" className="bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] text-black font-semibold px-4 py-2 text-sm">
                  {getPlanDisplayName(profileData?.plan || 'basic')}
                </Badge>
                <Badge 
                  variant={profileData?.isActive ? "default" : "destructive"} 
                  className={`px-4 py-2 text-sm font-semibold ${profileData?.isActive 
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' 
                    : 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                  }`}
                >
                  {profileData?.isActive ? (
                    <><CheckCircle className="h-4 w-4 mr-2" /> Активен</>
                  ) : (
                    <><XCircle className="h-4 w-4 mr-2" /> Неактивен</>
                  )}
                </Badge>
              </div>

              <div className="text-gray-300 space-y-2">
                <p className="flex items-center gap-3 justify-center md:justify-start text-lg">
                  <Mail className="h-5 w-5 text-[#b9ff6a]" />
                  <span className="font-mono text-[#b9ff6a]">{profileData?.username}@litium.space</span>
                </p>
                {profileData?.createdAt && (
                  <p className="flex items-center gap-3 justify-center md:justify-start">
                    <CalendarDays className="h-5 w-5 text-[#b9ff6a]" />
                    С нами с {format(new Date(profileData.createdAt), 'MMMM yyyy', { locale: ru })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border border-[#b9ff6a]/20 backdrop-blur-sm shadow-xl shadow-black/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-[#b9ff6a] flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#b9ff6a]/20 to-[#b9ff6a]/10">
                    <User className="h-6 w-6" />
                  </div>
                  Личная информация
                </CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Основные данные вашего аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-black/40 to-gray-900/40 border border-gray-700/50">
                      <label className="text-sm font-medium text-[#b9ff6a]">Имя</label>
                      <div className="text-white font-medium text-lg mt-1">{profileData?.firstName || 'Не указано'}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-black/40 to-gray-900/40 border border-gray-700/50">
                      <label className="text-sm font-medium text-[#b9ff6a]">Фамилия</label>
                      <div className="text-white font-medium text-lg mt-1">{profileData?.lastName || 'Не указано'}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-black/40 to-gray-900/40 border border-gray-700/50">
                      <label className="text-sm font-medium text-[#b9ff6a]">Имя пользователя</label>
                      <div className="text-white font-mono font-medium text-lg mt-1">{profileData?.username}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-black/40 to-gray-900/40 border border-gray-700/50">
                      <label className="text-sm font-medium text-[#b9ff6a]">Контактный Email</label>
                      <div className="text-white font-medium text-lg mt-1">{profileData?.email}</div>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-gradient-to-r from-transparent via-[#b9ff6a]/30 to-transparent" />
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#b9ff6a]/10 via-[#b9ff6a]/5 to-transparent border border-[#b9ff6a]/30">
                  <label className="text-sm font-medium text-[#b9ff6a]">LITIUM Email адрес</label>
                  <div className="text-[#b9ff6a] font-mono font-bold text-xl mt-2">
                    {profileData?.username}@litium.space
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="bg-gradient-to-r from-[#b9ff6a] to-[#a8e659] text-black hover:from-[#a8e659] hover:to-[#96d147] font-semibold px-6 py-3 shadow-lg transition-all duration-200 hover:scale-105">
                    <Settings className="h-5 w-5 mr-2" />
                    Редактировать профиль
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border border-[#b9ff6a]/20 backdrop-blur-sm shadow-xl shadow-black/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-[#b9ff6a] flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#b9ff6a]/20 to-[#b9ff6a]/10">
                    <Mail className="h-6 w-6" />
                  </div>
                  Статистика использования
                </CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Ваша активность в системе LITIUM.SPACE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 via-gray-900/40 to-black/50 border border-gray-700/50 hover:border-[#b9ff6a]/30 transition-all duration-200">
                    <div className="text-4xl font-bold text-[#b9ff6a] mb-2">0</div>
                    <div className="text-sm text-gray-300 font-medium">Отправлено писем</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 via-gray-900/40 to-black/50 border border-gray-700/50 hover:border-[#b9ff6a]/30 transition-all duration-200">
                    <div className="text-4xl font-bold text-[#b9ff6a] mb-2">0</div>
                    <div className="text-sm text-gray-300 font-medium">Получено писем</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 via-gray-900/40 to-black/50 border border-gray-700/50 hover:border-[#b9ff6a]/30 transition-all duration-200">
                    <div className="text-4xl font-bold text-[#b9ff6a] mb-2">100%</div>
                    <div className="text-sm text-gray-300 font-medium">Время работы</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Information - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border border-[#b9ff6a]/20 backdrop-blur-sm shadow-xl shadow-black/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-[#b9ff6a] flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#b9ff6a]/20 to-[#b9ff6a]/10">
                    <Package className="h-6 w-6" />
                  </div>
                  Подписка
                </CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Информация о тарифном плане
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-[#b9ff6a]/10 via-[#b9ff6a]/5 to-transparent border border-[#b9ff6a]/30">
                  <div className="text-2xl font-bold text-[#b9ff6a] mb-2">
                    {getPlanDisplayName(profileData?.plan || 'basic')}
                  </div>
                  <div className="text-sm text-gray-300 font-medium">Текущий план</div>
                </div>
                
                {/* Plan Details */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-black/40 to-gray-900/40 border border-gray-700/50">
                    <div className="text-[#b9ff6a] font-medium text-sm mb-2">Статус подписки:</div>
                    <div className="flex items-center gap-2">
                      {profileData?.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-500 font-semibold">Активна</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-500 font-semibold">Неактивна</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-black/40 to-gray-900/40 border border-gray-700/50">
                    <div className="text-[#b9ff6a] font-medium text-sm mb-2">Возможности плана:</div>
                    <div className="space-y-2 text-sm text-gray-300">
                      {profileData?.plan === 'basic' && (
                        <>
                          <div>• До 100 писем в месяц</div>
                          <div>• 1 GB хранилища</div>
                          <div>• Базовая поддержка</div>
                        </>
                      )}
                      {profileData?.plan === 'pro' && (
                        <>
                          <div>• До 1000 писем в месяц</div>
                          <div>• 10 GB хранилища</div>
                          <div>• Приоритетная поддержка</div>
                          <div>• Расширенная аналитика</div>
                        </>
                      )}
                      {profileData?.plan === 'enterprise' && (
                        <>
                          <div>• Неограниченные письма</div>
                          <div>• 100 GB хранилища</div>
                          <div>• VIP поддержка 24/7</div>
                          <div>• Полная аналитика</div>
                          <div>• API доступ</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-[#b9ff6a]/30 to-transparent" />

                <div className="text-center text-sm">
                  {profileData?.createdAt && isValid(new Date(profileData.createdAt)) && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-black/40 to-gray-900/40 border border-gray-700/50">
                      <div className="text-[#b9ff6a] font-medium">Дата регистрации:</div>
                      <div className="text-white font-semibold mt-1">
                        {format(new Date(profileData.createdAt), 'dd MMMM yyyy', { locale: ru })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={profileData?.profileImageUrl}
        userInitials={userInitials}
      />
    </div>
  );
}