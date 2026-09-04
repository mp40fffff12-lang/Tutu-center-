const SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

window.supabase = window.supabase.createClient(
  
    SUPABASE_URL,
    SUPABASE_KEY
);


console.log("Supabase Connected");
console.log(supabase);

const payment = document.getElementById("payment");
const qrBox = document.getElementById("qrBox");
const qrImage = document.getElementById("qrImage");

payment.onchange = function () {

    if (payment.value === "eSewa") {
        qrImage.src = "images/esewa.jpeg";
        qrBox.style.display = "block";
    }

    else if (payment.value === "Khalti") {
        qrImage.src = "images/khalti.jpeg";
        qrBox.style.display = "block";
    }

    else {
        qrBox.style.display = "none";
    }

};