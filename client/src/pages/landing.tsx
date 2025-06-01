import { useState } from "react";
import { Mail, Shield, Zap, Smartphone, Lock, Key, Server, EyeOff, ArchiveRestore, Check, Plus, Search, Palette, Inbox, Calendar, Users, Bot, Layers, IdCard, MessageSquareLock, Twitter, Github, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthModal from "@/components/auth-modal";

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-dark/80 backdrop-blur-md border-b border-surface z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mail className="text-dark text-sm" />
              </div>
              <span className="text-xl font-bold text-primary">LITIUM.SPACE</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-text-muted hover:text-white transition-colors duration-200"
              >
                Возможности
              </button>
              <button 
                onClick={() => scrollToSection('security')} 
                className="text-text-muted hover:text-white transition-colors duration-200"
              >
                Безопасность
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-text-muted hover:text-white transition-colors duration-200"
              >
                Тарифы
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-text-muted hover:text-white transition-colors duration-200"
              >
                Контакты
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="hidden sm:flex text-text-muted hover:text-white btn-hover-scale"
                onClick={handleAuthClick}
              >
                Войти
              </Button>
              <Button 
                className="bg-primary text-dark font-medium hover:bg-primary/80 btn-hover-lift glow-primary"
                onClick={handleAuthClick}
              >
                Создать почту
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden text-text-muted hover:text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" style={{backgroundSize: '40px 40px'}}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-surface rounded-full border border-primary/20 mb-6">
              <Shield className="text-primary mr-2 h-4 w-4" />
              <span className="text-sm text-text-muted">Полная конфиденциальность ваших данных</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Почта нового поколения
            <span className="block text-primary">для современного мира</span>
          </h1>
          
          <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
            Безопасная, быстрая и удобная электронная почта с современным интерфейсом. 
            Полный контроль над вашими сообщениями и данными.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-dark font-semibold hover:bg-primary/80 btn-hover-lift glow-primary shadow-lg shadow-primary/25"
              onClick={handleAuthClick}
            >
              <Layers className="mr-2 h-4 w-4" />
              Начать бесплатно
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-4 border-surface-lighter text-white hover:bg-surface btn-hover-scale glow-subtle"
            >
              <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              Посмотреть демо
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-surface/50 backdrop-blur-sm border-surface-lighter card-hover glow-subtle fade-in">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto btn-hover-scale">
                  <Lock className="text-primary h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Шифрование E2E</h3>
                <p className="text-text-muted text-sm">Ваши сообщения защищены end-to-end шифрованием</p>
              </CardContent>
            </Card>
            
            <Card className="bg-surface/50 backdrop-blur-sm border-surface-lighter card-hover glow-subtle fade-in" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto btn-hover-scale">
                  <Zap className="text-primary h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Молниеносная скорость</h3>
                <p className="text-text-muted text-sm">Мгновенная отправка и получение писем</p>
              </CardContent>
            </Card>
            
            <Card className="bg-surface/50 backdrop-blur-sm border-surface-lighter card-hover glow-subtle fade-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto btn-hover-scale">
                  <Smartphone className="text-primary h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Кроссплатформенность</h3>
                <p className="text-text-muted text-sm">Работает на всех устройствах и платформах</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Все необходимое для работы с почтой
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              Полный набор инструментов для эффективного управления электронной почтой
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <Card className="bg-surface border-surface-lighter shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-text-muted">LITIUM.SPACE</span>
                  </div>
                  
                  <div className="bg-dark rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Входящие</h3>
                      <Button size="sm" className="w-8 h-8 bg-primary/10 hover:bg-primary/20 p-0">
                        <Plus className="text-primary h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 bg-surface rounded-lg border-l-4 border-primary">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary text-sm font-semibold">АВ</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Анна Викторова</span>
                            <span className="text-xs text-text-muted">2 мин</span>
                          </div>
                          <p className="text-xs text-text-muted">Новый проект готов к ревью</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-surface/50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 text-sm font-semibold">МК</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Максим Киселев</span>
                            <span className="text-xs text-text-muted">1 час</span>
                          </div>
                          <p className="text-xs text-text-muted">Отчет по встрече с клиентом</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl font-bold mb-6">Интуитивный интерфейс</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Inbox className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Умная сортировка</h4>
                    <p className="text-text-muted">Автоматическая организация писем по категориям и важности</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Мгновенный поиск</h4>
                    <p className="text-text-muted">Находите нужные письма за секунды с продвинутым поиском</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Palette className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Темная тема</h4>
                    <p className="text-text-muted">Современный дизайн, который не напрягает глаза</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-surface border-surface-lighter card-hover glow-subtle group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 btn-hover-scale group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20">
                  <Layers className="text-primary h-8 w-8" />
                </div>
                <h4 className="font-semibold mb-2">Отправка файлов</h4>
                <p className="text-text-muted text-sm">До 25 ГБ вложений в одном письме</p>
                <div className="mt-3 flex items-center justify-center">
                  <div className="w-8 h-1 bg-primary/30 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-surface border-surface-lighter card-hover glow-subtle group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 btn-hover-scale group-hover:bg-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                  <Calendar className="text-blue-400 h-8 w-8" />
                </div>
                <h4 className="font-semibold mb-2">Календарь</h4>
                <p className="text-text-muted text-sm">Интегрированный календарь и планировщик</p>
                <div className="mt-3 flex items-center justify-center">
                  <div className="w-8 h-1 bg-blue-400/30 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-surface border-surface-lighter card-hover glow-subtle group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 btn-hover-scale group-hover:bg-purple-500/20 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                  <Users className="text-purple-400 h-8 w-8" />
                </div>
                <h4 className="font-semibold mb-2">Командная работа</h4>
                <p className="text-text-muted text-sm">Совместное управление почтой в команде</p>
                <div className="mt-3 flex items-center justify-center">
                  <div className="w-8 h-1 bg-purple-400/30 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-surface border-surface-lighter card-hover glow-subtle group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-16 h-16 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 btn-hover-scale group-hover:bg-orange-500/20 group-hover:shadow-lg group-hover:shadow-orange-500/20">
                  <Bot className="text-orange-400 h-8 w-8" />
                </div>
                <h4 className="font-semibold mb-2">ИИ-помощник</h4>
                <p className="text-text-muted text-sm">Умные ответы и автоматизация</p>
                <div className="mt-3 flex items-center justify-center">
                  <div className="w-8 h-1 bg-orange-400/30 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6">
              <Shield className="text-primary mr-2 h-4 w-4" />
              <span className="text-sm text-primary font-medium">Максимальная безопасность</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ваши данные под надежной защитой
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              Используем самые современные технологии шифрования и защиты данных
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 btn-hover-scale group-hover:bg-green-500/20 group-hover:shadow-lg group-hover:shadow-green-500/20">
                    <Key className="text-green-500 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">End-to-End шифрование</h4>
                    <p className="text-text-muted">Только вы и получатель можете прочитать ваши сообщения. Даже мы не имеем доступа к содержимому.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 btn-hover-scale group-hover:bg-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                    <Server className="text-blue-400 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Серверы в России</h4>
                    <p className="text-text-muted">Ваши данные хранятся на защищенных серверах на территории РФ в соответствии с законодательством.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0 btn-hover-scale group-hover:bg-yellow-500/20 group-hover:shadow-lg group-hover:shadow-yellow-500/20">
                    <EyeOff className="text-yellow-500 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Политика Zero Knowledge</h4>
                    <p className="text-text-muted">Мы не можем получить доступ к вашим данным даже при желании - они зашифрованы вашим ключом.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArchiveRestore className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Резервное копирование</h4>
                    <p className="text-text-muted">Автоматическое создание зашифрованных резервных копий для защиты от потери данных.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:pl-8">
              <Card className="bg-surface border-surface-lighter relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
                
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold">Статус безопасности</h4>
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 text-sm rounded-full">
                      <Check className="inline mr-1 h-3 w-3" />
                      Защищено
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Шифрование AES-256</span>
                      <Check className="text-green-500 h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">2FA аутентификация</span>
                      <Check className="text-green-500 h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Антивирусная проверка</span>
                      <Check className="text-green-500 h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Защита от спама</span>
                      <Check className="text-green-500 h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center space-x-3">
                      <IdCard className="text-primary h-5 w-5" />
                      <div>
                        <p className="font-medium text-sm">Сертификат безопасности</p>
                        <p className="text-xs text-text-muted">Проверено независимыми экспертами</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-surface/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6">
              <MessageSquareLock className="text-primary mr-2 h-4 w-4" />
              <span className="text-sm text-primary font-medium">Тарифные планы</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Выберите подходящий тариф
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              Гибкие тарифные планы для любых потребностей
            </p>
            
            <div className="flex items-center justify-center mt-8 space-x-2">
              <div className="flex items-center space-x-2 bg-surface rounded-full p-1 border border-surface-lighter">
                <button className="px-4 py-2 rounded-full bg-primary text-dark text-sm font-medium">
                  Месячная оплата
                </button>
                <button className="px-4 py-2 rounded-full text-text-muted text-sm font-medium hover:text-white">
                  Годовая оплата
                </button>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                -20%
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start mt-8">
            {/* Basic Plan */}
            <Card className="bg-surface border-surface-lighter card-hover glow-subtle group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-8 relative z-10">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-500/10 to-gray-500/5 rounded-2xl flex items-center justify-center mx-auto mb-4 btn-hover-scale shadow-lg">
                    <Mail className="text-gray-400 h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Базовый</h3>
                  <div className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">
                    Бесплатно
                  </div>
                  <p className="text-text-muted text-lg">Для личного использования</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="text-green-500 h-3 w-3" />
                    </div>
                    <span className="text-sm">1 ГБ хранилища</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="text-green-500 h-3 w-3" />
                    </div>
                    <span className="text-sm">1 почтовый адрес</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="text-green-500 h-3 w-3" />
                    </div>
                    <span className="text-sm">Базовая защита от спама</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="text-green-500 h-3 w-3" />
                    </div>
                    <span className="text-sm">Мобильное приложение</span>
                  </li>
                </ul>
                
                <Button 
                  variant="outline" 
                  className="w-full border-surface-lighter hover:bg-surface btn-hover-scale glow-subtle"
                  onClick={handleAuthClick}
                >
                  Начать бесплатно
                </Button>
              </CardContent>
            </Card>
            
            {/* Pro Plan */}
            <div className="relative mt-6">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
                <span className="bg-primary text-dark px-6 py-2 rounded-full text-sm font-bold shadow-xl whitespace-nowrap">
                  🔥 Популярный
                </span>
              </div>
              <Card className="bg-surface border-2 border-primary relative card-hover glow-primary group overflow-visible">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-8 relative z-10 pt-12">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow shadow-xl shadow-primary/30">
                    <Zap className="text-primary h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Профессиональный</h3>
                  <div className="text-4xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">499₽</span>
                    <span className="text-lg font-normal text-text-muted">/мес</span>
                  </div>
                  <p className="text-text-muted text-lg">Для бизнеса и команд</p>
                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs text-primary font-medium">Экономия 960₽ в год</span>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                      <Check className="text-primary h-3 w-3" />
                    </div>
                    <span className="text-sm">25 ГБ хранилища</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                      <Check className="text-primary h-3 w-3" />
                    </div>
                    <span className="text-sm">5 почтовых адресов</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                      <Check className="text-primary h-3 w-3" />
                    </div>
                    <span className="text-sm">Расширенная защита</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                      <Check className="text-primary h-3 w-3" />
                    </div>
                    <span className="text-sm">Календарь и задачи</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                      <Check className="text-primary h-3 w-3" />
                    </div>
                    <span className="text-sm">Приоритетная поддержка</span>
                  </li>
                </ul>
                
                <Button 
                  className="w-full bg-primary text-dark font-semibold hover:bg-primary/80 btn-hover-lift glow-primary shadow-xl shadow-primary/25"
                  onClick={handleAuthClick}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Выбрать план
                </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Enterprise Plan */}
            <Card className="bg-surface border-surface-lighter card-hover glow-subtle group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-8 relative z-10">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-violet-500/5 rounded-2xl flex items-center justify-center mx-auto mb-4 btn-hover-scale shadow-lg">
                    <Server className="text-violet-400 h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Корпоративный</h3>
                  <div className="text-4xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">1499₽</span>
                    <span className="text-lg font-normal text-text-muted">/мес</span>
                  </div>
                  <p className="text-text-muted text-lg">Для больших команд</p>
                  <div className="mt-4 flex items-center justify-center">
                    <span className="text-xs text-violet-400 font-medium bg-violet-400/10 px-3 py-1 rounded-full">
                      Индивидуальные условия
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <Check className="text-violet-400 h-3 w-3" />
                    </div>
                    <span className="text-sm">Безлимитное хранилище</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <Check className="text-violet-400 h-3 w-3" />
                    </div>
                    <span className="text-sm">Безлимитные адреса</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <Check className="text-violet-400 h-3 w-3" />
                    </div>
                    <span className="text-sm">Корпоративная защита</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <Check className="text-violet-400 h-3 w-3" />
                    </div>
                    <span className="text-sm">Административная панель</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <Check className="text-violet-400 h-3 w-3" />
                    </div>
                    <span className="text-sm">24/7 поддержка</span>
                  </li>
                </ul>
                
                <Button 
                  variant="outline" 
                  className="w-full border-surface-lighter hover:bg-surface btn-hover-scale glow-subtle"
                >
                  Связаться с нами
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-gradient-to-br from-primary/10 via-surface to-primary/5 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Готовы попробовать?
              </h2>
              <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
                Создайте свой аккаунт прямо сейчас и получите доступ ко всем возможностям современной почты
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-dark font-semibold hover:bg-primary/80 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-primary/25"
                  onClick={handleAuthClick}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Создать аккаунт
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-4 border-surface-lighter text-white hover:bg-surface"
                >
                  <div className="mr-2 h-4 w-4 flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  Связаться с нами
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-text-muted">
                <div className="flex items-center space-x-2">
                  <Check className="text-green-500 h-4 w-4" />
                  <span>30 дней бесплатно</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="text-green-500 h-4 w-4" />
                  <span>Без обязательств</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="text-green-500 h-4 w-4" />
                  <span>Отмена в любой момент</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-surface border-t border-surface-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Mail className="text-dark h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-primary">LITIUM.SPACE</span>
              </div>
              <p className="text-text-muted mb-6">
                Безопасная почта нового поколения для современного мира
              </p>
              <div className="flex space-x-4">
                <Button size="icon" variant="ghost" className="bg-surface-lighter hover:bg-primary/20">
                  <MessageSquareLock className="text-primary h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="bg-surface-lighter hover:bg-primary/20">
                  <Twitter className="text-primary h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="bg-surface-lighter hover:bg-primary/20">
                  <Github className="text-primary h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Продукт</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Возможности</a></li>
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Безопасность</a></li>
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Тарифы</a></li>
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Документация</a></li>
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Справка</a></li>
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Статус системы</a></li>
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Связаться с нами</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">О нас</a></li>
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Блог</a></li>
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Карьера</a></li>
                <li><a href="#" className="text-text-muted hover:text-white transition-colors duration-200">Пресса</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-surface-lighter mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-text-muted text-sm">
              © 2024 LITIUM.SPACE. Все права защищены.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-text-muted hover:text-white text-sm transition-colors duration-200">Политика конфиденциальности</a>
              <a href="#" className="text-text-muted hover:text-white text-sm transition-colors duration-200">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
