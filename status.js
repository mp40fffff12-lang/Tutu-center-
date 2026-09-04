const SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const TABLE = "Order";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// ADMIN LOGIN
// ===============================

function adminLogin() {

    if (sessionStorage.getItem("adminLoggedIn") === "true") {
        return;
    }

    let password = prompt("🔒 Enter Admin Password");

    if (password === "Aman12@.") {

        sessionStorage.setItem("adminLoggedIn", "true");

    } else {

        alert("Wrong Password");

        window.location.href = "index.html";
    }
}


// ===============================
// LOAD ORDERS
// ===============================

async function loadOrders() {

    const page = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    let status = "Pending";

    if (page === "completed.html") {
        status = "Completed";
    }

    if (page === "cancelled.html") {
        status = "Cancelled";
    }


    const { data, error } = await supabaseClient
        .from(TABLE)
        .select("*")
        .eq("Status", status)
        .order("orderid", { ascending: false });


    if (error) {

        console.log("Load orders error:", error);

        alert(error.message);

        return;
    }


    const ordersList =
        document.getElementById("ordersList");


    if (!ordersList) {
        console.log("ordersList not found");
        return;
    }


    if (!data || data.length === 0) {

        ordersList.innerHTML =
            `<p style="padding:20px;">
                No ${status} orders found.
            </p>`;

        return;
    }


    let html = "";


    data.forEach(order => {

        html += `

        <div class="card">

            <h3>🎮 ${order.Game || ""}</h3>

            <p>
                <b>Order ID:</b>
                ${order.orderid || ""}
            </p>

            <p>
                <b>UID:</b>
                ${order.Uid || ""}
            </p>

            <p>
                <b>Package:</b>
                ${order.Package || ""}
            </p>

            <p>
                <b>Payment:</b>
                ${order.Payment || ""}
            </p>

            <p>
                <b>Status:</b>
                ${order.Status || ""}
            </p>

            <p>
                <a
                    href="${order.Screenshot || "#"}"
                    target="_blank"
                >
                    📷 Payment Screenshot
                </a>
            </p>


            ${
                page === "pending.html"
                ?
                `
                <button
                    onclick="updateStatus('${order.orderid}', 'Completed')"
                >
                    ✅ Complete
                </button>

                <button
                    onclick="updateStatus('${order.orderid}', 'Cancelled')"
                >
                    ❌ Cancel
                </button>
                `
                :
                ""
            }


            ${
                page === "completed.html"
                ?
                `
                <button
                    onclick="updateStatus('${order.orderid}', 'Pending')"
                >
                    🟡 Pending
                </button>

                <button
                    onclick="updateStatus('${order.orderid}', 'Cancelled')"
                >
                    ❌ Cancel
                </button>
                `
                :
                ""
            }


            ${
                page === "cancelled.html"
                ?
                `
                <button
                    onclick="updateStatus('${order.orderid}', 'Pending')"
                >
                    🟡 Pending
                </button>

                <button
                    onclick="updateStatus('${order.orderid}', 'Completed')"
                >
                    ✅ Complete
                </button>
                `
                :
                ""
            }

        </div>

        `;
    });


    ordersList.innerHTML = html;
}



// ===============================
// UPDATE ORDER STATUS
// ===============================

async function updateStatus(orderid, status) {


    // Get order information first
    const { data: order, error: orderError } =
        await supabaseClient
            .from(TABLE)
            .select("CustomerID, orderid, Game")
            .eq("orderid", orderid)
            .single();


    if (orderError || !order) {

        console.log(
            "Could not find order:",
            orderError
        );

        alert("Could not find this order.");

        return;
    }


    // Update order status
    const { error: updateError } =
        await supabaseClient
            .from(TABLE)
            .update({
                Status: status
            })
            .eq("orderid", orderid);


    if (updateError) {

        console.log(
            "Status update failed:",
            updateError
        );

        alert(updateError.message);

        return;
    }


    // ===============================
    // CREATE NOTIFICATION
    // ===============================

    let title = "";
    let notificationMessage = "";


    if (status === "Completed") {

        title = "✅ Order Completed";

        notificationMessage =
            `Your order ${orderid} has been completed successfully.`;
    }


    else if (status === "Cancelled") {

        title = "❌ Order Cancelled";

        notificationMessage =
            `Your order ${orderid} has been cancelled.`;
    }


    else if (status === "Pending") {

        title = "🟡 Order Pending";

        notificationMessage =
            `Your order ${orderid} is now pending.`;
    }


    // Insert notification
    if (title !== "") {

        const { error: notificationError } =
            await supabaseClient
                .from("notifications")
                .insert([
                    {
                        CustomerID: order.CustomerID,
                        OrderID: order.orderid,
                        title: title,
                        message: notificationMessage,
                        type: "order",
                        IsRead: false
                    }
                ]);


        if (notificationError) {

            console.log(
                "Notification creation failed:",
                notificationError
            );

        } else {

            console.log(
                "Notification created successfully."
            );
        }
    }


    // Reload the current page
    await loadOrders();
}



// ===============================
// PAGE LOAD
// ===============================

window.onload = async function () {

    adminLogin();

    await loadOrders();

};