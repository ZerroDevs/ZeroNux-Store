/* file:///c:/Users/START/Desktop/Projects/ZeroNux Store/Scripts/auth-page.js */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleLinks = document.querySelectorAll('[data-target]');
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

    // Toggle between Login, Signup, and Forgot Password
    toggleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            const loginBox = document.getElementById('login-box');
            const signupBox = document.getElementById('signup-box');
            const forgotBox = document.getElementById('forgot-box');

            // Hide all first
            if (loginBox) loginBox.style.display = 'none';
            if (signupBox) signupBox.style.display = 'none';
            if (forgotBox) forgotBox.style.display = 'none';

            // Show target
            if (target === 'signup') {
                if (signupBox) signupBox.style.display = 'block';
            } else if (target === 'forgot') {
                if (forgotBox) forgotBox.style.display = 'block';
            } else {
                if (loginBox) loginBox.style.display = 'block';
            }
        });
    });

    // Forgot Password Logic
    const forgotBtn = document.getElementById('forgot-btn');
    if (forgotBtn) {
        forgotBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const errorDiv = document.getElementById('forgot-error');
            const successDiv = document.getElementById('forgot-success');

            // Reset UI
            if (errorDiv) { errorDiv.style.display = 'none'; errorDiv.textContent = ''; }
            if (successDiv) successDiv.style.display = 'none';

            if (!email) {
                if (errorDiv) { errorDiv.style.display = 'block'; errorDiv.textContent = "الرجاء إدخال البريد الإلكتروني"; }
                return;
            }

            try {
                // Use custom action URL for better UX if configured, otherwise standard firebase
                // Custom URL should be in the template settings, so standard call works.
                await firebase.auth().sendPasswordResetEmail(email);

                if (successDiv) successDiv.style.display = 'block';
                // Optional: switch back to login after a few seconds
            } catch (error) {
                console.error("Forgot Password Error:", error);
                let msg = "فشل إرسال الرابط: " + error.message;
                if (error.code === 'auth/user-not-found') {
                    msg = "هذا البريد غير مسجل لدينا"; // More user friendly
                }
                if (errorDiv) { errorDiv.style.display = 'block'; errorDiv.textContent = msg; }
            }
        });
    }

    // Helper to show errors
    function showError(elementId, message) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            // Auto hide after 5 seconds optional, but usually better to stay until user fixes
        } else {
            alert(message); // Fallback
        }
    }

    function clearError(elementId) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }
    }

    // Google Sign In
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            clearError('login-error'); // Assuming login box is visible
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await firebase.auth().signInWithPopup(provider);
                window.location.href = 'index.html'; // Redirect on success
            } catch (error) {
                console.error("Google Sign In Error:", error);

                // Determine which box is visible to show error
                const isSignupVisible = document.getElementById('signup-box').style.display === 'block';
                const errorId = isSignupVisible ? 'signup-error' : 'login-error';
                showError(errorId, "فشل تسجيل الدخول باستخدام Google: " + error.message);
            }
        });
    }

    // Email Login
    if (emailLoginBtn) {
        emailLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            clearError('login-error');

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showError('login-error', "الرجاء إدخال البريد الإلكتروني وكلمة المرور");
                return;
            }

            // Check Turnstile
            const loginBox = document.getElementById('login-box');
            const turnstileInput = loginBox.querySelector('[name="cf-turnstile-response"]');
            const token = turnstileInput ? turnstileInput.value : null;

            if (!token) {
                showError('login-error', "الرجاء إتمام التحقق (أنا لست روبوت)");
                return;
            }

            try {
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                if (!user.emailVerified) {
                    await firebase.auth().signOut();
                    showError('login-error', "يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد الخاص بك.");
                    return;
                }

                window.location.href = 'index.html';
            } catch (error) {
                console.error("Login Error:", error);
                let msg = "فشل تسجيل الدخول: " + error.message;
                if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                    msg = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
                }
                showError('login-error', msg);
            }
        });
    }

    // Email Signup
    if (emailSignupBtn) {
        emailSignupBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            clearError('signup-error');

            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            if (!email || !password || !name) {
                showError('signup-error', "الرجاء ملء جميع الحقول");
                return;
            }

            // Check Turnstile
            const signupBox = document.getElementById('signup-box');
            const turnstileInput = signupBox.querySelector('[name="cf-turnstile-response"]');
            const token = turnstileInput ? turnstileInput.value : null;

            if (!token) {
                showError('signup-error', "الرجاء إتمام التحقق (أنا لست روبوت)");
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
                let msg = "فشل إنشاء الحساب: " + error.message;
                if (error.code === 'auth/email-already-in-use') {
                    msg = "البريد الإلكتروني مستخدم بالفعل";
                } else if (error.code === 'auth/weak-password') {
                    msg = "كلمة المرور ضعيفة جداً";
                }
                showError('signup-error', msg);
            }
        });
    }
});
