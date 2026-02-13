/* file:///c:/Users/START/Desktop/Projects/ZeroNux Store/Scripts/auth-page.js */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleLinks = document.querySelectorAll('.toggle-auth a');
    const googleBtn = document.getElementById('google-btn');
    const appleBtn = document.getElementById('apple-btn');
    const emailLoginBtn = document.getElementById('email-login-btn');
    const emailSignupBtn = document.getElementById('email-signup-btn');

    // Check if user is already logged in and verified
    firebase.auth().onAuthStateChanged(user => {
        if (user && user.emailVerified) {
            window.location.href = 'index.html';
        }
    });

    // Toggle between Login and Signup
    toggleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;

            if (target === 'signup') {
                document.getElementById('login-box').style.display = 'none';
                document.getElementById('signup-box').style.display = 'block';
            } else {
                document.getElementById('signup-box').style.display = 'none';
                document.getElementById('login-box').style.display = 'block';
            }
        });
    });

    // Google Sign In
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await firebase.auth().signInWithPopup(provider);
                window.location.href = 'index.html'; // Redirect on success
            } catch (error) {
                console.error("Google Sign In Error:", error);
                alert("فشل تسجيل الدخول باستخدام Google: " + error.message);
            }
        });
    }

    // Email Login
    if (emailLoginBtn) {
        emailLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
                return;
            }

            try {
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                if (!user.emailVerified) {
                    await firebase.auth().signOut();
                    alert("يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد الخاص بك.");
                    return;
                }

                window.location.href = 'index.html';
            } catch (error) {
                console.error("Login Error:", error);
                alert("فشل تسجيل الدخول: " + error.message);
            }
        });
    }

    // Email Signup
    if (emailSignupBtn) {
        emailSignupBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            if (!email || !password || !name) {
                alert("الرجاء ملء جميع الحقول");
                return;
            }

            try {
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Update profile with name
                await user.updateProfile({
                    displayName: name
                });

                // Send Verification Email
                await user.sendEmailVerification();

                // Sign out immediately to prevent access
                await firebase.auth().signOut();

                // Redirect to verification page
                window.location.href = 'verify-email.html';
            } catch (error) {
                console.error("Signup Error:", error);
                alert("فشل إنشاء الحساب: " + error.message);
            }
        });
    }
});
