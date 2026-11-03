import { Link } from "wouter";
import { Package, ChevronRight, ClipboardList } from "lucide-react";
import { useListOrders } from "@workspace/api-client-react";
import { useLang, formatPrice, toBn } from "@/context/LanguageContext";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useListOrders();
  const { t, lang } = useLang();

  const statusLabel = (s: string) => {
    const map: Record<string, keyof typeof t> = {
      pending: "pending", confirmed: "confirmed", processing: "processing",
      delivered: "delivered", cancelled: "cancelled",
    };
    const key = map[s];
    return key ? t[key] : s;
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ClipboardList className="w-16 h-16 text-muted mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">{t.noOrdersTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.noOrdersSub}</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary/90 transition">
          {t.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t.myOrders}</h1>
      <div className="space-y-3">
        {orders.map((order, i) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className={`bg-white rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-sm transition cursor-pointer animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {lang === "bn" ? `অর্ডার #${toBn(order.id)}` : `Order #${order.id}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lang === "bn" ? `${toBn(order.items.length)} টি পণ্য` : `${order.items.length} item${order.items.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[order.status] ?? "bg-muted text-muted-foreground"}`}>
                    {statusLabel(order.status)}
                  </span>
                  <span className="text-sm font-bold text-primary">{formatPrice(order.totalPrice, lang)}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
