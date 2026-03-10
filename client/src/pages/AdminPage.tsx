import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES, type Pin } from "@shared/schema";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, MapPin, Plus, RefreshCw, AlertTriangle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  description: z.string().optional(),
  lat: z.string().min(1, "위도를 입력해주세요").refine(v => !isNaN(Number(v)) && Math.abs(Number(v)) <= 90, "올바른 위도를 입력해주세요 (-90 ~ 90)"),
  lng: z.string().min(1, "경도를 입력해주세요").refine(v => !isNaN(Number(v)) && Math.abs(Number(v)) <= 180, "올바른 경도를 입력해주세요 (-180 ~ 180)"),
  category: z.string().default("general"),
  image_url: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      lat: "",
      lng: "",
      category: "general",
      image_url: "",
    },
  });

  if (!loading && (!user || !user.isAdmin)) {
    navigate("/");
    return null;
  }

  const { data: pins = [], isLoading: pinsLoading, refetch } = useQuery<Pin[]>({
    queryKey: ["/api/pins"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("pins")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const supabase = getSupabase();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { error } = await supabase.from("pins").insert({
        name: values.name,
        description: values.description || null,
        lat: Number(values.lat),
        lng: Number(values.lng),
        category: values.category,
        image_url: values.image_url || null,
        created_by: authUser?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pins"] });
      form.reset();
      toast({ title: "핀이 등록되었습니다." });
    },
    onError: (error: any) => {
      toast({ title: "등록 실패", description: error.message ?? "핀 등록 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (pinId: string) => {
      setDeletingId(pinId);
      const supabase = getSupabase();
      const { error } = await supabase.from("pins").delete().eq("id", pinId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pins"] });
      setDeletingId(null);
      toast({ title: "핀이 삭제되었습니다." });
    },
    onError: () => {
      setDeletingId(null);
      toast({ title: "삭제 실패", variant: "destructive" });
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Pin 관리</h1>
              <p className="text-xs text-muted-foreground">핀을 추가하거나 삭제할 수 있습니다.</p>
            </div>
          </div>

          {/* Add Pin Form */}
          <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Plus className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">새 핀 등록</h2>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">이름 *</FormLabel>
                        <FormControl>
                          <Input placeholder="핀 이름" {...field} data-testid="input-pin-name" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">카테고리</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat.value} value={cat.value} data-testid={`option-category-${cat.value}`}>
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                  {cat.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">설명</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="장소에 대한 설명을 입력하세요 (선택)"
                          rows={2}
                          {...field}
                          data-testid="input-pin-description"
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">위도 *</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="37.5665" {...field} data-testid="input-pin-lat" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lng"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">경도 *</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="126.9780" {...field} data-testid="input-pin-lng" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">이미지 URL</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/image.jpg (선택)" {...field} data-testid="input-pin-image" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    data-testid="button-submit-pin"
                    disabled={createMutation.isPending}
                    className="gap-2"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    저장
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    data-testid="button-reset-form"
                    disabled={createMutation.isPending}
                  >
                    초기화
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Pin List */}
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-card-border">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm">핀 목록</h2>
                {!pinsLoading && (
                  <Badge variant="secondary" className="text-xs h-5 px-2">
                    {pins.length}개
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7"
                onClick={() => refetch()}
                data-testid="button-refresh-pins"
                disabled={pinsLoading}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pinsLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {pinsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : pins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MapPin className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">등록된 핀이 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-card-border">
                      <TableHead className="text-xs font-medium text-muted-foreground">이름</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground">카테고리</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground hidden sm:table-cell">위도</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground hidden sm:table-cell">경도</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground hidden md:table-cell">등록일</TableHead>
                      <TableHead className="w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pins.map(pin => {
                      const cat = CATEGORIES.find(c => c.value === pin.category) ?? CATEGORIES[0];
                      return (
                        <TableRow
                          key={pin.id}
                          className="border-card-border"
                          data-testid={`row-pin-${pin.id}`}
                        >
                          <TableCell className="font-medium text-sm" data-testid={`text-pin-name-${pin.id}`}>
                            {pin.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className="text-[10px] px-2 py-0.5 font-medium gap-1"
                              style={{ backgroundColor: cat.color + "20", color: cat.color, borderColor: cat.color + "40" }}
                              data-testid={`badge-category-${pin.id}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell" data-testid={`text-lat-${pin.id}`}>
                            {Number(pin.lat).toFixed(4)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell" data-testid={`text-lng-${pin.id}`}>
                            {Number(pin.lng).toFixed(4)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                            {pin.created_at ? new Date(pin.created_at).toLocaleDateString("ko-KR") : "-"}
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                  data-testid={`button-delete-pin-${pin.id}`}
                                  disabled={deletingId === pin.id}
                                >
                                  {deletingId === pin.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
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
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(pin.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-testid={`button-confirm-delete-${pin.id}`}
                                  >
                                    삭제
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
