const PAGE_SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const PAGE_SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";
const pageSupabase = supabase.createClient(PAGE_SUPABASE_URL, PAGE_SUPABASE_KEY);
const notificationsList = document.getElementById("notificationsList");

async function loadNotificationsPage() {
    const customerID = localStorage.getItem("CustomerID");

    if (!customerID) {
        notificationsList.innerHTML = '<div class="empty">🔔 No notifications yet.<br><small>Place an order to receive updates.</small></div>';
        return;
    }

    const items = [];

    const { data: saved, error: savedError } = await pageSupabase
        .from("Notifications")
        .select("*")
        .eq("CustomerID", customerID)
        .order("CreatedAt", { ascending: false });

    if (!savedError && saved) items.push(...saved);

    const { data: orders, error: ordersError } = await pageSupabase
        .from("Order")
        .select("orderid,Game,Package,Status,CreatedAt")
        .eq("CustomerID", customerID)
        .order("orderid", { ascending: false });

    if (!ordersError && orders) {
        orders.forEach(order => {
            const status = String(order.Status || "Pending").toLowerCase();
            let title, message, type;
            if (status === "completed") {
                title = "🟢 Order Completed";
                message = `Your order ${order.orderid} has been completed successfully.`;
                type = "completed";
            } else if (status === "cancelled" || status === "rejected") {
                title = "🔴 Order Rejected";
                message = `Your order ${order.orderid} was rejected/cancelled.`;
                type = "cancelled";
            } else {
                title = "🟡 Order Pending";
                message = `Your order ${order.orderid} is still being processed.`;
                type = "pending";
            }
            items.push({
                id: `status-${order.orderid}-${status}`,
                title,
                message,
                type,
                OrderID: order.orderid,
                IsRead: false,
                CreatedAt: order.CreatedAt || new Date().toISOString()
            });
        });
    }

    if (items.length === 0) {
        notificationsList.innerHTML = '<div class="empty">🔔 No notifications yet.</div>';
        return;
    }

    const seen = new Set();
    const unique = items.filter(n => {
        const key = `${n.id}-${n.OrderID || ""}-${n.title || ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    notificationsList.innerHTML = unique.map(n => `
        <div class="notification-card ${n.type || ""}">
            <h3>${escapeHtml(n.title || "Notification")}</h3>
            <p>${escapeHtml(n.message || "")}</p>
            ${n.OrderID ? `<small>Order: ${escapeHtml(n.OrderID)}</small><br>` : ""}
            <small>${new Date(n.CreatedAt || Date.now()).toLocaleString()}</small>
        </div>
    `).join("");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadNotificationsPage();
