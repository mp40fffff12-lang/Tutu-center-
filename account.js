const SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function loadAccount() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        window.location.href = "login.html";
        return;
    }

    const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "User";

    


const email = user.email || "No email";

const avatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    "";

document.getElementById("accountName").textContent = name;
document.getElementById("accountEmail").textContent = email;

const avatarImage = document.getElementById("accountAvatar");

if (avatar) {
    avatarImage.src = avatar;
} else {
    avatarImage.style.display = "none";
}
  
  
}

document
    .getElementById("logoutButton")
    .addEventListener("click", async () => {

        const { error } =
            await supabaseClient.auth.signOut({
                scope: "local"
            });

        if (error) {
            alert("Logout failed. Please try again.");
            return;
        }

        window.location.href = "login.html";
    });

loadAccount();