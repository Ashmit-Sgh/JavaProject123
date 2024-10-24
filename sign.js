const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

// Get the sign in form button
const signInButton = document.querySelector('.sign-in form button');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Add click event listener to the sign in button
signInButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default form submission
    window.location.href = 'login.html'; // Redirect to login.html
});
