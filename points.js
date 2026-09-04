const SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==============================
// SHOW DEPOSITS
// ==============================

async function showDeposits(status) {

    const list =
        document.getElementById("depositsList");

    list.innerHTML = "⏳ Loading...";


    const {
        data,
        error
    } = await supabaseClient
        .from("point_deposits")
        .select("*")
        .eq("status", status)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        list.innerHTML =
            "❌ " + error.message;

        return;
    }


    if (!data || data.length === 0) {

        list.innerHTML = `
            <div class="card">
                <h3>No ${status} deposits</h3>
            </div>
        `;

        return;
    }


    let html = "";


    data.forEach(deposit => {

        html += `

        <div class="card">

            <h3>💰 Rs. ${deposit.amount}</h3>

            <p>
                <b>Deposit ID:</b>
                ${deposit.id}
            </p>

            <p>
                <b>Customer ID:</b>
                ${deposit.customer_id}
            </p>

            <p>
                <b>Payment:</b>
                ${deposit.payment_method}
            </p>

            <p>
                <b>Status:</b>
                ${deposit.status}
            </p>

            <p>
                <b>Date:</b>
                ${new Date(
                    deposit.created_at
                ).toLocaleString()}
            </p>

            ${
                deposit.screenshot
                ?
                `
                <p>
                    <a
                        href="${deposit.screenshot}"
                        target="_blank"
                    >
                        🖼️ View Payment Screenshot
                    </a>
                </p>
                `
                :
                ""
            }


            ${
                status === "Pending"
                ?
                `
                <div style="margin-top:15px;">

                    <button
                        onclick="approveDeposit(${deposit.id})"
                    >
                        ✅ Approve
                    </button>

                    <button
                        onclick="cancelDeposit(${deposit.id})"
                    >
                        ❌ Cancel
                    </button>

                </div>
                `
                :
                ""
            }

        </div>

        `;

    });


    list.innerHTML = html;
}


// ==============================
// APPROVE DEPOSIT
// ==============================

async function approveDeposit(depositID) {

    const confirmed =
        confirm(
            "Approve this deposit and add the Points?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "approve_point_deposit",
                    {
                        p_deposit_id:
                            depositID
                    }
                );


        if (error) {
            throw error;
        }


        if (!data || data.length === 0) {
            throw new Error(
                "Approval failed"
            );
        }


        const newBalance =
            data[0].new_balance;


        alert(
            "✅ Deposit approved!\n\n" +
            "💰 New Points Balance: " +
            newBalance
        );


        showDeposits("Pending");

    }

    catch (error) {

        console.error(
            "Approve error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Approval failed"
            )
        );

    }

}


// ==============================
// CANCEL DEPOSIT
// ==============================

async function cancelDeposit(depositID) {

    const confirmed =
        confirm(
            "Cancel this deposit?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("point_deposits")
            .update({
                status: "Cancelled"
            })
            .eq("id", depositID);


    if (error) {

        console.error(error);

        alert(
            "❌ " +
            error.message
        );

        return;
    }


    alert(
        "❌ Deposit cancelled"
    );


    showDeposits("Pending");

}


// ==============================
// START
// ==============================

showDeposits("Pending");