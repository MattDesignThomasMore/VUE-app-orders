<script setup>
import { ref } from 'vue';
import zxcvbn from 'zxcvbn';


const email = ref('');
const password = ref('');
const feedbackMessage = ref('');
const isSuccess = ref(true);
let passwordStrength = 0;


const checkPasswordStrength = () => {
  const passwordResult = zxcvbn(password.value);
  passwordStrength = passwordResult.score;
};


const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


const showFeedback = (message, success = true) => {
  feedbackMessage.value = message;
  isSuccess.value = success;
};


const signUp = async () => {
  try {
    if (!isValidEmail(email.value)) {
      showFeedback("Invalid email address", false);
      return;
    }

    checkPasswordStrength();
    if (passwordStrength < 3) {
      showFeedback("Weak password. Please choose a stronger password.", false);
      return;
    }

    const response = await fetch('https://sneaker-api-4zoy.onrender.com/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email.value, password: password.value })
    });

    const json = await response.json();

    if (json.status === 'success') {
      showFeedback("Account created successfully.", true);
      const token = json.data.token;
      localStorage.setItem('token', token);
      window.location.href = "/orders";
    } else {
      showFeedback(json.message || "Account creation failed.", false);
    }
  } catch (error) {
    console.error('Error during signup:', error);
    showFeedback("Something went wrong.", false);
  }
};
</script>

<template>
  <div class="container">
    <div class="background-image"></div>


    <div class="login-container">
      <h1 class="login-header">Create an account</h1>
      <p class="login-subtext">Sign up</p>

      <div v-if="feedbackMessage" 
           :class="isSuccess ? 'feedback-success' : 'feedback-error'" 
           class="feedback-message">
        {{ feedbackMessage }}
      </div>

    
      <form class="login-form" @submit.prevent="signUp">
        <div class="form-group">
          <input
            v-model="email"
            id="email"
            type="email"
            placeholder="Your email"
            required
          />
        </div>

        <div class="form-group">
          <input
            v-model="password"
            id="password"
            type="password"
            placeholder="Your password"
            @input="checkPasswordStrength"
            required
          />
        </div>

        <button type="submit" style="margin-top: 25px" class="login-button">Sign Up</button>
      </form>

      <p class="signup-link" style="margin-top: 45px" >
        Already have an account? 
        <router-link to="/" class="link">Login</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


.container {
  position: relative;
  height: 100vh;
  width: 100%;
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background-image: url('/img.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.6);
  z-index: -1;
}


.login-container {
  position: relative;
  margin-left: 20vh;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  padding: 40px;
  max-width: 700px;
  width: 100%;
}

.login-header {
  font-size: 3rem;
  margin-bottom: 10px;
  color: #333;
}

.login-subtext {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 30px;
}


.feedback-message {
  font-size: 1rem;
  margin: 15px 0;
}

.feedback-success {
  color: green;
}

.feedback-error {
  color: red;
}


.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group input {
  padding: 15px 20px;
  border: 1px solid #555;
  background-color: #333;
  color: white;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: border-color 0.3s ease-in-out;
  width: 100%; 
  max-width: 600px; 
}


.form-group input:focus {
  border-color: #26f158;
  outline: none;
}

.form-group input::placeholder {
  color: white;
}


.login-button {
  background-color: #26f158;
  color: white;
  padding: 15px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  font-size: 1.1rem;
}

.login-button:hover {
  background-color: #25d350;
  transform: translateY(-2px);
}


.signup-link {
  margin-top: 20px;
  font-size: 1rem;
  color: #555;
}

.link {
  color: #25d350;
  text-decoration: underline;
}
</style>
