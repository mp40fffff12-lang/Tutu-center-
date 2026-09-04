const SUPABASE_URL =
    "https://kxswfgheuihgndtlvzqf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


async function checkLogin() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "Auth error:",
            error
        );

        return;

    }


    // Customer is NOT logged in

    if (!data.session) {

        window.location.href =
            "login.html";

        return;

    }


    // Customer IS logged in

    console.log(
        "✅ Customer logged in:",
        data.session.user.id
    );

}


checkLogin();