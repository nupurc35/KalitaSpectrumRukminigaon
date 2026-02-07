import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "./adminNavbar";
import { supabase } from "@/lib/superbase";
import { KALITA_RESTAURANT_ID } from "@/constants/restaurent";
import { Toaster, toast } from "react-hot-toast";
import AdminPageHeader from "@/components/AdminPageHeader";
import ProtectedRoute from "@/components/protectedRoute";

type MenuItemRow = {
  id: string;
  name: string | null;
  price: number | null;
};

type OrderItem = {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
};

const CURRENT_RESTAURANT_ID = KALITA_RESTAURANT_ID;

const CreateOrderContent: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadMenuItems = async () => {
      setLoadingMenu(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("id,name,price")
        .eq("restaurant_id", CURRENT_RESTAURANT_ID)
        .order("name", { ascending: true });

      if (error) {
        console.error("Failed to fetch menu items:", error);
        toast.error("Failed to load menu items.");
        if (isMounted) {
          setMenuItems([]);
          setLoadingMenu(false);
        }
        return;
      }

      if (isMounted) {
        setMenuItems((data ?? []) as MenuItemRow[]);
        setLoadingMenu(false);
      }
    };

    loadMenuItems().catch((err) => {
      console.error("Failed to fetch menu items:", err);
      toast.error("Failed to load menu items.");
      if (isMounted) {
        setMenuItems([]);
        setLoadingMenu(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedMenuItem = useMemo(
    () => menuItems.find((item) => item.id === selectedMenuItemId) ?? null,
    [menuItems, selectedMenuItemId]
  );

  const totalAmount = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );

  const handleAddItem = () => {
    if (!selectedMenuItem) {
      toast.error("Select a menu item.");
      return;
    }

    const parsedQuantity = Number.parseInt(quantity, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    const price = Number(selectedMenuItem.price ?? 0);

    setOrderItems((prev) => {
      const existing = prev.find((item) => item.menu_item_id === selectedMenuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menu_item_id === selectedMenuItem.id
            ? { ...item, quantity: item.quantity + parsedQuantity }
            : item
        );
      }

      return [
        ...prev,
        {
          menu_item_id: selectedMenuItem.id,
          name: selectedMenuItem.name ?? "Unnamed Item",
          price,
          quantity: parsedQuantity,
        },
      ];
    });

    setQuantity("1");
  };

  const handleSaveOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Add at least one item.");
      return;
    }

    setIsSaving(true);

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          restaurant_id: CURRENT_RESTAURANT_ID,
          customer_name: customerName.trim() || null,
          table_number: tableNumber.trim() || null,
          status: "paid",
        },
      ])
      .select("id")
      .single();

    if (orderError || !orderData) {
      console.error("Failed to create order:", orderError);
      toast.error(orderError?.message ?? "Failed to create order.");
      setIsSaving(false);
      return;
    }

    const orderItemsPayload = orderItems.map((item) => ({
      order_id: orderData.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price_at_time: item.price,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (orderItemsError) {
      console.error("Failed to create order items:", orderItemsError);
      toast.error(orderItemsError.message);
      setIsSaving(false);
      return;
    }

    const { error: totalError } = await supabase
      .from("orders")
      .update({ total_amount: totalAmount })
      .eq("id", orderData.id);

    if (totalError) {
      console.error("Failed to update order total:", totalError);
      toast.error(totalError.message);
      setIsSaving(false);
      return;
    }

    toast.success("Order saved.");
    setCustomerName("");
    setTableNumber("");
    setSelectedMenuItemId("");
    setQuantity("1");
    setOrderItems([]);
    setIsSaving(false);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="relative z-[9999]">
        <AdminHeader />
      </div>

      <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <AdminPageHeader />

          <header className="mb-8">
            <h1 className="text-4xl font-serif text-white mb-2">Create Order</h1>
            <p className="text-white/40">Quickly build and save a paid order.</p>
          </header>

          <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/50">
                  Customer Name (optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  placeholder="Walk-in customer"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/50">
                  Table Number (optional)
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(event) => setTableNumber(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  placeholder="e.g. 12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <label className="text-xs uppercase tracking-widest text-white/50">
                  Menu Item
                </label>
                <select
                  value={selectedMenuItemId}
                  onChange={(event) => setSelectedMenuItemId(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  disabled={loadingMenu}
                >
                  <option value="">
                    {loadingMenu ? "Loading menu items..." : "Select an item"}
                  </option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name ?? "Unnamed Item"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/50">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-5 py-2.5 rounded-full bg-secondary text-black text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.01] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">
                    Item
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">
                    Quantity
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">
                    Price
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40 text-right">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-white/50">
                      No items added yet.
                    </td>
                  </tr>
                ) : (
                  orderItems.map((item) => (
                    <tr
                      key={item.menu_item_id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-semibold text-white/90">
                        {item.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-white/80">{item.quantity}</td>
                      <td className="py-4 px-6 text-sm text-white/80">
                        ₹{item.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-white/80 text-right">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40">Total</p>
              <p className="text-3xl font-serif text-white">₹{totalAmount.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={isSaving}
              className="px-6 py-3 rounded-full bg-secondary text-black text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Order"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const CreateOrder: React.FC = () => {
  return (
    <ProtectedRoute>
      <CreateOrderContent />
    </ProtectedRoute>
  );
};

export default CreateOrder;
