const SUPABASE_URL =
    "https://kxswfgheuihgndtlvzqf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const GOOGLE_CLIENT_ID =
    "927598820295-k4kjhl386an6i8b2lh67ghqgsis2n948.apps.googleusercontent.com";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// GOOGLE LOGIN
async function handleGoogleLogin(response) {

    const message =
        document.getElementById("message");

    if (message) {
        message.textContent =
            "⏳ Signing you in...";
    }

    try {

        const { data, error } =
            await supabaseClient.auth.signInWithIdToken({
                provider: "google",
                token: response.credential
            });

        if (error) {
            throw error;
        }

        if (data.session) {

            if (message) {
                message.style.color = "green";
                message.textContent =
                    "✅ Login successful!";
            }

            setTimeout(() => {
                window.location.href =
                    "index.html";
            }, 500);

        }

    } catch (error) {

        console.error(
            "Google login error:",
            error
        );

        if (message) {
            message.style.color = "red";
            message.textContent =
                "❌ " +
                (error.message ||
                "Google login failed.");
        }
    }
}


// MAKE FUNCTION AVAILABLE TO GOOGLE
window.handleGoogleLogin =
    handleGoogleLogin;


// INITIALIZE GOOGLE
function initializeGoogleLogin() {

    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.id
    ) {
        setTimeout(
            initializeGoogleLogin,
            300
        );
        return;
    }

    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            handleGoogleLogin,

        context:
            "signin",

        auto_select:
            false,

        use_fedcm_for_button:
            true

    });


    google.accounts.id.renderButton(

        document.getElementById(
            "googleButton"
        ),

        {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 350
        }

    );
}


initializeGoogleLogin();