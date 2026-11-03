import { createContext, useContext, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";

interface CartContextType {
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  bounceBadge: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart();
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const [bounceBadge, setBounceBadge] = useState(false);

  const triggerBounce = useCallback(() => {
    setBounceBadge(true);
    setTimeout(() => setBounceBadge(false), 350);
  }, []);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  }, [queryClient]);

  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      await addToCartMutation.mutateAsync({ data: { productId, quantity } });
      triggerBounce();
      invalidate();
    },
    [addToCartMutation, triggerBounce, invalidate],
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      await updateCartItemMutation.mutateAsync({ itemId, data: { quantity } });
      invalidate();
    },
    [updateCartItemMutation, invalidate],
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      await removeFromCartMutation.mutateAsync({ itemId });
      invalidate();
    },
    [removeFromCartMutation, invalidate],
  );

  const clearCart = useCallback(async () => {
    await clearCartMutation.mutateAsync();
    invalidate();
  }, [clearCartMutation, invalidate]);

  return (
    <CartContext.Provider
      value={{
        totalItems: cart?.totalItems ?? 0,
        totalPrice: cart?.totalPrice ?? 0,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        bounceBadge,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
