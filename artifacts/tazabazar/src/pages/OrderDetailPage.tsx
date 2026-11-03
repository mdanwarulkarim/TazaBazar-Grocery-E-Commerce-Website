import { useRoute, useLocation } from "wouter";
import { ArrowLeft, MapPin, Phone, FileText, CheckCircle, Clock, Package, Truck } from "lucide-react";
import { useGetOrder } from "@workspace/api-client-react";
import { useLang, formatPrice, toBn } from "@/context/LanguageContext";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusSteps = ["pending", "confirmed", "processing", "delivered"];

export default function OrderDetailPage() {
  const [, params] = useRoute("/orders/:id");
  const [, navigate] = useLocation();
  const { t, lang } = useLang();
  const id = parseInt(params?.id ?? "0");

  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id } } as any);

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
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">📦</p>
        <h2 className="text-xl font-bold mb-2">{lang === "bn" ? "অর্ডার পাওয়া যায়নি" : "Order not found"}</h2>
        <button onClick={() => navigate("/orders")} className="text-primary text-sm hover:underline">{t.myOrders}</button>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate("/orders")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> {t.myOrders}
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "bn" ? `অর্ডার #${toBn(order.id)}` : `Order #${order.id}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date(order.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full capitalize ${statusColors[order.status] ?? "bg-muted"}`}>
          {statusLabel(order.status)}
        </span>
      </div>

      {/* Progress */}
      {order.status !== "cancelled" && (
        <div className="bg-white rounded-xl border border-border p-5 mb-4">
          <div className="flex items-start justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${i <= currentStep ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {i === 0 && <Clock className="w-4 h-4" />}
                  {i === 1 && <CheckCircle className="w-4 h-4" />}
                  {i === 2 && <Package className="w-4 h-4" />}
                  {i === 3 && <Truck className="w-4 h-4" />}
                </div>
                <span className="text-xs text-center text-muted-foreground">{statusLabel(step)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl border border-border p-5 mb-4">
        <h3 className="font-semibold text-foreground mb-3">{t.itemsOrdered}</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.unit} × {lang === "bn" ? toBn(item.quantity) : item.quantity}</p>
              </div>
              <p className="font-semibold text-primary">{formatPrice(item.price * item.quantity, lang)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
          <span>{t.total}</span>
          <span className="text-primary">{formatPrice(order.totalPrice, lang)}</span>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-white rounded-xl border border-border p-5 space-y-3">
        <h3 className="font-semibold text-foreground">{t.deliveryDetailsLabel}</h3>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span className="text-foreground">{order.deliveryAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-foreground">{order.phone}</span>
        </div>
        {order.note && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{order.note}</span>
          </div>
        )}
      </div>
    </div>
  );
}
