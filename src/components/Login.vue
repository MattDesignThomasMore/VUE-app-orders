<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";


const router = useRouter();
const store = useStore();


const email = ref('');
const password = ref('');
const feedbackMessage = ref('');
const isSuccess = ref(true);


const logIn = async () => {
  try {
    const response = await fetch('https://sneaker-api-4zoy.onrender.com/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email.value,
        password: password.value,
      })
    });

    const json = await response.json();

    if (json.status === 'success') {
      feedbackMessage.value = "Logged in successfully.";
      isSuccess.value = true;

      const token = json.data.token;
      localStorage.setItem('token', token);
      store.commit('setToken', token);

      router.push('/orders');
    } else {
      feedbackMessage.value = json.message || "Failed to log in.";
      isSuccess.value = false;
    }
  } catch (error) {
    console.error('Login error', error);
    feedbackMessage.value = "Something went wrong.";
    isSuccess.value = false;
  }
};
</script>

<template>
  <div class="container">

    <div class="background-image"></div>

 
    <div class="login-container">
      <h1 class="login-header">View order activity</h1>
      <p class="login-subtext" >Sign in</p>

   
      <div v-if="feedbackMessage" 
           :class="isSuccess ? 'feedback-success' : 'feedback-error'" 
           class="feedback-message">
        {{ feedbackMessage }}
      </div>

    
      <form class="login-form" @submit.prevent="logIn">
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
            required
          />
        </div>
        <button type="submit" style="margin-top: 3vh;" class="login-button">Sign In</button>
      </form>
      
      <p class="signup-link" style="margin-top: 5vh;">
        Don't have an account? 
        <router-link to="/signup" class="link">Sign Up</router-link>
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
  z-index: 10;
  margin-left: 20vh;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  padding: 40px;
  max-width: 700px; /* Made wider */
  width: 100%;
  text-align: left; 

}


.login-container:hover {

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
  margin: 15px 0;
}

.form-group input {
  padding: 15px 20px;
  border: 1px solid #ccc;
  background-color: #333;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: border-color 0.3s ease-in-out;
  width: 600px; 
}


.form-group input:focus {
  border-color: #26f158;
  outline: none;
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
  text-align: center;
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

<style>
 
  .login-form input {
    background-color: black; 
    color: white; 
    border: 1px solid #555; 
    padding: 10px; 
    border-radius: 5px; 
  }

 
  .login-form input::placeholder {
    color: white; 
    opacity: 1; 
  }
</style>
