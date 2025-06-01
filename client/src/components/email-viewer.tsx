import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowLeft, Reply, Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { EmailWithSender } from "@shared/schema";

interface EmailViewerProps {
  emailId: number;
  onClose: () => void;
}

export default function EmailViewer({ emailId, onClose }: EmailViewerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: email, isLoading, error } = useQuery<EmailWithSender>({
    queryKey: [`/api/emails/${emailId}`],
    enabled: !!emailId,
  });

  const deleteEmailMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/emails/${emailId}`);
    },
    onSuccess: () => {
      toast({
        title: "Письмо удалено",
        description: "Письмо было перемещено в корзину",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emails/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/emails/sent"] });
      onClose();
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
        title: "Ошибка",
        description: "Не удалось удалить письмо",
        variant: "destructive",
      });
    },
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Загрузка письма...</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted">Письмо не найдено</p>
          <Button variant="outline" className="mt-4" onClick={onClose}>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (firstName?: string | null, email?: string | null) => {
    if (firstName) {
      return firstName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface bg-surface/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold truncate max-w-md">{email.subject}</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" disabled className="btn-hover-scale">
              <Reply className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled className="btn-hover-scale">
              <Archive className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => deleteEmailMutation.mutate()}
              disabled={deleteEmailMutation.isPending}
              className="btn-hover-scale hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="bg-surface/50 border-surface-lighter max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={email.sender.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {getInitials(email.sender.firstName, email.sender.email)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {email.sender.firstName ? 
                        `${email.sender.firstName} ${email.sender.lastName || ''}`.trim() :
                        email.sender.email
                      }
                    </h3>
                    <p className="text-sm text-text-muted">{email.sender.email}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-text-muted">
                      {email.sentAt ? formatDistanceToNow(new Date(email.sentAt), { 
                        addSuffix: true, 
                        locale: ru 
                      }) : 'Недавно'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {email.sentAt ? new Date(email.sentAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Недавно'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-text-muted">
                    Кому: <span className="text-white">{email.toEmail}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <Separator className="bg-surface-lighter" />
          
          <CardContent className="pt-6">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {email.body}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
