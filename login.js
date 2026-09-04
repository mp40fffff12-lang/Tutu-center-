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


// ==============================
// CREATE NONCE
// ==============================

async function createNonce() {

    const nonceBytes =
        crypto.getRandomValues(
            new Uint8Array(32)
        );

    const nonce =
        btoa(
            String.fromCharCode(
                ...nonceBytes
            )
        );

    const encoder =
        new TextEncoder();

    const encodedNonce =
        encoder.encode(nonce);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            encodedNonce
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    const hashedNonce =
        hashArray
            .map(
                b =>
                    b.toString(16)
                     .padStart(2, "0")
            )
            .join("");

    return {
        nonce,
        hashedNonce
    };
}


// ==============================
// GOOGLE LOGIN
// ==============================

async function initializeGoogleLogin() {

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

    const {
        nonce,
        hashedNonce
    } = await createNonce();


    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            async function(response) {

                const message =
                    document.getElementById(
                        "message"
                    );

                if (message) {
                    message.style.color =
                        "black";

                    message.textContent =
                        "⏳ Signing you in...";
                }

                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .auth
                            .signInWithIdToken({

                                provider:
                                    "google",

                                token:
                                    response.credential,

                                nonce:
                                    nonce
                            });


                    if (error) {
                        throw error;
                    }


                    if (message) {

                        message.style.color =
                            "green";

                        message.textContent =
                            "✅ Login successful!";
                    }


                    setTimeout(() => {

                        window.location.href =
                            "index.html";

                    }, 500);


                } catch (error) {

                    console.error(
                        "Google login error:",
                        error
                    );

                    if (message) {

                        message.style.color =
                            "red";

                        message.textContent =
                            "❌ " +
                            (
                                error.message ||
                                "Google login failed."
                            );
                    }
                }
            },


        // IMPORTANT
        // Google receives the HASHED nonce

        nonce:
            hashedNonce,

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