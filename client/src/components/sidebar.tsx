import { Inbox, Send, Archive, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentView: 'inbox' | 'sent';
  onViewChange: (view: 'inbox' | 'sent') => void;
  selectedEmailId: number | null;
  onEmailSelect: (id: number | null) => void;
}

export default function Sidebar({ currentView, onViewChange, onEmailSelect }: SidebarProps) {
  const handleViewChange = (view: 'inbox' | 'sent') => {
    onViewChange(view);
    onEmailSelect(null); // Clear selection when changing views
  };

  return (
    <div className="w-64 bg-surface/50 border-r border-surface">
      <div className="p-4">
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start btn-hover-scale",
              currentView === 'inbox' && "bg-primary/10 text-primary hover:bg-primary/20 glow-subtle"
            )}
            onClick={() => handleViewChange('inbox')}
          >
            <Inbox className="mr-3 h-4 w-4" />
            Входящие
          </Button>
          
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start btn-hover-scale",
              currentView === 'sent' && "bg-primary/10 text-primary hover:bg-primary/20 glow-subtle"
            )}
            onClick={() => handleViewChange('sent')}
          >
            <Send className="mr-3 h-4 w-4" />
            Отправленные
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            disabled
          >
            <Archive className="mr-3 h-4 w-4" />
            Архив
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            disabled
          >
            <Trash2 className="mr-3 h-4 w-4" />
            Корзина
          </Button>
        </nav>
        
        <div className="mt-8 pt-4 border-t border-surface">
          <Button
            variant="ghost"
            className="w-full justify-start"
            disabled
          >
            <Settings className="mr-3 h-4 w-4" />
            Настройки
          </Button>
        </div>
      </div>
    </div>
  );
}
