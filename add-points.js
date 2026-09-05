const SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

const amount = document.getElementById("amount");
const paymentMethod = document.getElementById("paymentMethod");
const paymentBox = document.getElementById("paymentBox");
const paymentText = document.getElementById("paymentText");
const paymentQR = document.getElementById("paymentQR");
const paymentProof = document.getElementById("paymentProof");
const submitDeposit = document.getElementById("submitDeposit");
const message = document.getElementById("message");



    

  



// ==============================
// PAYMENT DETAILS
// ==============================

paymentMethod.addEventListener(
    "change",
    function () {

        const method =
            paymentMethod.value;

        paymentQR.style.display = "none";
        paymentQR.src = "";

        if (method === "") {

            paymentText.textContent =
                "Select a payment method.";

            return;
        }


        if (method === "eSewa") {

            paymentText.innerHTML =
                "Pay using <b>eSewa</b>.";

            // CHANGE THIS IMAGE NAME
            // to your actual eSewa QR filename
            paymentQR.src =
                "images/esewa.jpeg";

            paymentQR.style.display =
                "block";
        }


        else if (method === "Khalti") {

            paymentText.innerHTML =
                "Pay using <b>Khalti</b>.";

            // CHANGE THIS IMAGE NAME
            // to your actual Khalti QR filename
            paymentQR.src =
                "images/khalti.jpeg";

            paymentQR.style.display =
                "block";
        }


        else if (method === "IME Pay") {

            paymentText.innerHTML =
                "Pay using <b>IME Pay</b>.";

            paymentQR.style.display =
                "none";
        }


        else if (
            method === "Bank Transfer"
        ) {

            paymentText.innerHTML =
                "Pay using <b>Bank Transfer</b>.";

            paymentQR.style.display =
                "none";
        }

    }
);


// ==============================
// MESSAGE
// ==============================

function showMessage(
    text,
    color
) {

    message.innerHTML = text;
    message.style.color = color;

}


// ==============================
// SUBMIT DEPOSIT
// ==============================

submitDeposit.addEventListener(
    "click",
    async function () {

        const amountValue =
            Number(amount.value);

        const method =
            paymentMethod.value;

        const file =
            paymentProof.files[0];


        // --------------------------
        // VALIDATION
        // --------------------------

        if (
            !amountValue ||
            amountValue <= 0
        ) {

            showMessage(
                "❌ Enter a valid amount.",
                "red"
            );

            return;
        }


        if (method === "") {

            showMessage(
                "❌ Select a payment method.",
                "red"
            );

            return;
        }


        if (!file) {

            showMessage(
                "❌ Upload your payment screenshot.",
                "red"
            );

            return;
        }


        // --------------------------
        // BUTTON
        // --------------------------

        submitDeposit.disabled = true;

        showMessage(
            "⏳ Uploading payment...",
            "yellow"
        );


        try {

          
                

          const {
    data: { user },
    error: userError
} = await supabaseClient.auth.getUser();

if (userError || !user) {
    throw new Error("Please log in first.");
}

const customerID = user.id;


            // --------------------------
            // FILE NAME
            // --------------------------

            const fileExtension =
                file.name
                    .split(".")
                    .pop();

            const fileName =
                "points/" +
                customerID +
                "_" +
                Date.now() +
                "." +
                fileExtension;


            // --------------------------
            // UPLOAD SCREENSHOT
            // --------------------------

            const {
                data: uploadData,
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("payment")
                    .upload(
                        fileName,
                        file
                    );


            if (uploadError) {

                throw uploadError;

            }


            // --------------------------
            // GET PUBLIC URL
            // --------------------------

            const {
                data: urlData
            } =
                supabaseClient
                    .storage
                    .from("payment")
                    .getPublicUrl(
                        uploadData.path
                    );


            const screenshotURL =
                urlData.publicUrl;


            // --------------------------
            // CREATE DEPOSIT
            // --------------------------

            showMessage(
                "⏳ Creating deposit...",
                "yellow"
            );


            const {
                error: depositError
            } =
                await supabaseClient
                    .from("point_deposits")
                    .insert({

                        customer_id:
                            customerID,

                        amount:
                            amountValue,

                        payment_method:
                            method,

                        screenshot:
                            screenshotURL,

                        status:
                            "Pending"

                    });


            if (depositError) {

                throw depositError;

            }


            // --------------------------
            // SUCCESS
            // --------------------------

            showMessage(
                `✅ Deposit submitted!<br>
                 💰 Rs. ${amountValue}<br>
                 🟡 Status: Pending`,
                "lime"
            );


            amount.value = "";

            paymentMethod.value = "";

            paymentProof.value = "";

            paymentText.textContent =
                "Select a payment method.";

            paymentQR.style.display =
                "none";

            paymentQR.src = "";


        }

        catch (error) {

            console.error(
                "Deposit error:",
                error
            );

            showMessage(
                "❌ " +
                (
                    error.message ||
                    "Deposit failed."
                ),
                "red"
            );

        }


        submitDeposit.disabled =
            false;

    }
);