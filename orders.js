const SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const ordersList = document.getElementById("ordersList");
const searchUid = document.getElementById("searchUid");

let allOrders = [];

async function loadOrders() {

    ordersList.innerHTML = "Loading...";

    

  const customerID = localStorage.getItem("CustomerID");

const { data, error } = await supabaseClient
    .from("Order")
    .select("*")
    .eq("CustomerID", customerID)
    .order("orderid", { ascending: false });

    if (error) {
        ordersList.innerHTML = "<h3>❌ " + error.message + "</h3>";
        return;
    }

    allOrders = data;



  showOrders(allOrders);

    

}

function showOrders(list) {

    if (list.length === 0) {

        ordersList.innerHTML = "<h3>No Orders Found</h3>";

        return;

    }

    let html = "";

    list.forEach(order => {

        let statusClass = order.Status.toLowerCase();

        html += `
        <div class="order-card">

        <h3>${order.Game}</h3>

        <p><b>Order ID:</b> ${order.orderid}</p>

        <p><b>UID:</b> ${order.Uid}</p>

        <p><b>Package:</b> ${order.Package}</p>

        <p><b>Payment:</b> ${order.Payment}</p>

        <p>
        <b>Status:</b>
        <span class="${statusClass}">
        ${order.Status}
        </span>
        </p>

        <p>
        <a href="${order.Screenshot}" target="_blank">
        📷 View Payment Screenshot
        </a>
        </p>

        </div>
        `;

    });

    ordersList.innerHTML = html;

}

searchUid.addEventListener("input", () => {

    const uid = searchUid.value.trim();

    if (uid === "") {

        showOrders(allOrders);

        return;

    }

    const filtered = allOrders.filter(order =>
        order.Uid.toString().includes(uid)
    );

    showOrders(filtered);

});

const savedUID = localStorage.getItem("lastUID");

if(savedUID){
    searchUid.value = savedUID;
}

loadOrders();