import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Mail, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EmailWithDetails } from "@shared/schema";

interface EmailListProps {
  emails: EmailWithDetails[];
  selectedEmailId: number | null;
  onEmailSelect: (id: number) => void;
  isLoading: boolean;
}

export default function EmailList({ emails, selectedEmailId, onEmailSelect, isLoading }: EmailListProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-surface rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface rounded w-3/4"></div>
                  <div className="h-3 bg-surface rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="p-8 text-center">
        <Mail className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-muted">Нет писем</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-2">
        {emails.map((email) => {
          const isSelected = email.id === selectedEmailId;
          const isUnread = !email.isRead;
          
          return (
            <Button
              key={email.id}
              variant="ghost"
              className={cn(
                "w-full p-3 h-auto justify-start text-left mb-2 rounded-lg btn-hover-scale glow-subtle",
                isSelected && "bg-primary/10 border border-primary/20",
                isUnread && !isSelected && "bg-surface/50",
                !isUnread && !isSelected && "hover:bg-surface/30"
              )}
              onClick={() => onEmailSelect(email.id)}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className="flex-shrink-0 mt-1">
                  {isUnread ? (
                    <Mail className="h-4 w-4 text-primary" />
                  ) : (
                    <MailOpen className="h-4 w-4 text-text-muted" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm truncate",
                      isUnread ? "font-semibold" : "font-medium"
                    )}>
                      {email.sender.firstName || email.sender.email}
                    </span>
                    <span className="text-xs text-text-muted flex-shrink-0 ml-2">
                      {email.sentAt ? formatDistanceToNow(new Date(email.sentAt), { 
                        addSuffix: true, 
                        locale: ru 
                      }) : 'Недавно'}
                    </span>
                  </div>
                  
                  <p className={cn(
                    "text-sm mb-1 truncate",
                    isUnread ? "font-medium" : "text-text-muted"
                  )}>
                    {email.subject}
                  </p>
                  
                  <p className="text-xs text-text-muted truncate">
                    {email.body}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
