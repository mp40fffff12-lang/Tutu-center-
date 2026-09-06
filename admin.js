const SUPABASE_URL="https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY="sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const supabaseClient=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

async function adminLogin(){

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return false;
    }

    const role =
        user.app_metadata?.role;

    if (role !== "admin") {
        alert("❌ You are not authorized to access the Admin Panel.");
        window.location.href = "index.html";
        return false;
    }

    return true;
}








async function loadDashboard(){

const {data,error}=await supabaseClient
.from("Order")
.select("Status");

if(error){

alert(error.message);

return;

}

let total=data.length;

let pending=0;

let completed=0;

let cancelled=0;

data.forEach(order=>{

if(order.Status==="Pending") pending++;

if(order.Status==="Completed") completed++;

if(order.Status==="Cancelled") cancelled++;

});

document.getElementById("totalOrders").innerHTML=total;

document.getElementById("pendingOrders").innerHTML=pending;

document.getElementById("completedOrders").innerHTML=completed;

document.getElementById("cancelledOrders").innerHTML=cancelled;

}

window.onload = async () => {

    const isAdmin = await adminLogin();

    if (!isAdmin) {
        return;
    }

    await loadDashboard();
};




document.getElementById("searchBtn").addEventListener("click", async () => {

const keyword = document.getElementById("searchInput").value.trim();

if(keyword===""){
alert("Enter UID or Order ID");
return;
}

const { data, error } = await supabaseClient
.from("Order")
.select("*")
.or(`Uid.eq.${keyword},orderid.eq.${keyword}`);

if(error){

alert(error.message);

return;

}

const result = document.getElementById("searchResult");

if(data.length===0){

result.innerHTML="<h3>❌ No Order Found</h3>";

return;

}

let html="";

data.forEach(order=>{

html+=`

<div class="card">

<h3>${order.Game}</h3>

<p><b>Order ID:</b> ${order.orderid}</p>

<p><b>UID:</b> ${order.Uid}</p>

<p><b>Package:</b> ${order.Package}</p>

<p><b>Payment:</b> ${order.Payment}</p>

<p><b>Status:</b> ${order.Status}</p>

<p>
<a href="${order.Screenshot}" target="_blank">
📷 View Screenshot
</a>
</p>

</div>

`;

});

result.innerHTML=html;

});