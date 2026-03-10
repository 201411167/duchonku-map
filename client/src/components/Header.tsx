import { Link, useLocation } from "wouter";
import { MapPin, Sun, Moon, LogOut, Settings, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 md:px-6 border-b border-border/60 backdrop-blur-md bg-background/80">
      <div className="flex items-center gap-2 flex-1">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-base tracking-tight">Duchonku Map</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {user?.isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            data-testid="link-admin"
            onClick={() => navigate("/admin")}
            className="text-xs font-medium hidden sm:flex gap-1.5 items-center"
          >
            <Settings className="w-3.5 h-3.5" />
            Pin 관리
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="button-toggle-theme"
          className="w-8 h-8"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid="button-user-menu"
                className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{user.full_name || "사용자"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-block mt-1 text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    어드민
                  </span>
                )}
              </div>
              <DropdownMenuSeparator />
              {user.isAdmin && (
                <DropdownMenuItem
                  data-testid="menu-item-admin"
                  onClick={() => navigate("/admin")}
                  className="cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  Pin 관리
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                data-testid="menu-item-signout"
                onClick={signOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            data-testid="button-login"
            onClick={() => navigate("/login")}
            className="h-8 text-xs font-medium gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            로그인
          </Button>
        )}
      </div>
    </header>
  );
}
