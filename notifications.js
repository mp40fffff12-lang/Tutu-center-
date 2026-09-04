// ==============================
// CUSTOMER NOTIFICATIONS
// ==============================

const NOTIFICATION_SUPABASE_URL =
    "https://kxswfgheuihgndtlvzqf.supabase.co";

const NOTIFICATION_SUPABASE_KEY =
    "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const notificationClient =
    window.supabase &&
    typeof window.supabase.createClient === "function"
        ? window.supabase.createClient(
            NOTIFICATION_SUPABASE_URL,
            NOTIFICATION_SUPABASE_KEY
        )
        : null;


// ==============================
// GET CUSTOMER NOTIFICATIONS
// ==============================

async function getCustomerNotifications() {

    if (!notificationClient) {
        console.log("Supabase client not found");
        return [];
    }

    const customerID = localStorage.getItem("CustomerID");

    if (!customerID) {
        console.log("CustomerID not found");
        return [];
    }

    const notifications = [];


    // ==============================
    // SAVED NOTIFICATIONS
    // ==============================

    const {
        data: savedNotifications,
        error: notificationError
    } = await notificationClient
        .from("notifications")
        .select("*")
        .eq("CustomerID", customerID)
        .order("created_at", {
            ascending: false
        });

    if (notificationError) {
        console.log(
            "Notification fetch error:",
            notificationError
        );
    }

    if (!notificationError && savedNotifications) {
        notifications.push(...savedNotifications);
    }


    // ==============================
    // ORDER STATUS NOTIFICATION
    // ==============================

    const {
        data: orders,
        error: orderError
    } = await notificationClient
        .from("Order")
    
      .select("orderid,Game,Package,Status")
        .eq("CustomerID", customerID)
        .order("orderid", {
            ascending: false
        });

    if (orderError) {
        console.log(
            "Order notification fetch error:",
            orderError
        );
    }


    if (!orderError && orders) {

        orders.forEach(order => {

            const status =
                String(order.Status || "Pending")
                    .toLowerCase();

            let title = "";
            let text = "";
            let type = "info";


            if (status === "completed") {

                title = "🟢 Order Completed";

                text =
                    `Your order ${order.orderid} has been completed successfully.`;

                type = "completed";

            }

            else if (
                status === "cancelled" ||
                status === "rejected"
            ) {

                title = "🔴 Order Cancelled";

                text =
                    `Your order ${order.orderid} was cancelled.`;

                type = "cancelled";

            }

            else {

                title = "🟡 Order Pending";

                text =
                    `Your order ${order.orderid} is still being processed.`;

                type = "pending";
            }


            notifications.push({

                id:
                    `order-status-${order.orderid}-${status}`,

                title: title,

                message: text,

                type: type,

                OrderID: order.orderid,

                IsRead: false,

                created_at: new Date().toISOString()
                    
                    
            });

        });
    }


    // ==============================
    // REMOVE DUPLICATES
    // ==============================

    const seen = new Set();

    return notifications.filter(item => {

        const key =
            `${item.id}-${item.OrderID || ""}-${item.title || ""}`;

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);

        return true;
    });
}


// ==============================
// NOTIFICATION BAR
// ==============================

async function updateNotificationBar() {

    const bar =
        document.getElementById("notificationBar");

    if (!bar) return;


    const notifications =
        await getCustomerNotifications();


    const unread =
        notifications.filter(
            n => !n.IsRead
        ).length;


    const label =
        unread > 0
            ? `🔔 You have ${unread} notification${unread === 1 ? "" : "s"}`
            : "🔔 Notifications";


    const firstSpan =
        bar.querySelector("span:first-child");


    if (firstSpan) {

        firstSpan.innerHTML =
            `${label}${unread > 0
                ? '<span class="notification-dot"></span>'
                : ""
            }`;
    }


    if (unread > 0) {

        bar.classList.add("has-new");

    } else {

        bar.classList.remove("has-new");

    }
}


// ==============================
// START
// ==============================

updateNotificationBar();