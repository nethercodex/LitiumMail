import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertEmailSchema, type InsertEmail } from "@shared/schema";
import { useLocation } from "wouter";

export default function Compose() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const form = useForm<InsertEmail>({
    resolver: zodResolver(insertEmailSchema),
    defaultValues: {
      toEmail: "",
      subject: "",
      body: "",
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: InsertEmail) => {
      await apiRequest("POST", "/api/emails/send", data);
    },
    onSuccess: () => {
      toast({
        title: "Письмо отправлено",
        description: "Ваше письмо было успешно отправлено",
      });
      // Invalidate inbox and sent emails
      queryClient.invalidateQueries({ queryKey: ["/api/emails/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/emails/sent"] });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить письмо. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEmail) => {
    sendEmailMutation.mutate(data);
  };

  const handleBack = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Mail className="text-dark h-6 w-6" />
          </div>
          <p className="text-text-muted">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <header className="border-b border-surface bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Mail className="text-dark h-4 w-4" />
            </div>
            <span className="text-xl font-bold text-primary">LITIUM.SPACE</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-muted">
              {user?.firstName || user?.email}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="bg-surface border-surface-lighter">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="mr-2 h-5 w-5 text-primary" />
              Написать письмо
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="toEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Кому</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@email.com"
                          className="bg-dark border-surface-lighter"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тема</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Тема письма"
                          className="bg-dark border-surface-lighter"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сообщение</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Введите ваше сообщение..."
                          className="bg-dark border-surface-lighter min-h-[300px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="border-surface-lighter btn-hover-scale glow-subtle"
                  >
                    Отмена
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={sendEmailMutation.isPending}
                    className="bg-primary text-dark hover:bg-primary/80 btn-hover-lift glow-primary"
                  >
                    {sendEmailMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-dark border-t-transparent" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Отправить
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
