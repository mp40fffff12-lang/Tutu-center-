// ==============================
// SUPABASE
// ==============================

const SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const TABLE = "Order";

const supabaseClient =
    typeof supabase !== "undefined" &&
    typeof supabase.createClient === "function"
        ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
        : null;


// ==============================
// ELEMENTS
// ==============================

const uid = document.getElementById("uid");
const submitOrder = document.getElementById("submitOrder");
const message = document.getElementById("message");
const packages = document.querySelectorAll(".package");

const pointsBalance = document.getElementById("pointsBalance");

let selectedPackage = "";


// ==============================
// MESSAGE
// ==============================

function showMessage(text, color) {

    if (!message) return;

    message.innerHTML = text;
    message.style.color = color;

}


// ==============================
// CUSTOMER ID
// ==============================






// ==============================
// LOAD POINTS BALANCE
// ==============================

async function loadPointsBalance() {

    if (!pointsBalance || !supabaseClient) return;

  

  const {
    data: { user },
    error: userError
} = await supabaseClient.auth.getUser();

if (userError || !user) {
    return;
}

const customerID = user.id;

    const { data, error } = await supabaseClient
        .from("wallets")
        .select("points")
        .eq("customer_id", customerID)
        .maybeSingle();

    if (error) {

        console.log(
            "Points balance error:",
            error
        );

        return;

    }

    pointsBalance.textContent =
        data ? data.points : 0;

}


// ==============================
// PACKAGE SELECTION
// ==============================

packages.forEach(card => {

    card.addEventListener("click", () => {

        packages.forEach(c =>
            c.classList.remove("selected")
        );

        card.classList.add("selected");

        selectedPackage =
            card.dataset.package;

    });

});


// ==============================
// SUBMIT ORDER
// ==============================

if (submitOrder) {

    submitOrder.addEventListener(
        "click",
        async () => {

            if (!supabaseClient) {

                showMessage(
                    "❌ Supabase not loaded",
                    "red"
                );

                return;

            }


            // ------------------------------
            // CHECK UID
            // ------------------------------

            const uidValue =
                uid.value.trim();

            if (uidValue === "") {

                showMessage(
                    "❌ Enter UID",
                    "red"
                );

                return;

            }


            // ------------------------------
            // CHECK PACKAGE
            // ------------------------------

            if (selectedPackage === "") {

                showMessage(
                    "❌ Select a package",
                    "red"
                );

                return;

            }


            // ------------------------------
            // GET PACKAGE PRICE
            // ------------------------------

            const selectedCard =
                document.querySelector(
                    ".package.selected"
                );

            if (!selectedCard) {

                showMessage(
                    "❌ Select a package",
                    "red"
                );

                return;

            }

            const price =
                Number(selectedCard.dataset.price);


            if (!price || price <= 0) {

                showMessage(
                    "❌ Invalid package price",
                    "red"
                );

                return;

            }


            // ------------------------------
            // CUSTOMER ID
            // ------------------------------

            const {
    data: { user },
    error: userError
} = await supabaseClient.auth.getUser();

if (userError || !user) {
    showMessage("❌ Please login first", "red");
    return;
}

const customerID = user.id;
              


            // ------------------------------
            // DISABLE BUTTON
            // ------------------------------

            submitOrder.disabled = true;


            try {

                showMessage(
                    "⏳ Checking Points...",
                    "yellow"
                );


                // ==============================
                // PURCHASE WITH POINTS
                // ==============================

                const {
                    data,
                    error
                } = await supabaseClient.rpc(
                    "purchase_with_points",
                    {
                        p_customer_id: customerID,
                        p_uid: uidValue,
                        p_package: selectedPackage,
                        p_price: price
                    }
                );


                if (error) {

                    throw error;

                }


                if (!data || data.length === 0) {

                    throw new Error(
                        "Purchase failed"
                    );

                }


                const result = data[0];

                const orderId =
                    result.order_id;

                const newBalance =
                    result.new_balance;


                // ==============================
                // CREATE NOTIFICATION
                // ==============================

                const {
                    error: notificationError
                } = await supabaseClient
                    .from("notifications")
                    .insert([
                        {
                            CustomerID: customerID,
                            title: "🛒 Order Submitted",
                            message:
                                `Your order ${orderId} has been submitted successfully and is now Pending.`,
                            type: "order",
                            OrderID: orderId,
                            IsRead: false
                        }
                    ]);


                if (notificationError) {

                    console.log(
                        "Notification error:",
                        notificationError
                    );

                }


                // ==============================
                // UPDATE BALANCE
                // ==============================

                if (pointsBalance) {

                    pointsBalance.textContent =
                        newBalance;

                }


                // ==============================
                // SAVE LAST UID
                // ==============================

                localStorage.setItem(
                    "lastUID",
                    uidValue
                );


                // ==============================
                // SUCCESS
                // ==============================

                showMessage(
                    `✅ Order Submitted!<br>
                     💰 ${newBalance} Points remaining`,
                    "lime"
                );


                // ==============================
                // RESET
                // ==============================

                uid.value = "";

                packages.forEach(card => {

                    card.classList.remove(
                        "selected"
                    );

                });

                selectedPackage = "";


            } catch (err) {

                console.error(
                    "Purchase error:",
                    err
                );


                if (
                    err.message &&
                    err.message
                        .toLowerCase()
                        .includes(
                            "insufficient points"
                        )
                ) {

                    showMessage(
                        "❌ Not enough Points",
                        "red"
                    );

                } else {

                    showMessage(
                        "❌ " +
                        (
                            err.message ||
                            "Purchase failed"
                        ),
                        "red"
                    );

                }

            }


            submitOrder.disabled = false;

        }
    );

}


// ==============================
// NOTIFICATION COUNT
// ==============================

async function loadNotificationCount() {

    const notificationCount =
        document.getElementById(
            "notificationCount"
        );

    if (
        !notificationCount ||
        !supabaseClient
    ) return;


    const customerID =
        localStorage.getItem(
            "CustomerID"
        );


    if (!customerID) {

        notificationCount.textContent =
            "0";

        return;

    }


    const {
        count,
        error
    } = await supabaseClient
        .from("notifications")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq(
            "CustomerID",
            customerID
        )
        .eq(
            "IsRead",
            false
        );


    if (error) {

        console.log(
            "Notification count error:",
            error
        );

        return;

    }


    notificationCount.textContent =
        count || 0;

}


// ==============================
// START
// ==============================

loadPointsBalance();
loadNotificationCount();