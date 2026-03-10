import { X, MapPin, Tag, Navigation, Trash2, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, type Pin } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  pin: Pin | null;
  isAdmin: boolean;
  onClose: () => void;
  onDelete: (pinId: string) => void;
  deleting: boolean;
};

export default function PinDetailPanel({ pin, isAdmin, onClose, onDelete, deleting }: Props) {
  if (!pin) return null;

  const category = CATEGORIES.find(c => c.value === pin.category) ?? CATEGORIES[0];

  const formattedDate = pin.created_at
    ? new Date(pin.created_at).toLocaleDateString("ko-KR", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-card-border shadow-xl flex flex-col z-10 animate-in slide-in-from-right duration-300"
      data-testid="panel-pin-detail"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
        <h2 className="font-semibold text-sm text-foreground truncate flex-1 pr-4" data-testid="text-pin-name">
          {pin.name}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 shrink-0"
          onClick={onClose}
          data-testid="button-close-panel"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {pin.image_url ? (
          <div className="w-full aspect-video bg-muted overflow-hidden">
            <img
              src={pin.image_url}
              alt={pin.name}
              className="w-full h-full object-cover"
              data-testid="img-pin"
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-muted/50 flex items-center justify-center border-b border-card-border">
            <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              className="text-xs font-medium gap-1.5 px-2.5 py-1"
              style={{ backgroundColor: category.color + "20", color: category.color, borderColor: category.color + "40" }}
              data-testid="badge-category"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.label}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> 설명
            </p>
            <p className="text-sm text-foreground leading-relaxed" data-testid="text-pin-description">
              {pin.description || <span className="text-muted-foreground italic">설명 없음</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 space-y-0.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">위도</p>
              <p className="text-sm font-mono font-medium" data-testid="text-pin-lat">
                {Number(pin.lat).toFixed(6)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-0.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">경도</p>
              <p className="text-sm font-mono font-medium" data-testid="text-pin-lng">
                {Number(pin.lng).toFixed(6)}
              </p>
            </div>
          </div>

          {formattedDate && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <Navigation className="w-3 h-3" />
              {formattedDate} 등록
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="px-4 py-3 border-t border-card-border">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-2"
                data-testid="button-delete-pin"
                disabled={deleting}
              >
                {deleting ? (
                  <span className="w-3.5 h-3.5 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                핀 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  핀을 삭제하시겠습니까?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <strong>"{pin.name}"</strong> 핀을 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(pin.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-testid="button-confirm-delete"
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
