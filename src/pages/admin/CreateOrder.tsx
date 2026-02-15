import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/superbase";
import { restaurantId } from "@/config/env";
import { Toaster, toast } from "react-hot-toast";
import { Layout } from "@/components/crm/Layout";
import { Card } from "@/components/crm/Card";
import { Plus, Minus, ShoppingCart, Save, Utensils } from "lucide-react";

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

const CURRENT_RESTAURANT_ID = restaurantId;

const CreateOrder: React.FC = () => {
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
          name: selectedMenuItem.name ?? "Unknown Item",
          price,
          quantity: parsedQuantity,
        },
      ];
    });

    setQuantity("1");
    setSelectedMenuItemId("");
    toast.success("Item added to order.");
  };

  const handleRemoveItem = (menuItemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.menu_item_id !== menuItemId));
    toast.success("Item removed.");
  };

  const handleSaveOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    if (orderItems.length === 0) {
      toast.error("No items in the order.");
      return;
    }

    try {
      setIsSaving(true);
      
      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            restaurant_id: CURRENT_RESTAURANT_ID,
            customer_name: customerName.trim(),
            table_number: tableNumber.trim() || null,
            total_amount: totalAmount,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with correct column name
      const orderItemsPayload = orderItems.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price_at_time: item.price, // ✅ Changed from 'price' to 'price_at_time'
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      toast.success("Order created successfully!");
      
      // Reset form
      setCustomerName("");
      setTableNumber("");
      setOrderItems([]);
      setSelectedMenuItemId("");
      setQuantity("1");
    } catch (err: any) {
      console.error("Failed to create order:", err);
      toast.error(err.message || "Failed to save order.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout title="Create Order">
      <Toaster position="top-center" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
        {/* LEFT COLUMN: Input & Selection */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
          {/* Customer Details Card */}
          <Card className="flex-shrink-0 p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
              <UsersIcon size={16} /> Customer Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/40">Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-medium placeholder:text-white/20"
                  placeholder="e.g. Rahul Verma"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/40">Table No.</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-medium placeholder:text-white/20"
                  placeholder="Optional"
                />
              </div>
            </div>
          </Card>

          {/* Menu Selection Card */}
          <Card className="flex-1 flex flex-col min-h-0 p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
              <Utensils size={16} /> Select Items
            </h3>

            <div className="grid grid-cols-12 gap-4 mb-auto">
              <div className="col-span-8 space-y-2">
                <label className="text-xs font-medium text-white/40">Menu Item</label>
                <select
                  value={selectedMenuItemId}
                  onChange={(e) => setSelectedMenuItemId(e.target.value)}
                  disabled={loadingMenu}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all appearance-none text-white"
                >
                  <option value="">{loadingMenu ? "Loading..." : "Select an item..."}</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ₹{item.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-4 space-y-2">
                <label className="text-xs font-medium text-white/40">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-center font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleAddItem}
              disabled={!selectedMenuItemId || loadingMenu}
              className="mt-6 w-full py-3 rounded-xl bg-white text-black font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Add to Order
            </button>
          </Card>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-5 h-full">
          <div className="h-full rounded-xl border border-white/10 bg-[#171717] flex flex-col shadow-2xl shadow-black/50">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                <ShoppingCart size={16} /> Current Order
              </h3>
              <span className="text-xs font-medium px-2 py-1 rounded bg-white/10 text-white/60">
                {orderItems.length} {orderItems.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {orderItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                  <ShoppingCart size={48} strokeWidth={1} />
                  <p className="text-sm">No items added yet</p>
                </div>
              ) : (
                orderItems.map((item, index) => (
                  <div 
                    key={`${item.menu_item_id}-${index}`} 
                    className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-xs text-white/40 font-mono mt-1">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-medium text-amber-500">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.menu_item_id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-white/5 transition-colors"
                        title="Remove item"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-white/50 uppercase tracking-wider">
                  Total Amount
                </span>
                <span className="text-3xl font-bold font-mono tracking-tight flex items-start gap-1">
                  <span className="text-lg mt-1 text-white/40">₹</span>
                  {totalAmount.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleSaveOrder}
                disabled={isSaving || orderItems.length === 0 || !customerName.trim()}
                className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                  isSaving || orderItems.length === 0 || !customerName.trim()
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
                } flex items-center justify-center gap-2`}
              >
                {isSaving ? (
                  "Creating Order..."
                ) : (
                  <>
                    <Save size={18} />
                    Confirm & Create Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Helper Icon Component
function UsersIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default CreateOrder;