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

    try {
        // Wait for Supabase to identify the logged-in customer
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError) {
            console.log("Points user error:", userError);
            return;
        }

        if (!user) {
            console.log("Points: No logged-in user yet.");
            return;
        }

        const customerID = user.id;

        const { data, error } = await supabaseClient
            .from("wallets")
            .select("points")
            .eq("customer_id", customerID)
            .maybeSingle();

        if (error) {
            console.log("Points balance error:", error);
            return;
        }

        // Only update the screen when an actual wallet row was returned.
        // Never replace an existing balance with a false 0.
        if (data && data.points !== null && data.points !== undefined) {
            pointsBalance.textContent = data.points;
        }

    } catch (error) {
        console.log("Points loading error:", error);
    }
}
            

            
                

            


            


loadNotificationCount();